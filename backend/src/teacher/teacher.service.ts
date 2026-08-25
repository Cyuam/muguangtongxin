import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  /** 班级诊断：获取班级所有学生的测评诊断数据 */
  async getDiagnosisClass(teacherId: string, classId: string) {
    const cls = await this.prisma.class.findFirst({
      where: { id: classId, teacherId },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                assessmentSessions: {
                  where: { status: 'COMPLETED' },
                  include: {
                    result: {
                      include: { diagnosis: true },
                    },
                    scale: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!cls) throw new NotFoundException('班级不存在或无权限');

    const students = cls.enrollments.map((e) => {
      const results = e.student.assessmentSessions.map((s) => s.result).filter(Boolean);
      const latestResult = results[results.length - 1] ?? null;
      return {
        studentId: e.student.id,
        studentName: e.student.name,
        avatarUrl: e.student.avatarUrl,
        assessmentCount: results.length,
        latestResult,
        diagnosis: latestResult?.diagnosis ?? null,
      };
    });

    // 班级统计
    const allResults = students.flatMap((s) => s.latestResult ? [s.latestResult] : []);
    const avgScore = allResults.length > 0
      ? allResults.reduce((sum, r) => sum + r.totalScore, 0) / allResults.length
      : 0;

    return {
      classId: cls.id,
      className: cls.name,
      schoolName: cls.schoolName,
      grade: cls.grade,
      studentCount: cls.enrollments.length,
      assessedCount: students.filter((s) => s.assessmentCount > 0).length,
      avgScore: Math.round(avgScore * 100) / 100,
      students,
    };
  }

  /** 学生诊断：获取单个学生的详细诊断数据 */
  async getDiagnosisStudent(teacherId: string, studentId: string) {
    // 验证教师是否有权限查看该学生
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId, class: { teacherId } },
    });
    if (!enrollment) throw new NotFoundException('学生不存在或无权限');

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        assessmentSessions: {
          where: { status: 'COMPLETED' },
          include: {
            result: {
              include: { diagnosis: { include: { interventions: true } } },
            },
            scale: true,
          },
          orderBy: { completedAt: 'desc' },
        },
        gameSessions: {
          include: { scenario: true },
          orderBy: { startedAt: 'desc' },
        },
      },
    });
    if (!student) throw new NotFoundException('学生不存在');

    const { passwordHash, ...studentInfo } = student;
    return studentInfo;
  }

  /** 诊断趋势：获取班级测评趋势数据 */
  async getDiagnosisTrends(teacherId: string, classId: string, months = 6) {
    const cls = await this.prisma.class.findFirst({
      where: { id: classId, teacherId },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                assessmentSessions: {
                  where: {
                    status: 'COMPLETED',
                    completedAt: {
                      gte: new Date(new Date().setMonth(new Date().getMonth() - months)),
                    },
                  },
                  include: { result: true },
                },
              },
            },
          },
        },
      },
    });
    if (!cls) throw new NotFoundException('班级不存在或无权限');

    // 按月聚合
    const monthlyData: Record<string, any[]> = {};
    for (const enrollment of cls.enrollments) {
      for (const session of enrollment.student.assessmentSessions) {
        if (!session.result || !session.completedAt) continue;
        const monthKey = `${session.completedAt.getFullYear()}-${String(session.completedAt.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) monthlyData[monthKey] = [];
        monthlyData[monthKey].push(session.result);
      }
    }

    const trends = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, results]) => ({
        month,
        count: results.length,
        avgTotal: results.reduce((s, r) => s + r.totalScore, 0) / results.length,
        avgLaw: results.reduce((s, r) => s + r.lawScore, 0) / results.length,
        avgPsychology: results.reduce((s, r) => s + r.psychologyScore, 0) / results.length,
      }));

    return { classId, months, trends };
  }

  /** 获取教学建议列表 */
  async getAdvices(teacherId: string) {
    return this.prisma.intervention.findMany({
      where: { targetUserId: teacherId, type: 'TEACHING_ADVICE' },
      include: { diagnosis: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 教学建议反馈 */
  async feedbackAdvice(adviceId: string, teacherId: string, feedback: string) {
    const advice = await this.prisma.intervention.findUnique({
      where: { id: adviceId },
    });
    if (!advice) throw new NotFoundException('教学建议不存在');
    if (advice.targetUserId !== teacherId) throw new NotFoundException('无权限操作此建议');

    return this.prisma.intervention.update({
      where: { id: adviceId },
      data: {
        status: 'FEEDBACK',
        actedAt: new Date(),
        content: { ...(advice.content as any), feedback },
      },
    });
  }

  /** 获取教师的班级列表 */
  async getClasses(teacherId: string) {
    return this.prisma.class.findMany({
      where: { teacherId },
      include: {
        enrollments: { select: { id: true, studentId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
