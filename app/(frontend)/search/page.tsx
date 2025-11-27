import { searchPrompts } from '@/app/actions/prompts';
import { getCategoriesWithCount } from '@/app/actions/categories';
import Breadcrumb from '@/components/layout/Breadcrumb';
import PromptCard from '@/components/features/PromptCard';
import EmptyState, { NoSearchResultsState } from '@/components/ui/EmptyState';

/**
 * 搜索页面
 * 根据关键词搜索提示词
 */

interface PageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

// ISR: 搜索页面不缓存，保持动态
export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  const keyword = params.q || '';
  
  return {
    title: keyword ? `搜索: ${keyword} - AI提示词库` : '搜索 - AI提示词库',
    description: keyword ? `搜索AI提示词: ${keyword}` : '搜索优质AI提示词，快速找到你需要的prompt',
    robots: {
      index: false, // 搜索结果页不索引
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const keyword = params.q || '';
  
  // 执行搜索
  const prompts = keyword ? await searchPrompts(keyword, 50) : [];
  
  // 获取分类映射，用于显示中文分类名
  const categories = await getCategoriesWithCount();
  const categoryMap = new Map(categories.map(cat => [cat.slug, cat.name]));
  
  // 为每个提示词添加分类名称
  const promptsWithCategoryName = prompts.map(prompt => ({
    ...prompt,
    categoryName: categoryMap.get(prompt.category) || prompt.category,
  }));
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑导航 */}
      <Breadcrumb
        items={[
          { label: '搜索结果' },
        ]}
      />
      
      {/* 搜索关键词显示 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {keyword ? (
            <>
              搜索: <span className="text-blue-600">{keyword}</span>
            </>
          ) : (
            '搜索提示词'
          )}
        </h1>
        {keyword && (
          <p className="text-gray-600">找到 {promptsWithCategoryName.length} 个相关提示词</p>
        )}
      </div>
      
      {/* 搜索结果 */}
      {!keyword ? (
        <EmptyState
          icon={
            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          title="请输入搜索关键词"
          description="在顶部搜索框输入关键词，查找你需要的提示词"
          action={{ label: '浏览全部', href: '/' }}
        />
      ) : promptsWithCategoryName.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {promptsWithCategoryName.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        <NoSearchResultsState query={keyword} />
      )}
    </div>
  );
}

