'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils/formatNumber';
import { formatDate } from '@/lib/utils/formatDate';
import { statusConfig } from '@/lib/config/site';
import DeleteButton from './DeleteButton';
import BatchActions from './BatchActions';
import type { Prompt } from '@/lib/types/database';

/**
 * 提示词表格组件（客户端组件，支持批量选择）
 */

interface PromptsTableProps {
  prompts: Prompt[];
}

export default function PromptsTable({ prompts }: PromptsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedIds.length === prompts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(prompts.map(p => p.id));
    }
  };

  // 单选
  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 清空选择
  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === prompts.length && prompts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  标题
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  浏览量
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {prompts.map((prompt) => (
                <tr
                  key={prompt.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedIds.includes(prompt.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(prompt.id)}
                      onChange={() => handleSelectOne(prompt.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-md">
                      {prompt.title}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                      {prompt.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${statusConfig[prompt.status].bgColor} ${statusConfig[prompt.status].color}`}>
                      {statusConfig[prompt.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatNumber(prompt.view_count)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(prompt.created_at, 'yyyy-MM-dd')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/prompt/${prompt.id}`}
                        target="_blank"
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        查看
                      </Link>
                      <Link
                        href={`/admin/prompts/${prompt.id}/edit`}
                        className="text-xs text-gray-600 hover:text-gray-700"
                      >
                        编辑
                      </Link>
                      <DeleteButton id={prompt.id} title={prompt.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {prompts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            暂无提示词数据
          </div>
        )}
      </div>

      {/* 批量操作浮动栏 */}
      <BatchActions
        selectedIds={selectedIds}
        prompts={prompts}
        onClearSelection={handleClearSelection}
      />
    </>
  );
}

