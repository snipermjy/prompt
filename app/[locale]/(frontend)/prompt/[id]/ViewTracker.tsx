'use client';

import { useEffect, useRef } from 'react';
import { incrementViewCount } from '@/app/actions/prompts';

/**
 * 浏览量追踪组件
 * 在客户端执行，确保每次页面加载都能准确统计浏览量
 */

interface ViewTrackerProps {
  promptId: string;
}

export default function ViewTracker({ promptId }: ViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // 确保只执行一次（避免 React 18 StrictMode 双重调用）
    if (hasTracked.current) return;
    hasTracked.current = true;

    // 增加浏览量
    incrementViewCount(promptId).then(result => {
      if (!result.success) {
        // 静默失败
      }
    }).catch(() => {
      // 静默失败
    });
  }, [promptId]);

  // 不渲染任何内容
  return null;
}
