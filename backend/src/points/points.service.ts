import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

/** 积分来源类型 */
export type PointSource = 'ASSESSMENT' | 'GAME' | 'TASK' | 'REDEEM';

/** 成就徽章定义 */
const ACHIEVEMENT_DEFINITIONS: Record<string, string> = {
  FIRST_ASSESSMENT: '首次完成测评',
  FULL_SCORE: '满分通关',
  GAME_EXPLORER: '游戏探索者',
  LAW_MASTER: '法治小达人',
  STREAK_7: '连续学习7天',
  PARENT_PARTNER: '亲子共学之星',
};

@Injectable()
export class PointsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /** 获取用户积分余额 */
  async getBalance(userId: string): Promise<number> {
    const latest = await this.prisma.pointLedger.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return latest?.balance ?? 0;
  }

  /** 发放积分 */
  async awardPoints(
    userId: string,
    amount: number,
    source: PointSource,
    sourceId: string | null,
    description: string,
  ) {
    if (amount <= 0) throw new BadRequestException('积分数量必须大于 0');

    const currentBalance = await this.getBalance(userId);
    const newBalance = currentBalance + amount;

    const ledger = await this.prisma.pointLedger.create({
      data: {
        userId,
        amount,
        source,
        sourceId,
        description,
        balance: newBalance,
      },
    });

    // 更新排行榜
    await this.redis.zincrby('leaderboard:points', amount, userId);

    return ledger;
  }

  /** 消耗积分 */
  async consumePoints(
    userId: string,
    amount: number,
    source: PointSource,
    description: string,
  ) {
    if (amount <= 0) throw new BadRequestException('积分数量必须大于 0');

    const currentBalance = await this.getBalance(userId);
    if (currentBalance < amount) {
      throw new BadRequestException('积分余额不足');
    }

    const newBalance = currentBalance - amount;

    const ledger = await this.prisma.pointLedger.create({
      data: {
        userId,
        amount: -amount,
        source,
        description,
        balance: newBalance,
      },
    });

    // 更新排行榜
    await this.redis.zincrby('leaderboard:points', -amount, userId);

    return ledger;
  }

  /** 获取积分流水记录 */
  async getLedger(userId: string, page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.pointLedger.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.pointLedger.count({ where: { userId } }),
    ]);
    return { items, total, page, pageSize };
  }

  /** 获取排行榜 */
  async getLeaderboard(topN = 50) {
    const rankings = await this.redis.ztop('leaderboard:points', topN);
    // 批量获取用户信息
    const userIds = rankings.map((r) => r.member);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatarUrl: true, role: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return rankings.map((r, index) => ({
      rank: index + 1,
      userId: r.member,
      score: r.score,
      user: userMap.get(r.member),
    }));
  }

  /** 获取用户排名 */
  async getUserRank(userId: string) {
    const rank = await this.redis.zrank('leaderboard:points', userId);
    const balance = await this.getBalance(userId);
    return { rank, balance };
  }

  /** 积分兑换 */
  async redeem(userId: string, itemCode: string, cost: number) {
    const ledger = await this.consumePoints(
      userId,
      cost,
      'REDEEM',
      `兑换: ${itemCode}`,
    );
    return { ledger, itemCode, cost };
  }

  /** 获取成就徽章列表 */
  async getAchievements(userId: string) {
    const achievements = await this.prisma.achievement.findMany({
      where: { userId },
      orderBy: { awardedAt: 'desc' },
    });

    // 合并已获得和未获得的徽章定义
    const earnedCodes = new Set(achievements.map((a) => a.badgeCode));
    const allBadges = Object.entries(ACHIEVEMENT_DEFINITIONS).map(([code, name]) => ({
      badgeCode: code,
      badgeName: name,
      earned: earnedCodes.has(code),
    }));

    return { earned: achievements, allBadges };
  }

  /** 授予成就徽章 */
  async awardBadge(userId: string, badgeCode: string) {
    const badgeName = ACHIEVEMENT_DEFINITIONS[badgeCode];
    if (!badgeName) throw new BadRequestException('无效的徽章代码');

    // 检查是否已获得
    const existing = await this.prisma.achievement.findUnique({
      where: { userId_badgeCode: { userId, badgeCode } },
    });
    if (existing) return existing;

    return this.prisma.achievement.create({
      data: { userId, badgeCode, badgeName },
    });
  }
}
