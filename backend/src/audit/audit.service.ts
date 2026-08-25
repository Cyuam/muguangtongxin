import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /** 记录审计日志 */
  async log(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    detail?: any;
    ip?: string;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: params.userId ?? null,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId ?? null,
          detail: params.detail ?? null,
          ip: params.ip ?? null,
        },
      });
    } catch (err) {
      this.logger.error(`审计日志记录失败: ${(err as Error).message}`);
    }
  }

  /** 查询审计日志 */
  async queryLogs(params: {
    userId?: string;
    action?: string;
    entity?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
  }) {
    const { userId, action, entity, startDate, endDate, page = 1, pageSize = 20 } = params;

    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };

    const where = {
      ...(userId && { userId }),
      ...(action && { action }),
      ...(entity && { entity }),
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /** 获取操作统计 */
  async getActionStats(startDate?: Date, endDate?: Date): Promise<Record<string, number>> {
    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };

    const logs = await this.prisma.auditLog.findMany({
      where: {
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
      select: { action: true },
    });

    const stats: Record<string, number> = {};
    for (const log of logs) {
      stats[log.action] = (stats[log.action] ?? 0) + 1;
    }
    return stats;
  }
}
