import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** 效果评估结果 */
export type Effectiveness = 'EFFECTIVE' | 'PARTIAL' | 'INEFFECTIVE';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  /** 启动追踪：为干预建立追踪记录 */
  async startTracking(interventionId: string, studentId: string, baselineResultId: string) {
    const intervention = await this.prisma.intervention.findUnique({
      where: { id: interventionId },
    });
    if (!intervention) throw new NotFoundException('干预记录不存在');

    // 检查是否已有追踪记录
    const existing = await this.prisma.tracking.findUnique({
      where: { interventionId },
    });
    if (existing) {
      throw new BadRequestException('追踪记录已存在');
    }

    return this.prisma.tracking.create({
      data: {
        interventionId,
        studentId,
        baselineResultId,
        trajectory: [{ timestamp: new Date().toISOString(), event: 'TRACKING_STARTED' }],
      },
    });
  }

  /** 效果评估：对比基线和随访结果 */
  async evaluateEffectiveness(trackingId: string, followupResultId: string): Promise<any> {
    const tracking = await this.prisma.tracking.findUnique({
      where: { id: trackingId },
    });
    if (!tracking) throw new NotFoundException('追踪记录不存在');
    if (tracking.isClosed) throw new BadRequestException('追踪已关闭');

    const [baseline, followup] = await Promise.all([
      this.prisma.assessmentResult.findUnique({ where: { id: tracking.baselineResultId } }),
      this.prisma.assessmentResult.findUnique({ where: { id: followupResultId } }),
    ]);
    if (!baseline) throw new NotFoundException('基线测评结果不存在');
    if (!followup) throw new NotFoundException('随访测评结果不存在');

    // 计算改善幅度
    const totalImprovement = followup.totalScore - baseline.totalScore;
    const lawImprovement = followup.lawScore - baseline.lawScore;
    const psychologyImprovement = followup.psychologyScore - baseline.psychologyScore;

    // 判定效果
    const effectiveness = this.determineEffectiveness(totalImprovement, baseline.riskLevel, followup.riskLevel);

    // 更新轨迹
    const trajectory = (tracking.trajectory as any[]) ?? [];
    trajectory.push({
      timestamp: new Date().toISOString(),
      event: 'EFFECTIVENESS_EVALUATED',
      followupResultId,
      improvement: { total: totalImprovement, law: lawImprovement, psychology: psychologyImprovement },
      effectiveness,
    });

    const updated = await this.prisma.tracking.update({
      where: { id: trackingId },
      data: {
        followupResultId,
        effectiveness: effectiveness as any,
        trajectory,
      },
    });

    return {
      tracking: updated,
      evaluation: {
        baseline: { totalScore: baseline.totalScore, riskLevel: baseline.riskLevel },
        followup: { totalScore: followup.totalScore, riskLevel: followup.riskLevel },
        improvement: { total: totalImprovement, law: lawImprovement, psychology: psychologyImprovement },
        effectiveness,
      },
    };
  }

  /** 获取追踪轨迹 */
  async getTrajectory(trackingId: string) {
    const tracking = await this.prisma.tracking.findUnique({
      where: { id: trackingId },
      include: { intervention: true },
    });
    if (!tracking) throw new NotFoundException('追踪记录不存在');
    return tracking;
  }

  /** 获取学生的所有追踪记录 */
  async getStudentTrackings(studentId: string) {
    return this.prisma.tracking.findMany({
      where: { studentId },
      include: { intervention: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 升级干预：效果不佳时升级干预级别 */
  async escalateIntervention(trackingId: string) {
    const tracking = await this.prisma.tracking.findUnique({
      where: { id: trackingId },
      include: { intervention: true },
    });
    if (!tracking) throw new NotFoundException('追踪记录不存在');
    if (tracking.isClosed) throw new BadRequestException('追踪已关闭');

    // 升级干预
    const escalatedIntervention = await this.prisma.intervention.update({
      where: { id: tracking.interventionId },
      data: {
        level: tracking.intervention.level + 1,
        status: 'ESCALATED',
        actedAt: new Date(),
      },
    });

    // 更新轨迹
    const trajectory = (tracking.trajectory as any[]) ?? [];
    trajectory.push({
      timestamp: new Date().toISOString(),
      event: 'INTERVENTION_ESCALATED',
      newLevel: escalatedIntervention.level,
    });

    await this.prisma.tracking.update({
      where: { id: trackingId },
      data: { trajectory },
    });

    return escalatedIntervention;
  }

  /** 关闭追踪 */
  async closeTracking(trackingId: string, reason: string) {
    const tracking = await this.prisma.tracking.findUnique({
      where: { id: trackingId },
    });
    if (!tracking) throw new NotFoundException('追踪记录不存在');
    if (tracking.isClosed) throw new BadRequestException('追踪已关闭');

    const trajectory = (tracking.trajectory as any[]) ?? [];
    trajectory.push({
      timestamp: new Date().toISOString(),
      event: 'TRACKING_CLOSED',
      reason,
    });

    return this.prisma.tracking.update({
      where: { id: trackingId },
      data: { isClosed: true, trajectory },
    });
  }

  /** 判定效果 */
  private determineEffectiveness(improvement: number, baselineRisk: string, followupRisk: string): Effectiveness {
    // 风险等级降低且改善明显
    if (improvement >= 15 && this.isRiskReduced(baselineRisk, followupRisk)) {
      return 'EFFECTIVE';
    }
    // 有一定改善
    if (improvement >= 5) {
      return 'PARTIAL';
    }
    // 无改善或恶化
    return 'INEFFECTIVE';
  }

  /** 判断风险是否降低 */
  private isRiskReduced(baseline: string, followup: string): boolean {
    const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'];
    return order.indexOf(followup) > order.indexOf(baseline);
  }
}
