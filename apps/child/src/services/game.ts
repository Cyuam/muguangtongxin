import { get, post } from './api';
import type { GameScenario, GameSession, GameNode, GameChoice } from '@muguang/shared';

/** 游戏选择响应 */
export interface GameChoiceResponse {
  feedback: string;
  feedbackType: 'POSITIVE' | 'WARNING' | 'CORRECTIVE';
  nextNode: GameNode | null;
  isTerminal: boolean;
}

/** 获取推荐情景游戏列表 */
export function fetchScenarios(): Promise<GameScenario[]> {
  return get<GameScenario[]>('/game/scenarios');
}

/** 开始游戏会话 */
export function createSession(scenarioId: string): Promise<GameSession> {
  return post<GameSession>('/game/sessions', { scenarioId });
}

/** 提交选择，获取 AI 反馈与下一节点 */
export function submitChoice(
  sessionId: string,
  choiceId: string,
): Promise<GameChoiceResponse> {
  return post<GameChoiceResponse>(`/game/sessions/${sessionId}/choice`, { choiceId });
}

/** 获取游戏会话状态（断点续玩） */
export function fetchSession(sessionId: string): Promise<GameSession> {
  return get<GameSession>(`/game/sessions/${sessionId}`);
}

/** 获取游戏选项类型 */
export type { GameChoice };
