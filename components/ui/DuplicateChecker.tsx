'use client';

import { useState } from 'react';
import type { Prompt } from '@/lib/types/database';
import { formatNumber } from '@/lib/utils/formatNumber';
import { formatDate } from '@/lib/utils/formatDate';
import { getSimilarityColor, getSimilarityBgColor, getSimilarityDescription } from '@/lib/utils/similarity';
import Button from './Button';

/**
 * 重复提示词检查组件
 */

interface DuplicateItem extends Prompt {
  similarity: number;
  method: string;
}

interface DuplicateCheckerProps {
  duplicates: DuplicateItem[];
  newContent: string;
  newTitle?: string;
  onContinue: () => void;
  onCancel: () => void;
}

export default function DuplicateChecker({
  duplicates,
  newContent,
  newTitle,
  onContinue,
  onCancel,
}: DuplicateCheckerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const selectedDuplicate = duplicates.find(d => d.id === selectedId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 标题 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            ⚠️ 发现相似提示词
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            检测到 {duplicates.length} 个相似的提示词，请查看后决定是否继续添加
          </p>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showDiff ? (
            // 列表视图
            <div className="space-y-3">
              {duplicates.map((duplicate) => (
                <div
                  key={duplicate.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedId === duplicate.id
                      ? 'ring-2 ring-blue-500 border-blue-500'
                      : 'hover:border-gray-300'
                  } ${getSimilarityBgColor(duplicate.similarity)}`}
                  onClick={() => setSelectedId(duplicate.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {duplicate.title}
                        </h3>
                        <span className={`text-sm font-bold ${getSimilarityColor(duplicate.similarity)}`}>
                          {duplicate.similarity}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {getSimilarityDescription(duplicate.similarity)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>👁️ {formatNumber(duplicate.view_count)} 浏览</span>
                        <span>📋 {formatNumber(duplicate.copy_count)} 复制</span>
                        <span>📅 {formatDate(duplicate.created_at)}</span>
                      </div>
                      {duplicate.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {duplicate.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(duplicate.id);
                        setShowDiff(true);
                      }}
                    >
                      查看对比
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 对比视图
            selectedDuplicate && (
              <div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowDiff(false)}
                  className="mb-4"
                >
                  ← 返回列表
                </Button>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* 已存在的提示词 */}
                  <div>
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        已存在的提示词
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>👁️ {formatNumber(selectedDuplicate.view_count)} 浏览</span>
                        <span>📋 {formatNumber(selectedDuplicate.copy_count)} 复制</span>
                        <span>📅 {formatDate(selectedDuplicate.created_at)}</span>
                      </div>
                      <div className={`inline-block mt-2 px-2 py-1 rounded text-sm font-semibold ${getSimilarityColor(selectedDuplicate.similarity)}`}>
                        相似度: {selectedDuplicate.similarity}%
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 bg-red-50">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {selectedDuplicate.title}
                      </h4>
                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                        {selectedDuplicate.content}
                      </pre>
                    </div>
                  </div>

                  {/* 你的提示词 */}
                  <div>
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        你的提示词
                      </h3>
                      <div className="text-sm text-gray-600">
                        新提交的内容
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 bg-green-50">
                      {newTitle && (
                        <h4 className="font-medium text-gray-900 mb-2">
                          {newTitle}
                        </h4>
                      )}
                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                        {newContent}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>提示：</strong>
                    红色背景显示已存在的内容，绿色背景显示你的新内容。
                    请仔细对比两者的差异，决定是否继续添加。
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {duplicates.length > 1 && !showDiff && (
              <span>已选择 {selectedId ? '1' : '0'} / {duplicates.length} 个</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onCancel}>
              取消
            </Button>
            <Button variant="primary" onClick={onContinue}>
              仍要添加
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 批量处理的重复检查组件
 */
interface BatchDuplicateResult {
  taskId: string;
  content: string;
  title?: string;
  duplicates: DuplicateItem[];
  aiResult?: any;
}

interface BatchDuplicateCheckerProps {
  results: BatchDuplicateResult[];
  onResolve: (taskId: string, action: 'add' | 'skip') => void;
  onResolveAll: (action: 'add' | 'skip') => void;
  onClose: () => void;
}

export function BatchDuplicateChecker({
  results,
  onResolve,
  onResolveAll,
  onClose,
}: BatchDuplicateCheckerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 标题 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            ⚠️ 批量处理 - 发现重复项
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {results.length} 个任务需要确认，请逐个处理或批量操作
          </p>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.taskId}
                className="border rounded-lg overflow-hidden"
              >
                <div
                  className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setExpandedId(expandedId === result.taskId ? null : result.taskId)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {result.title || '未命名提示词'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        发现 {result.duplicates.length} 个相似项，
                        最高相似度 {Math.max(...result.duplicates.map(d => d.similarity))}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onResolve(result.taskId, 'skip');
                        }}
                      >
                        跳过
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onResolve(result.taskId, 'add');
                        }}
                      >
                        仍要添加
                      </Button>
                    </div>
                  </div>
                </div>

                {expandedId === result.taskId && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="space-y-3">
                      {result.duplicates.map((duplicate) => (
                        <div
                          key={duplicate.id}
                          className={`border rounded-lg p-3 ${getSimilarityBgColor(duplicate.similarity)}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">
                                  {duplicate.title}
                                </span>
                                <span className={`text-sm font-bold ${getSimilarityColor(duplicate.similarity)}`}>
                                  {duplicate.similarity}%
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>👁️ {formatNumber(duplicate.view_count)}</span>
                                <span>📋 {formatNumber(duplicate.copy_count)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <Button variant="secondary" onClick={onClose}>
            稍后处理
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => onResolveAll('skip')}
            >
              全部跳过
            </Button>
            <Button
              variant="primary"
              onClick={() => onResolveAll('add')}
            >
              全部添加
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
