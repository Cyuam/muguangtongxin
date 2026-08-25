import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRelationDto } from './dto/create-relation.dto';

@Injectable()
export class RelationsService {
  constructor(private prisma: PrismaService) {}

  /** 创建关系绑定 */
  async createRelation(dto: CreateRelationDto) {
    const fromUser = await this.prisma.user.findUnique({ where: { id: dto.fromUserId } });
    const toUser = await this.prisma.user.findUnique({ where: { id: dto.toUserId } });

    if (!fromUser || !toUser) {
      throw new NotFoundException('用户不存在');
    }

    // 校验关系类型与角色匹配
    if (dto.relationType === 'PARENT_OF') {
      if (fromUser.role !== 'PARENT' || toUser.role !== 'CHILD') {
        throw new BadRequestException('PARENT_OF 关系要求 from 为家长、to 为儿童');
      }
    } else if (dto.relationType === 'TEACHER_OF') {
      if (fromUser.role !== 'TEACHER' || toUser.role !== 'CHILD') {
        throw new BadRequestException('TEACHER_OF 关系要求 from 为教师、to 为儿童');
      }
    } else if (dto.relationType === 'GUARDIAN_OF') {
      if (fromUser.role !== 'PARENT' || toUser.role !== 'CHILD') {
        throw new BadRequestException('GUARDIAN_OF 关系要求 from 为家长、to 为儿童');
      }
    }

    // 检查是否已存在
    const existing = await this.prisma.userRelation.findUnique({
      where: {
        fromUserId_toUserId_relationType: {
          fromUserId: dto.fromUserId,
          toUserId: dto.toUserId,
          relationType: dto.relationType,
        },
      },
    });

    if (existing) {
      throw new ConflictException('该关系绑定已存在');
    }

    return this.prisma.userRelation.create({
      data: {
        fromUserId: dto.fromUserId,
        toUserId: dto.toUserId,
        relationType: dto.relationType,
      },
      include: { fromUser: true, toUser: true },
    });
  }

  /** 查询关系 */
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

  /** 解绑关系 */
  async deleteRelation(relationId: string) {
    const relation = await this.prisma.userRelation.findUnique({ where: { id: relationId } });
    if (!relation) throw new NotFoundException('关系不存在');
    await this.prisma.userRelation.delete({ where: { id: relationId } });
    return { success: true };
  }
}
