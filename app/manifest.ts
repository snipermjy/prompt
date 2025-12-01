import { MetadataRoute } from 'next';

/**
 * PWA Manifest
 * 支持将网站添加到主屏幕
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI Prompt Library - Curated AI prompts',
    short_name: 'AI Prompt Library',
    description: 'Curated collection of high-quality AI prompts for ChatGPT, Claude, Midjourney and more.',
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
