'use client';

import { useState } from 'react';
import { deletePrompt } from '@/app/actions/prompts';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/components/ui/ConfirmDialog';

/**
 * 删除提示词按钮
 */

interface DeleteButtonProps {
  id: string;
  title: string;
}

export default function DeleteButton({ id, title }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { confirm, Dialog } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: '确认删除',
      message: `确定要删除提示词 "${title}" 吗？此操作不可恢复。`,
      confirmText: '删除',
      cancelText: '取消',
      type: 'danger',
    });

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const success = await deletePrompt(id);

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
    <>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? '删除中...' : '删除'}
      </button>
      <Dialog />
    </>
  );
}

