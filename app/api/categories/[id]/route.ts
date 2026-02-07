/**
 * 分类管理 API
 * 支持更新和删除分类
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// 更新分类
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, icon } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: '名称和Slug不能为空' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 检查slug是否与其他分类冲突
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: `Slug "${slug}" 已被其他分类使用` },
        { status: 400 }
      );
    }

    // 更新分类
    const { data, error } = await supabase
      .from('categories')
      .update({
        name,
        slug,
        description,
        icon,
        last_updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update category:', error);
      return NextResponse.json(
        { error: '更新失败' },
        { status: 500 }
      );
    }

    // 🌐 不再自动生成翻译，改为手动触发
    // 翻译失败不影响主流程

    return NextResponse.json({
      success: true,
      category: data,
    });
  } catch (error) {
    console.error('Update category API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // 先获取分类的 slug
    const { data: category } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', id)
      .single();

    if (!category) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 404 }
      );
    }

    // 检查分类下是否有提示词（使用 slug）
    const { count } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('category', category.slug);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `该分类下有${count}个提示词，无法删除` },
        { status: 400 }
      );
    }

    // 删除分类
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete category:', error);
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete category API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
