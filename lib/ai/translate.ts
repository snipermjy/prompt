/**
 * AI 翻译功能
 * 使用硅基流动 DeepSeek API 进行中英文互译
 */

/**
 * 翻译结果接口
 */
export interface TranslationResult {
  title: string;
  description?: string;
  content: string;
  tags?: string[]; // 翻译后的标签
  use_cases?: string[]; // 翻译后的使用场景
  prompt_type?: string[]; // 翻译后的提示词类型
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
        temperature: 0.3, // 翻译使用较低温度以保证准确性
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API 错误:', errorText);
      throw new Error(`AI API 调用失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
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
 * 中文翻译成英文
 */
export async function translateToEnglish(
  title: string,
  description: string | undefined,
  content: string,
  tags?: string[],
  use_cases?: string[],
  prompt_type?: string[]
): Promise<TranslationResult> {
  const systemPrompt = `你是一个专业的中英文翻译专家，专门翻译 AI 提示词相关内容。

**翻译要求：**

1. **准确性**：
   - 准确传达原文含义
   - 保持专业术语的准确性
   - 不要添加或删减原文信息

2. **自然性**：
   - 使用地道的英文表达
   - 符合英文的语言习惯
   - 避免中式英语

3. **专业性**：
   - AI 相关术语使用行业标准翻译
   - 保持技术内容的专业性
   - 常见术语参考：
     * 提示词 → Prompt
     * 角色扮演 → Role-playing
     * 工作流 → Workflow
     * 智能体 → Agent
     * 上下文 → Context

4. **格式保持**：
   - 保持原文的换行和段落结构
   - 保持 Markdown 格式（如果有）
   - 保持特殊符号和标点

**输入内容：**

标题：${title}

${description ? `描述：${description}` : ''}

${tags && tags.length > 0 ? `标签：${tags.join(', ')}` : ''}

${use_cases && use_cases.length > 0 ? `使用场景：${use_cases.join(', ')}` : ''}

${prompt_type && prompt_type.length > 0 ? `提示词类型：${prompt_type.join(', ')}` : ''}

提示词内容：
---
${content}
---

**输出要求：**
请严格按照以下 JSON 格式返回翻译结果，不要添加任何其他文字：

\`\`\`json
{
  "title": "翻译后的标题",
  "description": "${description ? '翻译后的描述' : ''}",
  "content": "翻译后的提示词内容"${tags && tags.length > 0 ? ',\n  "tags": ["翻译后的标签1", "翻译后的标签2"]' : ''}${use_cases && use_cases.length > 0 ? ',\n  "use_cases": ["翻译后的场景1", "翻译后的场景2"]' : ''}${prompt_type && prompt_type.length > 0 ? ',\n  "prompt_type": ["翻译后的类型1", "翻译后的类型2"]' : ''}
}
\`\`\`

请开始翻译：`;

  try {
    const aiResponse = await callDeepSeekAPI(systemPrompt);

    // 提取 JSON 内容
    let jsonStr = aiResponse.trim();
    
    const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }
    }

    const result = JSON.parse(jsonStr) as TranslationResult;

    // 验证必需字段
    if (!result.title || !result.content) {
      throw new Error('AI 返回的翻译数据缺少必需字段');
    }

    return result;
  } catch (error) {
    console.error('AI 翻译失败:', error);
    throw new Error('AI 翻译失败，请稍后重试');
  }
}

/**
 * 英文翻译成中文
 */
export async function translateToChinese(
  title: string,
  description: string | undefined,
  content: string
): Promise<TranslationResult> {
  const systemPrompt = `你是一个专业的英中文翻译专家，专门翻译 AI 提示词相关内容。

**翻译要求：**

1. **准确性**：
   - 准确传达原文含义
   - 保持专业术语的准确性
   - 不要添加或删减原文信息

2. **自然性**：
   - 使用地道的中文表达
   - 符合中文的语言习惯
   - 流畅易读

3. **专业性**：
   - AI 相关术语使用行业标准翻译
   - 保持技术内容的专业性

4. **格式保持**：
   - 保持原文的换行和段落结构
   - 保持 Markdown 格式（如果有）
   - 保持特殊符号和标点

**输入内容：**

Title: ${title}

${description ? `Description: ${description}` : ''}

Prompt Content:
---
${content}
---

**输出要求：**
请严格按照以下 JSON 格式返回翻译结果，不要添加任何其他文字：

\`\`\`json
{
  "title": "翻译后的标题",
  "description": "${description ? '翻译后的描述' : ''}",
  "content": "翻译后的提示词内容"
}
\`\`\`

请开始翻译：`;

  try {
    const aiResponse = await callDeepSeekAPI(systemPrompt);

    let jsonStr = aiResponse.trim();
    
    const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }
    }

    const result = JSON.parse(jsonStr) as TranslationResult;

    if (!result.title || !result.content) {
      throw new Error('AI 返回的翻译数据缺少必需字段');
    }

    return result;
  } catch (error) {
    console.error('AI 翻译失败:', error);
    throw new Error('AI 翻译失败，请稍后重试');
  }
}

/**
 * 翻译分类名称和描述
 */
export async function translateCategory(
  name: string,
  description: string | undefined,
  targetLocale: 'zh' | 'en'
): Promise<{ name: string; description?: string }> {
  const isToEnglish = targetLocale === 'en';
  
  const systemPrompt = isToEnglish
    ? `你是一个专业的中英文翻译专家。请将以下分类名称和描述翻译成英文。

**翻译要求：**
- 分类名称要简洁（2-4个单词）
- 描述要准确传达原文含义
- 使用专业的行业术语

**输入：**
分类名称：${name}
${description ? `分类描述：${description}` : ''}

**输出格式：**
\`\`\`json
{
  "name": "Category Name",
  "description": "${description ? 'Category description' : ''}"
}
\`\`\`

请开始翻译：`
    : `你是一个专业的英中文翻译专家。请将以下分类名称和描述翻译成中文。

**翻译要求：**
- 分类名称要简洁（2-6个字）
- 描述要准确传达原文含义
- 使用专业的行业术语

**输入：**
Category Name: ${name}
${description ? `Category Description: ${description}` : ''}

**输出格式：**
\`\`\`json
{
  "name": "分类名称",
  "description": "${description ? '分类描述' : ''}"
}
\`\`\`

请开始翻译：`;

  try {
    const aiResponse = await callDeepSeekAPI(systemPrompt);

    let jsonStr = aiResponse.trim();
    
    const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }
    }

    const result = JSON.parse(jsonStr) as { name: string; description?: string };

    if (!result.name) {
      throw new Error('AI 返回的翻译数据缺少分类名称');
    }

    return result;
  } catch (error) {
    console.error('AI 翻译分类失败:', error);
    throw new Error('AI 翻译失败，请稍后重试');
  }
}
