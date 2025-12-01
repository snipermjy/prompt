/**
 * 翻译数据种子 API
 * 访问 /api/seed-translations 来添加示例翻译数据
 */

// 该路由会访问数据库，不能做静态预渲染
export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. 添加分类翻译
    const categoryTranslations = [
      { slug: 'writing', name: 'Writing Assistant', description: 'Help you create various types of written content' },
      { slug: 'coding', name: 'Programming', description: 'Code generation, debugging, optimization and more' },
      { slug: 'image', name: 'Image Generation', description: 'Prompts for AI image generation tools' },
      { slug: 'data', name: 'Data Analysis', description: 'Data processing, analysis and visualization' },
      { slug: 'marketing', name: 'Marketing', description: 'Advertising copy, social media content creation' },
      { slug: 'education', name: 'Education', description: 'Learning assistance, knowledge explanation' },
      { slug: 'life', name: 'Life Assistant', description: 'Various practical scenarios in daily life' },
      { slug: 'roleplay', name: 'Role Play', description: 'AI plays specific roles for conversation' },
    ];

    const categoryResults = [];
    for (const trans of categoryTranslations) {
      // 获取分类 ID
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', trans.slug)
        .single();

      if (category) {
        const { error } = await supabase
          .from('category_translations')
          .upsert({
            category_id: category.id,
            locale: 'en',
            name: trans.name,
            description: trans.description,
            translation_status: 'published',
            translated_by: 'ai',
          });

        categoryResults.push({
          slug: trans.slug,
          success: !error,
          error: error?.message,
        });
      }
    }

    // 2. 添加提示词翻译
    const promptTranslations = [
      {
        titleZh: '小红书爆款文案生成器',
        titleEn: 'Xiaohongshu Viral Content Generator',
        contentEn: `You are a Xiaohongshu viral content expert. Please create a Xiaohongshu-style post based on the topic I provide.

Requirements:
1. Title should be attractive with emojis
2. Content should be clearly segmented, no more than 3 lines per paragraph
3. Use emojis to enhance visual appeal
4. End with engagement prompts (like, save, comment)
5. Include 3-5 relevant hashtags

My topic is: [Enter your topic here]`,
        descriptionEn: 'Quickly generate Xiaohongshu-style viral content, suitable for marketing promotion',
      },
      {
        titleZh: 'Python代码优化助手',
        titleEn: 'Python Code Optimizer',
        contentEn: `I need you to act as a Python code optimization expert to help me optimize the following code.

Please optimize from these aspects:
1. Performance: Improve execution efficiency
2. Readability: Make code clearer and easier to understand
3. Best Practices: Follow PEP 8 standards
4. Error Handling: Add necessary exception handling
5. Comments: Add clear comments

Please provide the optimized code and explain the reason for each optimization.

My code:
\`\`\`python
[Paste your code here]
\`\`\``,
        descriptionEn: 'Professional Python code optimization suggestions to improve code quality',
      },
    ];

    const promptResults = [];
    for (const trans of promptTranslations) {
      // 获取提示词 ID
      const { data: prompt } = await supabase
        .from('prompts')
        .select('id')
        .eq('title', trans.titleZh)
        .single();

      if (prompt) {
        const { error } = await supabase
          .from('prompt_translations')
          .upsert({
            prompt_id: prompt.id,
            locale: 'en',
            title: trans.titleEn,
            content: trans.contentEn,
            description: trans.descriptionEn,
            translation_status: 'published',
            translated_by: 'ai',
          });

        promptResults.push({
          title: trans.titleZh,
          success: !error,
          error: error?.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: '翻译数据添加成功！',
      results: {
        categories: categoryResults,
        prompts: promptResults,
      },
    });
  } catch (error) {
    console.error('添加翻译数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
