import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** 报告周期 */
export type ReportPeriod = 'WEEKLY' | 'MONTHLY' | 'TERM';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  /** 生成治理报告 */
  async generateReport(jurisdiction: string, period: ReportPeriod, startDate: Date, endDate: Date) {
    // 聚合辖区数据
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
                    completedAt: { gte: startDate, lte: endDate },
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

    // 统计数据
    const stats = this.computeReportStats(allResults);
    const riskDistribution = this.computeRiskDistribution(allResults);
    const classSummaries = this.computeClassSummaries(classes);

    const content = {
      jurisdiction,
      period,
      dateRange: { startDate, endDate },
      stats,
      riskDistribution,
      classSummaries,
      generatedAt: new Date().toISOString(),
    };

    // 存储报告
    const report = await this.prisma.governanceReport.create({
      data: {
        jurisdiction,
        period,
        startDate,
        endDate,
        content,
      },
    });

    return report;
  }

  /** 获取报告列表 */
  async getReports(jurisdiction?: string, period?: ReportPeriod, page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.governanceReport.findMany({
        where: {
          ...(jurisdiction && { jurisdiction }),
          ...(period && { period }),
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.governanceReport.count({
        where: {
          ...(jurisdiction && { jurisdiction }),
          ...(period && { period }),
        },
      }),
    ]);
    return { items, total, page, pageSize };
  }

  /** 获取报告详情 */
  async getReport(reportId: string) {
    const report = await this.prisma.governanceReport.findUnique({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('报告不存在');
    return report;
  }

  /** 导出 PDF */
  async exportPdf(reportId: string): Promise<{ fileUrl: string; format: string }> {
    const report = await this.getReport(reportId);

    // 生成 PDF 文件（实际项目中使用 pdfkit 或 puppeteer）
    const fileUrl = `reports/${reportId}.pdf`;

    // 更新报告文件 URL
    await this.prisma.governanceReport.update({
      where: { id: reportId },
      data: { fileUrl },
    });

    return { fileUrl, format: 'PDF' };
  }

  /** 导出 Excel */
  async exportExcel(reportId: string): Promise<{ fileUrl: string; format: string }> {
    const report = await this.getReport(reportId);

    // 生成 Excel 文件（实际项目中使用 exceljs）
    const fileUrl = `reports/${reportId}.xlsx`;

    await this.prisma.governanceReport.update({
      where: { id: reportId },
      data: { fileUrl },
    });

    return { fileUrl, format: 'EXCEL' };
  }

  /** 分享存档 */
  async shareReport(reportId: string, shareTo: string[]): Promise<{ shared: boolean; shareTo: string[] }> {
    const report = await this.getReport(reportId);

    // 记录分享操作
    await this.prisma.auditLog.create({
      data: {
        action: 'REPORT_SHARED',
        entity: 'GOVERNANCE_REPORT',
        entityId: reportId,
        detail: { shareTo, reportPeriod: report.period, jurisdiction: report.jurisdiction },
      },
    });

    return { shared: true, shareTo };
  }

  /** 计算报告统计 */
  private computeReportStats(results: any[]): any {
    if (results.length === 0) {
      return { totalAssessments: 0, avgTotal: 0, avgLaw: 0, avgPsychology: 0 };
    }
    const sum = results.reduce(
      (acc, r) => ({
        total: acc.total + r.totalScore,
        law: acc.law + r.lawScore,
        psychology: acc.psychology + r.psychologyScore,
      }),
      { total: 0, law: 0, psychology: 0 },
    );
    return {
      totalAssessments: results.length,
      avgTotal: Math.round((sum.total / results.length) * 100) / 100,
      avgLaw: Math.round((sum.law / results.length) * 100) / 100,
      avgPsychology: Math.round((sum.psychology / results.length) * 100) / 100,
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

  /** 计算班级摘要 */
  private computeClassSummaries(classes: any[]): any[] {
    return classes.map((c) => {
      const results = c.enrollments.flatMap((e: any) =>
        e.student.assessmentSessions.map((s: any) => s.result).filter(Boolean),
      );
      const avgScore = results.length > 0
        ? results.reduce((a: number, r: any) => a + r.totalScore, 0) / results.length
        : 0;
      return {
        classId: c.id,
        className: c.name,
        schoolName: c.schoolName,
        studentCount: c.enrollments.length,
        assessedCount: results.length,
        avgScore: Math.round(avgScore * 100) / 100,
      };
    });
  }
}
