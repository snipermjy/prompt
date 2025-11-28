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
  category: string; // AI自由判断的分类名称
  category_slug?: string; // AI生成的slug（英文）
  category_description?: string; // AI生成的分类描述
  category_icon?: string; // AI生成的分类图标（emoji）
  tags: string[];
  prompt_type: string[];  // 提示词类型
  use_cases: string[];    // 使用场景
  language: 'zh-CN' | 'en-US' | 'ja-JP' | 'other';
  is_series?: boolean;    // 是否为系列提示词
  series_info?: {         // 系列信息（如果是系列）
    suggested_name: string;
    order_hint: number;
  };
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

**重要原则：不要被预设限制，根据实际内容灵活生成**

**分析要求：**

1. **标题 (title)**：
   - 15字以内，简洁准确
   - 突出提示词的核心功能
   - 使用吸引人的措辞

2. **描述 (description)**：
   - 50-100字
   - 清晰说明提示词的用途和特点
   - 突出亮点和适用场景

3. **分类 (category)**：
   - **完全自由判断**最适合的分类名称（用中文）
   - 不要被任何预设限制，根据提示词的实际内容和用途来判断
   - 只返回一个分类名称
   
   同时生成：
   - **category_slug**：分类的英文slug（小写，用连字符分隔），例如："提示词工程" → "prompt-engineering"
   - **category_description**：一句话描述这个分类（20-30字），例如："专注于提示词优化、设计和工程化的工具和方法"
   - **category_icon**：一个合适的emoji图标，例如："提示词工程" → "🔧"、"数据分析" → "📊"、"创意写作" → "✍️"

4. **提示词类型 (prompt_type)**：
   根据内容判断，用中文描述类型，可能的类型包括但不限于：
   - 智能体（角色扮演类）
   - 单次对话（一次性问答）
   - 工作流（多步骤流程）
   - 系列提示词（分多个步骤）
   - 模板（需要填空）
   - 创意生成（文案、图像等）
   - 分析类（数据、代码分析）
   - 自动化（脚本、批处理）
   - 或者你认为更准确的新类型（用中文）
   
   **重要：必须用中文返回**，例如：["智能体", "工作流"]

5. **使用场景 (use_cases)**：
   自由描述这个提示词的应用场景，例如：
   - 代码审查、代码重构、Bug修复
   - 文案写作、营销文案、SEO优化
   - 数据分析、可视化、报告生成
   - 产品设计、用户研究、竞品分析
   - 或者任何你认为准确的场景
   
   提取3-5个最相关的场景

6. **标签 (tags)**：
   完全开放，提取最相关的关键词：
   - 技术栈（Python, React, SQL）
   - 领域（教育, 医疗, 金融）
   - 特性（高效, 专业, 创意）
   - 任何有助于搜索的关键词
   
   3-5个标签

7. **语言 (language)**：
   - 根据提示词内容判断主要语言
   - 可选值：zh-CN（中文）、en-US（英文）、ja-JP（日文）、other（其他）

8. **系列提示词判断 (is_series)**：
   - 如果提示词明确提到"第一步"、"第二步"或"系列"等，设为 true
   - 如果是独立的单个提示词，设为 false 或不返回此字段

**返回格式要求：**
请严格按照以下 JSON 格式返回，不要添加任何其他文字：

\`\`\`json
{
  "title": "标题",
  "description": "描述内容",
  "category": "分类名称",
  "category_slug": "分类名称的英文翻译",
  "category_description": "分类描述",
  "category_icon": "📁",
  "prompt_type": ["提示词类型", "提示词类型"],
  "use_cases": ["使用场景", "使用场景"],
  "tags": ["标签1", "标签2", "标签3"],
  "language": "zh-CN",
  "is_series": false
}
\`\`\`

**注意：prompt_type 和 use_cases 必须用中文！**

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
    result.prompt_type = Array.isArray(result.prompt_type) ? result.prompt_type : [];
    result.use_cases = Array.isArray(result.use_cases) ? result.use_cases : [];

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

