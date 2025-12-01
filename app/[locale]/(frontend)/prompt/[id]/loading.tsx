/**
 * 提示词详情页加载状态
 */
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑骨架 */}
      <div className="h-5 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
      
      {/* 标题区域骨架 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-20 animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-6 w-24 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex gap-2 mb-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-5 w-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
        
        <div className="h-16 bg-gray-100 rounded mb-3 animate-pulse"></div>
      </div>
      
      {/* 内容区域骨架 */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="h-6 bg-white/50 rounded w-32 mb-3 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white/50 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
