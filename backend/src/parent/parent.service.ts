import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParentService {
  constructor(private prisma: PrismaService) {}

  /** 获取预警列表 */
  async getWarnings(parentId: string, status?: string) {
    return this.prisma.warning.findMany({
      where: {
        parentId,
        ...(status && { status }),
      },
      include: {
        result: {
          include: { session: { include: { scale: true } } },
        },
      },
      orderBy: { notifiedAt: 'desc' },
    });
  }

  /** 获取预警详情 */
  async getWarning(warningId: string, parentId: string) {
    const warning = await this.prisma.warning.findUnique({
      where: { id: warningId },
      include: {
        result: {
          include: { session: { include: { scale: true, student: true } } },
        },
      },
    });
    if (!warning) throw new NotFoundException('预警不存在');
    if (warning.parentId !== parentId) throw new NotFoundException('无权限查看此预警');

    // 标记为已读
    if (warning.status === 'UNREAD') {
      await this.prisma.warning.update({
        where: { id: warningId },
        data: { status: 'READ', readAt: new Date() },
      });
    }

    return warning;
  }

  /** 获取监护建议列表 */
  async getCareAdvices(parentId: string) {
    return this.prisma.careAdvice.findMany({
      where: { parentId },
      orderBy: { pushedAt: 'desc' },
    });
  }

  /** 监护建议反馈 */
  async feedbackCareAdvice(adviceId: string, parentId: string, feedback: string) {
    const advice = await this.prisma.careAdvice.findUnique({
      where: { id: adviceId },
    });
    if (!advice) throw new NotFoundException('监护建议不存在');
    if (advice.parentId !== parentId) throw new NotFoundException('无权限操作此建议');

    return this.prisma.careAdvice.update({
      where: { id: adviceId },
      data: { feedback },
    });
  }

  /** 获取亲子任务列表 */
  async getTasks(parentId: string, status?: string) {
    return this.prisma.parentTask.findMany({
      where: {
        parentId,
        ...(status && { status }),
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  /** 创建亲子任务 */
  async createTask(parentId: string, task: {
    studentId: string;
    title: string;
    description: string;
    category: string;
    pointsReward: number;
  }) {
    return this.prisma.parentTask.create({
      data: {
        parentId,
        studentId: task.studentId,
        title: task.title,
        description: task.description,
        category: task.category,
        pointsReward: task.pointsReward,
        status: 'PUBLISHED',
      },
    });
  }

  /** 验证亲子任务完成 */
  async verifyTask(taskId: string, parentId: string) {
    const task = await this.prisma.parentTask.findUnique({
      where: { id: taskId },
    });
    if (!task) throw new NotFoundException('任务不存在');
    if (task.parentId !== parentId) throw new NotFoundException('无权限操作此任务');
    if (task.status !== 'COMPLETED') {
      throw new NotFoundException('任务尚未完成，无法验证');
    }

    return this.prisma.parentTask.update({
      where: { id: taskId },
      data: { status: 'VERIFIED', verifiedAt: new Date() },
    });
  }

  /** 获取关联儿童列表 */
  async getChildren(parentId: string) {
    const relations = await this.prisma.userRelation.findMany({
      where: { fromUserId: parentId, relationType: 'PARENT_OF' },
      include: {
        toUser: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            ageGroup: true,
            isLeftBehind: true,
          },
        },
      },
    });
    return relations.map((r) => r.toUser);
  }
}
