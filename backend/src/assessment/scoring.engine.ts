import { Injectable } from '@nestjs/common';
import { RiskLevel } from '../common/constants/enums';

/** 评分维度结果 */
export interface ScoreResult {
  totalScore: number;
  lawScore: number;
  psychologyScore: number;
  dimensionScores: Record<string, number>;
  detail: Record<string, any>;
}

/**
 * 评分引擎
 * 负责计算总分、法治得分、心理得分、风险等级判定
 */
@Injectable()
export class ScoringEngine {
  /**
   * 计算各项得分
   * @param questions 量表题目列表
   * @param answers 学生作答记录
   */
  calculate(questions: any[], answers: Record<string, string>): ScoreResult {
    let lawScore = 0;
    let psychologyScore = 0;
    let lawMaxScore = 0;
    let psychologyMaxScore = 0;
    const dimensionScores: Record<string, number> = {};
    const detail: Record<string, any> = {};

    for (const question of questions) {
      const questionId = question.id ?? question.key;
      const userAnswer = answers[questionId];
      const category = question.category ?? 'PSYCHOLOGY'; // LAW_AWARENESS | PSYCHOLOGY
      const dimension = question.dimension ?? 'default';
      const maxScore = question.maxScore ?? question.options?.length ?? 4;

      // 计算本题得分
      let questionScore = 0;
      if (userAnswer != null) {
        if (question.scoringType === 'DIRECT') {
          questionScore = Number(userAnswer) || 0;
        } else {
          // 默认：选项映射分值
          const option = question.options?.find((opt: any) => opt.key === userAnswer || opt.value === userAnswer);
          questionScore = option?.score ?? 0;
        }
      }

      // 累加到对应类别
      if (category === 'LAW_AWARENESS') {
        lawScore += questionScore;
        lawMaxScore += maxScore;
      } else {
        psychologyScore += questionScore;
        psychologyMaxScore += maxScore;
      }

      // 累加到维度
      dimensionScores[dimension] = (dimensionScores[dimension] ?? 0) + questionScore;

      // 记录明细
      detail[questionId] = {
        answer: userAnswer,
        score: questionScore,
        maxScore,
        category,
        dimension,
      };
    }

    // 归一化为百分制
    const normalizedLawScore = lawMaxScore > 0 ? (lawScore / lawMaxScore) * 100 : 0;
    const normalizedPsychologyScore = psychologyMaxScore > 0 ? (psychologyScore / psychologyMaxScore) * 100 : 0;
    const totalScore = (normalizedLawScore + normalizedPsychologyScore) / 2;

    return {
      totalScore: Math.round(totalScore * 100) / 100,
      lawScore: Math.round(normalizedLawScore * 100) / 100,
      psychologyScore: Math.round(normalizedPsychologyScore * 100) / 100,
      dimensionScores,
      detail,
    };
  }

  /**
   * 风险等级判定
   * 基于总分和心理得分综合判定
   */
  determineRiskLevel(scores: ScoreResult): RiskLevel {
    const { totalScore, psychologyScore } = scores;

    // 心理得分极低 -> 高危
    if (psychologyScore < 30) {
      return RiskLevel.CRITICAL;
    }

    // 综合判定
    if (totalScore < 40) {
      return RiskLevel.HIGH;
    } else if (totalScore < 60) {
      return RiskLevel.MEDIUM;
    } else if (totalScore < 75) {
      return RiskLevel.LOW;
    } else {
      return RiskLevel.NONE;
    }
  }
}
