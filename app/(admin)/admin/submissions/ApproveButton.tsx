'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserSubmission } from '@/lib/types/database';

/**
 * 通过并转为提示词按钮
 * 通过审核并跳转到添加页面填写详细信息
 */

interface ApproveButtonProps {
  submission: UserSubmission;
}

export default function ApproveButton({ submission }: ApproveButtonProps) {
  const router = useRouter();

  const handleApprove = () => {
    // 将提交数据存储到 sessionStorage，标记为"通过并发布"
    const promptData = {
      content: submission.content,
      description: submission.description || '',
      author_name: submission.author_name || '',
      author_link: submission.author_link || '',
      submissionId: submission.id, // 保存提交ID，用于发布后更新状态
    };

    sessionStorage.setItem('convertSubmission', JSON.stringify(promptData));
    router.push('/admin/prompts/add');
  };

  return (
    <button
      onClick={handleApprove}
      className="px-3 py-1.5 text-xs text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
    >
      通过并发布
    </button>
  );
}

