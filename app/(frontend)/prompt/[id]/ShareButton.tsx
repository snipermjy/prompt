'use client';

import { useState } from 'react';
import { incrementShareCount } from '@/app/actions/prompts';
import { useToast } from '@/components/ui/Toast';

/**
 * 分享按钮组件
 */

interface ShareButtonProps {
  promptId: string;
  title: string;
}

export default function ShareButton({ promptId, title }: ShareButtonProps) {
  const [shared, setShared] = useState(false);
  const { showToast } = useToast();

  const handleShare = async () => {
    try {
      const url = window.location.href;
      
      // 尝试使用 Web Share API
      if (navigator.share) {
        await navigator.share({
          title: title,
          url: url,
        });
        showToast('success', '分享成功！');
      } else {
        // 降级方案：复制链接
        await navigator.clipboard.writeText(url);
        showToast('success', '链接已复制到剪贴板！');
      }
      
      setShared(true);
      
      // 增加分享量（异步执行，不阻塞用户体验）
      incrementShareCount(promptId).catch(err => console.error('Failed to increment share count:', err));
      
      // 2秒后恢复按钮状态
      setTimeout(() => {
        setShared(false);
      }, 2000);
    } catch (error) {
      // 用户取消分享不显示错误
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to share:', error);
        showToast('error', '分享失败，请重试');
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={shared}
      className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5 ${
        shared
          ? 'bg-green-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {shared ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          已分享
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          分享
        </>
      )}
    </button>
  );
}

