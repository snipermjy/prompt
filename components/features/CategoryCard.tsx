import Link from 'next/link';
import type { Category } from '@/lib/types/database';

/**
 * 分类卡片组件
 * 用于首页展示分类信息
 */

interface CategoryCardProps {
  category: Category & { prompt_count?: number };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300"
    >
      <div className="flex items-center gap-3">
        {/* 图标 */}
        <div className="text-3xl">{category.icon}</div>
        
        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-0.5">{category.name}</h3>
          {category.description && (
            <p className="text-xs text-gray-500 line-clamp-1">{category.description}</p>
          )}
        </div>
        
        {/* 数量 */}
        {category.prompt_count !== undefined && (
          <div className="flex-shrink-0">
            <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded">
              {category.prompt_count}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

