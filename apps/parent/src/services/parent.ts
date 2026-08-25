import { get, post, patch } from './api';
import type {
  Warning,
  CareAdvice,
  ParentTask,
  PageResult,
  PageQuery,
  WarningStatus,
  AdviceFeedback,
  ParentTaskCategory,
} from '@muguang/shared';

// ============ 风险预警 ============

/** 获取风险预警列表 */
export function fetchWarnings(
  params?: PageQuery & { status?: WarningStatus },
): Promise<PageResult<Warning>> {
  return get<PageResult<Warning>>('/parent/warnings', { params });
}

/** 获取预警详情 */
export function fetchWarningDetail(id: string): Promise<Warning> {
  return get<Warning>(`/parent/warnings/${id}`);
}

/** 标记预警已读 */
export function markWarningRead(id: string): Promise<Warning> {
  return patch<Warning>(`/parent/warnings/${id}/read`);
}

/** 标记预警已处理 */
export function markWarningHandled(id: string): Promise<Warning> {
  return patch<Warning>(`/parent/warnings/${id}/handle`);
}

// ============ 监护建议 ============

/** 获取监护建议列表 */
export function fetchCareAdvices(params?: PageQuery): Promise<PageResult<CareAdvice>> {
  return get<PageResult<CareAdvice>>('/parent/care-advices', { params });
}

/** 提交建议反馈 */
export function submitAdviceFeedback(
  id: string,
  feedback: AdviceFeedback,
): Promise<CareAdvice> {
  return post<CareAdvice>(`/parent/care-advices/${id}/feedback`, { feedback });
}

// ============ 亲子任务 ============

/** 获取亲子任务列表 */
export function fetchTasks(params?: PageQuery): Promise<PageResult<ParentTask>> {
  return get<PageResult<ParentTask>>('/parent/tasks', { params });
}

/** 发起亲子任务 */
export function createTask(data: {
  studentId: string;
  title: string;
  description: string;
  category: ParentTaskCategory;
  pointsReward: number;
}): Promise<ParentTask> {
  return post<ParentTask>('/parent/tasks', data);
}

/** 验收亲子任务 */
export function verifyTask(id: string): Promise<ParentTask> {
  return patch<ParentTask>(`/parent/tasks/${id}/verify`);
}
