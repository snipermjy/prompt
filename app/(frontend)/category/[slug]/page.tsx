import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '@/app/actions/categories';
import { getPrompts } from '@/app/actions/prompts';
import Breadcrumb from '@/components/layout/Breadcrumb';
import PromptCard from '@/components/features/PromptCard';
import EmptyState from '@/components/ui/EmptyState';

/**
 * 分类页面
 * 展示特定分类下的所有提示词
 */

// ISR: 每10分钟重新生成页面
export const revalidate = 600;

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
  
  // 获取分类信息
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    notFound();
  }
  
  // 获取该分类下的提示词
  const prompts = await getPrompts(slug, 100);
  
  // 为每个提示词添加中文分类名称
  const promptsWithCategoryName = prompts.map(prompt => ({
    ...prompt,
    categoryName: category.name,
  }));
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑导航 */}
      <Breadcrumb
        items={[
          { label: '分类', href: '/' },
          { label: category.name },
        ]}
      />
      
      {/* 分类标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{category.icon}</span>
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        </div>
        {category.description && (
          <p className="text-gray-600">{category.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">共 {prompts.length} 个提示词</p>
      </div>
      
      {/* 提示词列表 */}
      {promptsWithCategoryName.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
    </div>
  );
}

