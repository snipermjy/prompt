'use client';

import { useState } from 'react';
import type { BatchTask } from '@/lib/types/batch';
import Modal, { ModalBody } from '@/components/ui/Modal';
import { formatPromptContent } from '@/lib/utils/formatContent';

interface TaskDetailModalProps {
  task: BatchTask;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 任务详情预览Modal
 */
export default function TaskDetailModal({ task, isOpen, onClose }: TaskDetailModalProps) {
  const [showFormatted, setShowFormatted] = useState(false);
  
  if (!task.result) return null;

  // 格式化内容
  const getFormattedContent = () => {
    try {
      const formatted = formatPromptContent(task.content);
      // 仅在开发环境输出日志
      if (process.env.NODE_ENV === 'development') {
        console.log('原始内容长度:', task.content.length);
        console.log('格式化后长度:', formatted.length);
        console.log('是否相同:', task.content === formatted);
      }
      return formatted;
    } catch (error) {
      console.error('格式化失败:', error);
      return task.content;
    }
  };
  
  // 计算格式化差异
  const getFormatDiff = () => {
    const formatted = getFormattedContent();
    const originalLines = task.content.split('\n').length;
    const formattedLines = formatted.split('\n').length;
    const originalEmpty = task.content.split('\n').filter((l: string) => !l.trim()).length;
    const formattedEmpty = formatted.split('\n').filter((l: string) => !l.trim()).length;
    
    return {
      lineDiff: formattedLines - originalLines,
      emptyLineDiff: formattedEmpty - originalEmpty,
      charDiff: formatted.length - task.content.length,
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <ModalBody>
        {/* 标题 */}
        <h2 className="text-xl font-bold text-gray-900 mb-6">提示词详情</h2>
        
        <div className="space-y-6">
          {/* 提示词内容 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                提示词内容
              </label>
              <button
                type="button"
                onClick={() => setShowFormatted(!showFormatted)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showFormatted ? '查看原始内容' : '📝 查看格式化'}
              </button>
            </div>
            
            {showFormatted ? (
              /* 左右分栏对比 */
              <div className="grid grid-cols-2 gap-4">
                {/* 原始内容 */}
                <div>
                  <div className="text-xs text-gray-600 mb-1">原始内容</div>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-900 whitespace-pre-wrap border border-gray-200 h-[400px] overflow-y-auto">
                    {task.content}
                  </div>
                </div>
                
                {/* 格式化预览 */}
                <div>
                  <div className="text-xs text-gray-600 mb-1">格式化预览</div>
                  <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-900 whitespace-pre-wrap border border-blue-200 h-[400px] overflow-y-auto">
                    {getFormattedContent()}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <div>💡 发布时会自动应用格式化</div>
                    {(() => {
                      const diff = getFormatDiff();
                      if (diff.charDiff === 0) {
                        return <div className="text-green-600">✓ 内容已经是最佳格式</div>;
                      }
                      return (
                        <div className="text-blue-600">
                          📝 优化：{diff.emptyLineDiff > 0 ? `+${diff.emptyLineDiff}` : diff.emptyLineDiff}个空行，
                          {diff.charDiff > 0 ? `+${diff.charDiff}` : diff.charDiff}个字符
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              /* 普通显示 */
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-900 whitespace-pre-wrap border border-gray-200 max-h-[400px] overflow-y-auto">
                {task.content}
              </div>
            )}
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

          {/* 提示词类型 */}
          {task.result.prompt_type && task.result.prompt_type.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                提示词类型
              </label>
              <div className="flex flex-wrap gap-2">
                {task.result.prompt_type.map((type, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 使用场景 */}
          {task.result.use_cases && task.result.use_cases.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                使用场景
              </label>
              <div className="flex flex-wrap gap-2">
                {task.result.use_cases.map((useCase, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {useCase}
                  </span>
                ))}
              </div>
            </div>
          )}

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
