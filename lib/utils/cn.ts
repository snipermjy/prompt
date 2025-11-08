import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名
 * 用于动态组合多个类名，自动处理冲突
 * 
 * @param inputs - 类名数组
 * @returns 合并后的类名字符串
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // 返回 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500') // 条件类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

