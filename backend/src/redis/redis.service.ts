import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit(): void {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.client = new Redis({
      host,
      port,
      password,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Redis 连接已建立');
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis 连接错误: ${err.message}`);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit();
  }

  /** 获取 Redis 客户端 */
  get Client(): Redis {
    return this.client;
  }

  /** 缓存测评断点续测进度 */
  async cacheAssessmentProgress(sessionId: string, answers: Record<string, string>): Promise<void> {
    await this.client.set(
      `assessment:progress:${sessionId}`,
      JSON.stringify(answers),
      'EX',
      7200, // 2 小时过期
    );
  }

  /** 获取测评进度 */
  async getAssessmentProgress(sessionId: string): Promise<Record<string, string> | null> {
    const data = await this.client.get(`assessment:progress:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  /** 清除测评进度 */
  async clearAssessmentProgress(sessionId: string): Promise<void> {
    await this.client.del(`assessment:progress:${sessionId}`);
  }

  /** 记录游戏连续时长 */
  async incrGameDuration(studentId: string): Promise<number> {
    const key = `game:duration:${studentId}`;
    const count = await this.client.incr(key);
    if (count === 1) {
      await this.client.expire(key, 3600); // 1 小时窗口
    }
    return count;
  }

  /** 重置游戏时长 */
  async resetGameDuration(studentId: string): Promise<void> {
    await this.client.del(`game:duration:${studentId}`);
  }

  /** 排行榜：增加积分 */
  async zincrby(leaderboardKey: string, amount: number, memberId: string): Promise<void> {
    await this.client.zincrby(leaderboardKey, amount, memberId);
  }

  /** 排行榜：获取 Top N */
  async ztop(leaderboardKey: string, n: number): Promise<Array<{ member: string; score: number }>> {
    const results = await this.client.zrevrange(leaderboardKey, 0, n - 1, 'WITHSCORES');
    const items: Array<{ member: string; score: number }> = [];
    for (let i = 0; i < results.length; i += 2) {
      items.push({ member: results[i], score: Number(results[i + 1]) });
    }
    return items;
  }

  /** 排行榜：获取成员排名 */
  async zrank(leaderboardKey: string, memberId: string): Promise<number | null> {
    const rank = await this.client.zrevrank(leaderboardKey, memberId);
    return rank;
  }
}
