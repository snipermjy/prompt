import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化日期为标准格式
 * 
 * @param date - 日期字符串或 Date 对象
 * @param formatStr - 格式字符串，默认 'yyyy年MM月dd日'
 * @returns 格式化后的日期字符串
 * 
 * @example
 * formatDate('2024-01-01') // 返回 '2024年01月01日'
 * formatDate(new Date(), 'yyyy-MM-dd') // 返回 '2024-01-01'
 */
export function formatDate(date: string | Date, formatStr: string = 'yyyy年MM月dd日'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: zhCN });
  } catch (error) {
    console.error('Invalid date:', date);
    return '日期无效';
  }
}

/**
 * 格式化日期为相对时间
 * 
 * @param date - 日期字符串或 Date 对象
 * @returns 相对时间字符串
 * 
 * @example
 * formatRelativeTime('2024-01-01') // 返回 '3天前'
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: zhCN });
  } catch (error) {
    console.error('Invalid date:', date);
    return '日期无效';
  }
}

