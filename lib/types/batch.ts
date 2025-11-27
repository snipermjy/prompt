/**
 * 批量任务类型定义
 */

import type { AIGeneratedMetadata } from '@/lib/ai/generate';
import type { Prompt } from './database';

export type TaskStatus = 'pending' | 'processing' | 'success' | 'error';

// 扩展AI生成结果，包含重复检查结果
export interface BatchTaskResult extends AIGeneratedMetadata {
  duplicates?: Array<Prompt & { similarity: number; method: string }>;
}

export interface BatchTask {
  id: string;
  content: string;
  status: TaskStatus;
  progress: number;
  progressText: string;
  result: BatchTaskResult | null;
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
