'use client';

import { useState } from 'react';
import { updateSubmissionStatus, deleteSubmission } from '@/app/actions/submissions';
import { useRouter } from 'next/navigation';
import type { UserSubmission } from '@/lib/types/database';

/**
 * 批量操作组件（提交管理）
 */

interface BatchActionsProps {
  selectedIds: string[];
  submissions: UserSubmission[];
  onClearSelection: () => void;
}

export default function BatchActions({ selectedIds, submissions, onClearSelection }: BatchActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<string>('');

  const handleBatchAction = async (action: 'approve' | 'reject' | 'restore' | 'delete') => {
    if (selectedIds.length === 0) return;

    const confirmMessages = {
      approve: `确定要通过选中的 ${selectedIds.length} 个提交吗？`,
      reject: `确定要拒绝选中的 ${selectedIds.length} 个提交吗？`,
      restore: `确定要将选中的 ${selectedIds.length} 个提交恢复为"待审核"吗？`,
      delete: `确定要删除选中的 ${selectedIds.length} 个提交吗？此操作不可恢复！`,
    };

    const confirmed = window.confirm(confirmMessages[action]);
    if (!confirmed) return;

    setLoading(true);
    setActionType(action);

    try {
      if (action === 'delete') {
        // 批量删除
        const deletePromises = selectedIds.map(id => deleteSubmission(id));
        await Promise.all(deletePromises);
      } else {
        // 批量更新状态
        const statusMap = {
          approve: 'approved' as const,
          reject: 'rejected' as const,
          restore: 'pending' as const,
        };
        const status = statusMap[action];
        const updatePromises = selectedIds.map(id => updateSubmissionStatus(id, status));
        await Promise.all(updatePromises);
      }

      onClearSelection();
      router.refresh();
    } catch (error) {
      console.error('批量操作失败:', error);
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">
          已选择 {selectedIds.length} 项
        </span>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleBatchAction('approve')}
            disabled={loading}
            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && actionType === 'approve' ? '通过中...' : '批量通过'}
          </button>
          
          <button
            onClick={() => handleBatchAction('reject')}
            disabled={loading}
            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && actionType === 'reject' ? '拒绝中...' : '批量拒绝'}
          </button>
          
          <button
            onClick={() => handleBatchAction('restore')}
            disabled={loading}
            className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && actionType === 'restore' ? '恢复中...' : '恢复审核'}
          </button>
          
          <button
            onClick={() => handleBatchAction('delete')}
            disabled={loading}
            className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && actionType === 'delete' ? '删除中...' : '批量删除'}
          </button>
          
          <button
            onClick={onClearSelection}
            disabled={loading}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            取消选择
          </button>
        </div>
      </div>
    </div>
  );
}

