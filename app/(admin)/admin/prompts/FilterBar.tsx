'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Category } from '@/lib/types/database';

/**
 * 提示词管理页面筛选栏（客户端组件）
 */

interface FilterBarProps {
  categories: Category[];
}

export default function FilterBar({ categories }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';

  // 按一级分类分组
  const categoryTree: { [key: string]: Category[] } = {};
  categories.forEach(cat => {
    const parent = cat.parent_category || '其他';
    if (!categoryTree[parent]) {
      categoryTree[parent] = [];
    }
    categoryTree[parent].push(cat);
  });

  // 一级分类顺序
  const parentOrder = ['内容创作', '技术开发', '商业运营', '效率工具', 'AI应用', '其他'];
  const sortedParents = parentOrder.filter(p => categoryTree[p]);

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    router.push(`/admin/prompts?${params.toString()}`);
  };

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    router.push(`/admin/prompts?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* 分类筛选（按一级分类分组） */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">分类筛选</label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">全部分类</option>
            {sortedParents.map(parent => (
              <optgroup key={parent} label={parent}>
                {categoryTree[parent].map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* 状态筛选 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">状态筛选</label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
            <option value="pending">待审核</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
      </div>
    </div>
  );
}

