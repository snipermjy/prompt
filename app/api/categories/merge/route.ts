/**
 * 分类合并 API
 * 将多个分类合并到目标分类
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetCategoryId, sourceCategoryIds } = body;

    if (!targetCategoryId || !sourceCategoryIds || sourceCategoryIds.length === 0) {
      return NextResponse.json(
        { error: '参数错误' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 获取目标分类
    const { data: targetCategory, error: targetError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', targetCategoryId)
      .single();

    if (targetError || !targetCategory) {
      return NextResponse.json(
        { error: '目标分类不存在' },
        { status: 404 }
      );
    }

    // 获取源分类
    const { data: sourceCategories, error: sourceError } = await supabase
      .from('categories')
      .select('*')
      .in('id', sourceCategoryIds);

    if (sourceError || !sourceCategories || sourceCategories.length === 0) {
      return NextResponse.json(
        { error: '源分类不存在' },
        { status: 404 }
      );
    }

    // 将源分类下的所有提示词移动到目标分类
    for (const sourceCategory of sourceCategories) {
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ category: targetCategory.slug })
        .eq('category', sourceCategory.slug);

      if (updateError) {
        console.error('Failed to update prompts:', updateError);
        return NextResponse.json(
          { error: '合并失败' },
          { status: 500 }
        );
      }
    }

    // 删除源分类
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .in('id', sourceCategoryIds);

    if (deleteError) {
      console.error('Failed to delete source categories:', deleteError);
      return NextResponse.json(
        { error: '删除源分类失败' },
        { status: 500 }
      );
    }

    // 更新目标分类的最后更新时间
    await supabase
      .from('categories')
      .update({ last_updated_at: new Date().toISOString() })
      .eq('id', targetCategoryId);

    // 发送通知
    const { notifyAdmin } = await import('@/lib/utils/adminNotification');
    await notifyAdmin({
      type: 'system_info',
      message: `已将${sourceCategories.map(c => c.name).join('、')}合并到"${targetCategory.name}"`,
      data: {
        targetCategory: targetCategory.name,
        sourceCategories: sourceCategories.map(c => c.name)
      }
    });

    return NextResponse.json({
      success: true,
      category: targetCategory,
    });
  } catch (error) {
    console.error('Merge categories API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
