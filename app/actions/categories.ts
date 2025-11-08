'use server';

import { createClient } from '@/lib/supabase/server';
import type { Category } from '@/lib/types/database';

/**
 * 获取所有分类
 * 
 * @returns 分类数组
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    
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

