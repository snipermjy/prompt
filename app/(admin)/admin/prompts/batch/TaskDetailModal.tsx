'use client';

import type { BatchTask } from '@/lib/types/batch';
import Modal, { ModalBody } from '@/components/ui/Modal';

interface TaskDetailModalProps {
  task: BatchTask;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 任务详情预览Modal
 */
export default function TaskDetailModal({ task, isOpen, onClose }: TaskDetailModalProps) {
  if (!task.result) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <ModalBody>
        {/* 标题 */}
        <h2 className="text-xl font-bold text-gray-900 mb-6">提示词详情</h2>
        
        <div className="space-y-6">
          {/* 提示词内容 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              提示词内容
            </label>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-900 whitespace-pre-wrap border border-gray-200">
              {task.content}
            </div>
          </div>

          {/* 标题 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              标题
            </label>
            <div className="text-base text-gray-900">
              {task.result.title}
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              描述
            </label>
            <div className="text-sm text-gray-700">
              {task.result.description}
            </div>
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              分类
            </label>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              {task.result.category}
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              标签
            </label>
            <div className="flex flex-wrap gap-2">
              {task.result.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 适用AI模型 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              适用AI模型
            </label>
            <div className="flex flex-wrap gap-2">
              {task.result.target_ai.map((ai, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                >
                  {ai}
                </span>
              ))}
            </div>
          </div>

          {/* 语言 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              语言
            </label>
            <div className="text-sm text-gray-900">
              {task.result.language === 'zh-CN' && '中文'}
              {task.result.language === 'en-US' && '英文'}
              {task.result.language === 'ja-JP' && '日文'}
              {task.result.language === 'other' && '其他'}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
}
