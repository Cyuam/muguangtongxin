import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** AI 反馈生成结果 */
export interface GameFeedback {
  feedback: string;
  encouragement: string;
  nextNodeHint?: string;
}

/** 教学建议生成结果 */
export interface TeachingAdvice {
  title: string;
  content: string;
  strategies: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * AI 游戏引擎
 * 负责游戏推荐与反馈生成
 */
@Injectable()
export class GameEngine {
  private readonly logger = new Logger(GameEngine.name);

  constructor(private configService: ConfigService) {}

  /** 推荐游戏场景 */
  recommendScenarios(
    availableScenarios: any[],
    studentProfile: { ageGroup: string; weakPoints: string[]; interests?: string[] },
  ): any[] {
    const scored = availableScenarios.map((scenario) => {
      let score = 0;

      // 年龄匹配
      if (scenario.ageGroup === studentProfile.ageGroup) {
        score += 30;
      }

      // 薄弱点匹配
      const theme = scenario.theme;
      if (studentProfile.weakPoints.includes(theme)) {
        score += 40;
      }

      // 兴趣匹配
      if (studentProfile.interests?.includes(theme)) {
        score += 20;
      }

      // 优先推荐未完成的游戏
      if (scenario.isActive) {
        score += 10;
      }

      return { scenario, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .map((s) => ({ ...s.scenario, matchScore: s.score }));
  }

  /** 生成游戏反馈 */
  generateFeedback(
    choice: any,
    context: { scenarioTheme: string; studentAgeGroup: string; history: any[] },
  ): GameFeedback {
    // 基于选项和上下文生成反馈
    const isCorrect = choice.isCorrect ?? true;
    const theme = context.scenarioTheme;

    const feedbacks = this.getThemeFeedbacks(theme);
    const feedback = isCorrect
      ? feedbacks.correct
      : feedbacks.incorrect;

    const encouragements = [
      '你做得很好，继续加油！',
      '很棒的选择，你正在学会保护自己！',
      '你的思考很深入，继续保持！',
      '勇敢面对问题，你真了不起！',
    ];
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

    return {
      feedback,
      encouragement,
      nextNodeHint: choice.nextNode,
    };
  }

  /** 生成游戏总结 */
  generateGameSummary(history: any[], scenarioTheme: string): any {
    const totalChoices = history.length;
    const correctChoices = history.filter((h) => h.feedback?.isCorrect).length;
    const accuracy = totalChoices > 0 ? (correctChoices / totalChoices) * 100 : 0;

    return {
      totalChoices,
      correctChoices,
      accuracy: Math.round(accuracy),
      theme: scenarioTheme,
      rating: this.getRating(accuracy),
      suggestion: this.getSummarySuggestion(accuracy, scenarioTheme),
    };
  }

  /** 获取主题反馈模板 */
  private getThemeFeedbacks(theme: string): { correct: string; incorrect: string } {
    const templates: Record<string, { correct: string; incorrect: string }> = {
      BULLYING: {
        correct: '你选择了正确的应对方式，勇敢说"不"是保护自己的第一步。',
        incorrect: '这个选择可能会让情况变得更糟，想想还有没有更好的方法？',
      },
      CYBERSECURITY: {
        correct: '很好的网络安全意识，保护个人信息非常重要。',
        incorrect: '这个选择可能存在安全风险，让我们重新思考一下。',
      },
      SELF_PROTECTION: {
        correct: '你展现了很好的自我保护意识！',
        incorrect: '这个选择可能不够安全，想想怎样更好地保护自己。',
      },
      EMOTION: {
        correct: '你很好地处理了情绪问题，这是成长的重要一步。',
        incorrect: '情绪管理需要练习，让我们看看其他方法。',
      },
    };
    return templates[theme] ?? { correct: '做得好！', incorrect: '再想想看？' };
  }

  /** 获取评级 */
  private getRating(accuracy: number): string {
    if (accuracy >= 90) return 'EXCELLENT';
    if (accuracy >= 70) return 'GOOD';
    if (accuracy >= 50) return 'FAIR';
    return 'NEEDS_IMPROVEMENT';
  }

  /** 获取总结建议 */
  private getSummarySuggestion(accuracy: number, theme: string): string {
    if (accuracy >= 80) {
      return `你在${this.getThemeName(theme)}方面表现优秀，继续保持！`;
    } else if (accuracy >= 60) {
      return `你在${this.getThemeName(theme)}方面有基础认识，建议继续学习巩固。`;
    } else {
      return `你在${this.getThemeName(theme)}方面还需要加强学习，建议多加练习。`;
    }
  }

  /** 获取主题中文名 */
  private getThemeName(theme: string): string {
    const names: Record<string, string> = {
      BULLYING: '防欺凌',
      CYBERSECURITY: '网络安全',
      SELF_PROTECTION: '自我保护',
      EMOTION: '情绪管理',
    };
    return names[theme] ?? theme;
  }
}
