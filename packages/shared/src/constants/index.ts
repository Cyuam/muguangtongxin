import { Role, AgeGroup, RiskLevel } from './enums';

/** 年龄段中文标签 */
export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  [AgeGroup.LOWER]: '低年级（6-9 岁）',
  [AgeGroup.MIDDLE]: '中年级（10-12 岁）',
  [AgeGroup.UPPER]: '高年级（13-15 岁）',
};

/** 风险等级中文标签 */
export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  [RiskLevel.NONE]: '无风险',
  [RiskLevel.LOW]: '低风险',
  [RiskLevel.MEDIUM]: '中风险',
  [RiskLevel.HIGH]: '高风险',
  [RiskLevel.CRITICAL]: '极高风险',
};

/** 风险等级颜色（用于 UI 展示） */
export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  [RiskLevel.NONE]: '#52c41a',
  [RiskLevel.LOW]: '#73d13d',
  [RiskLevel.MEDIUM]: '#faad14',
  [RiskLevel.HIGH]: '#fa8c16',
  [RiskLevel.CRITICAL]: '#f5222d',
};

/** 角色中文标签 */
export const ROLE_LABELS: Record<Role, string> = {
  [Role.CHILD]: '儿童',
  [Role.PARENT]: '家长',
  [Role.TEACHER]: '教师',
  [Role.COMMUNITY_ADMIN]: '社区管理者',
  [Role.SYSTEM_ADMIN]: '系统管理员',
};

/** 北滘镇辖区标识 */
export const BEIJIAO_JURISDICTION = 'beijiao';

/** 北滘镇下属村/社区 */
export const BEIJIAO_VILLAGES = [
  'beijiao_town',
  'bijiao_village',
  'shadun_village',
  'linjiang_village',
  'xincheng_community',
  'bibo_community',
] as const;

/** 游戏时长阈值（分钟） */
export const GAME_MAX_DURATION_MINUTES = 30;

/** 积分来源 */
export const POINT_SOURCES = {
  ASSESSMENT: 20,    // 完成测评奖励 20 积分
  GAME: 15,          // 完成游戏奖励 15 积分
  TASK: 30,          // 完成亲子任务奖励 30 积分
  FULL_SCORE_BONUS: 50, // 满分额外奖励 50 积分
} as const;
