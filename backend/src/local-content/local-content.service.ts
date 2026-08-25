import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgeGroup } from '../common/constants/enums';

/** 北滘镇种子数据 */
const BEIJIAO_SEED_DATA = {
  // 法治测评题目（北滘镇本地化）
  assessmentQuestions: [
    {
      id: 'beijiao_law_q1',
      category: 'LAW_AWARENESS',
      dimension: 'TRAFFIC_SAFETY',
      question: '在北滘镇的主要道路上骑自行车，你应该在哪一侧骑行？',
      options: [
        { key: 'A', value: '道路右侧', score: 4 },
        { key: 'B', value: '道路左侧', score: 1 },
        { key: 'C', value: '道路中间', score: 0 },
        { key: 'D', value: '随便哪侧都行', score: 0 },
      ],
      localContext: '北滘镇主要道路包括林上路、三乐路等',
    },
    {
      id: 'beijiao_law_q2',
      category: 'LAW_AWARENESS',
      dimension: 'COMMUNITY_RULES',
      question: '在北滘镇社区内，以下哪种行为是正确的？',
      options: [
        { key: 'A', value: '遵守社区公约，维护公共环境', score: 4 },
        { key: 'B', value: '在公共区域大声喧哗', score: 1 },
        { key: 'C', value: '随意丢弃垃圾', score: 0 },
        { key: 'D', value: '破坏公共设施', score: 0 },
      ],
      localContext: '北滘镇各社区均有社区公约',
    },
  ],
  // 游戏场景（北滘镇本地化）
  gameScenarios: [
    {
      title: '北滘镇社区安全大冒险',
      theme: 'SELF_PROTECTION',
      ageGroup: 'LOWER',
      localFeatures: ['北滘公园', '北滘文化中心', '社区图书馆'],
    },
    {
      title: '校园防欺凌情景模拟',
      theme: 'BULLYING',
      ageGroup: 'MIDDLE',
      localFeatures: ['北滘中学', '碧江小学'],
    },
  ],
  // 监护建议（北滘镇本地化）
  careAdvices: [
    {
      topic: '北滘镇暑期安全监护建议',
      content: {
        summary: '暑期是儿童安全事故高发期，请家长加强监护',
        localResources: ['北滘镇青少年活动中心', '社区暑期托管班'],
        tips: ['注意水上安全', '交通安全', '网络安全'],
      },
    },
  ],
};

@Injectable()
export class LocalContentService {
  constructor(private prisma: PrismaService) {}

  /** 获取本地化内容 */
  async getContent(params: {
    jurisdiction: string;
    topic?: string;
    ageGroup?: AgeGroup;
    contentType?: string;
  }) {
    return this.prisma.localContent.findMany({
      where: {
        jurisdiction: params.jurisdiction,
        ...(params.topic && { topic: params.topic }),
        ...(params.ageGroup && { ageGroup: params.ageGroup }),
        ...(params.contentType && { contentType: params.contentType }),
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /** 获取单条本地化内容 */
  async getContentById(id: string) {
    const content = await this.prisma.localContent.findUnique({
      where: { id },
    });
    if (!content) throw new NotFoundException('内容不存在');
    return content;
  }

  /** 更新内容 */
  async updateContent(id: string, content: any) {
    const existing = await this.prisma.localContent.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('内容不存在');

    return this.prisma.localContent.update({
      where: { id },
      data: { content },
    });
  }

  /** 创建本地化内容 */
  async createContent(params: {
    jurisdiction: string;
    topic: string;
    ageGroup?: AgeGroup;
    contentType: string;
    content: any;
    dataSource?: string;
  }) {
    return this.prisma.localContent.create({
      data: {
        jurisdiction: params.jurisdiction,
        topic: params.topic,
        ageGroup: params.ageGroup ?? null,
        contentType: params.contentType,
        content: params.content,
        dataSource: params.dataSource ?? null,
      },
    });
  }

  /** 初始化北滘镇种子数据 */
  async seedBeijiaoData(): Promise<{ created: number; skipped: number }> {
    let created = 0;
    let skipped = 0;
    const jurisdiction = 'beijiao';

    // 检查是否已有种子数据
    const existing = await this.prisma.localContent.findFirst({
      where: { jurisdiction, dataSource: 'SEED' },
    });
    if (existing) {
      return { created: 0, skipped: 1 };
    }

    // 插入测评题目
    for (const question of BEIJIAO_SEED_DATA.assessmentQuestions) {
      await this.prisma.localContent.create({
        data: {
          jurisdiction,
          topic: `ASSESSMENT_${question.dimension}`,
          ageGroup: 'LOWER',
          contentType: 'ASSESSMENT',
          content: question,
          dataSource: 'SEED',
        },
      });
      created++;
    }

    // 插入游戏场景
    for (const scenario of BEIJIAO_SEED_DATA.gameScenarios) {
      await this.prisma.localContent.create({
        data: {
          jurisdiction,
          topic: `GAME_${scenario.theme}`,
          ageGroup: scenario.ageGroup as any,
          contentType: 'GAME',
          content: scenario,
          dataSource: 'SEED',
        },
      });
      created++;
    }

    // 插入监护建议
    for (const advice of BEIJIAO_SEED_DATA.careAdvices) {
      await this.prisma.localContent.create({
        data: {
          jurisdiction,
          topic: advice.topic,
          contentType: 'ADVICE',
          content: advice.content,
          dataSource: 'SEED',
        },
      });
      created++;
    }

    return { created, skipped };
  }

  /** 获取北滘镇种子数据（不写入数据库） */
  getBeijaoSeedData() {
    return BEIJIAO_SEED_DATA;
  }

  /** 删除本地化内容 */
  async deleteContent(id: string) {
    const existing = await this.prisma.localContent.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('内容不存在');

    await this.prisma.localContent.delete({ where: { id } });
    return { deleted: true };
  }
}
