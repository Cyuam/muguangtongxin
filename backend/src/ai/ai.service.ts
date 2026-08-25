import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GameEngine, GameFeedback, TeachingAdvice } from './game.engine';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private configService: ConfigService,
    private gameEngine: GameEngine,
  ) {}

  /** 游戏引擎推荐 */
  recommendGames(availableScenarios: any[], studentProfile: { ageGroup: string; weakPoints: string[]; interests?: string[] }) {
    return this.gameEngine.recommendScenarios(availableScenarios, studentProfile);
  }

  /** 游戏反馈生成 */
  generateGameFeedback(
    choice: any,
    context: { scenarioTheme: string; studentAgeGroup: string; history: any[] },
  ): GameFeedback {
    return this.gameEngine.generateFeedback(choice, context);
  }

  /** 游戏总结生成 */
  generateGameSummary(history: any[], scenarioTheme: string) {
    return this.gameEngine.generateGameSummary(history, scenarioTheme);
  }

  /** 教学建议生成 */
  generateTeachingAdvice(diagnosis: {
    weakPoints: any[];
    riskProfile: any;
    scope: string;
  }): TeachingAdvice {
    const { weakPoints, riskProfile } = diagnosis;
    const topWeakPoint = weakPoints[0];

    const strategies: string[] = [];
    const title = `针对${topWeakPoint?.dimension ?? '薄弱维度'}的教学建议`;

    // 基于薄弱维度生成策略
    if (topWeakPoint) {
      strategies.push(...this.getStrategiesForDimension(topWeakPoint.dimension, topWeakPoint.severity));
    }

    // 基于风险等级调整优先级
    const riskLevel = riskProfile?.riskLevel ?? 'NONE';
    const priority = this.getPriorityFromRisk(riskLevel);

    // 生成建议内容
    const content = this.buildAdviceContent(weakPoints, riskProfile);

    return { title, content, strategies, priority };
  }

  /** 内容本地化：将通用内容适配为本地化版本 */
  localizeContent(content: any, jurisdiction: string): any {
    // 北滘镇特殊适配
    if (jurisdiction === 'beijiao') {
      return this.adaptForBeijiao(content);
    }

    // 通用本地化
    return {
      ...content,
      localizedAt: new Date().toISOString(),
      jurisdiction,
    };
  }

  /** 生成监护建议（面向家长） */
  generateCareAdvice(studentProfile: {
    name: string;
    riskLevel: string;
    weakPoints: any[];
  }): any {
    const { name, riskLevel, weakPoints } = studentProfile;

    const adviceMap: Record<string, string> = {
      NONE: `${name}表现良好，请继续保持良好的家庭教育氛围。`,
      LOW: `${name}在某些方面需要适当关注，建议多与孩子沟通交流。`,
      MEDIUM: `${name}存在一些需要关注的问题，建议加强监护和引导。`,
      HIGH: `${name}风险较高，建议密切关注并及时与教师沟通。`,
      CRITICAL: `${name}需要紧急关注，建议寻求专业帮助。`,
    };

    const suggestions = weakPoints.slice(0, 3).map((wp) => ({
      dimension: wp.dimension,
      suggestion: this.getParentSuggestion(wp.dimension),
    }));

    return {
      message: adviceMap[riskLevel] ?? adviceMap.NONE,
      suggestions,
      riskLevel,
    };
  }

  /** 获取维度教学策略 */
  private getStrategiesForDimension(dimension: string, severity: string): string[] {
    const baseStrategies: Record<string, string[]> = {
      LAW_AWARENESS: [
        '结合生活案例讲解法律知识',
        '组织法治主题班会活动',
        '推荐适龄法治教育读物',
      ],
      EMOTION: [
        '开展情绪管理小组辅导',
        '教授情绪调节技巧',
        '建立情绪日记习惯',
      ],
      SELF_PROTECTION: [
        '开展安全教育活动',
        '模拟安全情境演练',
        '教授求助技能',
      ],
      BULLYING: [
        '开展反欺凌主题教育',
        '建立同伴支持机制',
        '加强校园巡查监控',
      ],
    };

    const strategies = baseStrategies[dimension] ?? ['加强该维度的教学关注'];
    if (severity === 'CRITICAL') {
      strategies.push('建议一对一辅导介入');
    }
    return strategies;
  }

  /** 从风险等级获取优先级 */
  private getPriorityFromRisk(riskLevel: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const mapping: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> = {
      NONE: 'LOW',
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH',
      CRITICAL: 'HIGH',
    };
    return mapping[riskLevel] ?? 'LOW';
  }

  /** 构建建议内容 */
  private buildAdviceContent(weakPoints: any[], riskProfile: any): string {
    const parts: string[] = [];
    if (weakPoints.length > 0) {
      parts.push(`发现 ${weakPoints.length} 个薄弱维度需要关注。`);
      parts.push(`最薄弱维度: ${weakPoints[0].dimension}（得分: ${weakPoints[0].score}）。`);
    }
    if (riskProfile?.riskLevel && riskProfile.riskLevel !== 'NONE') {
      parts.push(`当前风险等级: ${riskProfile.riskLevel}，建议及时干预。`);
    }
    return parts.join(' ') || '学生表现良好，继续保持。';
  }

  /** 北滘镇内容适配 */
  private adaptForBeijiao(content: any): any {
    return {
      ...content,
      localizedAt: new Date().toISOString(),
      jurisdiction: 'beijiao',
      localizedFeatures: {
        localCases: true,
        localResources: true,
        communityContext: '北滘镇社区特色',
      },
    };
  }

  /** 获取家长建议 */
  private getParentSuggestion(dimension: string): string {
    const suggestions: Record<string, string> = {
      LAW_AWARENESS: '与孩子一起学习法律知识，讨论生活中的法律案例',
      EMOTION: '多关注孩子情绪变化，建立良好的沟通氛围',
      SELF_PROTECTION: '教授孩子基本安全知识和自我保护技能',
      BULLYING: '关注孩子在校情况，教导正确处理人际冲突',
    };
    return suggestions[dimension] ?? '多关注孩子的学习和生活状态';
  }
}
