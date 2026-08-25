import { get, post } from './api';
import type { PointLedger, Achievement, PageResult } from '@muguang/shared';

/** 排行榜条目 */
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatarUrl?: string;
  totalPoints: number;
  rank: number;
}

/** 排行榜响应 */
export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  myRank: number;
  myPoints: number;
}

/** 获取当前积分余额 */
export function fetchBalance(): Promise<{ balance: number }> {
  return get<{ balance: number }>('/points/balance');
}

/** 获取积分流水 */
export function fetchLedger(page = 1, pageSize = 20): Promise<PageResult<PointLedger>> {
  return get<PageResult<PointLedger>>('/points/ledger', { params: { page, pageSize } });
}

/** 获取积分排行榜 */
export function fetchLeaderboard(
  scope: 'CLASS' | 'GRADE' = 'CLASS',
): Promise<LeaderboardResponse> {
  return get<LeaderboardResponse>('/points/leaderboard', { params: { scope } });
}

/** 积分兑换 */
export function redeem(
  itemId: string,
  amount: number,
): Promise<{ success: boolean; newBalance: number }> {
  return post<{ success: boolean; newBalance: number }>('/points/redeem', { itemId, amount });
}

/** 获取成就徽章 */
export function fetchAchievements(): Promise<Achievement[]> {
  return get<Achievement[]>('/points/achievements');
}
