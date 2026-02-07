/**
 * 翻译相关的 Server Actions
 */

'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { translateCategory } from '@/lib/ai/translate';
import type {
  PromptTranslation,
  CategoryTranslation,
  CreatePromptTranslationInput,
  CreateCategoryTranslationInput,
  Locale,
  PromptWithTranslation,
  CategoryWithTranslation,
} from '@/lib/types/database';

// ============================================================================
// 提示词翻译
// ============================================================================

/**
 * 获取提示词的翻译
 */
export async function getPromptTranslation(
  promptId: string,
  locale: Locale
): Promise<PromptTranslation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('prompt_translations')
    .select('*')
    .eq('prompt_id', promptId)
    .eq('locale', locale)
    .single();

  if (error) {
    console.error('获取提示词翻译失败:', error);
    return null;
  }

  return data;
}

/**
 * 获取带翻译的提示词
 * 如果是中文，返回原始数据
 * 如果是英文，合并翻译数据
 */
export async function getPromptWithTranslation(
  promptId: string,
  locale: Locale
): Promise<PromptWithTranslation | null> {
  const supabase = await createClient();

  // 获取原始提示词
  const { data: prompt, error: promptError } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', promptId)
    .single();

  if (promptError || !prompt) {
    console.error('获取提示词失败:', promptError);
    return null;
  }

  // 如果是中文，直接返回原始数据
  if (locale === 'zh') {
    return {
      ...prompt,
      _locale: 'zh',
    };
  }

  // 如果是英文，获取翻译
  const translation = await getPromptTranslation(promptId, 'en');

  if (!translation) {
    // 如果没有翻译，返回原始数据（降级方案）
    return {
      ...prompt,
      _locale: 'en',
      _translation_status: 'pending',
    };
  }

  // 合并翻译数据
  return {
    ...prompt,
    title: translation.title,
    description: translation.description || prompt.description,
    content: translation.content,
    tags: translation.tags && translation.tags.length > 0 ? translation.tags : prompt.tags,
    use_cases: translation.use_cases && translation.use_cases.length > 0 ? translation.use_cases : prompt.use_cases,
    prompt_type: translation.prompt_type && translation.prompt_type.length > 0 ? translation.prompt_type : prompt.prompt_type,
    _locale: 'en',
    _translation_status: translation.translation_status,
  };
}

/**
 * 创建或更新提示词翻译
 */
export async function upsertPromptTranslation(
  input: CreatePromptTranslationInput
): Promise<{ success: boolean; error?: string; data?: PromptTranslation }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('prompt_translations')
    .upsert({
      prompt_id: input.prompt_id,
      locale: input.locale,
      title: input.title,
      description: input.description,
      content: input.content,
      tags: input.tags || [],
      use_cases: input.use_cases || [],
      prompt_type: input.prompt_type || [],
      translation_status: input.translation_status || 'pending',
      translated_by: input.translated_by || 'ai',
      translated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('创建/更新提示词翻译失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * 批量获取提示词翻译
 */
export async function getPromptsWithTranslation(
  locale: Locale,
  filters?: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'latest' | 'popular' | 'mostShared';
  }
): Promise<PromptWithTranslation[]> {
  const supabase = await createClient();

  let query = supabase
    .from('prompts')
    .select('*')
    .eq('status', filters?.status || 'published');

  const sortBy = filters?.sortBy || 'latest';

  if (sortBy === 'popular') {
    // 最热：按浏览量优先，其次复制量，最后创建时间
    query = query
      .order('view_count', { ascending: false })
      .order('copy_count', { ascending: false })
      .order('created_at', { ascending: false });
  } else if (sortBy === 'mostShared') {
    // 分享最多：按分享量优先，其次创建时间
    query = query
      .order('share_count', { ascending: false })
      .order('created_at', { ascending: false });
  } else {
    // 最新：按创建时间倒序
    query = query.order('created_at', { ascending: false });
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset !== undefined) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  }

  const { data: prompts, error } = await query;

  if (error || !prompts) {
    console.error('获取提示词列表失败:', error);
    return [];
  }

  // 如果是中文，直接返回
  if (locale === 'zh') {
    return prompts.map(p => ({ ...p, _locale: 'zh' as Locale }));
  }

  // 如果是英文，批量获取翻译
  const promptIds = prompts.map(p => p.id);
  const { data: translations } = await supabase
    .from('prompt_translations')
    .select('*')
    .in('prompt_id', promptIds)
    .eq('locale', 'en');

  const translationMap = new Map(
    (translations || []).map(t => [t.prompt_id, t])
  );

  return prompts.map(prompt => {
    const translation = translationMap.get(prompt.id);
    if (!translation) {
      return { ...prompt, _locale: 'en' as Locale, _translation_status: 'pending' as const };
    }

    return {
      ...prompt,
      title: translation.title,
      description: translation.description || prompt.description,
      content: translation.content,
      tags: translation.tags && translation.tags.length > 0 ? translation.tags : prompt.tags,
      use_cases: translation.use_cases && translation.use_cases.length > 0 ? translation.use_cases : prompt.use_cases,
      prompt_type: translation.prompt_type && translation.prompt_type.length > 0 ? translation.prompt_type : prompt.prompt_type,
      _locale: 'en' as Locale,
      _translation_status: translation.translation_status,
    };
  });
}

// ============================================================================
// 分类翻译
// ============================================================================

/**
 * 获取分类的翻译
 */
export async function getCategoryTranslation(
  categoryId: string,
  locale: Locale
): Promise<CategoryTranslation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('category_translations')
    .select('*')
    .eq('category_id', categoryId)
    .eq('locale', locale)
    .single();

  if (error) {
    console.error('获取分类翻译失败:', error);
    return null;
  }

  return data;
}

