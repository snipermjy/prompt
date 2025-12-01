-- 添加二级分类支持和管理员通知系统
-- 执行时间: 2025-12-01

-- 1. 在 categories 表添加 parent_category 和 last_updated_at 字段
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_category VARCHAR(50);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. 创建管理员通知表
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_categories_parent_category ON categories(parent_category);
CREATE INDEX IF NOT EXISTS idx_categories_last_updated_at ON categories(last_updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);

-- 4. 创建触发器：当有新提示词添加到分类时，更新分类的 last_updated_at
CREATE OR REPLACE FUNCTION update_category_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE categories 
  SET last_updated_at = NOW() 
  WHERE slug = NEW.category;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS trigger_update_category_timestamp ON prompts;

-- 创建新触发器
CREATE TRIGGER trigger_update_category_timestamp
AFTER INSERT OR UPDATE ON prompts
FOR EACH ROW
EXECUTE FUNCTION update_category_timestamp();

-- 5. 设置现有分类的 parent_category（手动设置或通过脚本）
-- 这里提供一个示例，实际需要根据现有数据调整

-- 内容创作类
UPDATE categories SET parent_category = '内容创作' 
WHERE slug IN ('text-writing', 'image-generation', 'video-creation', 'audio-production', 'design-creative');

-- 技术开发类
UPDATE categories SET parent_category = '技术开发' 
WHERE slug IN ('code-development', 'data-analysis', 'product-design', 'tech-docs');

-- 商业运营类
UPDATE categories SET parent_category = '商业运营' 
WHERE slug IN ('marketing', 'social-media', 'business-analysis', 'customer-service');

-- 效率工具类
UPDATE categories SET parent_category = '效率工具' 
WHERE slug IN ('office-assistant', 'education', 'automation');

-- AI应用类
UPDATE categories SET parent_category = 'AI应用' 
WHERE slug IN ('ai-agent');

-- 6. 初始化 last_updated_at 为当前时间
UPDATE categories SET last_updated_at = NOW() WHERE last_updated_at IS NULL;

-- 7. 允许所有人读取通知（管理员）
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- 注意：实际使用时需要配置适当的 RLS 策略，这里仅作示例
-- 管理员权限通过 service_role key 访问，不需要额外的 RLS 策略

-- 完成！
