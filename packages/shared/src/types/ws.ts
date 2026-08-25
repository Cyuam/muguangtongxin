/** WebSocket 事件名 */
export const WS_EVENTS = {
  WARNING_NEW: 'warning.new',
  TASK_NEW: 'task.new',
  TASK_VERIFIED: 'task.verified',
  INTERVENTION_REQUEST: 'intervention.request',
  TASK_SYNC: 'task.sync',
  ACHIEVEMENT_AWARDED: 'achievement.awarded',
  DIAGNOSIS_UPDATED: 'diagnosis.updated',
} as const;

export type WsEventName = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];

/** WebSocket 事件载荷 */
export interface WsEventPayload<T = unknown> {
  event: WsEventName;
  data: T;
  timestamp: string;
}
