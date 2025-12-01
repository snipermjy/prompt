/**
 * AI 翻译提示词 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { translateToEnglish, translateToChinese } from '@/lib/ai/translate';
import { upsertPromptTranslation } from '@/app/actions/translations';
import type { Locale } from '@/lib/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promptId, title, description, content, tags, use_cases, prompt_type, sourceLocale, targetLocale } = body;

    // 验证参数
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数' },
        { status: 400 }
      );
    }

    // 如果没有指定sourceLocale/targetLocale，默认为中译英
    const source = sourceLocale || 'zh';
    const target = targetLocale || 'en';

    // 验证语言
    if (!['zh', 'en'].includes(source) || !['zh', 'en'].includes(target)) {
      return NextResponse.json(
        { success: false, error: '不支持的语言' },
        { status: 400 }
      );
    }

    if (source === target) {
      return NextResponse.json(
        { success: false, error: '源语言和目标语言不能相同' },
        { status: 400 }
      );
    }

    // 调用 AI 翻译
    let translationResult;
    if (target === 'en') {
      translationResult = await translateToEnglish(title, description, content, tags, use_cases, prompt_type);
    } else {
      translationResult = await translateToChinese(title, description, content);
    }

    // 如果有promptId，保存到数据库
    if (promptId) {
      const saveResult = await upsertPromptTranslation({
        prompt_id: promptId,
        locale: target as Locale,
        title: translationResult.title,
        description: translationResult.description,
        content: translationResult.content,
        tags: translationResult.tags,
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
        translation: translationResult,
        saved: saveResult.data,
      });
    }

    // 没有promptId，只返回翻译结果
    return NextResponse.json({
      success: true,
      translation: translationResult,
    });
  } catch (error) {
    console.error('翻译提示词失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '翻译失败，请稍后重试' 
      },
      { status: 500 }
    );
  }
}
