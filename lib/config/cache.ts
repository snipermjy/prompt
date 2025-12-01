/**
 * 缓存配置
 * 定义不同页面和数据的缓存策略
 */

export const cacheConfig = {
  // 页面级别缓存（ISR revalidate 时间，单位：秒）
  pages: {
    home: 300, // 5分钟
    promptDetail: 60, // 1分钟
    category: 600, // 10分钟
    search: 0, // 不缓存
    submit: 0, // 不缓存
  },

  // 数据级别缓存
  data: {
    prompts: 60, // 提示词列表缓存1分钟
    categories: 3600, // 分类缓存1小时
    stats: 300, // 统计数据缓存5分钟
  },

  // 静态资源缓存
  static: {
    images: 86400, // 图片缓存1天
    fonts: 604800, // 字体缓存7天
    scripts: 86400, // 脚本缓存1天
  },
} as const;

/**
 * 获取缓存控制头
 */
export function getCacheHeaders(type: keyof typeof cacheConfig.pages) {
  const maxAge = cacheConfig.pages[type];
  
  if (maxAge === 0) {
    return {
      'Cache-Control': 'no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
  }

  return {
    'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
  };
}

/**
 * 浏览器缓存键生成
 */
export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return `${prefix}:${sortedParams}`;
}
