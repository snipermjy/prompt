import { getCategories } from '@/app/actions/categories';
import Breadcrumb from '@/components/layout/Breadcrumb';
import CategoryManagement from './CategoryManagement';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '分类管理 - 管理后台',
  description: '管理AI提示词分类',
};

export default async function CategoriesPage() {
  const categories = await getCategories(true, 'last_updated');

  return (
    <div>
      {/* 面包屑导航 */}
      <Breadcrumb
        items={[
          { label: '管理后台', href: '/admin' },
          { label: '分类管理' },
        ]}
      />

      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            管理提示词分类，支持合并、重命名、删除等操作
          </p>
        </div>
      </div>

      {/* 分类管理组件 */}
      <CategoryManagement initialCategories={categories} />
    </div>
  );
}