/**
 * 获取带翻译的分类
 * 参数使用的是分类的 slug（如 "ai-agent"），内部会根据 slug 查询分类记录
 */
export async function getCategoryWithTranslation(
  categorySlug: string,
  locale: Locale
): Promise<CategoryWithTranslation | null> {
  const supabase = await createClient();

  // 先根据 slug 查到分类记录
  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single();

  if (error || !category) {
    return null;
  }

  // 中文页面：直接用原始中文名
  if (locale === 'zh') {
    return { ...category, _locale: 'zh' };
  }

  // 英文页面：按分类 id 获取英文翻译
  const translation = await getCategoryTranslation(category.id, 'en');

  // 如果没有翻译，返回中文名称作为降级方案
  if (!translation) {
    return { ...category, _locale: 'en', _translation_status: 'pending' };
  }

  return {
    ...category,
    name: translation.name,
    description: translation.description || category.description,
    _locale: 'en',
    _translation_status: translation.translation_status,
  };
}

/**
 * 创建或更新分类翻译
 */
export async function upsertCategoryTranslation(
  input: CreateCategoryTranslationInput
): Promise<{ success: boolean; error?: string; data?: CategoryTranslation }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('category_translations')
    .upsert(
      {
        category_id: input.category_id,
        locale: input.locale,
        name: input.name,
        description: input.description,
        translation_status: input.translation_status || 'pending',
        translated_by: input.translated_by || 'ai',
        translated_at: new Date().toISOString(),
      },
      {
        onConflict: 'category_id,locale',
      }
    )
    .select()
    .single();

  if (error) {
    // 如果是唯一键冲突（记录已存在），尝试返回已有记录，避免大量无害的 duplicate key 报错
    const supabaseError = error as { code?: string; message: string };
    if (supabaseError.code === '23505') {
      try {
        const { data: existing, error: fetchError } = await supabase
          .from('category_translations')
          .select('*')
          .eq('category_id', input.category_id)
          .eq('locale', input.locale)
          .single();

        if (fetchError || !existing) {
          console.error('获取已存在的分类翻译失败:', fetchError || error);
          return { success: false, error: error.message };
        }

        return { success: true, data: existing };
      } catch (fetchError) {
        console.error('处理分类翻译唯一键冲突失败:', fetchError);
        return { success: false, error: error.message };
      }
    }

    console.error('创建/更新分类翻译失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * 批量获取分类翻译
 */
export async function getCategoriesWithTranslation(
  locale: Locale
): Promise<CategoryWithTranslation[]> {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !categories) {
    console.error('获取分类列表失败:', error);
    return [];
  }

  if (locale === 'zh') {
    return categories.map(c => ({ ...c, _locale: 'zh' as Locale }));
  }

  const categoryIds = categories.map(c => c.id);
  const { data: translations } = await supabase
    .from('category_translations')
    .select('*')
    .in('category_id', categoryIds)
    .eq('locale', 'en');

  const translationMap = new Map(
    (translations || []).map(t => [t.category_id, t])
  );

  return categories.map(category => {
    const translation = translationMap.get(category.id);
    if (!translation) {
      return { ...category, _locale: 'en' as Locale, _translation_status: 'pending' as const };
    }

    return {
      ...category,
      name: translation.name,
      description: translation.description || category.description,
      _locale: 'en' as Locale,
      _translation_status: translation.translation_status,
    };
  });
}
