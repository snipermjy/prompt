'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { Prompt, CreatePromptInput, UpdatePromptInput } from '@/lib/types/database';
import { generateContentHash, calculateSimilarity } from '@/lib/utils/similarity';

/**
 * 获取提示词列表
 * 
 * @param category - 分类筛选（可选）
 * @param limit - 返回数量限制
 * @param offset - 偏移量（用于分页）
 * @param includeAll - 是否包含所有状态（管理后台使用，默认false只返回已发布）
 * @returns 提示词数组
 */
export async function getPrompts(
  category?: string,
  limit: number = 20,
  offset: number = 0,
  includeAll: boolean = false
): Promise<Prompt[]> {
  try {
    const supabase = includeAll ? createAdminClient() : await createClient();
    
    let query = supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // 前端只显示已发布的，管理后台显示所有状态
    if (!includeAll) {
      query = query.eq('status', 'published');
    }
    
    // 如果有分类筛选
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Failed to fetch prompts:', error);
      throw new Error(`Failed to fetch prompts: ${error.message}`);
    }
    
    return (data as Prompt[]) || [];
  } catch (error) {
    console.error('Error in getPrompts:', error);
    return [];
  }
}

/**
 * 根据ID获取单个提示词
 * 
 * @param id - 提示词ID
 * @param isAdmin - 是否使用管理员权限（默认false）
 * @returns 提示词对象
 */
export async function getPromptById(id: string, isAdmin: boolean = false): Promise<Prompt | null> {
  try {
    if (!id) {
      throw new Error('Prompt ID is required');
    }
    
    const supabase = isAdmin ? createAdminClient() : await createClient();
    
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Failed to fetch prompt:', error);
      throw new Error(`Failed to fetch prompt: ${error.message}`);
    }
    
    if (!data) {
      return null;
    }
    
    return data as Prompt;
  } catch (error) {
    console.error('Error in getPromptById:', error);
    return null;
  }
}

/**
 * 搜索提示词
 * 
 * @param keyword - 搜索关键词
 * @param limit - 返回数量限制
 * @returns 提示词数组
 */
export async function searchPrompts(
  keyword: string,
  limit: number = 20
): Promise<Prompt[]> {
  try {
    // 验证和清理输入
    if (!keyword || typeof keyword !== 'string') {
      return [];
    }
    
    const trimmedKeyword = keyword.trim();
    
    if (trimmedKeyword.length < 2) {
      return [];
    }
    
    // 限制关键词长度，防止过长查询
    if (trimmedKeyword.length > 100) {
      return [];
    }
    
    // 转义特殊字符，防止SQL注入
    const sanitizedKeyword = trimmedKeyword.replace(/[%_]/g, '\\$&');
    
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${sanitizedKeyword}%,content.ilike.%${sanitizedKeyword}%,description.ilike.%${sanitizedKeyword}%`)
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100)); // 限制最大返回数量
    
    if (error) {
      console.error('Failed to search prompts:', error);
      throw new Error(`Failed to search prompts: ${error.message}`);
    }
    
    return (data as Prompt[]) || [];
  } catch (error) {
    console.error('Error in searchPrompts:', error);
    return [];
  }
}

/**
 * 增加浏览量
 * 使用数据库 RPC 函数实现原子递增，避免 race condition
 * 
 * @param id - 提示词ID
 */
export async function incrementViewCount(id: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    await supabase.rpc('increment_prompt_counter', {
      prompt_id: id,
      counter_name: 'view_count'
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

/**
 * 增加复制量
 * 使用数据库 RPC 函数实现原子递增，避免 race condition
 * 
 * @param id - 提示词ID
 */
export async function incrementCopyCount(id: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    await supabase.rpc('increment_prompt_counter', {
      prompt_id: id,
      counter_name: 'copy_count'
    });
  } catch (error) {
    console.error('Error incrementing copy count:', error);
  }
}

/**
 * 增加分享量
 * 使用数据库 RPC 函数实现原子递增，避免 race condition
 * 
 * @param id - 提示词ID
 */
export async function incrementShareCount(id: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    await supabase.rpc('increment_prompt_counter', {
      prompt_id: id,
      counter_name: 'share_count'
    });
  } catch (error) {
    console.error('Error incrementing share count:', error);
  }
}

/**
 * 创建提示词（管理员）
 * 
 * @param input - 提示词输入数据
 * @returns 创建的提示词
 */
export async function createPrompt(input: CreatePromptInput): Promise<Prompt | null> {
  try {
    // 导入格式化函数
    const { formatPromptContent } = await import('@/lib/utils/formatContent');
    
    // 格式化内容
    const formattedInput = {
      ...input,
      content: formatPromptContent(input.content),
    };
    
    console.log('Creating prompt with data:', JSON.stringify(formattedInput, null, 2));
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('prompts')
      .insert([formattedInput])
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create prompt - Supabase error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to create prompt: ${error.message}`);
    }
    
    console.log('Prompt created successfully:', data);
    return data as Prompt;
  } catch (error) {
    console.error('Error in createPrompt:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error; // 重新抛出错误，而不是返回 null
  }
}

