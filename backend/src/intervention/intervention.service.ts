import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskLevel } from '../common/constants/enums';

/** 干预类型 */
export type InterventionType = 'WARNING' | 'CARE_ADVICE' | 'TEACHING_ADVICE' | 'PARENT_TASK';

@Injectable()
export class InterventionService {
  constructor(private prisma: PrismaService) {}

  /** 触发预警：基于测评结果风险等级向家长推送预警 */
  async triggerWarning(resultId: string, studentId: string, parentId: string) {
    const result = await this.prisma.assessmentResult.findUnique({
      where: { id: resultId },
    });
    if (!result) throw new NotFoundException('测评结果不存在');

    // 仅对有风险的结果触发预警
    if (result.riskLevel === RiskLevel.NONE) {
      return { skipped: true, reason: '无风险，无需预警' };
    }

    // 检查是否已有预警
    const existingWarning = await this.prisma.warning.findFirst({
      where: { resultId, parentId },
    });
    if (existingWarning) {
      return { skipped: true, reason: '预警已存在', warning: existingWarning };
    }

    // 创建预警记录
    const warning = await this.prisma.warning.create({
      data: {
        studentId,
        parentId,
        resultId,
        riskLevel: result.riskLevel as any,
        content: {
          riskLevel: result.riskLevel,
          totalScore: result.totalScore,
          lawScore: result.lawScore,
          psychologyScore: result.psychologyScore,
          message: this.getWarningMessage(result.riskLevel),
        },
        status: 'UNREAD',
      },
    });

    // 同时创建干预记录
    const diagnosis = await this.prisma.diagnosis.findUnique({
      where: { resultId },
    });
    if (diagnosis) {
      await this.prisma.intervention.create({
        data: {
          diagnosisId: diagnosis.id,
          type: 'WARNING',
          targetUserId: parentId,
          content: { warningId: warning.id, riskLevel: result.riskLevel },
          status: 'PENDING',
          level: this.getRiskLevelValue(result.riskLevel),
        },
      });
    }

    return { skipped: false, warning };
  }

  /** 推送监护建议 */
  async pushCareAdvice(parentId: string, studentId: string, topic: string, content: any) {
    const careAdvice = await this.prisma.careAdvice.create({
      data: {
        parentId,
        studentId,
        topic,
        content,
      },
    });

    // 关联到干预记录
    const interventions = await this.prisma.intervention.findMany({
      where: { targetUserId: parentId, type: 'CARE_ADVICE', status: 'PENDING' },
    });
    if (interventions.length === 0) {
      // 查找诊断记录关联
      const diagnosis = await this.prisma.diagnosis.findFirst({
        where: { targetId: studentId },
      });
      if (diagnosis) {
        await this.prisma.intervention.create({
          data: {
            diagnosisId: diagnosis.id,
            type: 'CARE_ADVICE',
            targetUserId: parentId,
            content: { adviceId: careAdvice.id, topic },
            status: 'PENDING',
          },
        });
      }
    }

    return careAdvice;
  }

  /** 生成教学建议（面向教师） */
  async generateTeachingAdvice(diagnosisId: string, teacherId: string, content: any) {
    const diagnosis = await this.prisma.diagnosis.findUnique({
      where: { id: diagnosisId },
    });
    if (!diagnosis) throw new NotFoundException('诊断记录不存在');

    return this.prisma.intervention.create({
      data: {
        diagnosisId,
        type: 'TEACHING_ADVICE',
        targetUserId: teacherId,
        content,
        status: 'PENDING',
      },
    });
  }

  /** 生成亲子任务 */
  async generateParentTask(parentId: string, studentId: string, task: {
    title: string;
    description: string;
    category: string;
    pointsReward: number;
  }) {
    return this.prisma.parentTask.create({
      data: {
        parentId,
        studentId,
        title: task.title,
        description: task.description,
        category: task.category,
        pointsReward: task.pointsReward,
        status: 'PUBLISHED',
      },
    });
  }

  /** 升级干预：提高干预级别 */
  async escalateIntervention(interventionId: string) {
    const intervention = await this.prisma.intervention.findUnique({
      where: { id: interventionId },
    });
    if (!intervention) throw new NotFoundException('干预记录不存在');
    if (intervention.status === 'CLOSED') {
      throw new BadRequestException('干预已关闭，无法升级');
    }

    return this.prisma.intervention.update({
      where: { id: interventionId },
      data: {
        level: intervention.level + 1,
        status: 'ESCALATED',
        actedAt: new Date(),
      },
    });
  }

  /** 标记干预已处理 */
  async markInterventionActed(interventionId: string, status: string) {
    const intervention = await this.prisma.intervention.findUnique({
      where: { id: interventionId },
    });
    if (!intervention) throw new NotFoundException('干预记录不存在');

    return this.prisma.intervention.update({
      where: { id: interventionId },
      data: { status, actedAt: new Date() },
    });
  }

  /** 获取干预列表 */
  async getInterventions(targetUserId: string, type?: string, status?: string) {
    return this.prisma.intervention.findMany({
      where: {
        targetUserId,
        ...(type && { type }),
        ...(status && { status }),
      },
      include: { diagnosis: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 获取预警消息 */
  private getWarningMessage(riskLevel: string): string {
    const messages: Record<string, string> = {
      LOW: '您的孩子在某些维度表现需关注，建议适当引导',
      MEDIUM: '您的孩子存在一定风险，建议加强关注和沟通',
      HIGH: '您的孩子风险较高，建议及时干预并寻求教师帮助',
      CRITICAL: '您的孩子风险较高，建议立即干预并考虑专业心理辅导',
    };
    return messages[riskLevel] ?? '请关注孩子的测评结果';
  }

  /** 获取风险等级数值 */
  private getRiskLevelValue(riskLevel: string): number {
    const values: Record<string, number> = {
      NONE: 0,
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4,
    };
    return values[riskLevel] ?? 0;
  }
}
