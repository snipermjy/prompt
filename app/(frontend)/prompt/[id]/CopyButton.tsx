'use client';

import { useState } from 'react';
import { incrementCopyCount } from '@/app/actions/prompts';
import { useToast } from '@/components/ui/Toast';

/**
 * 复制按钮组件
 */

interface CopyButtonProps {
  content: string;
  promptId: string;
}

export default function CopyButton({ content, promptId }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      showToast('success', '提示词已复制到剪贴板！');
      
      // 增加复制量（异步执行，不阻塞用户体验）
      incrementCopyCount(promptId).catch(err => console.error('Failed to increment copy count:', err));
      
      // 2秒后恢复按钮状态
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast('error', '复制失败，请重试');
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={copied}
      className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5 ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          已复制
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          复制
        </>
      )}
    </button>
  );
}

