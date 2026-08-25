import { get, post, patch } from './api';
import type {
  AssessmentScale,
  AssessmentSession,
  AssessmentResult,
  AgeGroup,
  PageResult,
} from '@muguang/shared';

/** 获取适合当前年龄段的测评量表 */
export function fetchScales(ageGroup?: AgeGroup): Promise<AssessmentScale[]> {
  const params = ageGroup ? { ageGroup } : {};
  return get<AssessmentScale[]>('/assessment/scales', { params });
}

/** 创建测评会话（开始测评） */
export function createSession(scaleId: string): Promise<AssessmentSession> {
  return post<AssessmentSession>('/assessment/sessions', { scaleId });
}

/** 提交作答（断点续测） */
export function submitAnswer(
  sessionId: string,
  answers: Record<string, string>,
): Promise<AssessmentSession> {
  return patch<AssessmentSession>(`/assessment/sessions/${sessionId}`, { answers });
}

/** 完成测评 */
export function completeSession(sessionId: string): Promise<AssessmentResult> {
  return post<AssessmentResult>(`/assessment/sessions/${sessionId}/complete`);
}

/** 获取测评历史 */
export function fetchHistory(
  page = 1,
  pageSize = 20,
): Promise<PageResult<AssessmentResult>> {
  return get<PageResult<AssessmentResult>>('/assessment/results/history', {
    params: { page, pageSize },
  });
}

/** 获取测评结果详情 */
export function fetchResult(resultId: string): Promise<AssessmentResult> {
  return get<AssessmentResult>(`/assessment/results/${resultId}`);
}
