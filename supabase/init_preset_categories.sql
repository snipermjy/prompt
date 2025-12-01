-- 初始化预设分类（17个二级分类 + 5个一级分类）
-- 执行时间: 2025-12-01

-- 清空现有分类（可选，谨慎使用）
-- DELETE FROM categories;

-- 内容创作类（5个）
INSERT INTO categories (name, slug, icon, description, parent_category, display_order, last_updated_at) VALUES
('文字创作', 'text-writing', '📝', '文案、文章、故事、剧本等文字内容', '内容创作', 1, NOW()),
('图像生成', 'image-generation', '🎨', 'Midjourney、Stable Diffusion等图像提示词', '内容创作', 2, NOW()),
('视频创作', 'video-creation', '🎬', '视频脚本、分镜、Sora等视频生成提示词', '内容创作', 3, NOW()),
('音频制作', 'audio-production', '🎵', '音乐、配音、音效生成提示词', '内容创作', 4, NOW()),
('设计创意', 'design-creative', '💡', 'UI/UX设计、平面设计、创意构思', '内容创作', 5, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  parent_category = EXCLUDED.parent_category,
  last_updated_at = NOW();

-- 技术开发类（4个）
INSERT INTO categories (name, slug, icon, description, parent_category, display_order, last_updated_at) VALUES
('代码开发', 'code-development', '💻', '编程、调试、代码审查、重构', '技术开发', 6, NOW()),
('数据分析', 'data-analysis', '📊', '数据处理、可视化、统计分析', '技术开发', 7, NOW()),
('产品设计', 'product-design', '📱', '产品规划、原型设计、用户研究', '技术开发', 8, NOW()),
('技术文档', 'tech-docs', '📝', 'API文档、技术说明、代码注释', '技术开发', 9, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  parent_category = EXCLUDED.parent_category,
  last_updated_at = NOW();

-- 商业运营类（4个）
INSERT INTO categories (name, slug, icon, description, parent_category, display_order, last_updated_at) VALUES
('营销推广', 'marketing', '📢', '营销策略、广告文案、SEO优化', '商业运营', 10, NOW()),
('社交媒体', 'social-media', '📱', '小红书、抖音、微博等平台内容', '商业运营', 11, NOW()),
('商业分析', 'business-analysis', '📈', '市场分析、竞品研究、商业策略', '商业运营', 12, NOW()),
('客户服务', 'customer-service', '💬', '客服话术、用户沟通、售后支持', '商业运营', 13, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  parent_category = EXCLUDED.parent_category,
  last_updated_at = NOW();

-- 效率工具类（3个）
INSERT INTO categories (name, slug, icon, description, parent_category, display_order, last_updated_at) VALUES
('办公助手', 'office-assistant', '📋', '邮件、会议、文档、报告处理', '效率工具', 14, NOW()),
('学习教育', 'education', '📚', '教学辅导、课程设计、知识总结', '效率工具', 15, NOW()),
('自动化工具', 'automation', '⚙️', '脚本编写、工作流自动化、批处理', '效率工具', 16, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  parent_category = EXCLUDED.parent_category,
  last_updated_at = NOW();

-- AI应用类（1个）
INSERT INTO categories (name, slug, icon, description, parent_category, display_order, last_updated_at) VALUES
('AI智能体', 'ai-agent', '🤖', '角色扮演、智能体配置、对话系统', 'AI应用', 17, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  parent_category = EXCLUDED.parent_category,
  last_updated_at = NOW();

-- 完成！共17个预设分类
SELECT '✅ 预设分类初始化完成！共17个分类，分属5个一级分类。' AS status;
