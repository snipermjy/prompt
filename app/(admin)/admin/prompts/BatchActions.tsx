'use client';

import { useState } from 'react';
import { updatePrompt, deletePrompt } from '@/app/actions/prompts';
import { useRouter } from 'next/navigation';
import type { Prompt, PromptStatus } from '@/lib/types/database';

/**
 * 批量操作组件
 */

interface BatchActionsProps {
  selectedIds: string[];
  prompts: Prompt[];
  onClearSelection: () => void;
}

export default function BatchActions({ selectedIds, onClearSelection }: BatchActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<string>('');

  const handleBatchAction = async (action: 'publish' | 'draft' | 'delete') => {
    if (selectedIds.length === 0) {
      return;
    }

    const confirmMessages = {
      publish: `确定要将选中的 ${selectedIds.length} 个提示词设为“已发布”吗？`,
      draft: `确定要将选中的 ${selectedIds.length} 个提示词设为“草稿”吗？`,
      delete: `确定要删除选中的 ${selectedIds.length} 个提示词吗？此操作不可恢复！`,
    };

    const confirmed = window.confirm(confirmMessages[action]);
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setActionType(action);

    try {
      if (action === 'delete') {
        // 批量删除
        const deletePromises = selectedIds.map(id => deletePrompt(id));
        await Promise.all(deletePromises);
      } else {
        // 批量更新状态
        const status = action === 'publish' ? 'published' : 'draft';
        const updatePromises = selectedIds.map(id => {
          return updatePrompt(id, { status: status as PromptStatus });
        });
        await Promise.all(updatePromises);
      }

      onClearSelection();
      router.refresh();
    } catch (error) {
      console.error('批量操作失败:', error);
      alert('操作失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 px-6 py-4 flex items-center gap-4">
        <span className="text-sm text-gray-700 font-medium">
          已选择 <span className="text-blue-600 font-bold">{selectedIds.length}</span> 项
        </span>
        
        <div className="h-6 w-px bg-gray-300"></div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBatchAction('publish')}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-1.5"
          >
            {loading && actionType === 'publish' ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                发布中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                批量发布
              </>
            )}
          </button>

          <button
            onClick={() => handleBatchAction('draft')}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors flex items-center gap-1.5"
          >
            {loading && actionType === 'draft' ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                处理中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                改为草稿
              </>
            )}
          </button>


          <button
            onClick={() => handleBatchAction('delete')}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center gap-1.5"
          >
            {loading && actionType === 'delete' ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                删除中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                批量删除
              </>
            )}
          </button>

          <button
            onClick={onClearSelection}
            disabled={loading}
            className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
          >
            取消选择
          </button>
        </div>
      </div>
    </div>
  );
}

