import { getPromptsWithTranslation, getCategoriesWithTranslation } from '@/app/actions/translations';
import { getCategoriesWithCount } from '@/app/actions/categories';
import LoadMore from '@/components/features/LoadMore';
import { NoDataState } from '@/components/ui/EmptyState';
import { WebsiteJsonLd } from '@/components/seo/JsonLd';
import CategoryNav from '@/components/layout/CategoryNav';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/types/database';

/**
 * 首页
 * 展示分类导航和最新提示词列表
 */

// 动态渲染，实时更新
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });
  
  return {
    title: t('name'),
    description: t('description'),
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const tCategory = await getTranslations({ locale, namespace: 'category' });
  const tSubmit = await getTranslations({ locale, namespace: 'submit' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  
  // 获取分类统计和提示词数据
  let categoriesWithCount: Awaited<ReturnType<typeof getCategoriesWithCount>> = [];
  let prompts: Awaited<ReturnType<typeof getPromptsWithTranslation>> = [];

  try {
    [categoriesWithCount, prompts] = await Promise.all([
      getCategoriesWithCount(),
      getPromptsWithTranslation(locale, { status: 'published', limit: 20 }),
    ]);
    
    // 只显示有提示词的分类
    categoriesWithCount = categoriesWithCount.filter(cat => cat.prompt_count > 0);
  } catch (error) {
    console.error('Failed to load data:', error);
  }

  // 获取带翻译的分类
  const categoriesWithTranslation = await getCategoriesWithTranslation(locale);
  
  // 合并翻译和统计数据
  const categories = categoriesWithCount.map(cat => {
    const translated = categoriesWithTranslation.find(t => t.id === cat.id);
    return {
      ...cat,
      name: translated?.name || cat.name,
      description: translated?.description || cat.description,
    };
  });
  
  // 创建分类映射（slug -> name，使用翻译后的名称）
  const categoryMap = new Map(categories.map(cat => [cat.slug, cat.name]));
  
  // 为每个提示词添加分类名称
  const promptsWithCategoryName = prompts.map(prompt => ({
    ...prompt,
    categoryName: categoryMap.get(prompt.category) || prompt.category,
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <>
      <WebsiteJsonLd url={siteUrl} />
      
      {/* 顶部分类导航 */}
      <CategoryNav categories={categories} totalCount={prompts.length} locale={locale} />
      
      {/* 主内容区 - 全宽布局 */}
      <div className="max-w-[1920px] mx-auto">
      <main className="p-4 md:p-6">

        {/* 工具栏 - 统计和排序 */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {tCategory('total')} <span className="font-semibold text-blue-600">{prompts.length}</span> {tCategory('prompts')}
            </span>
          </div>
          
          {/* 排序按钮 */}
          <div className="flex items-center gap-2">
            <button className="px-3 md:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm">
              {tCategory('latest')}
            </button>
            <button className="px-3 md:px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              {tCategory('popular')}
            </button>
            <button className="hidden sm:block px-3 md:px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              {tCategory('mostSaved')}
            </button>
          </div>
        </div>

        {/* 提示词列表 - 带加载更多功能 */}
        {promptsWithCategoryName.length > 0 ? (
          <LoadMore initialPrompts={promptsWithCategoryName} categoryMap={categoryMap} locale={locale} />
        ) : (
          <NoDataState 
            title={tCommon('noData')}
            description={tCommon('noDataDescription')}
            actionLabel={tSubmit('title')} 
            actionHref={`/${locale}/submit`} 
          />
        )}
      </main>
      </div>
    </>
  );
}

