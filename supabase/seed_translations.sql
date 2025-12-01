-- AI提示词库 - 翻译数据
-- 为现有提示词添加英文翻译示例

-- 注意：这个脚本假设已经运行了 seed.sql
-- 需要根据实际的 prompt_id 进行调整

-- 1. 为分类添加英文翻译
INSERT INTO category_translations (category_id, locale, name, description, translation_status, translated_by) 
SELECT 
  id,
  'en' as locale,
  CASE slug
    WHEN 'writing' THEN 'Writing Assistant'
    WHEN 'coding' THEN 'Programming'
    WHEN 'image' THEN 'Image Generation'
    WHEN 'data' THEN 'Data Analysis'
    WHEN 'marketing' THEN 'Marketing'
    WHEN 'education' THEN 'Education'
    WHEN 'life' THEN 'Life Assistant'
    WHEN 'roleplay' THEN 'Role Play'
  END as name,
  CASE slug
    WHEN 'writing' THEN 'Help you create various types of written content'
    WHEN 'coding' THEN 'Code generation, debugging, optimization and more'
    WHEN 'image' THEN 'Prompts for AI image generation tools'
    WHEN 'data' THEN 'Data processing, analysis and visualization'
    WHEN 'marketing' THEN 'Advertising copy, social media content creation'
    WHEN 'education' THEN 'Learning assistance, knowledge explanation'
    WHEN 'life' THEN 'Various practical scenarios in daily life'
    WHEN 'roleplay' THEN 'AI plays specific roles for conversation'
  END as description,
  'published' as translation_status,
  'ai' as translated_by
FROM categories
ON CONFLICT (category_id, locale) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  translation_status = EXCLUDED.translation_status,
  translated_at = NOW();

-- 2. 为提示词添加英文翻译示例
-- 小红书爆款文案生成器
INSERT INTO prompt_translations (prompt_id, locale, title, content, description, translation_status, translated_by)
SELECT 
  id,
  'en' as locale,
  'Xiaohongshu Viral Content Generator' as title,
  'You are a Xiaohongshu viral content expert. Please create a Xiaohongshu-style post based on the topic I provide.

Requirements:
1. Title should be attractive with emojis
2. Content should be clearly segmented, no more than 3 lines per paragraph
3. Use emojis to enhance visual appeal
4. End with engagement prompts (like, save, comment)
5. Include 3-5 relevant hashtags

My topic is: [Enter your topic here]' as content,
  'Quickly generate Xiaohongshu-style viral content, suitable for marketing promotion' as description,
  'published' as translation_status,
  'ai' as translated_by
FROM prompts
WHERE title = '小红书爆款文案生成器'
ON CONFLICT (prompt_id, locale) DO UPDATE
SET 
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  description = EXCLUDED.description,
  translation_status = EXCLUDED.translation_status,
  translated_at = NOW();

-- Python代码优化助手
INSERT INTO prompt_translations (prompt_id, locale, title, content, description, translation_status, translated_by)
SELECT 
  id,
  'en' as locale,
  'Python Code Optimizer' as title,
  'I need you to act as a Python code optimization expert to help me optimize the following code.

Please optimize from these aspects:
1. Performance: Improve execution efficiency
2. Readability: Make code clearer and easier to understand
3. Best Practices: Follow PEP 8 standards
4. Error Handling: Add necessary exception handling
5. Comments: Add clear comments

Please provide the optimized code and explain the reason for each optimization.

My code:
```python
[Paste your code here]
```' as content,
  'Professional Python code optimization suggestions to improve code quality' as description,
  'published' as translation_status,
  'ai' as translated_by
FROM prompts
WHERE title = 'Python代码优化助手'
ON CONFLICT (prompt_id, locale) DO UPDATE
SET 
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  description = EXCLUDED.description,
  translation_status = EXCLUDED.translation_status,
  translated_at = NOW();

-- Midjourney建筑设计提示词（这个本身就是英文，保持原样）
INSERT INTO prompt_translations (prompt_id, locale, title, content, description, translation_status, translated_by)
SELECT 
  id,
  'en' as locale,
  title,
  content,
  description,
  'published' as translation_status,
  'ai' as translated_by
FROM prompts
WHERE title = 'Midjourney建筑设计提示词'
ON CONFLICT (prompt_id, locale) DO UPDATE
SET 
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  description = EXCLUDED.description,
  translation_status = EXCLUDED.translation_status,
  translated_at = NOW();

-- 提示：运行此脚本后，英文界面将显示翻译后的内容
