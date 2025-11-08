import { getCategories } from '@/app/actions/categories';
import Breadcrumb from '@/components/layout/Breadcrumb';
import PromptForm from '../PromptForm';

/**
 * 添加提示词页面
 */

export const metadata = {
  title: '添加提示词 - 管理后台',
  description: '添加新的AI提示词',
};

export default async function AddPromptPage() {
  const categories = await getCategories();

  return (
    <div>
      {/* 面包屑导航 */}
      <Breadcrumb
        items={[
          { label: '管理后台', href: '/admin' },
          { label: '提示词管理', href: '/admin/prompts' },
          { label: '添加提示词' },
        ]}
      />

      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">添加提示词</h1>
      </div>

      {/* 表单 */}
      <PromptForm categories={categories} />
    </div>
  );
}

