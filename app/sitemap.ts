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
  const locales = ['zh', 'en'] as const;
  const defaultLocale = 'zh';

  const buildLanguageAlternates = (path: string) => ({
    languages: locales.reduce<Record<string, string>>((result, locale) => {
      result[locale] = `${siteUrl}/${locale}${path}`;
      return result;
    }, {}),
  });
  
  // 获取所有提示词和分类（使用静态客户端，不依赖 cookies）
  const [prompts, categories] = await Promise.all([
    getPrompts(undefined, 1000, 0, false, true),
    getCategories(true),
  ]);
  
  // 静态页面（以 zh 为 canonical，en 作为语言备选）
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/${defaultLocale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: buildLanguageAlternates(''),
    },
    {
      url: `${siteUrl}/${defaultLocale}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: buildLanguageAlternates('/submit'),
    },
  ];
  
  // 分类页面
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => {
    const basePath = `/category/${category.slug}`;
    return {
      url: `${siteUrl}/${defaultLocale}${basePath}`,
      lastModified: new Date(category.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: buildLanguageAlternates(basePath),
    };
  });
  
  // 提示词详情页
  const promptPages: MetadataRoute.Sitemap = prompts.map((prompt) => {
    const basePath = `/prompt/${prompt.id}`;
    return {
      url: `${siteUrl}/${defaultLocale}${basePath}`,
      lastModified: new Date(prompt.updated_at || prompt.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: buildLanguageAlternates(basePath),
    };
  });
  
  return [...staticPages, ...categoryPages, ...promptPages];
}
