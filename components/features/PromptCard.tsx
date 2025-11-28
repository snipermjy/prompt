'use client';

import { useRouter } from 'next/navigation';
import type { Prompt } from '@/lib/types/database';
import { formatNumber } from '@/lib/utils/formatNumber';

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
  // 只显示前3个标签
  const displayTags = prompt.tags?.slice(0, 3) || [];
  const hasAuthor = !!(prompt.author_name && prompt.author_link);
  
  const handleCardClick = () => {
    router.push(`/prompt/${prompt.id}`);
  };
  
  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prompt.author_link) {
      window.open(prompt.author_link, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <div
      onClick={handleCardClick}
      className={`prompt-card bg-white rounded-lg border border-gray-200 px-3 pt-4 pb-3 cursor-pointer flex flex-col relative group ${
        compact ? '' : ''
      }`}
      style={{ height: compact ? 'auto' : '135px' }}
    >
      {/* 标题 */}
      <div className="mb-1 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
          {prompt.title}
        </h3>
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

