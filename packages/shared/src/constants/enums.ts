/**
 * 角色枚举
 */
export enum Role {
  CHILD = 'CHILD',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  COMMUNITY_ADMIN = 'COMMUNITY_ADMIN',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

/**
 * 年龄段枚举
 */
export enum AgeGroup {
  LOWER = 'LOWER',   // 6-9 岁
  MIDDLE = 'MIDDLE', // 10-12 岁
  UPPER = 'UPPER',   // 13-15 岁
}

/**
 * 风险等级枚举
 */
export enum RiskLevel {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * 测评类别
 */
export type AssessmentCategory = 'LAW_AWARENESS' | 'PSYCHOLOGY';

/**
 * 游戏主题
 */
export type GameTheme = 'BULLYING' | 'CYBERSECURITY' | 'SELF_PROTECTION' | 'EMOTION';

/**
 * 关系类型
 */
export type RelationType = 'PARENT_OF' | 'TEACHER_OF' | 'GUARDIAN_OF';

/**
 * 测评会话状态
 */
export type AssessmentSessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

/**
 * 干预类型
 */
export type InterventionType =
  | 'WARNING'
  | 'CARE_ADVICE'
  | 'TEACHING_ADVICE'
  | 'PARENT_TASK';

/**
 * 干预状态
 */
export type InterventionStatus = 'PENDING' | 'DELIVERED' | 'ACTED' | 'COMPLETED';

/**
 * 追踪效果
 */
export type TrackingEffectiveness = 'EFFECTIVE' | 'PARTIAL' | 'INEFFECTIVE';

/**
 * 亲子任务类别
 */
export type ParentTaskCategory = 'LAW_STUDY' | 'EMOTION' | 'LIFE_PRACTICE';

/**
 * 亲子任务状态
 */
export type ParentTaskStatus = 'PUBLISHED' | 'COMPLETED' | 'VERIFIED';

/**
 * 预警状态
 */
export type WarningStatus = 'UNREAD' | 'READ' | 'HANDLED';

/**
 * 建议反馈
 */
export type AdviceFeedback = 'USEFUL' | 'USELESS' | 'PRACTICED';

/**
 * 协同任务状态
 */
export type CollabTaskStatus = 'OPEN' | 'RESPONDED' | 'CLOSED';

/**
 * 诊断范围
 */
export type DiagnosisScope = 'INDIVIDUAL' | 'CLASS' | 'GRADE' | 'DISTRICT';
