'use server';

import { createClient } from '@/lib/supabase/server';
import type { Category } from '@/lib/types/database';

/**
 * 获取所有分类
 * 
 * @param useStaticClient - 是否使用静态客户端（用于 sitemap 等静态生成场景，默认false）
 * @param sortBy - 排序方式：'display_order' | 'last_updated' | 'name'（默认按最新更新时间）
 * @returns 分类数组
 */
export async function getCategories(
  useStaticClient: boolean = false,
  sortBy: 'display_order' | 'last_updated' | 'name' = 'last_updated'
): Promise<Category[]> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/server');
    const supabase = useStaticClient ? createAdminClient() : await createClient();
    
    let query = supabase.from('categories').select('*');
    
    // 根据排序方式选择
    switch (sortBy) {
      case 'last_updated':
        query = query.order('last_updated_at', { ascending: false, nullsFirst: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'display_order':
      default:
        query = query.order('display_order', { ascending: true });
        break;
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Failed to fetch categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
    
    return (data as Category[]) || [];
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
}

/**
 * 根据 slug 获取分类
 * 
 * @param slug - 分类slug
 * @returns 分类对象
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    if (!slug) {
      throw new Error('Category slug is required');
    }
    
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('Failed to fetch category:', error);
      return null;
    }
    
    return data as Category;
  } catch (error) {
    console.error('Error in getCategoryBySlug:', error);
    return null;
  }
}

/**
 * 获取分类树结构（一级分类 + 二级分类）
 * 
 * @returns 分类树结构
 */
export async function getCategoryTree(): Promise<Map<string, Category[]>> {
  try {
    const categories = await getCategories(false, 'last_updated');
    const tree = new Map<string, Category[]>();
    
    // 按一级分类分组
    for (const category of categories) {
      const parentCategory = category.parent_category || '其他';
      
      if (!tree.has(parentCategory)) {
        tree.set(parentCategory, []);
      }
      
      tree.get(parentCategory)!.push(category);
    }
    
    return tree;
  } catch (error) {
    console.error('Error in getCategoryTree:', error);
    return new Map();
  }
}

/**
 * 获取分类及其提示词数量（优化版 - 减少查询次数）
 * 
 * @returns 分类数组（包含提示词数量）
 */
export async function getCategoriesWithCount(): Promise<(Category & { prompt_count: number })[]> {
  try {
    const supabase = await createClient();
    
    // 先获取所有分类
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (categoriesError) {
      console.error('Failed to fetch categories:', categoriesError);
      return [];
    }
    
    if (!categories || categories.length === 0) {
      return [];
    }
    
    // 获取所有分类的 slug
    const categorySlugs = categories.map(c => c.slug);
    
    // 一次性查询所有分类的提示词数量
    const { data: promptCounts } = await supabase
      .from('prompts')
      .select('category')
      .eq('status', 'published')
      .in('category', categorySlugs);
    
    // 统计每个分类的提示词数量
    const countMap = new Map<string, number>();
    (promptCounts || []).forEach(p => {
      countMap.set(p.category, (countMap.get(p.category) || 0) + 1);
    });
    
    // 合并数据
    return categories.map(category => ({
      ...category,
      prompt_count: countMap.get(category.slug) || 0,
    })) as (Category & { prompt_count: number })[];
  } catch (error) {
    console.error('Error in getCategoriesWithCount:', error);
    return [];
  }
}

/**
 * 创建新分类（AI自动生成）
 * 
 * @param name - 分类名称
 * @param slug - 分类slug
 * @param description - 分类描述
 * @param icon - 分类图标（emoji）
 * @param parentCategory - 一级分类名称
 * @returns 创建的分类
 */
export async function createCategory(
  name: string,
  slug: string,
  description?: string,
  icon?: string,
  parentCategory?: string
): Promise<Category | null> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/server');
    const supabase = createAdminClient();
    
    // 1. 检测分类名称冲突
    const { detectCategoryConflict } = await import('@/lib/utils/categoryConflictDetector');
    const conflictResult = await detectCategoryConflict(name);
    
    if (conflictResult.hasConflict) {
      // 发送通知到管理后台
      const { notifyAdmin } = await import('@/lib/utils/adminNotification');
      await notifyAdmin({
        type: 'category_conflict',
        message: conflictResult.suggestion,
        data: {
          newCategory: name,
          newSlug: slug,
          similarCategories: conflictResult.similarCategories
        }
      });
      
      // 如果相似度非常高（>95%），直接使用现有分类
      if (conflictResult.similarCategories[0]?.similarity > 0.95) {
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', conflictResult.similarCategories[0].slug)
          .single();
        return existingCategory as Category;
      }
    }
    
    // 2. 检查slug是否已存在
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (existing) {
      return null;
    }
    
    // 3. 获取最大display_order
    const { data: maxOrder } = await supabase
      .from('categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();
    
    const displayOrder = (maxOrder?.display_order || 0) + 1;
    
    // 3.5. 验证parent_category是否有效
    const validParentCategories = ['内容创作', '技术开发', '商业运营', '效率工具', 'AI应用'];
    if (parentCategory && !validParentCategories.includes(parentCategory)) {
      console.warn(`Invalid parent_category: ${parentCategory}, setting to null`);
      parentCategory = undefined;
    }
    
    // 4. 创建新分类
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name,
        slug,
        description: description || `${name}相关的提示词`,
        icon: icon || '📁',
        parent_category: parentCategory || null,
        display_order: displayOrder,
        last_updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create category:', error);
      throw new Error(`Failed to create category: ${error.message}`);
    }
    
    // 5. 同步翻译为英文（不等待翻译完成，避免阻塞）
    // 使用异步方式，不影响分类创建的响应速度
    Promise.resolve().then(async () => {
      try {
        const { translateCategory } = await import('@/lib/ai/translate');
        const { upsertCategoryTranslation } = await import('@/app/actions/translations');
        
        const translation = await translateCategory(name, description || '', 'en');
        
        await upsertCategoryTranslation({
          category_id: data.id,
          locale: 'en',
          name: translation.name,
          description: translation.description,
          translation_status: 'ai_translated',
          translated_by: 'ai',
        });
      } catch (translationError) {
        console.error('翻译失败:', data.id, translationError);
      }
    });
    
    // 6. 发送新分类创建通知（包含AI判断理由）
    const { notifyAdmin } = await import('@/lib/utils/adminNotification');
    await notifyAdmin({
      type: 'new_category',
      message: `AI创建了新分类"${name}"${parentCategory ? `（属于${parentCategory}）` : ''}`,
      data: {
        categoryId: data.id,
        categoryName: name,
        categorySlug: slug,
        parentCategory: parentCategory,
        description: description,
        reason: '现有17个分类无法准确覆盖该提示词的应用场景',
        // 可以在这里添加更多上下文信息
      }
    });
    
    return data as Category;
  } catch (error) {
    console.error('Error in createCategory:', error);
    return null;
  }
}
