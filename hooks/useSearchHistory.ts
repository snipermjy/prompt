'use client';

import { useState, useEffect, useCallback } from 'react';

const SEARCH_HISTORY_KEY = 'ai_prompt_search_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * 搜索历史管理 Hook
 * 基于 localStorage 实现
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载搜索历史
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const historyArray = JSON.parse(stored) as string[];
        setHistory(historyArray);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 保存到 localStorage
  const saveHistory = useCallback((newHistory: string[]) => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, []);

  // 添加搜索记录
  const addSearchTerm = useCallback((term: string) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;

    setHistory((prev) => {
      // 移除已存在的相同项
      const filtered = prev.filter(item => item !== trimmedTerm);
      // 添加到开头，保持最多MAX_HISTORY_ITEMS项
      const newHistory = [trimmedTerm, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  // 删除单个搜索记录
  const removeSearchTerm = useCallback((term: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter(item => item !== term);
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  // 清空搜索历史
  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, [saveHistory]);

  return {
    history,
    isLoaded,
    addSearchTerm,
    removeSearchTerm,
    clearHistory,
  };
}

