'use client';

import { useState } from 'react';
import type { Category } from '@/lib/types/database';

interface CategoryWithCount extends Category {
  prompt_count?: number;
}

interface CategoryManagementProps {
  initialCategories: CategoryWithCount[];
}

interface CategoryTree {
  [parentCategory: string]: CategoryWithCount[];
}

export default function CategoryManagement({ initialCategories }: CategoryManagementProps) {
  const [categories, setCategories] = useState<CategoryWithCount[]>(initialCategories);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithCount | null>(null);

  // 构建分类树
  const categoryTree: CategoryTree = {};
  const parentCategories = new Set<string>();

  categories.forEach(cat => {
    const parent = cat.parent_category || '其他';
    parentCategories.add(parent);

    if (!categoryTree[parent]) {
      categoryTree[parent] = [];
    }
    categoryTree[parent].push(cat);
  });

  // 一级分类顺序
  const parentOrder = ['内容创作', '技术开发', '商业运营', '效率工具', 'AI应用', '其他'];
  const sortedParents = parentOrder.filter(p => parentCategories.has(p));

  // 一级分类图标映射
  const parentIcons: { [key: string]: string } = {
    '内容创作': '✍️',
    '技术开发': '💻',
    '商业运营': '📈',
    '效率工具': '⚡',
    'AI应用': '🤖',
    '其他': '📁'
  };

  // 切换选中状态
  const toggleSelection = (categoryId: string) => {
    const newSelection = new Set(selectedCategories);
    if (newSelection.has(categoryId)) {
      newSelection.delete(categoryId);
    } else {
      newSelection.add(categoryId);
    }
    setSelectedCategories(newSelection);
  };

  // 打开合并对话框
  const openMergeModal = () => {
    if (selectedCategories.size < 2) {
      alert('请至少选择2个分类进行合并');
      return;
    }
    setMergeModalOpen(true);
  };

  // 打开重命名对话框
  const openRenameModal = (category: CategoryWithCount) => {
    setSelectedCategory(category);
    setRenameModalOpen(true);
  };

  // 删除分类
  const handleDelete = async (category: CategoryWithCount) => {
    if (category.prompt_count && category.prompt_count > 0) {
      alert(`分类"${category.name}"下有${category.prompt_count}个提示词，无法删除`);
      return;
    }

    if (!confirm(`确定要删除分类"${category.name}"吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== category.id));
        alert('删除成功');
      } else {
        const data = await response.json();
        alert(`删除失败: ${data.error}`);
      }
    } catch (error) {
      console.error('删除分类失败:', error);
      alert('删除失败，请稍后重试');
    }
  };

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            已选择 <span className="font-semibold text-blue-600">{selectedCategories.size}</span> 个分类
          </div>
          <div className="flex gap-2">
            <button
              onClick={openMergeModal}
              disabled={selectedCategories.size < 2}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              合并分类
            </button>
            <button
              onClick={() => setSelectedCategories(new Set())}
              disabled={selectedCategories.size === 0}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              取消选择
            </button>
          </div>
        </div>
      </div>

      {/* 分类列表（按一级分类分组） */}
      {sortedParents.map(parent => (
        <div key={parent} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{parentIcons[parent]}</span>
            <h2 className="text-lg font-semibold text-gray-900">{parent}</h2>
            <span className="text-sm text-gray-500">
              ({categoryTree[parent]?.length || 0}个分类)
            </span>
          </div>

          <div className="space-y-2">
            {categoryTree[parent]?.map(category => (
              <div
                key={category.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  selectedCategories.has(category.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* 复选框 */}
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(category.id)}
                    onChange={() => toggleSelection(category.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />

                  {/* 分类信息 */}
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{category.name}</span>
                        <span className="text-xs text-gray-500">({category.slug})</span>
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                    </div>
                  </div>

                  {/* 提示词数量 */}
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {category.prompt_count || 0}
                    </div>
                    <div className="text-xs text-gray-500">提示词</div>
                  </div>

                  {/* 最后更新时间 */}
                  <div className="text-right min-w-[120px]">
                    <div className="text-sm text-gray-600">
                      {category.last_updated_at
                        ? new Date(category.last_updated_at).toLocaleDateString('zh-CN')
                        : '-'}
                    </div>
                    <div className="text-xs text-gray-500">最后更新</div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openRenameModal(category)}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    重命名
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 合并对话框 */}
      {mergeModalOpen && (
        <MergeModal
          categories={categories.filter(c => selectedCategories.has(c.id))}
          onClose={() => setMergeModalOpen(false)}
          onSuccess={(mergedCategory) => {
            // 刷新分类列表
            window.location.reload();
          }}
        />
      )}

      {/* 重命名对话框 */}
      {renameModalOpen && selectedCategory && (
        <RenameModal
          category={selectedCategory}
          onClose={() => {
            setRenameModalOpen(false);
            setSelectedCategory(null);
          }}
          onSuccess={(updatedCategory) => {
            setCategories(categories.map(c => 
              c.id === updatedCategory.id ? updatedCategory : c
            ));
            setRenameModalOpen(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
}

// 合并对话框组件
function MergeModal({
  categories,
  onClose,
  onSuccess,
}: {
  categories: CategoryWithCount[];
  onClose: () => void;
  onSuccess: (category: CategoryWithCount) => void;
}) {
  const [targetCategoryId, setTargetCategoryId] = useState(categories[0]?.id || '');
  const [loading, setLoading] = useState(false);

  const handleMerge = async () => {
    if (!targetCategoryId) {
      alert('请选择目标分类');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/categories/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCategoryId,
          sourceCategoryIds: categories.filter(c => c.id !== targetCategoryId).map(c => c.id),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('合并成功');
        onSuccess(data.category);
      } else {
        const data = await response.json();
        alert(`合并失败: ${data.error}`);
      }
    } catch (error) {
      console.error('合并分类失败:', error);
      alert('合并失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">合并分类</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            将以下分类合并到目标分类：
          </p>
          <div className="space-y-2 mb-4">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 text-sm">
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-gray-500">({cat.prompt_count || 0}个提示词)</span>
              </div>
            ))}
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择目标分类：
          </label>
          <select
            value={targetCategoryId}
            onChange={(e) => setTargetCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleMerge}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            {loading ? '合并中...' : '确认合并'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 重命名对话框组件
function RenameModal({
  category,
  onClose,
  onSuccess,
}: {
  category: CategoryWithCount;
  onClose: () => void;
  onSuccess: (category: CategoryWithCount) => void;
}) {
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [description, setDescription] = useState(category.description || '');
  const [icon, setIcon] = useState(category.icon);
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    if (!name.trim() || !slug.trim()) {
      alert('名称和Slug不能为空');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description, icon }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('更新成功');
        onSuccess(data.category);
      } else {
        const data = await response.json();
        alert(`更新失败: ${data.error}`);
      }
    } catch (error) {
      console.error('更新分类失败:', error);
      alert('更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">重命名分类</h3>
        
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分类名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug（英文标识）
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              图标（Emoji）
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleRename}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
