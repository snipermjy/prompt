import { getPrompts } from '@/app/actions/prompts';
import { getCategoriesWithCount } from '@/app/actions/categories';
import LoadMore from '@/components/features/LoadMore';
import { NoDataState } from '@/components/ui/EmptyState';
import { WebsiteJsonLd } from '@/components/seo/JsonLd';
import CategoryNav from '@/components/layout/CategoryNav';

/**
 * 首页
 * 展示分类导航和最新提示词列表
 */

// 动态渲染，实时更新
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'AI提示词库 - 精选优质AI提示词',
  description: '收录各类优质AI提示词，涵盖ChatGPT、Claude、Midjourney等主流AI工具',
};

export default async function HomePage() {
  // 获取分类和提示词数据
  let categories: Awaited<ReturnType<typeof getCategoriesWithCount>> = [];
  let prompts: Awaited<ReturnType<typeof getPrompts>> = [];

  try {
    [categories, prompts] = await Promise.all([
      getCategoriesWithCount(),
      getPrompts(undefined, 20),
    ]);
    
    // 只显示有提示词的分类
    categories = categories.filter(cat => cat.prompt_count > 0);
  } catch (error) {
    console.error('Failed to load data:', error);
    // 如果数据库未配置，返回空数组，页面仍可显示
  }

  // 创建分类映射（slug -> name）
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
      <CategoryNav categories={categories} totalCount={prompts.length} />
      
      {/* 主内容区 - 全宽布局 */}
      <div className="max-w-[1920px] mx-auto">
      <main className="p-4 md:p-6">

        {/* 工具栏 - 统计和排序 */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              共 <span className="font-semibold text-blue-600">{prompts.length}</span> 个提示词
            </span>
          </div>
          
          {/* 排序按钮 */}
          <div className="flex items-center gap-2">
            <button className="px-3 md:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm">
              最新
            </button>
            <button className="px-3 md:px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              最热
            </button>
            <button className="hidden sm:block px-3 md:px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              收藏最多
            </button>
          </div>
        </div>

        {/* 提示词列表 - 带加载更多功能 */}
        {promptsWithCategoryName.length > 0 ? (
          <LoadMore initialPrompts={promptsWithCategoryName} categoryMap={categoryMap} />
        ) : (
          <NoDataState actionLabel="提交提示词" actionHref="/submit" />
        )}
      </main>
      </div>
    </>
  );
}

