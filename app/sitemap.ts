import { MetadataRoute } from 'next';
import { getPrompts } from '@/app/actions/prompts';
import { getCategories } from '@/app/actions/categories';

// 强制静态生成，避免使用 cookies
export const dynamic = 'force-static';
export const revalidate = 3600; // 每小时重新生成一次

/**
 * 动态生成网站地图
 * 包含所有提示词和分类页面
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://promtp.mom';
  
  // 获取所有提示词和分类（使用静态客户端，不依赖 cookies）
  const [prompts, categories] = await Promise.all([
    getPrompts(undefined, 1000, 0, false, true),
    getCategories(true),
  ]);
  
  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];
  
  // 分类页面
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/category/${category.slug}`,
    lastModified: new Date(category.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));
  
  // 提示词详情页
  const promptPages: MetadataRoute.Sitemap = prompts.map((prompt) => ({
    url: `${siteUrl}/prompt/${prompt.id}`,
    lastModified: new Date(prompt.updated_at || prompt.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  return [...staticPages, ...categoryPages, ...promptPages];
}
