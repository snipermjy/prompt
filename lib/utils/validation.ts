/**
 * 输入验证和清理工具
 * 用于防止XSS、SQL注入等安全问题
 */

/**
 * 清理HTML标签，防止XSS攻击
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * 验证URL格式
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return (
      (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
      url.length <= 2048
    );
  } catch {
    return false;
  }
}

/**
 * 清理字符串，移除多余空白
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (!input || typeof input !== 'string') return '';
  
  let cleaned = input.trim().replace(/\s+/g, ' ');
  
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  
  return cleaned;
}

/**
 * 验证UUID格式
 */
export function validateUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * 验证数组中的所有元素都是字符串
 */
export function validateStringArray(arr: any): arr is string[] {
  return Array.isArray(arr) && arr.every(item => typeof item === 'string');
}

/**
 * 清理标签数组
 */
export function sanitizeTags(tags: string[], maxTags: number = 10, maxLength: number = 50): string[] {
  if (!Array.isArray(tags)) return [];
  
  return tags
    .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
    .map(tag => sanitizeString(tag, maxLength))
    .filter(tag => tag.length > 0)
    .slice(0, maxTags);
}

/**
 * 验证内容长度
 */
export function validateLength(
  input: string,
  min: number,
  max: number
): { valid: boolean; message?: string } {
  if (!input || typeof input !== 'string') {
    return { valid: false, message: '内容不能为空' };
  }
  
  const length = input.trim().length;
  
  if (length < min) {
    return { valid: false, message: `内容至少需要 ${min} 个字符（当前 ${length} 个）` };
  }
  
  if (length > max) {
    return { valid: false, message: `内容不能超过 ${max} 个字符（当前 ${length} 个）` };
  }
  
  return { valid: true };
}

/**
 * 防止SQL注入 - 转义特殊字符
 */
export function escapeSqlLike(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input.replace(/[%_\\]/g, '\\$&');
}

/**
 * 限制速率 - 简单的客户端限流
 */
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];
  
  // 清除过期的时间戳
  const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
  
  if (validTimestamps.length >= maxRequests) {
    return false; // 超过限制
  }
  
  validTimestamps.push(now);
  rateLimitMap.set(key, validTimestamps);
  
  return true; // 允许请求
}
