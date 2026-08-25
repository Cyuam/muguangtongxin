import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    const { passwordHash, ...result } = user;
    return result;
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  /** 获取用户的关系绑定 */
  async getRelations(userId: string) {
    const [fromRelations, toRelations] = await Promise.all([
      this.prisma.userRelation.findMany({
        where: { fromUserId: userId },
        include: { toUser: true },
      }),
      this.prisma.userRelation.findMany({
        where: { toUserId: userId },
        include: { fromUser: true },
      }),
    ]);

    return { fromRelations, toRelations };
  }

  /** 获取关联儿童（家长视角） */
  async getRelatedChildren(parentId: string) {
    const relations = await this.prisma.userRelation.findMany({
      where: { fromUserId: parentId, relationType: 'PARENT_OF' },
      include: { toUser: true },
    });
    return relations.map((r) => r.toUser);
  }

  /** 获取班级学生（教师视角） */
  async getClassStudents(teacherId: string, classId: string) {
    const cls = await this.prisma.class.findFirst({
      where: { id: classId, teacherId },
      include: {
        enrollments: {
          include: { student: true },
        },
      },
    });
    if (!cls) throw new NotFoundException('班级不存在或无权限');
    return cls.enrollments.map((e) => e.student);
  }
}
