/**
 * AI 生成元数据 API 路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMetadata, validateAIConfig } from '@/lib/ai/generate';
import { getCategories } from '@/app/actions/categories';

export async function POST(request: NextRequest) {
  try {
    // 验证 AI 配置
    const configCheck = validateAIConfig();
    if (!configCheck.valid) {
      return NextResponse.json(
        { error: configCheck.message },
        { status: 500 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { content } = body;

    // 验证输入
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '请提供提示词内容' },
        { status: 400 }
      );
    }

    if (content.trim().length < 20) {
      return NextResponse.json(
        { error: '提示词内容至少需要 20 个字符' },
        { status: 400 }
      );
    }

    // 获取现有分类列表
    const categories = await getCategories();

    // 调用 AI 生成
    const metadata = await generateMetadata(content, categories);

    return NextResponse.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    console.error('AI 生成 API 错误:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'AI 生成失败，请稍后重试',
      },
      { status: 500 }
    );
  }
}

