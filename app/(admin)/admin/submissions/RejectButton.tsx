'use client';

import { useState } from 'react';
import { updateSubmissionStatus } from '@/app/actions/submissions';
import { useRouter } from 'next/navigation';

/**
 * 拒绝按钮
 */

interface RejectButtonProps {
  id: string;
}

export default function RejectButton({ id }: RejectButtonProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const router = useRouter();

  const handleReject = async () => {
    const reason = window.prompt('请输入拒绝原因（可选）:');
    if (reason === null) return;

    setIsRejecting(true);

    try {
      const success = await updateSubmissionStatus(id, 'rejected', reason || undefined);
      if (success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Reject error:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <button
      onClick={handleReject}
      disabled={isRejecting}
      className="px-3 py-1.5 text-xs text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isRejecting ? '处理中...' : '拒绝'}
    </button>
  );
}

