'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Prompt } from '@/lib/types/database';
import { formatNumber } from '@/lib/utils/formatNumber';
import { useToast } from '@/components/ui/Toast';
import { incrementCopyCount } from '@/app/actions/prompts';
import { useFavorites } from '@/hooks/useFavorites';

/**
 * 提示词卡片组件
 * 用于首页和列表页展示提示词信息
 */

interface PromptCardProps {
  prompt: Prompt & { categoryName?: string };
  compact?: boolean; // 紧凑模式（用于相关推荐）
}

export default function PromptCard({ prompt, compact = false }: PromptCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isCopying, setIsCopying] = useState(false);
  // 只显示前3个标签
  const displayTags = prompt.tags?.slice(0, 3) || [];
  const hasAuthor = !!(prompt.author_name && prompt.author_link);
  const favorited = isFavorite(prompt.id);
  
  const handleCardClick = () => {
    router.push(`/prompt/${prompt.id}`);
  };
  
  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prompt.author_link) {
      window.open(prompt.author_link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止卡片点击事件
    if (isCopying) return;

    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(prompt.content);
      showToast('success', '复制成功！');
      // 增加复制次数
      incrementCopyCount(prompt.id).catch(err => console.error('Failed to increment copy count:', err));
    } catch (error) {
      console.error('Copy failed:', error);
      showToast('error', '复制失败，请重试');
    } finally {
      setTimeout(() => setIsCopying(false), 300);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止卡片点击事件
    const added = toggleFavorite(prompt.id);
    showToast('success', added ? '已添加到收藏' : '已取消收藏');
  };
  
  return (
    <div
      onClick={handleCardClick}
      className={`prompt-card bg-white rounded-lg border border-gray-200 px-3 pt-4 pb-3 cursor-pointer flex flex-col relative group ${
        compact ? '' : ''
      }`}
      style={{ height: compact ? 'auto' : '135px' }}
    >
      {/* 快速操作按钮 - 悬停时显示 */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        {/* 收藏按钮 */}
        <button
          onClick={handleFavoriteClick}
          className={`p-1.5 bg-white border rounded-md hover:scale-110 transition-all duration-200 shadow-sm ${
            favorited
              ? 'border-red-300 text-red-500'
              : 'border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-300'
          }`}
          title={favorited ? '取消收藏' : '收藏'}
        >
          <svg
            className="w-4 h-4"
            fill={favorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* 复制按钮 */}
        <button
          onClick={handleCopyClick}
          className="p-1.5 bg-white border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 hover:scale-110 transition-all duration-200 shadow-sm"
          title="快速复制提示词"
          disabled={isCopying}
        >
          {isCopying ? (
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      {/* 标题和分类 */}
      <div className="flex items-start gap-1.5 mb-1 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1 flex-1 min-w-0">
          {prompt.title}
        </h3>
        <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded flex-shrink-0">
          {prompt.categoryName || prompt.category}
        </span>
      </div>

      {/* 作者来源 - 小字显示在标题下 */}
      {hasAuthor ? (
        <div
          onClick={handleAuthorClick}
          className="flex items-center gap-0.5 text-xs text-gray-500 hover:text-blue-600 transition-colors mb-2 flex-shrink-0 w-fit"
          title="来源作者"
        >
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="font-medium">@{prompt.author_name}</span>
        </div>
      ) : (
        <div className="mb-2 flex-shrink-0"></div>
      )}

      {/* 描述 */}
      <div className="flex-1 min-h-0 mb-2 overflow-hidden">
        {prompt.description ? (
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {prompt.description}
          </p>
        ) : (
          <div></div>
        )}
      </div>

      {/* 底部：标签 - 一行显示 */}
      <div className="flex items-center gap-1 mt-auto flex-shrink-0 overflow-hidden">
        {displayTags.length > 0 ? (
          displayTags.map((tag, index) => (
            <span
              key={index}
              className="tag inline-flex items-center px-1.5 py-0.5 bg-purple-50 text-purple-700 text-xs rounded cursor-pointer hover:bg-purple-600 hover:text-white transition-all whitespace-nowrap"
              style={{ lineHeight: '1.2', maxHeight: '20px' }}
            >
              #{tag}
            </span>
          ))
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

