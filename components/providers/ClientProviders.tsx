'use client';

import { ToastProvider } from '@/components/ui/Toast';

/**
 * 客户端Provider组件
 * 包含所有需要在客户端运行的Provider
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}

