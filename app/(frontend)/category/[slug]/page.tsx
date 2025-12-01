import { notFound } from 'next/navigation';
import { getCategoryBySlug, getCategoriesWithCount } from '@/app/actions/categories';
import { getPrompts } from '@/app/actions/prompts';
import Breadcrumb from '@/components/layout/Breadcrumb';
import PromptCard from '@/components/features/PromptCard';
import EmptyState from '@/components/ui/EmptyState';
import CategoryNav from '@/components/layout/CategoryNav';

/**
 * 分类页面
 * 展示特定分类下的所有提示词
 */

// 动态渲染，实时更新
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    return {
      title: '分类不存在',
    };
  }
  
  return {
    title: `${category.name} - AI提示词库`,
    description: category.description || `浏览${category.name}分类下的所有AI提示词`,
    openGraph: {
      title: `${category.name} - AI提示词库`,
      description: category.description || `浏览${category.name}分类下的所有AI提示词`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  
  // 获取分类信息和所有分类列表
  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getCategoriesWithCount(),
  ]);
  
  if (!category) {
    notFound();
  }
  
  // 只显示有提示词的分类
  const categories = allCategories.filter(cat => cat.prompt_count > 0);
  
  // 获取该分类下的提示词
  const prompts = await getPrompts(slug, 100);
  
  // 为每个提示词添加中文分类名称
  const promptsWithCategoryName = prompts.map(prompt => ({
    ...prompt,
    categoryName: category.name,
  }));
  
  return (
    <>
      {/* 顶部分类导航 */}
      <CategoryNav categories={categories} totalCount={prompts.length} />
      
      {/* 主内容区 - 全宽布局 */}
      <div className="max-w-[1920px] mx-auto">
        <main className="p-4 md:p-6">
          {/* 面包屑导航 */}
          <Breadcrumb
            items={[
              { label: '分类', href: '/' },
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
            <p className="text-sm text-gray-500 mt-2">共 {prompts.length} 个提示词</p>
          </div>
          
          {/* 提示词列表 - 自适应网格 */}
          {promptsWithCategoryName.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
              {promptsWithCategoryName.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="该分类暂无提示词"
              description="快来提交第一个提示词吧！"
              action={{ label: '提交提示词', href: '/submit' }}
            />
          )}
        </main>
      </div>
    </>
  );
}

