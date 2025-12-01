'use server';

import { createAdminClient } from '@/lib/supabase/server';
import type { UserSubmission, CreateSubmissionInput } from '@/lib/types/database';

/**
 * 创建用户提交
 * 
 * @param input - 提交数据
 * @returns 创建的提交记录
 */
export async function createSubmission(
  input: CreateSubmissionInput
): Promise<{ success: boolean; message: string; data?: UserSubmission }> {
  try {
    // 数据验证
    if (!input.content || input.content.trim().length === 0) {
      return {
        success: false,
        message: '提示词内容不能为空',
      };
    }
    
    if (input.content.length > 10000) {
      return {
        success: false,
        message: '提示词内容不能超过10000字',
      };
    }
    
    if (input.description && input.description.length > 200) {
      return {
        success: false,
        message: '简介不能超过200字',
      };
    }
    
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('user_submissions')
      .insert([{
        content: input.content.trim(),
        description: input.description?.trim() || null,
        submitter_name: input.submitter_name?.trim() || null,
        submitter_email: input.submitter_email?.trim() || null,
        author_name: input.author_name?.trim() || null,
        author_link: input.author_link?.trim() || null,
        status: 'pending',
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create submission:', error);
      return {
        success: false,
        message: '提交失败，请稍后重试',
      };
    }
    
    return {
      success: true,
      message: '提交成功！我们会尽快审核您的提示词',
      data: data as UserSubmission,
    };
  } catch (error) {
    console.error('Error in createSubmission:', error);
    return {
      success: false,
      message: '系统错误，请稍后重试',
    };
  }
}

/**
 * 获取所有用户提交（管理员）
 * 
 * @param status - 状态筛选（可选）
 * @returns 提交记录数组
 */
export async function getSubmissions(status?: string): Promise<UserSubmission[]> {
  try {
    const supabase = createAdminClient();
    
    let query = supabase
      .from('user_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Failed to fetch submissions:', error);
      return [];
    }
    
    return (data as UserSubmission[]) || [];
  } catch (error) {
    console.error('Error in getSubmissions:', error);
    return [];
  }
}

/**
 * 更新提交状态（管理员）
 * 
 * @param id - 提交ID
 * @param status - 新状态
 * @param adminNote - 管理员备注
 * @returns 是否成功
 */
export async function updateSubmissionStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
  adminNote?: string
): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('user_submissions')
      .update({
        status,
        admin_note: adminNote || null,
      })
      .eq('id', id);
    
    if (error) {
      console.error('Failed to update submission status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateSubmissionStatus:', error);
    return false;
  }
}

/**
 * 根据ID获取提交详情（管理员）
 * 
 * @param id - 提交ID
 * @returns 提交记录
 */
export async function getSubmissionById(id: string): Promise<UserSubmission | null> {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('user_submissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Failed to fetch submission:', error);
      return null;
    }
    
    return data as UserSubmission;
  } catch (error) {
    console.error('Error in getSubmissionById:', error);
    return null;
  }
}

/**
 * 删除提交（管理员）
 * 
 * @param id - 提交ID
 * @returns 是否成功
 */
export async function deleteSubmission(id: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('user_submissions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Failed to delete submission:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteSubmission:', error);
    return false;
  }
}

/**
 * 通过审核并自动转为提示词（管理员）
 * 
 * @param id - 提交ID
 * @param promptData - 提示词数据（标题、分类、标签等）
 * @returns 是否成功
 */
export async function approveAndPublish(
  id: string,
  promptData: {
    title: string;
    category: string;
    tags: string[];
    prompt_type: string[];
    use_cases: string[];
    language: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient();
    
    // 1. 获取提交内容
    const { data: submission, error: fetchError } = await supabase
      .from('user_submissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !submission) {
      return {
        success: false,
        message: '提交不存在',
      };
    }
    
    // 2. 创建提示词
    const { error: insertError } = await supabase
      .from('prompts')
      .insert([{
        title: promptData.title,
        content: submission.content,
        description: submission.description || null,
        category: promptData.category,
        tags: promptData.tags,
        prompt_type: promptData.prompt_type,
        use_cases: promptData.use_cases,
        difficulty: 'beginner', // 默认难度为初级
        language: promptData.language,
        author_name: submission.author_name || null,
        author_link: submission.author_link || null,
        status: 'published', // 直接发布
      }]);
    
    if (insertError) {
      console.error('Failed to create prompt:', insertError);
      return {
        success: false,
        message: '创建提示词失败',
      };
    }
    
    // 3. 更新提交状态为已通过
    const { error: updateError } = await supabase
      .from('user_submissions')
      .update({ status: 'approved' })
      .eq('id', id);
    
    if (updateError) {
      console.error('Failed to update submission status:', updateError);
    }
    
    return {
      success: true,
      message: '已通过审核并发布到前端',
    };
  } catch (error) {
    console.error('Error in approveAndPublish:', error);
    return {
      success: false,
      message: '系统错误',
    };
  }
}

