import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AgeGroup } from '../common/constants/enums';

/** 游戏时长保护：1 小时窗口内最多 3 次 */
const MAX_SESSIONS_PER_HOUR = 3;

@Injectable()
export class GameService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /** 获取推荐游戏列表（按年龄段和主题筛选） */
  async getScenarios(ageGroup?: AgeGroup, theme?: string) {
    return this.prisma.gameScenario.findMany({
      where: {
        isActive: true,
        ...(ageGroup && { ageGroup }),
        ...(theme && { theme }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 获取游戏场景详情 */
  async getScenarioDetail(scenarioId: string) {
    const scenario = await this.prisma.gameScenario.findUnique({
      where: { id: scenarioId },
    });
    if (!scenario) throw new NotFoundException('游戏场景不存在');
    return scenario;
  }

  /** 开始游戏会话 */
  async startSession(scenarioId: string, studentId: string) {
    // 游戏时长保护：检查窗口内会话次数
    const sessionCount = await this.redis.incrGameDuration(studentId);
    if (sessionCount > MAX_SESSIONS_PER_HOUR) {
      await this.redis.resetGameDuration(studentId);
      throw new BadRequestException('游戏时长已达上限，请稍后再试');
    }

    const scenario = await this.prisma.gameScenario.findUnique({
      where: { id: scenarioId },
    });
    if (!scenario) throw new NotFoundException('游戏场景不存在');
    if (!scenario.isActive) throw new BadRequestException('游戏场景已下线');

    const script = scenario.script as any;
    const startNode = script.startNode ?? 'start';

    const session = await this.prisma.gameSession.create({
      data: {
        scenarioId,
        studentId,
        currentNode: startNode,
        history: [],
        choices: [],
      },
    });

    return {
      session,
      currentNode: this.getNode(script, startNode),
    };
  }

  /** 处理选择，返回反馈 */
  async processChoice(sessionId: string, choiceId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { scenario: true },
    });
    if (!session) throw new NotFoundException('游戏会话不存在');
    if (session.completedAt) throw new BadRequestException('游戏会话已结束');

    const script = session.scenario.script as any;
    const currentNodeData = this.getNode(script, session.currentNode);

    // 验证选项有效性
    const choice = currentNodeData.choices?.find((c: any) => c.id === choiceId);
    if (!choice) throw new BadRequestException('无效的选项');

    // 计算下一个节点
    const nextNode = choice.nextNode ?? 'end';
    const nextNodeData = this.getNode(script, nextNode);

    // 更新历史和选择
    const history = (session.history as any[]) ?? [];
    const choices = (session.choices as any[]) ?? [];
    history.push({ node: session.currentNode, choiceId, feedback: choice.feedback });
    choices.push({ node: session.currentNode, choiceId });

    const updated = await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        currentNode: nextNode,
        history,
        choices,
        ...(nextNode === 'end' && { completedAt: new Date() }),
      },
    });

    return {
      session: updated,
      feedback: choice.feedback,
      currentNode: nextNodeData,
      isCompleted: nextNode === 'end',
    };
  }

  /** 获取游戏会话详情 */
  async getSession(sessionId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { scenario: true },
    });
    if (!session) throw new NotFoundException('游戏会话不存在');
    return session;
  }

  /** 获取学生的游戏历史 */
  async getStudentHistory(studentId: string) {
    return this.prisma.gameSession.findMany({
      where: { studentId },
      include: { scenario: true },
      orderBy: { startedAt: 'desc' },
    });
  }

  /** 从脚本中获取节点数据 */
  private getNode(script: any, nodeKey: string): any {
    const nodes = script.nodes ?? {};
    return nodes[nodeKey] ?? { key: nodeKey, text: '', choices: [] };
  }
}
