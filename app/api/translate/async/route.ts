/**
 * 异步翻译API - 在后台翻译提示词和分类
 */

import { NextRequest, NextResponse } from 'next/server';
import { translateToEnglish, translateCategory } from '@/lib/ai/translate';
import { upsertPromptTranslation, upsertCategoryTranslation } from '@/app/actions/translations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, title, description, content, name } = body;

    if (type === 'prompt') {
      // 翻译提示词
      console.log('开始异步翻译提示词:', id);
      
      const translation = await translateToEnglish(
        title || '',
        description || '',
        content
      );

      const result = await upsertPromptTranslation({
        prompt_id: id,
        locale: 'en',
        title: translation.title,
        description: translation.description,
        content: translation.content,
        translation_status: 'ai_translated',
        translated_by: 'ai',
      });

      if (result.success) {
        console.log('提示词翻译成功:', id);
        return NextResponse.json({ success: true, message: '翻译成功' });
      } else {
        console.error('提示词翻译失败:', result.error);
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
      }
    } else if (type === 'category') {
      // 翻译分类
      console.log('开始异步翻译分类:', id, name);
      
      const translation = await translateCategory(name, description || '', 'en');

      const result = await upsertCategoryTranslation({
        category_id: id,
        locale: 'en',
        name: translation.name,
        description: translation.description,
        translation_status: 'ai_translated',
        translated_by: 'ai',
      });

      if (result.success) {
        console.log('分类翻译成功:', id);
        return NextResponse.json({ success: true, message: '翻译成功' });
      } else {
        console.error('分类翻译失败:', result.error);
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: '无效的类型' }, { status: 400 });
  } catch (error) {
    console.error('异步翻译失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '翻译失败' },
      { status: 500 }
    );
  }
}
