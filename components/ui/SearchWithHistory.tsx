'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { sanitizeString } from '@/lib/utils/validation';

interface SearchWithHistoryProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

/**
 * 带历史记录的搜索框组件
 */
export default function SearchWithHistory({ 
  placeholder, 
  className = '',
  onSearch
}: SearchWithHistoryProps) {
  const router = useRouter();
  const t = useTranslations('search');
  const { history, addSearchTerm, removeSearchTerm, clearHistory } = useSearchHistory();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = useCallback((searchQuery: string) => {
    // 清理和验证输入
    const sanitized = sanitizeString(searchQuery, 100);
    if (!sanitized || sanitized.length < 2) return;

    addSearchTerm(sanitized);
    setShowDropdown(false);
    setQuery(''); // 清空输入框，允许再次搜索
    
    if (onSearch) {
      onSearch(sanitized);
    } else {
      // 获取当前 locale
      const locale = window.location.pathname.split('/')[1] || 'zh';
      // 使用时间戳确保每次都是新的 URL，强制刷新
      router.push(`/${locale}/search?q=${encodeURIComponent(sanitized)}&t=${Date.now()}`);
    }
  }, [addSearchTerm, onSearch, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleHistoryClick = (term: string) => {
    setQuery(term);
    handleSearch(term);
  };

  const handleRemoveHistory = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    removeSearchTerm(term);
  };

  const handleClearAll = () => {
    clearHistory();
  };

  const handleFocus = () => {
    if (history.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* 搜索框 */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder || t('placeholder') || 'Search prompts...'}
          className="w-full px-4 py-2 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
        {/* 搜索图标 */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {/* 清除按钮 */}
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {/* 搜索历史下拉框 */}
      {showDropdown && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* 标题栏 */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-600">{t('history') || 'Search History'}</span>
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              {t('clearHistory') || 'Clear'}
            </button>
          </div>

          {/* 历史记录列表 */}
          <div className="py-1">
            {history.map((term, index) => (
              <div
                key={index}
                onClick={() => handleHistoryClick(term)}
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-700 truncate">{term}</span>
                </div>
                <button
                  onClick={(e) => handleRemoveHistory(e, term)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

