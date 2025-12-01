/**
 * 分析追踪工具
 * 用于集成 Google Analytics 或其他分析服务
 */

type GtagFn = (...args: unknown[]) => void;

function getGtag(): GtagFn | undefined {
  if (typeof window === 'undefined') return undefined;
  const win = window as unknown as { gtag?: GtagFn };
  return win.gtag;
}

// 页面浏览事件
export const trackPageView = (url: string) => {
  const gtag = getGtag();
  if (!gtag || !process.env.NEXT_PUBLIC_GA_ID) return;

  gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
    page_path: url,
  });
};

// 自定义事件追踪
export const trackEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// 提示词相关事件
export const promptEvents = {
  view: (promptId: string, title: string) => {
    trackEvent({
      action: 'view_prompt',
      category: 'Prompt',
      label: title,
      value: 1,
    });
  },
  
  copy: (promptId: string, title: string) => {
    trackEvent({
      action: 'copy_prompt',
      category: 'Prompt',
      label: title,
      value: 1,
    });
  },
  
  share: (promptId: string, title: string) => {
    trackEvent({
      action: 'share_prompt',
      category: 'Prompt',
      label: title,
      value: 1,
    });
  },
};

// 搜索事件
export const searchEvent = (query: string, resultCount: number) => {
  trackEvent({
    action: 'search',
    category: 'Search',
    label: query,
    value: resultCount,
  });
};

// 提交事件
export const submitEvent = (type: 'prompt' | 'feedback') => {
  trackEvent({
    action: 'submit',
    category: 'User Action',
    label: type,
    value: 1,
  });
};

// 错误追踪
export const trackError = (error: Error, context?: string) => {
  const gtag = getGtag();
  if (gtag) {
    gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      context: context,
    });
  }
  
  // 也可以发送到 Sentry 或其他错误追踪服务
  console.error('Tracked error:', error, context);
};
