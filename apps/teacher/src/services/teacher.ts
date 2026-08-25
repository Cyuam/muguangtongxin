import { get, post } from './api';
import type {
  Diagnosis,
  WeakPoint,
  PageResult,
  PageQuery,
  AdviceFeedback,
  RiskProfile,
} from '@muguang/shared';

/** 班级诊断响应 */
export interface ClassDiagnosis {
  classId: string;
  className: string;
  totalStudents: number;
  assessedStudents: number;
  overallProfile: RiskProfile;
  weakPoints: WeakPoint[];
  students: StudentDiagnosisSummary[];
}

/** 学生诊断摘要 */
export interface StudentDiagnosisSummary {
  studentId: string;
  studentName: string;
  riskLevel: string;
  totalScore: number;
  weakDimensions: string[];
}

/** 学生个体诊断详情 */
export interface StudentDiagnosisDetail {
  studentId: string;
  studentName: string;
  diagnosis: Diagnosis;
  recentResults: {
    resultId: string;
    totalScore: number;
    riskLevel: string;
    createdAt: string;
  }[];
}

/** 趋势数据点 */
export interface TrendPoint {
  date: string;
  dimension: string;
  score: number;
  riskLevel: string;
}

/** 教学建议 */
export interface TeachingAdvice {
  id: string;
  topic: string;
  targetDescription: string;
  content: string;
  recommendedActivities: string[];
  expectedGoals: string;
  localCases: string[];
  feedback?: AdviceFeedback;
  createdAt: string;
}

// ============ 班级诊断 ============

/** 获取班级诊断 */
export function fetchClassDiagnosis(classId: string): Promise<ClassDiagnosis> {
  return get<ClassDiagnosis>(`/teacher/diagnosis/class/${classId}`);
}

/** 获取学生个体诊断 */
export function fetchStudentDiagnosis(studentId: string): Promise<StudentDiagnosisDetail> {
  return get<StudentDiagnosisDetail>(`/teacher/diagnosis/student/${studentId}`);
}

/** 获取薄弱点变化趋势 */
export function fetchTrends(
  params?: { classId?: string; dimension?: string; startDate?: string; endDate?: string },
): Promise<TrendPoint[]> {
  return get<TrendPoint[]>('/teacher/diagnosis/trends', { params });
}

// ============ 教学建议 ============

/** 获取教学建议列表 */
export function fetchAdvices(params?: PageQuery): Promise<PageResult<TeachingAdvice>> {
  return get<PageResult<TeachingAdvice>>('/teacher/advices', { params });
}

/** 提交建议反馈 */
export function submitAdviceFeedback(
  id: string,
  feedback: AdviceFeedback,
): Promise<TeachingAdvice> {
  return post<TeachingAdvice>(`/teacher/advices/${id}/feedback`, { feedback });
}
