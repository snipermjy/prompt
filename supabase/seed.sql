-- AI提示词库 - 初始数据
-- 插入分类和测试数据

-- 1. 插入分类数据
INSERT INTO categories (name, slug, icon, description, display_order) VALUES
  ('写作助手', 'writing', '✍️', '帮助你创作各类文字内容', 1),
  ('编程开发', 'coding', '💻', '代码生成、调试、优化等编程辅助', 2),
  ('图像生成', 'image', '🎨', '用于AI绘画工具的提示词', 3),
  ('数据分析', 'data', '📊', '数据处理、分析和可视化', 4),
  ('营销文案', 'marketing', '📢', '广告文案、社交媒体内容创作', 5),
  ('学习教育', 'education', '📚', '学习辅导、知识讲解', 6),
  ('生活助手', 'life', '🏠', '日常生活中的各种实用场景', 7),
  ('角色扮演', 'roleplay', '🎭', 'AI扮演特定角色进行对话', 8)
ON CONFLICT (slug) DO NOTHING;

-- 2. 插入测试提示词数据
INSERT INTO prompts (
  title, 
  content, 
  description, 
  category, 
  tags, 
  target_ai, 
  difficulty, 
  language, 
  status,
  view_count,
  copy_count,
  author_name,
  author_link
) VALUES
(
  '小红书爆款文案生成器',
  '你是一位小红书爆款文案专家。请根据我提供的主题，创作一篇小红书风格的文案。

要求：
1. 标题要有吸引力，使用emoji
2. 内容分段清晰，每段不超过3行
3. 多使用emoji增加视觉效果
4. 结尾引导互动（点赞、收藏、评论）
5. 加入3-5个相关话题标签

我的主题是：[在这里输入你的主题]',
  '快速生成小红书风格的爆款文案，适合营销推广',
  'marketing',
  ARRAY['小红书', '文案', '营销', '社交媒体'],
  ARRAY['ChatGPT', 'Claude', '文心一言'],
  'beginner',
  'zh-CN',
  'published',
  1234,
  567,
  'AI写作助手',
  'https://xiaohongshu.com/user/profile/xxx'
),
(
  'Python代码优化助手',
  '我需要你作为一位Python代码优化专家，帮我优化以下代码。

请从以下几个方面进行优化：
1. 性能优化：提高运行效率
2. 代码可读性：使代码更清晰易懂
3. 最佳实践：遵循PEP 8规范
4. 错误处理：添加必要的异常处理
5. 注释说明：添加清晰的注释

请给出优化后的代码，并说明每处优化的理由。

我的代码：
```python
[在这里粘贴你的代码]
```',
  '专业的Python代码优化建议，提升代码质量',
  'coding',
  ARRAY['Python', '代码优化', '编程'],
  ARRAY['ChatGPT', 'Claude', 'Copilot'],
  'intermediate',
  'zh-CN',
  'published',
  892,
  234,
  NULL,
  NULL
),
(
  'Midjourney建筑设计提示词',
  'architectural photography of a modern minimalist house, white concrete walls, large glass windows, surrounded by lush green garden, golden hour lighting, shot with Canon EOS R5, professional composition, ultra detailed, 8k resolution --ar 16:9 --v 6',
  '用于生成现代建筑设计图的专业提示词',
  'image',
  ARRAY['Midjourney', '建筑设计', 'AI绘画'],
  ARRAY['Midjourney', 'Stable Diffusion'],
  'advanced',
  'en-US',
  'published',
  2156,
  789,
  'AI绘画大师',
  'https://space.bilibili.com/xxx'
),
(
  'Excel公式生成器',
  '我需要你作为Excel公式专家，帮我生成所需的公式。

请根据我的需求：
1. 生成准确的Excel公式
2. 说明公式的作用
3. 提供使用示例
4. 如果有多种实现方式，请给出最优方案
5. 标注需要注意的事项

我的需求是：[在这里描述你的需求]',
  '快速生成各类Excel公式，提高工作效率',
  'data',
  ARRAY['Excel', '数据处理', '办公'],
  ARRAY['ChatGPT', 'Claude'],
  'beginner',
  'zh-CN',
  'published',
  567,
  123,
  NULL,
  NULL
),
(
  '英语口语陪练助手',
  '你是一位专业的英语口语教练。让我们进行英语对话练习。

规则：
1. 根据我的水平调整难度（初级/中级/高级）
2. 在对话中自然地纠正我的错误
3. 每次对话后总结常见错误和改进建议
4. 教我地道的表达方式
5. 鼓励我多说多练

我的英语水平：[初级/中级/高级]
想练习的场景：[日常对话/商务英语/旅游英语等]

让我们开始吧！',
  '与AI进行英语口语练习，提升英语表达能力',
  'education',
  ARRAY['英语学习', '口语练习', '教育'],
  ARRAY['ChatGPT', 'Claude'],
  'beginner',
  'zh-CN',
  'published',
  1543,
  432,
  NULL,
  NULL
);

-- 3. 插入一些待审核的用户提交（测试数据）
INSERT INTO user_submissions (
  content,
  description,
  submitter_name,
  submitter_email,
  author_name,
  author_link,
  status
) VALUES
(
  '你是一位专业的简历优化专家，帮我优化简历内容...',
  '简历优化助手，让简历更专业更有吸引力',
  '张三',
  'zhangsan@example.com',
  '职场导师',
  'https://www.zhihu.com/people/xxx',
  'pending'
),
(
  '请帮我生成一个健身计划，我的目标是...',
  '个性化健身计划生成器',
  '李四',
  'lisi@example.com',
  NULL,
  NULL,
  'pending'
);

