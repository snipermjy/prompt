'use client';

import { useState } from 'react';
import { formatRelativeTime } from '@/lib/utils/formatDate';
import type { UserSubmission } from '@/lib/types/database';
import ApproveButton from './ApproveButton';
import RejectButton from './RejectButton';
import ViewButton from './ViewButton';
import RestoreButton from './RestoreButton';
import DeleteButton from './DeleteButton';
import BatchActions from './BatchActions';

/**
 * 提交列表表格组件（支持批量选择）
 */

interface SubmissionsTableProps {
  submissions: UserSubmission[];
}

export default function SubmissionsTable({ submissions }: SubmissionsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedIds.length === submissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(submissions.map(s => s.id));
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
      <div className="space-y-4">
        {/* 全选控制 */}
        {submissions.length > 0 && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.length === submissions.length && submissions.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedIds.length > 0 ? `已选择 ${selectedIds.length} 项` : '全选'}
              </span>
            </label>
          </div>
        )}

        {/* 提交列表 */}
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className={`bg-white rounded-lg border p-5 transition-all ${
              selectedIds.includes(submission.id)
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* 选择框 */}
              <div className="flex-shrink-0 pt-1">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(submission.id)}
                  onChange={() => handleSelectOne(submission.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* 内容区域 */}
              <div className="flex-1 min-w-0">
                {/* 状态标签 */}
                <div className="mb-3">
                  {submission.status === 'pending' && (
                    <span className="inline-block px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                      待审核
                    </span>
                  )}
                  {submission.status === 'approved' && (
                    <span className="inline-block px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      已通过
                    </span>
                  )}
                  {submission.status === 'rejected' && (
                    <span className="inline-block px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      已拒绝
                    </span>
                  )}
                </div>

                {/* 简介 */}
                {submission.description && (
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {submission.description}
                  </p>
                )}

                {/* 内容预览 */}
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans line-clamp-4">
                    {submission.content}
                  </pre>
                </div>

                {/* 提交信息 */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  {submission.submitter_name && (
                    <span>提交人: {submission.submitter_name}</span>
                  )}
                  {submission.author_name && (
                    <span>来源: {submission.author_name}</span>
                  )}
                  <span>提交于 {formatRelativeTime(submission.created_at)}</span>
                </div>

                {/* 管理员备注 */}
                {submission.admin_note && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">管理员备注: </span>
                      {submission.admin_note}
                    </p>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <ViewButton content={submission.content} />

                {submission.status === 'pending' && (
                  <>
                    <ApproveButton submission={submission} />
                    <RejectButton id={submission.id} />
                  </>
                )}

                {(submission.status === 'approved' || submission.status === 'rejected') && (
                  <RestoreButton id={submission.id} />
                )}

                <DeleteButton id={submission.id} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
          暂无提交数据
        </div>
      )}

      {/* 批量操作浮动栏 */}
      <BatchActions
        selectedIds={selectedIds}
        submissions={submissions}
        onClearSelection={handleClearSelection}
      />
    </>
  );
}

