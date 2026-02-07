import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * 合并分类 API
 * 将源分类的所有提示词迁移到目标分类，然后删除源分类
 */
export async function POST(request: NextRequest) {
  try {
    const { sourceSlug, targetSlug } = await request.json();

    if (!sourceSlug || !targetSlug) {
      return NextResponse.json(
        { error: '缺少必需参数' },
        { status: 400 }
      );
    }

    if (sourceSlug === targetSlug) {
      return NextResponse.json(
        { error: '源分类和目标分类不能相同' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. 检查两个分类是否存在
    const { data: sourceCategory } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', sourceSlug)
      .single();

    const { data: targetCategory } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', targetSlug)
      .single();

    if (!sourceCategory || !targetCategory) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 404 }
      );
    }

    // 2. 统计需要迁移的提示词数量
    const { count } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('category', sourceSlug);

    // 3. 迁移所有提示词（使用事务）
    const { error: updateError } = await supabase
      .from('prompts')
      .update({ category: targetSlug })
      .eq('category', sourceSlug);

    if (updateError) {
      console.error('Failed to migrate prompts:', updateError);
      return NextResponse.json(
        { error: '迁移提示词失败' },
        { status: 500 }
      );
    }

    // 4. 迁移分类翻译数据（如果存在）
    // 先检查目标分类是否已有翻译
    const { data: targetTranslations } = await supabase
      .from('category_translations')
      .select('locale')
      .eq('category_id', targetCategory.id);

    const targetLocales = new Set((targetTranslations || []).map(t => t.locale));

    // 获取源分类的翻译
    const { data: sourceTranslations } = await supabase
      .from('category_translations')
      .select('*')
      .eq('category_id', sourceCategory.id);

    // 迁移不冲突的翻译
    if (sourceTranslations && sourceTranslations.length > 0) {
      const translationsToMigrate = sourceTranslations
        .filter(t => !targetLocales.has(t.locale))
        .map(t => ({
          category_id: targetCategory.id,
          locale: t.locale,
          name: t.name,
          description: t.description,
          translation_status: t.translation_status,
          translated_by: t.translated_by,
        }));

      if (translationsToMigrate.length > 0) {
        await supabase
          .from('category_translations')
          .insert(translationsToMigrate);
      }
    }

    // 5. 删除源分类的翻译
    await supabase
      .from('category_translations')
      .delete()
      .eq('category_id', sourceCategory.id);

    // 6. 删除源分类
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('slug', sourceSlug);

    if (deleteError) {
      console.error('Failed to delete source category:', deleteError);
      return NextResponse.json(
        { error: '删除源分类失败' },
        { status: 500 }
      );
    }

    // 5. 发送通知
    const { notifyAdmin } = await import('@/lib/utils/adminNotification');
    await notifyAdmin({
      type: 'system_info',
      message: `分类"${sourceCategory.name}"已合并到"${targetCategory.name}"，共迁移${count || 0}个提示词`,
      data: {
        sourceCategory: sourceCategory.name,
        targetCategory: targetCategory.name,
        migratedCount: count || 0,
      }
    });

    return NextResponse.json({
      success: true,
      message: `成功合并分类，迁移了${count || 0}个提示词`,
      migratedCount: count || 0,
    });
  } catch (error) {
    console.error('Error in merge categories:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
