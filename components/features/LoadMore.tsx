'use client';

import { useState } from 'react';
import { getPrompts } from '@/app/actions/prompts';
import PromptCard from './PromptCard';
import type { Prompt } from '@/lib/types/database';

interface LoadMoreProps {
  initialPrompts: (Prompt & { categoryName?: string })[];
  category?: string;
  pageSize?: number;
  categoryMap?: Map<string, string>; // 分类slug到名称的映射
}

/**
 * 加载更多组件
 * 用于首页和分类页的分页加载
 */
export default function LoadMore({ 
  initialPrompts, 
  category, 
  pageSize = 20,
  categoryMap 
}: LoadMoreProps) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPrompts.length >= pageSize);
  const [page, setPage] = useState(1);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const offset = page * pageSize;
      const newPrompts = await getPrompts(category, pageSize, offset);
      
      if (newPrompts.length < pageSize) {
        setHasMore(false);
      }

      // 为新数据添加分类名称（如果有categoryMap）
      const promptsWithCategoryName = categoryMap
        ? newPrompts.map(prompt => ({
            ...prompt,
            categoryName: categoryMap.get(prompt.category) || prompt.category,
          }))
        : newPrompts;

      setPrompts(prev => [...prev, ...promptsWithCategoryName]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load more prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 提示词卡片网格 - 自适应布局 */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                加载中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                加载更多
              </>
            )}
          </button>
        </div>
      )}

      {/* 没有更多数据提示 */}
      {!hasMore && prompts.length > 0 && (
        <div className="text-center mt-8 py-4 text-gray-500 text-sm">
          已经到底了，没有更多内容
        </div>
      )}
    </>
  );
}

