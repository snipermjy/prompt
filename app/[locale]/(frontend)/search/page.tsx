import { searchPrompts } from '@/app/actions/prompts';
import { getCategoriesWithCount } from '@/app/actions/categories';
import Breadcrumb from '@/components/layout/Breadcrumb';
import PromptCard from '@/components/features/PromptCard';
import EmptyState, { NoSearchResultsState } from '@/components/ui/EmptyState';

/**
 * Search page
 * Search prompts by keyword
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
  
  const siteName = 'AI Prompt Library';
  return {
    title: keyword ? `Search: ${keyword} - ${siteName}` : `Search - ${siteName}`,
    description: keyword
      ? `Search AI prompts: ${keyword}`
      : 'Search high-quality AI prompts and quickly find what you need.',
    robots: {
      index: false, // do not index search result pages
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const keyword = params.q || '';
  
  // Execute search
  const prompts = keyword ? await searchPrompts(keyword, 50) : [];
  
  // Get category mapping (slug -> name)
  const categories = await getCategoriesWithCount();
  const categoryMap = new Map(categories.map(cat => [cat.slug, cat.name]));
  
  // 为每个提示词添加分类名称
  const promptsWithCategoryName = prompts.map(prompt => ({
    ...prompt,
    categoryName: categoryMap.get(prompt.category) || prompt.category,
  }));
  
  return (
    <div className="max-w-[1920px] mx-auto">
      <main className="p-4 md:p-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Search results' },
          ]}
        />
        
        {/* Search keyword summary */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {keyword ? (
              <>
                Search: <span className="text-blue-600">{keyword}</span>
              </>
            ) : (
              'Search prompts'
            )}
          </h1>
          {keyword && (
            <p className="text-gray-600">
              Found {promptsWithCategoryName.length} related prompts
            </p>
          )}
        </div>
        
        {/* Search results - responsive grid */}
        {!keyword ? (
          <EmptyState
            icon={
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            title="Enter a search keyword"
            description="Type a keyword in the top search box to find prompts."
            action={{ label: 'Browse all', href: '/' }}
          />
        ) : promptsWithCategoryName.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {promptsWithCategoryName.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        ) : (
          <NoSearchResultsState query={keyword} />
        )}
      </main>
    </div>
  );
}

