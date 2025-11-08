/**
 * AI 自动生成功能
 * 使用硅基流动 DeepSeek API 生成提示词元数据
 */

import type { Category } from '@/lib/types/database';

/**
 * AI 生成结果接口
 */
export interface AIGeneratedMetadata {
  title: string;
  description: string;
  category: string;
  tags: string[];
  target_ai: string[];
  language: 'zh-CN' | 'en-US' | 'ja-JP' | 'other';
}

/**
 * 调用硅基流动 DeepSeek API
 */
async function callDeepSeekAPI(prompt: string): Promise<string> {
  const apiUrl = process.env.AI_API_URL || 'https://api.siliconflow.cn/v1/chat/completions';
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B';

  if (!apiKey) {
    throw new Error('AI_API_KEY 未配置，请在 .env.local 中设置');
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API 错误:', errorText);
      throw new Error(`AI API 调用失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 提取 AI 返回的内容
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('AI 返回内容为空');
    }

    return content;
  } catch (error) {
    console.error('调用 DeepSeek API 失败:', error);
    throw error;
  }
}

/**
 * 根据提示词内容生成元数据
 * 
 * @param content - 提示词内容
 * @param existingCategories - 现有分类列表（用于参考）
 * @returns 生成的元数据
 */
export async function generateMetadata(
  content: string,
  existingCategories: Category[]
): Promise<AIGeneratedMetadata> {
  // 构建现有分类列表供 AI 参考
  const categoryList = existingCategories
    .map((cat) => `- ${cat.name} (${cat.slug}): ${cat.description || ''}`)
    .join('\n');

  // 构建 AI 提示词
  const systemPrompt = `你是一个专业的 AI 提示词分析助手。你的任务是分析用户提供的提示词内容，并生成结构化的元数据。

**分析要求：**

1. **标题 (title)**：
   - 20字以内，简洁准确
   - 突出提示词的核心功能
   - 使用吸引人的措辞

2. **描述 (description)**：
   - 50-100字
   - 清晰说明提示词的用途和特点
   - 突出亮点和适用场景

3. **分类 (category)**：
   - 优先从以下现有分类中选择最匹配的（返回 slug 值）：
${categoryList}
   - 如果现有分类都不合适，可以建议新分类名称（用中文，不要带 slug）
   - 只返回一个分类

4. **标签 (tags)**：
   - 提取 3-5 个关键标签
   - 标签要精准、简短（2-4个字）
   - 可以是技术名词、应用场景、特性等
   - 标签可以灵活创建，不局限于预设

5. **适用 AI 模型 (target_ai)**：
   - 列出适合使用这个提示词的 AI 模型
   - 常见模型：ChatGPT, Claude, Gemini, 文心一言, 通义千问, Midjourney, Stable Diffusion 等
   - 可以根据提示词特点灵活判断
   - 至少列出 1-3 个

6. **语言 (language)**：
   - 根据提示词内容判断主要语言
   - 可选值：zh-CN（中文）、en-US（英文）、ja-JP（日文）、other（其他）

**重要说明：**
- 分类和标签都可以灵活生成，不要局限于预设
- 如果提示词很专业或小众，可以创建新的分类和标签
- 确保生成的内容准确、有用、易于理解

**返回格式要求：**
请严格按照以下 JSON 格式返回，不要添加任何其他文字：

\`\`\`json
{
  "title": "标题",
  "description": "描述内容",
  "category": "分类slug或新分类名",
  "tags": ["标签1", "标签2", "标签3"],
  "target_ai": ["AI模型1", "AI模型2"],
  "language": "zh-CN"
}
\`\`\`

现在，请分析以下提示词内容：

---
${content}
---

请开始分析并返回 JSON 格式的结果。`;

  try {
    // 调用 AI API
    const aiResponse = await callDeepSeekAPI(systemPrompt);

    // 提取 JSON 内容（处理可能的 markdown 代码块）
    let jsonStr = aiResponse.trim();
    
    // 移除可能的 markdown 代码块标记
    const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // 如果没有代码块，尝试找到第一个 { 和最后一个 }
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }
    }

    // 解析 JSON
    const result = JSON.parse(jsonStr) as AIGeneratedMetadata;

    // 验证必需字段
    if (!result.title || !result.description || !result.category) {
      throw new Error('AI 返回的数据缺少必需字段');
    }

    // 确保数组字段存在
    result.tags = Array.isArray(result.tags) ? result.tags : [];
    result.target_ai = Array.isArray(result.target_ai) ? result.target_ai : [];

    // 验证分类：如果是现有分类的 slug，保持不变；如果是新分类，也保持
    // 不做强制匹配，让管理员自己决定

    // 设置默认语言
    if (!result.language) {
      result.language = 'zh-CN';
    }

    return result;
  } catch (error) {
    console.error('AI 生成元数据失败:', error);
    throw new Error('AI 生成失败，请检查提示词内容或稍后重试');
  }
}

/**
 * 验证 AI 配置是否正确
 */
export function validateAIConfig(): { valid: boolean; message: string } {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL;
  const model = process.env.AI_MODEL;

  if (!apiKey) {
    return {
      valid: false,
      message: 'AI_API_KEY 未配置，请在 .env.local 中设置',
    };
  }

  if (!apiUrl) {
    return {
      valid: false,
      message: 'AI_API_URL 未配置，请在 .env.local 中设置',
    };
  }

  if (!model) {
    return {
      valid: false,
      message: 'AI_MODEL 未配置，请在 .env.local 中设置',
    };
  }

  return {
    valid: true,
    message: 'AI 配置正常',
  };
}

