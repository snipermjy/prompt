import Link from 'next/link';
import { getPrompts } from '@/app/actions/prompts';
import { getCategoriesWithCount } from '@/app/actions/categories';
import LoadMore from '@/components/features/LoadMore';
import { NoDataState } from '@/components/ui/EmptyState';
import { WebsiteJsonLd } from '@/components/seo/JsonLd';

/**
 * 首页
 * 展示分类导航和最新提示词列表
 */

// ISR: 每5分钟重新生成页面
export const revalidate = 300;

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
      <div className="max-w-[1920px] mx-auto flex">
      {/* 左侧分类导航 - 桌面端显示 */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-100 min-h-[calc(100vh-81px)] sticky top-[81px] overflow-y-auto">
        <div className="p-4">{/* 分类导航内容 */}
          {/* 标题 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">分类筛选</h2>
          </div>

          {/* 分类列表 */}
          <nav className="space-y-1">
            {/* 全部 */}
            <Link
              href="/"
              className="category-item active flex items-center justify-between px-3 py-2.5 rounded-lg border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/15 to-transparent"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <span className="text-sm font-semibold text-blue-600">全部</span>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {prompts.length}
              </span>
            </Link>

            {/* 各分类 */}
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="category-item flex items-center justify-between px-3 py-2.5 rounded-lg border-l-4 border-transparent hover:bg-gradient-to-r hover:from-blue-50/10 hover:to-transparent hover:border-l-blue-500 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                </div>
                <span className="text-xs text-gray-500">{category.prompt_count || 0}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 p-3 md:p-6">
        {/* 移动端分类筛选 - 横向滚动 */}
        <div className="md:hidden mb-4 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg whitespace-nowrap"
            >
              📚 全部
            </Link>
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                {category.icon} {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* 排序和筛选栏 */}
        <div className="flex items-center justify-between mb-4 md:mb-6">{/* 原有排序筛选内容 */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              共 <span className="font-semibold text-blue-600">{prompts.length}</span> 个提示词
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
              最新
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              最热
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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

