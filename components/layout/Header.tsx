'use client';

import Link from 'next/link';
import { siteConfig } from '@/lib/config/site';
import SearchWithHistory from '@/components/ui/SearchWithHistory';

/**
 * 网站头部组件
 * 包含Logo、导航菜单、搜索框
 */

export default function Header() {

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center logo-icon">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI提示词库</h1>
              <p className="text-xs text-gray-500">PromptHub</p>
            </div>
          </div>

          {/* 搜索框 - 桌面端显示完整，移动端简化 */}
          <div className="flex-1 max-w-2xl hidden sm:block">
            <SearchWithHistory placeholder="搜索提示词、标签..." />
          </div>

          {/* 右侧按钮 */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* 移动端搜索图标 */}
            <button
              onClick={() => window.location.href = '/search'}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="搜索"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>

            {/* 提交按钮 */}
            <Link
              href="/submit"
              className="btn-primary px-3 py-2 md:px-6 md:py-2.5 text-sm md:text-base text-white rounded-lg font-medium flex items-center gap-1 md:gap-2"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span className="hidden sm:inline">提交提示词</span>
              <span className="sm:hidden">提交</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

