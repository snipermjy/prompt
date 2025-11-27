'use client';

import { useEffect, useState, useRef } from 'react';
import { formatNumber } from '@/lib/utils/formatNumber';

interface AnimatedNumberProps {
  value: number;
  duration?: number; // 动画持续时间（毫秒）
  className?: string;
  useFormatNumber?: boolean; // 是否使用formatNumber格式化
}

/**
 * 数字滚动动画组件
 * 用于统计数据展示
 */
export default function AnimatedNumber({ 
  value, 
  duration = 1000, 
  className = '',
  useFormatNumber = false
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 使用 Intersection Observer 监听元素是否进入视口
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateValue(0, value, duration);
          }
        });
      },
      { threshold: 0.1 } // 当元素至少10%可见时触发
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [value, duration, hasAnimated]);

  const animateValue = (start: number, end: number, durationMs: number) => {
    const startTime = performance.now();
    const difference = end - start;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      
      // 使用缓动函数（ease-out）
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + difference * easeOut);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(step);
  };

  const formattedValue = useFormatNumber ? formatNumber(displayValue) : displayValue.toLocaleString();

  return (
    <span ref={elementRef} className={className}>
      {formattedValue}
    </span>
  );
}

/**
 * 用于格式化大数字（如 1.2k, 1.5M）
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

