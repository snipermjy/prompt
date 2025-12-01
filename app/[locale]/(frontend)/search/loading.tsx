import SkeletonCard from '@/components/ui/SkeletonCard';

/**
 * 搜索页面加载状态
 */
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑骨架 */}
      <div className="h-5 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
      
      {/* 搜索标题骨架 */}
      <div className="mb-8">
        <div className="h-9 bg-gray-200 rounded w-96 mb-2 animate-pulse"></div>
        <div className="h-5 bg-gray-100 rounded w-48 animate-pulse"></div>
      </div>
      
      {/* 搜索结果骨架 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {[...Array(20)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
