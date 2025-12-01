'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';

/**
 * 二级分类导航组件
 * 支持一级分类悬停显示二级分类下拉菜单
 */

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  parent_category?: string;
  prompt_count: number;
}

interface CategoryNavV2Props {
  categories: Category[];
  totalCount: number;
  locale?: Locale;
}

interface CategoryTree {
  [parentCategory: string]: Category[];
}

export default function CategoryNavV2({ categories, totalCount, locale }: CategoryNavV2Props) {
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = locale || (params.locale as Locale) || 'zh';
  const t = useTranslations('category');
  const [hoveredParent, setHoveredParent] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 判断当前是否在首页或分类页
  const isHomePage = pathname === `/${currentLocale}` || pathname === '/';
  const currentCategory = pathname.includes('/category/') 
    ? pathname.split('/category/')[1] 
    : null;
  
  // Categories are already translated from database, use them directly
  const translatedCategories = categories;
  
  // 构建分类树（只包含有提示词的分类）
  const categoryTree: CategoryTree = {};
  const parentCategories = new Set<string>();
  
  translatedCategories.forEach(cat => {
    // 只添加有提示词的分类
    if (cat.prompt_count && cat.prompt_count > 0) {
      const parent = cat.parent_category || (currentLocale === 'en' ? 'Other' : '其他');
      
      if (!categoryTree[parent]) {
        categoryTree[parent] = [];
      }
      categoryTree[parent].push(cat);
      parentCategories.add(parent);
    }
  });
  
  // Get all parent categories that have prompts
  const parentOrder = Array.from(parentCategories).sort();
  
  const sortedParents = parentOrder.filter(p => 
    parentCategories.has(p) && categoryTree[p] && categoryTree[p].length > 0
  );
  
  // Default icon for all parent categories
  const getParentIcon = (parent: string) => {
    // 标记参数已使用（目前图标与具体父级无关）
    void parent;
    // You can add custom icons based on parent name if needed
    return '📁';
  };
  
  // Translate parent category name
  const translateParent = (parent: string) => {
    if (currentLocale === 'zh') return parent;
    // Try to get translation from category.parents namespace
    try {
      return t(`parents.${parent}` as never) || parent;
    } catch {
      return parent;
    }
  };
  
  // 计算一级分类的提示词总数
  const getParentCount = (parent: string) => {
    return categoryTree[parent]?.reduce((sum, cat) => sum + cat.prompt_count, 0) || 0;
  };
  
  // 处理鼠标悬停
  const handleMouseEnter = (parent: string, event: React.MouseEvent<HTMLButtonElement>) => {
    // 清除之前的延迟关闭
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const navRect = navRef.current?.getBoundingClientRect();
    
    if (navRect) {
      setDropdownPosition({
        left: rect.left - navRect.left,
        top: rect.bottom - navRect.top + 8
      });
    }
    
    setHoveredParent(parent);
  };
  
  const handleMouseLeave = () => {
    // 延迟关闭，允许鼠标移动到下拉菜单
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredParent(null);
    }, 300);
  };
  
  const handleDropdownEnter = () => {
    // 鼠标进入下拉菜单时，取消关闭
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };
  
  return (
    <div className="bg-white border-b border-gray-200 sticky top-[81px] z-40" ref={navRef}>
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="relative">
          {/* 分类导航 - 横向滚动 */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-3 pt-3">
            {/* 全部分类 */}
            <Link
              href={`/${currentLocale}`}
              className={`category-pill px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all flex-shrink-0 ${
                isHomePage
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <span>📚</span>
              <span>{t('all')}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                isHomePage ? 'bg-blue-500' : 'text-gray-500'
              }`}>
                {totalCount}
              </span>
            </Link>
            
            {/* 一级分类（带下拉） */}
            {sortedParents.map((parent) => {
              const hasSubcategories = categoryTree[parent] && categoryTree[parent].length > 0;
              const isActive = categoryTree[parent]?.some(cat => cat.slug === currentCategory);
              
              return (
                <div key={parent} className="relative flex-shrink-0">
                  <button
                    onMouseEnter={(e) => hasSubcategories && handleMouseEnter(parent, e)}
                    onMouseLeave={handleMouseLeave}
                    className={`category-pill px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span>{getParentIcon(parent)}</span>
                    <span>{translateParent(parent)}</span>
                    <span className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {getParentCount(parent)}
                    </span>
                    {hasSubcategories && (
                      <svg 
                        className="w-3 h-3 ml-0.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* 二级分类下拉菜单 */}
          {hoveredParent && categoryTree[hoveredParent] && (
            <div 
              className="absolute bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[200px] max-w-[400px]"
              style={{
                left: `${dropdownPosition.left}px`,
                top: `${dropdownPosition.top}px`
              }}
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="p-2">
                {/* Dropdown header */}
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
                  {translateParent(hoveredParent)}
                </div>
                
                {/* 二级分类列表 */}
                <div className="py-1">
                  {categoryTree[hoveredParent].map((category) => {
                    const isActive = currentCategory === category.slug;
                    return (
                      <Link
                        key={category.id}
                        href={`/${currentLocale}/category/${category.slug}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                        onClick={() => setHoveredParent(null)}
                      >
                        <span className="text-base">{category.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{category.name}</div>
                        </div>
                        <span className={`text-xs ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                          {category.prompt_count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .category-pill:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
