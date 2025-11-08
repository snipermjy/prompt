import { notFound } from 'next/navigation';
import { getPromptById } from '@/app/actions/prompts';
import { getCategories } from '@/app/actions/categories';
import Breadcrumb from '@/components/layout/Breadcrumb';
import PromptForm from '../../PromptForm';

/**
 * 编辑提示词页面
 */

// 禁用页面缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const prompt = await getPromptById(id, true); // 使用管理员权限

  return {
    title: prompt ? `编辑: ${prompt.title} - 管理后台` : '编辑提示词 - 管理后台',
  };
}

export default async function EditPromptPage({ params }: PageProps) {
  const { id } = await params;

  const [prompt, categories] = await Promise.all([
    getPromptById(id, true), // 使用管理员权限
    getCategories(),
  ]);

  if (!prompt) {
    notFound();
  }

  return (
    <div>
      {/* 面包屑导航 */}
      <Breadcrumb
        items={[
          { label: '管理后台', href: '/admin' },
          { label: '提示词管理', href: '/admin/prompts' },
          { label: '编辑提示词' },
        ]}
      />

      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">编辑提示词</h1>
      </div>

      {/* 表单 */}
      <PromptForm categories={categories} initialData={prompt} />
    </div>
  );
}

