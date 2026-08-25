import {
  Role,
  AgeGroup,
  RiskLevel,
  AssessmentCategory,
  GameTheme,
  RelationType,
  AssessmentSessionStatus,
  InterventionType,
  InterventionStatus,
  TrackingEffectiveness,
  ParentTaskCategory,
  ParentTaskStatus,
  WarningStatus,
  AdviceFeedback,
  CollabTaskStatus,
  DiagnosisScope,
} from '../constants/enums';

/** 统一 API 响应 */
export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

/** 统一 API 错误 */
export interface ApiError {
  code: string;
  message: string;
  detail?: unknown;
}

/** 分页请求 */
export interface PageQuery {
  page: number;
  pageSize: number;
}

/** 分页响应 */
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 用户 */
export interface User {
  id: string;
  phone: string;
  role: Role;
  name: string;
  avatarUrl?: string;
  ageGroup?: AgeGroup;
  isLeftBehind?: boolean;
  jurisdiction?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 用户关系 */
export interface UserRelation {
  id: string;
  fromUserId: string;
  toUserId: string;
  relationType: RelationType;
  fromUser?: User;
  toUser?: User;
  createdAt: string;
}

/** 班级 */
export interface Class {
  id: string;
  name: string;
  schoolName: string;
  grade: number;
  teacherId: string;
  jurisdiction: string;
  teacher?: User;
  createdAt: string;
}

/** 测评量表 */
export interface AssessmentScale {
  id: string;
  title: string;
  ageGroup: AgeGroup;
  category: AssessmentCategory;
  questions: AssessmentQuestion[];
  version: number;
  isActive: boolean;
}

/** 测评题目 */
export interface AssessmentQuestion {
  id: string;
  stem: string;
  options: AssessmentOption[];
  dimension: string;
  maxScore: number;
}

/** 测评选项 */
export interface AssessmentOption {
  id: string;
  text: string;
  score: number;
}

/** 测评会话 */
export interface AssessmentSession {
  id: string;
  scaleId: string;
  studentId: string;
  status: AssessmentSessionStatus;
  answers?: Record<string, string>;
  startedAt: string;
  completedAt?: string;
  durationSec?: number;
  resultId?: string;
}

/** 测评结果 */
export interface AssessmentResult {
  id: string;
  sessionId: string;
  totalScore: number;
  lawScore: number;
  psychologyScore: number;
  riskLevel: RiskLevel;
  dimensionScores: Record<string, number>;
  detail: AssessmentDetail;
  createdAt: string;
}

/** 测评明细分析 */
export interface AssessmentDetail {
  correctCount: number;
  totalCount: number;
  weakDimensions: string[];
  strongDimensions: string[];
}

/** 游戏场景 */
export interface GameScenario {
  id: string;
  title: string;
  theme: GameTheme;
  ageGroup: AgeGroup;
  script: GameScript;
  isActive: boolean;
}

/** 游戏脚本（节点树） */
export interface GameScript {
  startNode: string;
  nodes: Record<string, GameNode>;
}

/** 游戏节点 */
export interface GameNode {
  id: string;
  scenario: string;
  prompt: string;
  choices: GameChoice[];
  isTerminal: boolean;
}

/** 游戏选择 */
export interface GameChoice {
  id: string;
  text: string;
  nextNode: string | null;
  feedback?: string;
  feedbackType?: 'POSITIVE' | 'WARNING' | 'CORRECTIVE';
}

/** 游戏会话 */
export interface GameSession {
  id: string;
  scenarioId: string;
  studentId: string;
  currentNode: string;
  history: GameHistoryEntry[];
  choices: GameChoiceRecord[];
  startedAt: string;
  completedAt?: string;
}

/** 游戏历史记录 */
export interface GameHistoryEntry {
  nodeId: string;
  prompt: string;
  choiceId?: string;
  feedback?: string;
  timestamp: string;
}

/** 游戏选择行为记录 */
export interface GameChoiceRecord {
  nodeId: string;
  choiceId: string;
  choiceText: string;
  timestamp: string;
}

/** 积分流水 */
export interface PointLedger {
  id: string;
  userId: string;
  amount: number;
  source: 'ASSESSMENT' | 'GAME' | 'TASK' | 'REDEEM';
  sourceId?: string;
  description: string;
  balance: number;
  createdAt: string;
}

/** 成就徽章 */
export interface Achievement {
  id: string;
  userId: string;
  badgeCode: string;
  badgeName: string;
  awardedAt: string;
}

/** 诊断 */
export interface Diagnosis {
  id: string;
  resultId: string;
  scope: DiagnosisScope;
  targetId: string;
  weakPoints: WeakPoint[];
  riskProfile: RiskProfile;
  createdAt: string;
}

/** 薄弱点 */
export interface WeakPoint {
  dimension: string;
  score: number;
  threshold: number;
  description: string;
}

/** 风险画像 */
export interface RiskProfile {
  overallRisk: RiskLevel;
  lawRisk: RiskLevel;
  psychologyRisk: RiskLevel;
  factors: string[];
}

/** 干预 */
export interface Intervention {
  id: string;
  diagnosisId: string;
  type: InterventionType;
  targetUserId: string;
  content: InterventionContent;
  status: InterventionStatus;
  level: number;
  createdAt: string;
  actedAt?: string;
}

/** 干预内容 */
export interface InterventionContent {
  title: string;
  summary: string;
  details: string;
  suggestions: string[];
  localCases?: string[];
}

/** 追踪 */
export interface Tracking {
  id: string;
  interventionId: string;
  studentId: string;
  baselineResultId: string;
  followupResultId?: string;
  effectiveness?: TrackingEffectiveness;
  trajectory: TrackingPoint[];
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 追踪轨迹点 */
export interface TrackingPoint {
  timestamp: string;
  resultId: string;
  riskLevel: RiskLevel;
  note?: string;
}

/** 风险预警 */
export interface Warning {
  id: string;
  studentId: string;
  parentId: string;
  resultId: string;
  riskLevel: RiskLevel;
  content: WarningContent;
  status: WarningStatus;
  notifiedAt: string;
  readAt?: string;
}

/** 预警内容 */
export interface WarningContent {
  riskType: string;
  riskLevel: RiskLevel;
  manifestations: string[];
  suggestions: string[];
  studentNameMasked: string;
}

/** 监护建议 */
export interface CareAdvice {
  id: string;
  parentId: string;
  studentId: string;
  topic: string;
  content: CareAdviceContent;
  feedback?: AdviceFeedback;
  pushedAt: string;
}

/** 监护建议内容 */
export interface CareAdviceContent {
  title: string;
  body: string;
  isLeftBehindSpecific: boolean;
  actionableSteps: string[];
}

/** 亲子任务 */
export interface ParentTask {
  id: string;
  parentId: string;
  studentId: string;
  title: string;
  description: string;
  category: ParentTaskCategory;
  status: ParentTaskStatus;
  pointsReward: number;
  publishedAt: string;
  completedAt?: string;
  verifiedAt?: string;
}

/** 协同任务 */
export interface CollabTask {
  id: string;
  initiatorId: string;
  type: string;
  targetIds: string[];
  status: CollabTaskStatus;
  content: Record<string, unknown>;
  createdAt: string;
  closedAt?: string;
}

/** 审计日志 */
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  detail?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
}

/** 治理报告 */
export interface GovernanceReport {
  id: string;
  jurisdiction: string;
  period: 'WEEKLY' | 'MONTHLY' | 'TERM';
  startDate: string;
  endDate: string;
  content: ReportContent;
  fileUrl?: string;
  createdAt: string;
}

/** 报告内容 */
export interface ReportContent {
  overview: string;
  riskIntervention: string;
  collabEffectiveness: string;
  issues: string[];
  localAnalysis: string;
}

/** 数据看板总览 */
export interface DashboardOverview {
  totalChildren: number;
  assessmentParticipationRate: number;
  riskDistribution: Record<RiskLevel, number>;
  interventionProgress: {
    total: number;
    pending: number;
    delivered: number;
    acted: number;
    completed: number;
  };
  collabCoverage: number;
}

/** 登录请求 */
export interface LoginRequest {
  phone: string;
  password: string;
  role: Role;
}

/** 登录响应 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/** 刷新 token 请求 */
export interface RefreshTokenRequest {
  refreshToken: string;
}
