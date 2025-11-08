import SkeletonCard from '@/components/ui/SkeletonCard';

/**
 * 前端页面加载状态
 * Next.js 14 会自动在Suspense边界显示此组件
 */
export default function Loading() {
  return (
    <div className="max-w-[1920px] mx-auto flex">
      {/* 左侧分类导航骨架屏 */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-100 min-h-[calc(100vh-81px)] sticky top-[81px] overflow-y-auto p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </aside>

      {/* 右侧内容区骨架屏 */}
      <main className="flex-1 p-3 md:p-6">
        {/* 移动端分类筛选骨架屏 */}
        <div className="md:hidden mb-4 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-100 rounded-lg animate-pulse flex-shrink-0"></div>
            ))}
          </div>
        </div>

        {/* 排序和筛选栏骨架屏 */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-20 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* 提示词卡片网格骨架屏 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {[...Array(20)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}

