import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /** 总览：辖区整体数据概览 */
  async getDashboardOverview(jurisdiction: string) {
    const classes = await this.prisma.class.findMany({
      where: { jurisdiction },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                assessmentSessions: {
                  where: { status: 'COMPLETED' },
                  select: { id: true, result: { select: { riskLevel: true, totalScore: true } } },
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
    const riskDistribution: Record<string, number> = {};
    for (const result of allResults) {
      const level = result.riskLevel as string;
      riskDistribution[level] = (riskDistribution[level] ?? 0) + 1;
    }

    // 协同任务统计
    const collabTasks = await this.prisma.collabTask.findMany();
    const openTasks = collabTasks.filter((t) => t.status === 'OPEN').length;

    // 报告统计
    const reports = await this.prisma.governanceReport.findMany({
      where: { jurisdiction },
    });

    return {
      jurisdiction,
      classCount: classes.length,
      studentCount: allStudents.length,
      assessedStudentCount: allStudents.filter((s) => s.assessmentSessions.length > 0).length,
      totalAssessments: allResults.length,
      riskDistribution,
      collabTaskStats: { total: collabTasks.length, open: openTasks },
      reportCount: reports.length,
    };
  }

  /** 风险地图：按班级展示风险分布 */
  async getDashboardRiskMap(jurisdiction: string) {
    const classes = await this.prisma.class.findMany({
      where: { jurisdiction },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                assessmentSessions: {
                  where: { status: 'COMPLETED' },
                  select: { result: { select: { riskLevel: true } } },
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
      const riskDist: Record<string, number> = {};
      for (const r of results) {
        const level = r.riskLevel as string;
        riskDist[level] = (riskDist[level] ?? 0) + 1;
      }
      const highRiskCount = (riskDist.HIGH ?? 0) + (riskDist.CRITICAL ?? 0);
      return {
        classId: c.id,
        className: c.name,
        schoolName: c.schoolName,
        grade: c.grade,
        studentCount: c.enrollments.length,
        riskDistribution: riskDist,
        highRiskCount,
      };
    });
  }

  /** 协同状态：多端协同任务状态 */
  async getDashboardCollabStatus(jurisdiction: string) {
    const classes = await this.prisma.class.findMany({
      where: { jurisdiction },
      select: { teacherId: true },
    });
    const teacherIds = classes.map((c) => c.teacherId);

    const collabTasks = await this.prisma.collabTask.findMany({
      where: { initiatorId: { in: teacherIds } },
      orderBy: { createdAt: 'desc' },
    });

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const task of collabTasks) {
      byStatus[task.status] = (byStatus[task.status] ?? 0) + 1;
      byType[task.type] = (byType[task.type] ?? 0) + 1;
    }

    return {
      total: collabTasks.length,
      byStatus,
      byType,
      recent: collabTasks.slice(0, 10),
    };
  }

  /** 生成报告 */
  async generateReport(jurisdiction: string, period: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const classes = await this.prisma.class.findMany({
      where: { jurisdiction },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                assessmentSessions: {
                  where: {
                    status: 'COMPLETED',
                    completedAt: { gte: start, lte: end },
                  },
                  include: { result: true },
                },
              },
            },
          },
        },
      },
    });

    const allResults = classes.flatMap((c) =>
      c.enrollments.flatMap((e) =>
        e.student.assessmentSessions.map((s) => s.result).filter(Boolean),
      ),
    );

    const content = {
      jurisdiction,
      period,
      dateRange: { startDate: start, endDate: end },
      totalAssessments: allResults.length,
      avgScore: allResults.length > 0
        ? allResults.reduce((s, r) => s + r.totalScore, 0) / allResults.length
        : 0,
      classCount: classes.length,
      generatedAt: new Date().toISOString(),
    };

    return this.prisma.governanceReport.create({
      data: {
        jurisdiction,
        period,
        startDate: start,
        endDate: end,
        content,
      },
    });
  }

  /** 获取报告列表 */
  async getReports(jurisdiction?: string, page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.governanceReport.findMany({
        where: { ...(jurisdiction && { jurisdiction }) },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.governanceReport.count({
        where: { ...(jurisdiction && { jurisdiction }) },
      }),
    ]);
    return { items, total, page, pageSize };
  }

  /** 下载报告 */
  async downloadReport(reportId: string) {
    const report = await this.prisma.governanceReport.findUnique({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('报告不存在');
    return {
      fileUrl: report.fileUrl ?? `reports/${reportId}.pdf`,
      format: 'PDF',
      content: report.content,
    };
  }
}
