import Link from 'next/link';
import { getPrompts } from '@/app/actions/prompts';
import { getCategories } from '@/app/actions/categories';
import FilterBar from './FilterBar';
import PromptsTable from './PromptsTable';

/**
 * 提示词管理页面
 * 显示所有提示词列表，支持批量操作、筛选、编辑、删除
 */

// 禁用页面缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
  }>;
}

export default async function PromptsManagePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { category, status } = params;

  // 获取数据 - 管理后台获取所有状态的提示词
  const [prompts, categories] = await Promise.all([
    getPrompts(category, 1000, 0, true), // includeAll = true
    getCategories(),
  ]);

  // 根据状态筛选
  const filteredPrompts = status
    ? prompts.filter((p) => p.status === status)
    : prompts;

  return (
    <div>
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">提示词管理</h1>
          <p className="text-sm text-gray-600 mt-1">
            共 <span className="font-semibold text-blue-600">{filteredPrompts.length}</span> 个提示词
          </p>
        </div>
        <Link
          href="/admin/prompts/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加提示词
        </Link>
      </div>

      {/* 筛选器 */}
      <FilterBar categories={categories} />

      {/* 提示词表格（支持批量选择） */}
      <PromptsTable prompts={filteredPrompts} categories={categories} />
    </div>
  );
}

