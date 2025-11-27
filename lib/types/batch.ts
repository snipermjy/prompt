/**
 * 批量任务类型定义
 */

import type { AIGeneratedMetadata } from '@/lib/ai/generate';

export type TaskStatus = 'pending' | 'processing' | 'success' | 'error';

export interface BatchTask {
  id: string;
  content: string;
  status: TaskStatus;
  progress: number;
  progressText: string;
  result: AIGeneratedMetadata | null;
  error: string | null;
  createdAt: number;
  updatedAt: number;
  selected: boolean; // 是否被选中用于批量发布
  isEditing: boolean; // 是否处于编辑状态
}

export interface BatchTaskStats {
  total: number;
  pending: number;
  processing: number;
  success: number;
  error: number;
}
