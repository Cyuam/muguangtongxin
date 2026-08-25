/** 姓名脱敏 */
export function maskName(name: string): string {
  if (!name || name.length === 0) return '';
  if (name.length === 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

/** 手机号脱敏 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

/** 格式化日期 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** 格式化日期时间 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 计算用时（秒 → 可读文本） */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} 秒`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes} 分 ${remainingSeconds} 秒`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} 时 ${remainingMinutes} 分`;
}

/** 根据出生年月计算年龄段 */
export function calcAgeGroup(birthYear: number): 'LOWER' | 'MIDDLE' | 'UPPER' {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  if (age <= 9) return 'LOWER';
  if (age <= 12) return 'MIDDLE';
  return 'UPPER';
}

/** 生成简易唯一 ID（前端临时用） */
export function genTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
