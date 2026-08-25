import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** 诊断范围 */
export type DiagnosisScope = 'INDIVIDUAL' | 'CLASS' | 'GRADE' | 'DISTRICT';

@Injectable()
export class DiagnosisService {
  constructor(private prisma: PrismaService) {}

  /** 个体诊断：基于测评结果生成诊断报告 */
  async diagnoseIndividual(resultId: string) {
    const result = await this.prisma.assessmentResult.findUnique({
      where: { id: resultId },
      include: { session: { include: { student: true, scale: true } } },
    });
    if (!result) throw new NotFoundException('测评结果不存在');

    // 识别薄弱点
    const weakPoints = this.identifyWeakPoints(result.dimensionScores as Record<string, number>);
    const riskProfile = this.buildRiskProfile(result);

    // 检查是否已有诊断记录
    const existing = await this.prisma.diagnosis.findUnique({
      where: { resultId },
    });
    if (existing) {
      return this.prisma.diagnosis.update({
        where: { id: existing.id },
        data: { weakPoints, riskProfile },
      });
    }

    return this.prisma.diagnosis.create({
      data: {
        resultId,
        scope: 'INDIVIDUAL',
        targetId: result.session.studentId,
        weakPoints,
        riskProfile,
      },
    });
  }

  /** 班级诊断：聚合班级所有学生的测评结果 */
  async diagnoseClass(classId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId },
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
    });

    const studentResults = enrollments.map((e) => ({
      student: e.student,
      results: e.student.assessmentSessions
        .map((s) => s.result)
        .filter(Boolean),
    }));

    // 聚合统计
    const allResults = studentResults.flatMap((sr) => sr.results);
    const classStats = this.aggregateStats(allResults);
    const classWeakPoints = this.identifyClassWeakPoints(allResults);

    return {
      classId,
      studentCount: enrollments.length,
      assessedCount: studentResults.filter((sr) => sr.results.length > 0).length,
      stats: classStats,
      weakPoints: classWeakPoints,
      students: studentResults.map((sr) => ({
        studentId: sr.student.id,
        studentName: sr.student.name,
        resultCount: sr.results.length,
        latestResult: sr.results[sr.results.length - 1] ?? null,
      })),
    };
  }

  /** 辖区诊断：聚合辖区所有学校的测评结果 */
  async diagnoseDistrict(jurisdiction: string) {
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

    const allResults = classes.flatMap((c) =>
      c.enrollments.flatMap((e) =>
        e.student.assessmentSessions.map((s) => s.result).filter(Boolean),
      ),
    );

    const districtStats = this.aggregateStats(allResults);
    const districtWeakPoints = this.identifyClassWeakPoints(allResults);

    // 风险分布
    const riskDistribution = this.calculateRiskDistribution(allResults);

    return {
      jurisdiction,
      classCount: classes.length,
      totalAssessments: allResults.length,
      stats: districtStats,
      weakPoints: districtWeakPoints,
      riskDistribution,
    };
  }

  /** 获取诊断详情 */
  async getDiagnosis(diagnosisId: string) {
    const diagnosis = await this.prisma.diagnosis.findUnique({
      where: { id: diagnosisId },
      include: { result: true, interventions: true },
    });
    if (!diagnosis) throw new NotFoundException('诊断记录不存在');
    return diagnosis;
  }

  /** 识别薄弱点：得分低于阈值的维度 */
  identifyWeakPoints(dimensionScores: Record<string, number>): any[] {
    const THRESHOLD = 50;
    return Object.entries(dimensionScores)
      .filter(([, score]) => score < THRESHOLD)
      .map(([dimension, score]) => ({
        dimension,
        score,
        severity: score < 30 ? 'CRITICAL' : score < 40 ? 'HIGH' : 'MEDIUM',
      }))
      .sort((a, b) => a.score - b.score);
  }

  /** 识别班级薄弱点：平均得分低于阈值的维度 */
  private identifyClassWeakPoints(results: any[]): any[] {
    const dimensionAggregates: Record<string, number[]> = {};
    for (const result of results) {
      const dims = result.dimensionScores as Record<string, number>;
      for (const [dim, score] of Object.entries(dims)) {
        if (!dimensionAggregates[dim]) dimensionAggregates[dim] = [];
        dimensionAggregates[dim].push(score);
      }
    }
    return Object.entries(dimensionAggregates)
      .map(([dim, scores]) => ({
        dimension: dim,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        studentCount: scores.length,
      }))
      .filter((d) => d.avgScore < 60)
      .sort((a, b) => a.avgScore - b.avgScore);
  }

  /** 构建风险画像 */
  private buildRiskProfile(result: any): any {
    return {
      riskLevel: result.riskLevel,
      totalScore: result.totalScore,
      lawScore: result.lawScore,
      psychologyScore: result.psychologyScore,
      recommendation: this.getRecommendation(result.riskLevel),
    };
  }

  /** 聚合统计 */
  private aggregateStats(results: any[]): any {
    if (results.length === 0) {
      return { avgTotal: 0, avgLaw: 0, avgPsychology: 0, count: 0 };
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
      avgTotal: sum.total / results.length,
      avgLaw: sum.law / results.length,
      avgPsychology: sum.psychology / results.length,
      count: results.length,
    };
  }

  /** 计算风险分布 */
  private calculateRiskDistribution(results: any[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    for (const result of results) {
      const level = result.riskLevel as string;
      distribution[level] = (distribution[level] ?? 0) + 1;
    }
    return distribution;
  }

  /** 根据风险等级获取建议 */
  private getRecommendation(riskLevel: string): string {
    const recommendations: Record<string, string> = {
      NONE: '表现良好，继续保持',
      LOW: '关注薄弱维度，适当引导',
      MEDIUM: '需要针对性辅导和关注',
      HIGH: '建议启动干预计划，加强监护',
      CRITICAL: '紧急干预，建议专业心理辅导',
    };
    return recommendations[riskLevel] ?? '关注学生状态';
  }
}
