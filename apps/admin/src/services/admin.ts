import { get, post } from './api';
import type {
  DashboardOverview,
  GovernanceReport,
  PageResult,
  PageQuery,
  RiskLevel,
} from '@muguang/shared';

/** 风险地图数据项 */
export interface RiskMapItem {
  jurisdiction: string;
  jurisdictionName: string;
  totalChildren: number;
  riskDistribution: Record<RiskLevel, number>;
  highRiskCount: number;
}

/** 协同状态数据 */
export interface CollabStatus {
  parentActiveRate: number;
  teacherActiveRate: number;
  collabCoverage: number;
  totalCollabTasks: number;
  completedCollabTasks: number;
}

/** 看板筛选参数 */
export interface DashboardFilter {
  startDate?: string;
  endDate?: string;
  jurisdiction?: string;
  ageGroup?: string;
  isLeftBehind?: boolean;
}

// ============ 数据看板 ============

/** 数据看板总览 */
export function fetchDashboardOverview(
  filter?: DashboardFilter,
): Promise<DashboardOverview> {
  return get<DashboardOverview>('/admin/dashboard/overview', { params: filter });
}

/** 风险分布地图数据 */
export function fetchRiskMap(filter?: DashboardFilter): Promise<RiskMapItem[]> {
  return get<RiskMapItem[]>('/admin/dashboard/risk-map', { params: filter });
}

/** 家校社协同状态 */
export function fetchCollabStatus(filter?: DashboardFilter): Promise<CollabStatus> {
  return get<CollabStatus>('/admin/dashboard/collab-status', { params: filter });
}

// ============ 治理报告 ============

/** 治理报告列表 */
export function fetchReports(params?: PageQuery): Promise<PageResult<GovernanceReport>> {
  return get<PageResult<GovernanceReport>>('/admin/reports', { params });
}

/** 生成治理报告 */
export function generateReport(data: {
  period: 'WEEKLY' | 'MONTHLY' | 'TERM';
  startDate: string;
  endDate: string;
  contentModules: string[];
  jurisdiction?: string;
}): Promise<GovernanceReport> {
  return post<GovernanceReport>('/admin/reports/generate', data);
}

/** 下载治理报告 */
export function getReportDownloadUrl(id: string): string {
  return `/api/v1/admin/reports/${id}/download`;
}
