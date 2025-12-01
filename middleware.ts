/**
 * Next.js 中间件 - 国际化路由和语言检测
 */

import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  // 支持的语言列表
  locales,
  
  // 默认语言
  defaultLocale,
  
  // 语言检测策略
  localeDetection: true,
  
  // 所有语言都显示前缀（/ 重定向到 /zh 或 /en）
  localePrefix: 'always',
});

export const config = {
  // 匹配所有路径，除了 API、静态文件和管理后台
  matcher: [
    // 包含所有路径
    '/((?!api|_next|_vercel|admin|.*\\..*).*)',
    // 包含根路径
    '/',
  ],
};
