'use client';

import { useState } from 'react';
import { updateSubmissionStatus } from '@/app/actions/submissions';
import { useRouter } from 'next/navigation';

/**
 * 恢复审核按钮（将已拒绝/已通过的提交恢复为待审核状态）
 */

interface RestoreButtonProps {
  id: string;
}

export default function RestoreButton({ id }: RestoreButtonProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const router = useRouter();

  const handleRestore = async () => {
    const confirmed = window.confirm('确认将此提交恢复为"待审核"状态吗？');
    if (!confirmed) return;

    setIsRestoring(true);

    try {
      const success = await updateSubmissionStatus(id, 'pending');
      if (success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Restore error:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <button
      onClick={handleRestore}
      disabled={isRestoring}
      className="text-xs px-3 py-1.5 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isRestoring ? '恢复中...' : '恢复审核'}
    </button>
  );
}

