'use server';

import { createClient } from '@/lib/supabase/server';
import type { Category } from '@/lib/types/database';

/**
 * 获取所有分类
 * 
 * @param useStaticClient - 是否使用静态客户端（用于 sitemap 等静态生成场景，默认false）
 * @returns 分类数组
 */
export async function getCategories(useStaticClient: boolean = false): Promise<Category[]> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/server');
    const supabase = useStaticClient ? createAdminClient() : await createClient();
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    
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
 * 获取分类及其提示词数量
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
    
    // 为每个分类获取提示词数量
    const categoriesWithCount = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await supabase
          .from('prompts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published')
          .eq('category', category.slug);
        
        return {
          ...category,
          prompt_count: count || 0,
        };
      })
    );
    
    return categoriesWithCount as (Category & { prompt_count: number })[];
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
 * @returns 创建的分类
 */
export async function createCategory(
  name: string,
  slug: string,
  description?: string,
  icon?: string
): Promise<Category | null> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/server');
    const supabase = createAdminClient();
    
    // 检查slug是否已存在
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (existing) {
      console.log(`Category with slug "${slug}" already exists`);
      return null;
    }
    
    // 获取最大display_order
    const { data: maxOrder } = await supabase
      .from('categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();
    
    const displayOrder = (maxOrder?.display_order || 0) + 1;
    
    // 创建新分类
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name,
        slug,
        description: description || `${name}相关的提示词`,
        icon: icon || '📁', // 使用AI生成的图标或默认图标
        display_order: displayOrder,
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create category:', error);
      throw new Error(`Failed to create category: ${error.message}`);
    }
    
    console.log(`✅ Created new category: ${name} (${slug})`);
    return data as Category;
  } catch (error) {
    console.error('Error in createCategory:', error);
    return null;
  }
}
