/**
 * 数据库类型定义
 * 与 Supabase 数据库表结构保持一致
 */

// 提示词状态
export type PromptStatus = 'draft' | 'pending' | 'published' | 'rejected';

// 难度等级
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// 语言
export type Language = 'zh-CN' | 'en-US' | 'ja-JP' | 'other';

// 提示词表
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  category: string;
  tags: string[];
  target_ai: string[];
  difficulty: DifficultyLevel;
  language: Language;
  view_count: number;
  copy_count: number;
  share_count: number;
  status: PromptStatus;
  author_name?: string;
  author_link?: string;
  created_at: string;
  updated_at: string;
}

// 分类表
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  display_order: number;
  created_at: string;
}

// 用户提交表
export interface UserSubmission {
  id: string;
  title?: string;
  content: string;
  description?: string;
  submitter_name?: string;
  submitter_email?: string;
  author_name?: string;
  author_link?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
}

// API 响应格式
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 创建提示词的输入类型
export interface CreatePromptInput {
  title: string;
  content: string;
  description?: string;
  category: string;
  tags: string[];
  target_ai: string[];
  difficulty: DifficultyLevel;
  language: Language;
  status: PromptStatus;
  author_name?: string;
  author_link?: string;
}

// 更新提示词的输入类型
export type UpdatePromptInput = Partial<CreatePromptInput>;

// 创建用户提交的输入类型
export interface CreateSubmissionInput {
  content: string;
  description?: string;
  submitter_name?: string;
  submitter_email?: string;
  author_name?: string;
  author_link?: string;
}

