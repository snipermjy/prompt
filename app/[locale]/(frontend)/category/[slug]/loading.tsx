import SkeletonCard from '@/components/ui/SkeletonCard';

/**
 * 分类页面加载状态
 */
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑骨架 */}
      <div className="h-5 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
      
      {/* 分类标题骨架 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-5 bg-gray-100 rounded w-96 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded w-32 animate-pulse"></div>
      </div>
      
      {/* 提示词列表骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(15)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
