/** 后端共享枚举（与前端 shared 包保持一致） */
export enum Role {
  CHILD = 'CHILD',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  COMMUNITY_ADMIN = 'COMMUNITY_ADMIN',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

export enum AgeGroup {
  LOWER = 'LOWER',
  MIDDLE = 'MIDDLE',
  UPPER = 'UPPER',
}

export enum RiskLevel {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}
