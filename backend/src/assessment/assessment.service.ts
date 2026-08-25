import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ScoringEngine } from './scoring.engine';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { AgeGroup } from '../common/constants/enums';

@Injectable()
export class AssessmentService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private scoringEngine: ScoringEngine,
  ) {}

  /** 获取量表列表（按年龄段筛选） */
  async getScales(ageGroup?: AgeGroup, category?: string) {
    return this.prisma.assessmentScale.findMany({
      where: {
        isActive: true,
        ...(ageGroup && { ageGroup }),
        ...(category && { category }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 获取量表详情（含题目） */
  async getScaleDetail(scaleId: string) {
    const scale = await this.prisma.assessmentScale.findUnique({
      where: { id: scaleId },
    });
    if (!scale) throw new NotFoundException('量表不存在');
    return scale;
  }

  /** 创建测评会话 */
  async createSession(dto: CreateSessionDto) {
    const scale = await this.prisma.assessmentScale.findUnique({
      where: { id: dto.scaleId },
    });
    if (!scale) throw new NotFoundException('量表不存在');
    if (!scale.isActive) throw new BadRequestException('量表已停用');

    // 检查是否有未完成的会话（支持断点续测）
    const existing = await this.prisma.assessmentSession.findFirst({
      where: {
        scaleId: dto.scaleId,
        studentId: dto.studentId,
        status: 'IN_PROGRESS',
      },
    });
    if (existing) {
      // 恢复断点续测进度
      const cachedAnswers = await this.redis.getAssessmentProgress(existing.id);
      return { session: existing, resumedAnswers: cachedAnswers };
    }

    const session = await this.prisma.assessmentSession.create({
      data: {
        scaleId: dto.scaleId,
        studentId: dto.studentId,
        status: 'IN_PROGRESS',
        answers: {},
      },
    });
    return { session, resumedAnswers: null };
  }

  /** 提交作答（支持断点续测，部分提交保存进度） */
  async submitAnswers(sessionId: string, dto: SubmitAnswersDto) {
    const session = await this.prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: { scale: true },
    });
    if (!session) throw new NotFoundException('测评会话不存在');
    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('测评会话已结束');
    }

    // 合并已有答案与新答案
    const existingAnswers = (session.answers as Record<string, string>) ?? {};
    const mergedAnswers = { ...existingAnswers, ...dto.answers };

    // 缓存进度到 Redis（断点续测）
    await this.redis.cacheAssessmentProgress(sessionId, mergedAnswers);

    // 更新会话答案
    const updated = await this.prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        answers: mergedAnswers,
        ...(dto.durationSec && { durationSec: dto.durationSec }),
      },
    });

    return updated;
  }

  /** 完成测评，触发评分 */
  async completeSession(sessionId: string) {
    const session = await this.prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: { scale: true },
    });
    if (!session) throw new NotFoundException('测评会话不存在');
    if (session.status === 'COMPLETED') {
      throw new BadRequestException('测评会话已完成');
    }

    const answers = (session.answers as Record<string, string>) ?? {};
    const questions = (session.scale.questions as any[]) ?? [];

    // 调用评分引擎计算
    const scores = this.scoringEngine.calculate(questions, answers);
    const riskLevel = this.scoringEngine.determineRiskLevel(scores);

    // 事务：创建结果 + 更新会话状态 + 清除 Redis 进度
    const result = await this.prisma.$transaction(async (tx) => {
      const assessmentResult = await tx.assessmentResult.create({
        data: {
          sessionId: session.id,
          totalScore: scores.totalScore,
          lawScore: scores.lawScore,
          psychologyScore: scores.psychologyScore,
          riskLevel: riskLevel as any,
          dimensionScores: scores.dimensionScores,
          detail: scores.detail,
        },
      });

      await tx.assessmentSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          resultId: assessmentResult.id,
        },
      });

      return assessmentResult;
    });

    await this.redis.clearAssessmentProgress(sessionId);
    return result;
  }

  /** 获取测评结果历史 */
  async getResultsHistory(studentId: string, page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.assessmentResult.findMany({
        where: { session: { studentId } },
        include: { session: { include: { scale: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.assessmentResult.count({
        where: { session: { studentId } },
      }),
    ]);
    return { items, total, page, pageSize };
  }

  /** 获取单个测评结果 */
  async getResult(resultId: string) {
    const result = await this.prisma.assessmentResult.findUnique({
      where: { id: resultId },
      include: { session: { include: { scale: true } } },
    });
    if (!result) throw new NotFoundException('测评结果不存在');
    return result;
  }
}
