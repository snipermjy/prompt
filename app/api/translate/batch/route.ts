/**
 * 批量翻译 API
 * 为所有没有英文翻译的提示词和分类生成翻译
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { translateToEnglish, translateCategory } from '@/lib/ai/translate';
import { upsertPromptTranslation, upsertCategoryTranslation } from '@/app/actions/translations';
import type { Locale } from '@/lib/types/database';

export async function POST() {
  try {
    const supabase = createAdminClient();
    
    const results = {
      prompts: {
        total: 0,
        translated: 0,
        skipped: 0,
        failed: 0,
        errors: [] as string[],
      },
      categories: {
        total: 0,
        translated: 0,
        skipped: 0,
        failed: 0,
        errors: [] as string[],
      },
    };

    // 1. 翻译分类
    console.log('开始翻译分类...');
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (categories) {
      results.categories.total = categories.length;
      
      for (const category of categories) {
        try {
          // 检查是否已有英文翻译
          const { data: existing } = await supabase
            .from('category_translations')
            .select('*')
            .eq('category_id', category.id)
            .eq('locale', 'en')
            .single();

          if (existing) {
            console.log(`分类 "${category.name}" 已有翻译，跳过`);
            results.categories.skipped++;
            continue;
          }

          // 调用 AI 翻译
          console.log(`翻译分类: ${category.name}`);
          const translation = await translateCategory(
            category.name,
            category.description,
            'en'
          );

          // 保存翻译
          const saveResult = await upsertCategoryTranslation({
            category_id: category.id,
            locale: 'en' as Locale,
            name: translation.name,
            description: translation.description,
            translation_status: 'ai_translated',
            translated_by: 'ai',
          });

          if (saveResult.success) {
            console.log(`✓ 分类 "${category.name}" 翻译成功`);
            results.categories.translated++;
          } else {
            throw new Error(saveResult.error || '保存失败');
          }

          // 添加延迟避免API限流
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          const errorMsg = `分类 "${category.name}": ${error instanceof Error ? error.message : '未知错误'}`;
          console.error('翻译分类失败:', errorMsg);
          results.categories.failed++;
          results.categories.errors.push(errorMsg);
        }
      }
    }

    // 2. 翻译提示词
    console.log('开始翻译提示词...');
    const { data: prompts } = await supabase
      .from('prompts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (prompts) {
      results.prompts.total = prompts.length;
      
      for (const prompt of prompts) {
        try {
          // 检查是否已有英文翻译
          const { data: existing } = await supabase
            .from('prompt_translations')
            .select('*')
            .eq('prompt_id', prompt.id)
            .eq('locale', 'en')
            .single();

          if (existing) {
            console.log(`提示词 "${prompt.title}" 已有翻译，跳过`);
            results.prompts.skipped++;
            continue;
          }

          // 调用 AI 翻译
          console.log(`翻译提示词: ${prompt.title}`);
          const translation = await translateToEnglish(
            prompt.title,
            prompt.description,
            prompt.content
          );

          // 保存翻译
          const saveResult = await upsertPromptTranslation({
            prompt_id: prompt.id,
            locale: 'en' as Locale,
            title: translation.title,
            description: translation.description,
            content: translation.content,
            translation_status: 'ai_translated',
            translated_by: 'ai',
          });

          if (saveResult.success) {
            console.log(`✓ 提示词 "${prompt.title}" 翻译成功`);
            results.prompts.translated++;
          } else {
            throw new Error(saveResult.error || '保存失败');
          }

          // 添加延迟避免API限流
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          const errorMsg = `提示词 "${prompt.title}": ${error instanceof Error ? error.message : '未知错误'}`;
          console.error('翻译提示词失败:', errorMsg);
          results.prompts.failed++;
          results.prompts.errors.push(errorMsg);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '批量翻译完成',
      results,
    });
  } catch (error) {
    console.error('批量翻译失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '批量翻译失败',
      },
      { status: 500 }
    );
  }
}
