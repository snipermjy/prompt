import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * 获取所有分类列表 API
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, parent_category, icon, description')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch categories:', error);
      return NextResponse.json(
        { error: '获取分类失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      categories: categories || [],
    });
  } catch (error) {
    console.error('Error in get categories:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