/**
 * 更新提示词（管理员）
 * 
 * @param id - 提示词ID
 * @param input - 更新的数据
 * @returns 更新后的提示词
 */
export async function updatePrompt(
  id: string,
  input: UpdatePromptInput
): Promise<Prompt | null> {
  try {
    // 导入格式化函数
    const { formatPromptContent } = await import('@/lib/utils/formatContent');
    
    // 如果更新了内容，格式化它
    const formattedInput = input.content
      ? { ...input, content: formatPromptContent(input.content) }
      : input;
    
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('prompts')
      .update(formattedInput)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Failed to update prompt:', error);
      throw new Error(`Failed to update prompt: ${error.message}`);
    }
    
    return data as Prompt;
  } catch (error) {
    console.error('Error in updatePrompt:', error);
    return null;
  }
}

/**
 * 删除提示词（管理员）
 * 
 * @param id - 提示词ID
 */
export async function deletePrompt(id: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Failed to delete prompt:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deletePrompt:', error);
    return false;
  }
}

/**
 * 获取相关推荐提示词
 * 
 * @param currentId - 当前提示词ID
 * @param category - 分类
 * @param limit - 返回数量
 * @returns 提示词数组
 */
export async function getRelatedPrompts(
  currentId: string,
  category: string,
  limit: number = 4
): Promise<Prompt[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('status', 'published')
      .eq('category', category)
      .neq('id', currentId)
      .limit(limit);
    
    if (error) {
      console.error('Failed to fetch related prompts:', error);
      return [];
    }
    
    return (data as Prompt[]) || [];
  } catch (error) {
    console.error('Error in getRelatedPrompts:', error);
    return [];
  }
}

/**
 * 检查提示词重复
 * 
 * @param content - 提示词内容
 * @param title - 提示词标题（可选）
 * @returns 相似的提示词列表
 */
export async function checkDuplicates(
  content: string,
  title?: string
): Promise<Array<Prompt & { similarity: number; method: string }>> {
  try {
    if (!content || content.trim().length < 20) {
      return [];
    }

    const supabase = createAdminClient();
    
    // 生成内容hash
    const contentHash = generateContentHash(content);
    
    // 第一步：精确匹配（通过hash）
    const { data: exactMatches } = await supabase
      .from('prompts')
      .select('*')
      .eq('status', 'published')
      .eq('content_hash', contentHash);
    
    if (exactMatches && exactMatches.length > 0) {
      return exactMatches.map(prompt => ({
        ...prompt as Prompt,
        similarity: 100,
        method: 'exact',
      }));
    }

    // 第二步：候选筛选（标题相似或内容前缀相似）
    let candidates: Prompt[] = [];
    
    // 如果提供了标题，先查找标题相同或相似的
    if (title) {
      const { data: titleMatches } = await supabase
        .from('prompts')
        .select('*')
        .eq('status', 'published')
        .ilike('title', `%${title.trim()}%`);
      
      if (titleMatches) {
        candidates.push(...(titleMatches as Prompt[]));
      }
    }
    
    // 如果候选项少于50个，再查询所有已发布的进行详细对比
    if (candidates.length < 50) {
      const { data: allPublished } = await supabase
        .from('prompts')
        .select('*')
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(1000); // 软限制，避免极端情况
      
      if (allPublished) {
        // 合并候选项，去重
        const candidateIds = new Set(candidates.map(c => c.id));
        const newCandidates = (allPublished as Prompt[]).filter(
          p => !candidateIds.has(p.id)
        );
        candidates.push(...newCandidates);
      }
    }

    // 第三步：计算相似度
    const results = candidates
      .map(candidate => {
        const result = calculateSimilarity(
          content,
          candidate.content,
          title,
          candidate.title
        );
        
        return {
          ...candidate,
          similarity: result.similarity,
          method: result.method,
        };
      })
      .filter(item => item.similarity >= 80) // 只返回相似度>=80%的
      .sort((a, b) => {
        // 先按相似度排序
        if (b.similarity !== a.similarity) {
          return b.similarity - a.similarity;
        }
        // 相似度相同时按浏览量排序
        return b.view_count - a.view_count;
      });

    return results;
  } catch (error) {
    console.error('Error in checkDuplicates:', error);
    return [];
  }
}

/**
 * 创建提示词时自动生成hash
 */
export async function createPromptWithHash(input: CreatePromptInput): Promise<Prompt | null> {
  try {
    // 生成content_hash
    const contentHash = generateContentHash(input.content);
    
    const dataWithHash = {
      ...input,
      content_hash: contentHash,
    };

    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('prompts')
      .insert([dataWithHash])
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create prompt:', error);
      throw new Error(`Failed to create prompt: ${error.message}`);
    }
    
    return data as Prompt;
  } catch (error) {
    console.error('Error in createPromptWithHash:', error);
    throw error;
  }
}

