/**
 * next-intl 请求配置
 */

import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // 验证 locale 是否有效
  const validLocale: string = locales.includes(locale as any) ? (locale as string) : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../locales/${validLocale}/common.json`)).default,
  };
});
