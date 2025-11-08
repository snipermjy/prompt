'use client';

import { useState } from 'react';
import { deleteSubmission } from '@/app/actions/submissions';
import { useRouter } from 'next/navigation';

/**
 * 删除提交按钮
 */

interface DeleteButtonProps {
  id: string;
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm('确定要删除此提交吗？此操作不可恢复！');
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const success = await deleteSubmission(id);
      if (success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isDeleting ? '删除中...' : '删除'}
    </button>
  );
}

