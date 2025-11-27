import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * 动态导入工具
 * 用于代码分割和懒加载组件
 */

// 带加载状态的动态导入
export const dynamicWithLoading = <P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  loadingComponent?: React.ReactNode
) => {
  return dynamic(importFunc, {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        {loadingComponent || <LoadingSpinner />}
      </div>
    ),
    ssr: true,
  });
};

// 仅客户端的动态导入
export const dynamicClientOnly = <P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>
) => {
  return dynamic(importFunc, {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    ),
  });
};
