import { MetadataRoute } from 'next';

/**
 * PWA Manifest
 * 支持将网站添加到主屏幕
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI提示词库 - 精选优质AI提示词',
    short_name: 'AI提示词库',
    description: '收录各类优质AI提示词，涵盖ChatGPT、Claude、Midjourney等主流AI工具',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['productivity', 'utilities', 'education'],
    lang: 'zh-CN',
  };
}
