import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** 协同任务类型 */
export type CollabTaskType = 'WARNING_NOTIFY' | 'ADVICE_PUSH' | 'TASK_ASSIGN' | 'REPORT_SHARE';

@Injectable()
export class MidplaneService {
  constructor(private prisma: PrismaService) {}

  /** 数据汇聚：聚合多端数据（测评、游戏、积分、干预） */
  async aggregateData(studentId: string) {
    const [assessmentResults, gameSessions, pointLedger, trackings] = await Promise.all([
      this.prisma.assessmentResult.findMany({
        where: { session: { studentId } },
        include: { session: { include: { scale: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.gameSession.findMany({
        where: { studentId },
        include: { scenario: true },
        orderBy: { startedAt: 'desc' },
        take: 10,
      }),
      this.prisma.pointLedger.findMany({
        where: { userId: studentId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.tracking.findMany({
        where: { studentId },
        include: { intervention: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      studentId,
      assessment: assessmentResults,
      games: gameSessions,
      points: pointLedger,
      trackings,
      summary: {
        totalAssessments: assessmentResults.length,
        totalGames: gameSessions.length,
        totalPoints: pointLedger[0]?.balance ?? 0,
        activeTrackings: trackings.filter((t) => !t.isClosed).length,
      },
    };
  }

  /** 数据标准化：统一数据格式 */
  normalizeData(rawData: any, dataType: string): any {
    switch (dataType) {
      case 'ASSESSMENT':
        return {
          type: 'ASSESSMENT',
          id: rawData.id,
          timestamp: rawData.createdAt,
          payload: {
            totalScore: rawData.totalScore,
            lawScore: rawData.lawScore,
            psychologyScore: rawData.psychologyScore,
            riskLevel: rawData.riskLevel,
          },
        };
      case 'GAME':
        return {
          type: 'GAME',
          id: rawData.id,
          timestamp: rawData.startedAt,
          payload: {
            scenarioId: rawData.scenarioId,
            completed: !!rawData.completedAt,
          },
        };
      case 'POINTS':
        return {
          type: 'POINTS',
          id: rawData.id,
          timestamp: rawData.createdAt,
          payload: {
            amount: rawData.amount,
            source: rawData.source,
            balance: rawData.balance,
          },
        };
      default:
        return { type: dataType, id: rawData.id, timestamp: rawData.createdAt, payload: rawData };
    }
  }

  /** 跨端数据查询：统一查询接口 */
  async crossEndQuery(params: {
    studentId?: string;
    classId?: string;
    jurisdiction?: string;
    startDate?: Date;
    endDate?: Date;
    dataTypes?: string[];
  }) {
    const { studentId, classId, jurisdiction, startDate, endDate } = params;
    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };

    const results: any = {};

    // 测评数据
    if (!params.dataTypes || params.dataTypes.includes('ASSESSMENT')) {
      results.assessment = await this.prisma.assessmentResult.findMany({
        where: {
          ...(studentId && { session: { studentId } }),
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        include: { session: { include: { student: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    // 游戏数据
    if (!params.dataTypes || params.dataTypes.includes('GAME')) {
      results.game = await this.prisma.gameSession.findMany({
        where: {
          ...(studentId && { studentId }),
          ...(Object.keys(dateFilter).length > 0 && { startedAt: dateFilter }),
        },
        include: { scenario: true },
        orderBy: { startedAt: 'desc' },
      });
    }

    // 积分数据
    if (!params.dataTypes || params.dataTypes.includes('POINTS')) {
      results.points = await this.prisma.pointLedger.findMany({
        where: {
          ...(studentId && { userId: studentId }),
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return results;
  }

  /** 协同任务流转：创建协同任务 */
  async createCollabTask(initiatorId: string, type: CollabTaskType, targetIds: string[], content: any) {
    return this.prisma.collabTask.create({
      data: {
        initiatorId,
        type,
        targetIds,
        content,
        status: 'OPEN',
      },
    });
  }

  /** 处理协同任务 */
  async processCollabTask(taskId: string, handlerId: string, result: any) {
    const task = await this.prisma.collabTask.findUnique({
      where: { id: taskId },
    });
    if (!task) throw new NotFoundException('协同任务不存在');
    if (task.status !== 'OPEN') {
      throw new NotFoundException('协同任务已处理');
    }

    return this.prisma.collabTask.update({
      where: { id: taskId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        content: { ...(task.content as any), handlerId, result, handledAt: new Date().toISOString() },
      },
    });
  }

  /** 获取协同任务列表 */
  async getCollabTasks(status?: string, initiatorId?: string) {
    return this.prisma.collabTask.findMany({
      where: {
        ...(status && { status }),
        ...(initiatorId && { initiatorId }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
