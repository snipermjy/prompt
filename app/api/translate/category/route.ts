/**
 * AI 翻译分类 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { translateCategory } from '@/lib/ai/translate';
import { upsertCategoryTranslation } from '@/app/actions/translations';
import type { Locale } from '@/lib/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, name, description, targetLocale } = body;

    // 验证参数
    if (!categoryId || !name || !targetLocale) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数' },
        { status: 400 }
      );
    }

    // 验证语言
    if (!['zh', 'en'].includes(targetLocale)) {
      return NextResponse.json(
        { success: false, error: '不支持的语言' },
        { status: 400 }
      );
    }

    // 调用 AI 翻译
    const translationResult = await translateCategory(name, description, targetLocale as Locale);

    // 保存翻译结果到数据库
    const saveResult = await upsertCategoryTranslation({
      category_id: categoryId,
      locale: targetLocale as Locale,
      name: translationResult.name,
      description: translationResult.description,
      translation_status: 'ai_translated',
      translated_by: 'ai',
    });

    if (!saveResult.success) {
      return NextResponse.json(
        { success: false, error: '保存翻译失败: ' + saveResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        translation: translationResult,
        saved: saveResult.data,
      },
    });
  } catch (error) {
    console.error('翻译分类失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '翻译失败，请稍后重试' 
      },
      { status: 500 }
    );
  }
}
