'use client';

import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'ai_prompt_favorites';

/**
 * 收藏管理 Hook
 * 基于 localStorage 实现
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载收藏列表
  useEffect(() => {
    // 确保在客户端环境
    if (typeof window === 'undefined') {
      setIsLoaded(true);
      return;
    }
    
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const favArray = JSON.parse(stored) as string[];
        // 验证数据格式
        if (Array.isArray(favArray)) {
          setFavorites(new Set(favArray.filter(id => typeof id === 'string')));
        }
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      // 清除损坏的数据
      try {
        localStorage.removeItem(FAVORITES_KEY);
      } catch (e) {
        // 忽略清除错误
      }
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 保存到 localStorage
  const saveFavorites = useCallback((newFavorites: Set<string>) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(newFavorites)));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, []);

  // 添加收藏
  const addFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      newFavorites.add(id);
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  // 移除收藏
  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      newFavorites.delete(id);
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  // 切换收藏状态
  const toggleFavorite = useCallback((id: string) => {
    if (favorites.has(id)) {
      removeFavorite(id);
      return false;
    } else {
      addFavorite(id);
      return true;
    }
  }, [favorites, addFavorite, removeFavorite]);

  // 检查是否已收藏
  const isFavorite = useCallback((id: string) => {
    return favorites.has(id);
  }, [favorites]);

  // 获取所有收藏的ID列表
  const getFavoriteIds = useCallback(() => {
    return Array.from(favorites);
  }, [favorites]);

  // 清空所有收藏
  const clearFavorites = useCallback(() => {
    setFavorites(new Set());
    saveFavorites(new Set());
  }, [saveFavorites]);

  return {
    favorites: getFavoriteIds(),
    isLoaded,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    count: favorites.size,
  };
}

