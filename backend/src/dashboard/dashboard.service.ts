import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskLevel } from '../common/constants/enums';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /** 总览：辖区整体数据概览 */
  async getOverview(jurisdiction: string) {
    const classes = await this.prisma.class.findMany({
      where: { jurisdiction },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                assessmentSessions: {
                  where: { status: 'COMPLETED' },
                  include: { result: true },
                },
              },
            },
          },
        },
      },
    });

    const allStudents = classes.flatMap((c) => c.enrollments.map((e) => e.student));
    const allResults = allStudents.flatMap((s) =>
      s.assessmentSessions.map((sess) => sess.result).filter(Boolean),
    );

    // 风险分布
    const riskDistribution = this.computeRiskDistribution(allResults);

    // 协同状态
    const collabTasks = await this.prisma.collabTask.findMany({
      where: { initiatorId: { in: allStudents.map((s) => s.id) } },
    });

    return {
      jurisdiction,
      classCount: classes.length,
      studentCount: allStudents.length,
      assessedStudentCount: allStudents.filter((s) => s.assessmentSessions.length > 0).length,
      totalAssessments: allResults.length,
      riskDistribution,
      collabTaskStats: {
        total: collabTasks.length,
        open: collabTasks.filter((t) => t.status === 'OPEN').length,
        closed: collabTasks.filter((t) => t.status === 'CLOSED').length,
      },
    };
  }

  /** 风险地图：按班级/学校展示风险分布 */
  async getRiskMap(jurisdiction: string) {
    const classes = await this.prisma.class.findMany({
      where: { jurisdiction },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                assessmentSessions: {
                  where: { status: 'COMPLETED' },
                  include: { result: true },
                },
              },
            },
          },
        },
      },
    });

    return classes.map((c) => {
      const results = c.enrollments.flatMap((e) =>
        e.student.assessmentSessions.map((s) => s.result).filter(Boolean),
      );
      const riskDist = this.computeRiskDistribution(results);
      const highRiskCount = (riskDist.HIGH ?? 0) + (riskDist.CRITICAL ?? 0);
      return {
        classId: c.id,
        className: c.name,
        schoolName: c.schoolName,
        grade: c.grade,
        studentCount: c.enrollments.length,
        assessedCount: results.length,
        riskDistribution: riskDist,
        highRiskCount,
        riskLevel: this.determineClassRiskLevel(highRiskCount, c.enrollments.length),
      };
    });
  }

  /** 协同状态：多端协同任务状态 */
  async getCollabStatus(jurisdiction: string) {
    const classes = await this.prisma.class.findMany({
      where: { jurisdiction },
      select: { id: true, name: true, teacherId: true },
    });

    const teacherIds = classes.map((c) => c.teacherId);
    const collabTasks = await this.prisma.collabTask.findMany({
      where: { initiatorId: { in: teacherIds } },
      orderBy: { createdAt: 'desc' },
    });

    // 按类型分组
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const task of collabTasks) {
      byType[task.type] = (byType[task.type] ?? 0) + 1;
      byStatus[task.status] = (byStatus[task.status] ?? 0) + 1;
    }

    return {
      totalTasks: collabTasks.length,
      byType,
      byStatus,
      recentTasks: collabTasks.slice(0, 10),
    };
  }

  /** 多维筛选：按条件筛选数据 */
  async filterData(params: {
    jurisdiction: string;
    classId?: string;
    grade?: number;
    riskLevel?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { jurisdiction, classId, grade, riskLevel, startDate, endDate } = params;

    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };

    const classes = await this.prisma.class.findMany({
      where: {
        jurisdiction,
        ...(classId && { id: classId }),
        ...(grade && { grade }),
      },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                assessmentSessions: {
                  where: {
                    status: 'COMPLETED',
                    ...(Object.keys(dateFilter).length > 0 && { completedAt: dateFilter }),
                  },
                  include: { result: true },
                },
              },
            },
          },
        },
      },
    });

    let results = classes.flatMap((c) =>
      c.enrollments.flatMap((e) =>
        e.student.assessmentSessions.map((s) => s.result).filter(Boolean),
      ),
    );

    // 按风险等级筛选
    if (riskLevel) {
      results = results.filter((r) => r.riskLevel === riskLevel);
    }

    return {
      classes: classes.map((c) => ({
        id: c.id,
        name: c.name,
        schoolName: c.schoolName,
        grade: c.grade,
      })),
      results,
      count: results.length,
    };
  }

  /** 计算风险分布 */
  private computeRiskDistribution(results: any[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    for (const result of results) {
      const level = result.riskLevel as string;
      distribution[level] = (distribution[level] ?? 0) + 1;
    }
    return distribution;
  }

  /** 判定班级风险等级 */
  private determineClassRiskLevel(highRiskCount: number, totalStudents: number): string {
    if (totalStudents === 0) return RiskLevel.NONE;
    const ratio = highRiskCount / totalStudents;
    if (ratio >= 0.3) return RiskLevel.HIGH;
    if (ratio >= 0.15) return RiskLevel.MEDIUM;
    if (ratio >= 0.05) return RiskLevel.LOW;
    return RiskLevel.NONE;
  }
}
