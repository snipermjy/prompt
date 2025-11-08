import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

/**
 * 空状态组件
 * 用于展示无数据、搜索无结果等场景
 */
export default function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      {/* 图标 */}
      <div className="mb-4 text-gray-300">
        {icon || (
          <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>

      {/* 标题 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {/* 描述 */}
      {description && (
        <p className="text-sm text-gray-600 text-center max-w-md mb-6">{description}</p>
      )}

      {/* 操作按钮 */}
      {action && (
        <>
          {action.href ? (
            <Link
              href={action.href}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  );
}

/**
 * 预设的空状态变体
 */

// 无数据
export function NoDataState({ actionLabel = '添加数据', actionHref }: { actionLabel?: string; actionHref?: string }) {
  return (
    <EmptyState
      icon={
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
      title="暂无数据"
      description="这里还没有任何内容，快来添加第一个吧！"
      action={actionHref ? { label: actionLabel, href: actionHref } : undefined}
    />
  );
}

// 搜索无结果
export function NoSearchResultsState({ query, onReset }: { query?: string; onReset?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title={query ? `没有找到"${query}"相关的结果` : '没有找到相关结果'}
      description="尝试使用其他关键词，或者调整筛选条件"
      action={onReset ? { label: '清除筛选', onClick: onReset } : undefined}
    />
  );
}

// 错误状态
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-20 h-20 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
      title="加载失败"
      description={message || '数据加载出错，请稍后重试'}
      action={onRetry ? { label: '重新加载', onClick: onRetry } : undefined}
    />
  );
}

// 无收藏
export function NoFavoritesState() {
  return (
    <EmptyState
      icon={
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      }
      title="还没有收藏"
      description="发现喜欢的提示词？快点击❤️收藏吧！"
      action={{ label: '浏览提示词', href: '/' }}
    />
  );
}
