import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoriesWithCount } from '@/app/actions/categories';
import { getCategoryWithTranslation, getCategoriesWithTranslation, getPromptsWithTranslation } from '@/app/actions/translations';
import Breadcrumb from '@/components/layout/Breadcrumb';
import PromptCard from '@/components/features/PromptCard';
import EmptyState from '@/components/ui/EmptyState';
import CategoryNav from '@/components/layout/CategoryNav';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/types/database';

/**
 * 分类页面
 * 展示特定分类下的所有提示词
 */

// 动态渲染，实时更新
export const dynamic = 'force-dynamic';

type SortBy = 'latest' | 'popular' | 'mostShared';

interface PageProps {
  params: Promise<{
    slug: string;
    locale: Locale;
  }>;
  searchParams?: Promise<{
    sort?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, locale } = await params;
  const category = await getCategoryWithTranslation(slug, locale);
  const t = await getTranslations({ locale, namespace: 'site' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://promtp.mom';
  const basePath = `/category/${slug}`;
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }
  
  return {
    title: `${category.name} - ${t('name')}`,
    description: category.description || `Browse all AI prompts in ${category.name} category`,
    openGraph: {
      title: `${category.name} - ${t('name')}`,
      description: category.description || `Browse all AI prompts in ${category.name} category`,
    },
    alternates: {
      canonical: `${siteUrl}/${locale}${basePath}`,
      languages: {
        zh: `${siteUrl}/zh${basePath}`,
        en: `${siteUrl}/en${basePath}`,
      },
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug, locale } = await params;
  const search = searchParams ? await searchParams : {};
  const sortParam = (search as { sort?: string }).sort;
  const sortBy: SortBy = sortParam === 'popular' || sortParam === 'mostShared' ? sortParam : 'latest';
  const t = await getTranslations({ locale, namespace: 'category' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tSubmit = await getTranslations({ locale, namespace: 'submit' });
  
  // 获取分类信息和所有分类列表
  const [category, categoriesWithCount, categoriesWithTranslation] = await Promise.all([
    getCategoryWithTranslation(slug, locale),
    getCategoriesWithCount(),
    getCategoriesWithTranslation(locale),
  ]);
  
  if (!category) {
    notFound();
  }
  
  // 只显示有提示词的分类
  const categoriesWithPrompt = categoriesWithCount.filter(cat => cat.prompt_count > 0);
  const categories = categoriesWithPrompt.map(cat => {
    const translated = categoriesWithTranslation.find(t => t.id === cat.id);
    return {
      ...cat,
      name: translated?.name || cat.name,
      description: translated?.description || cat.description,
    };
  });
  
  // 获取该分类下的提示词
  const prompts = await getPromptsWithTranslation(locale, {
    category: slug,
    status: 'published',
    limit: 100,
    sortBy,
  });
  
  // 为每个提示词添加中文分类名称
  const promptsWithCategoryName = prompts.map(prompt => ({
    ...prompt,
    categoryName: category.name,
  }));
  
  return (
    <>
      {/* 顶部分类导航 */}
      <CategoryNav categories={categories} totalCount={prompts.length} locale={locale} />
      
      {/* 主内容区 - 全宽布局 */}
      <div className="max-w-[1920px] mx-auto">
        <main className="p-4 md:p-6">
          {/* 面包屑导航 */}
          <Breadcrumb
            items={[
              { label: t('all'), href: `/${locale}` },
              { label: category.name },
            ]}
          />
          
          {/* 分类标题 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{category.icon}</span>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            </div>
            {category.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">{t('total')} {prompts.length} {t('prompts')}</p>
          </div>

          {/* 排序按钮 */}
          <div className="flex items-center justify-end mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/category/${slug}?sort=latest`}
                className={`px-3 md:px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors ${
                  sortBy === 'latest'
                    ? 'text-white bg-blue-600'
                    : 'text-gray-600 bg-white hover:bg-gray-100'
                }`}
              >
                {t('latest')}
              </Link>
              <Link
                href={`/${locale}/category/${slug}?sort=popular`}
                className={`px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  sortBy === 'popular'
                    ? 'text-white bg-blue-600 shadow-sm'
                    : 'text-gray-600 bg-white hover:bg-gray-100'
                }`}
              >
                {t('popular')}
              </Link>
              <Link
                href={`/${locale}/category/${slug}?sort=mostShared`}
                className={`hidden sm:block px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  sortBy === 'mostShared'
                    ? 'text-white bg-blue-600 shadow-sm'
                    : 'text-gray-600 bg-white hover:bg-gray-100'
                }`}
              >
                {t('mostSaved')}
              </Link>
            </div>
          </div>
          
          {/* 提示词列表 - 自适应网格 */}
          {promptsWithCategoryName.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
              {promptsWithCategoryName.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} locale={locale} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={tCommon('noData')}
              description=""
              action={{ label: tSubmit('title'), href: `/${locale}/submit` }}
            />
          )}
        </main>
      </div>
    </>
  );
}

