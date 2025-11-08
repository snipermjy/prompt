/**
 * 提示词卡片骨架屏
 */
export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 h-[135px] animate-pulse">
      {/* 标题和分类 */}
      <div className="flex items-start gap-2 mb-2">
        <div className="h-4 bg-gray-200 rounded flex-1"></div>
        <div className="h-4 w-16 bg-gray-200 rounded flex-shrink-0"></div>
      </div>
      
      {/* 描述 */}
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
      
      {/* 标签 */}
      <div className="flex gap-1">
        <div className="h-5 w-12 bg-gray-200 rounded"></div>
        <div className="h-5 w-16 bg-gray-200 rounded"></div>
        <div className="h-5 w-14 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

/**
 * 骨架屏网格 - 显示多个卡片骨架
 */
export function SkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

