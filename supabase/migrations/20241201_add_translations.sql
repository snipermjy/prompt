-- ============================================================================
-- 国际化翻译表
-- 创建时间: 2024-12-01
-- 说明: 添加提示词和分类的多语言翻译支持
-- ============================================================================

-- 1. 提示词翻译表
-- ============================================================================
CREATE TABLE IF NOT EXISTS prompt_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL CHECK (locale IN ('zh', 'en')),
  
  -- 翻译内容
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  tags TEXT[],
  use_cases TEXT[],
  prompt_type TEXT[],
  
  -- 翻译元数据
  translation_status VARCHAR(20) DEFAULT 'pending' CHECK (
    translation_status IN ('pending', 'ai_translated', 'reviewed', 'published')
  ),
  translated_by VARCHAR(50), -- 'ai' or user_id
  translated_at TIMESTAMP DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 约束：每个提示词的每种语言只能有一条翻译
  UNIQUE(prompt_id, locale)
);

-- 2. 分类翻译表
-- ============================================================================
CREATE TABLE IF NOT EXISTS category_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL CHECK (locale IN ('zh', 'en')),
  
  -- 翻译内容
  name TEXT NOT NULL,
  description TEXT,
  
  -- 翻译元数据
  translation_status VARCHAR(20) DEFAULT 'pending' CHECK (
    translation_status IN ('pending', 'ai_translated', 'reviewed', 'published')
  ),
  translated_by VARCHAR(50),
  translated_at TIMESTAMP DEFAULT NOW(),
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 约束
  UNIQUE(category_id, locale)
);

-- 3. 索引优化
-- ============================================================================

-- 提示词翻译索引
CREATE INDEX IF NOT EXISTS idx_prompt_translations_prompt_locale 
  ON prompt_translations(prompt_id, locale);

CREATE INDEX IF NOT EXISTS idx_prompt_translations_status 
  ON prompt_translations(translation_status);

CREATE INDEX IF NOT EXISTS idx_prompt_translations_locale 
  ON prompt_translations(locale);

-- 分类翻译索引
CREATE INDEX IF NOT EXISTS idx_category_translations_category_locale 
  ON category_translations(category_id, locale);

CREATE INDEX IF NOT EXISTS idx_category_translations_locale 
  ON category_translations(locale);

-- 4. 自动更新时间戳触发器
-- ============================================================================

-- 创建或替换更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 提示词翻译表触发器
DROP TRIGGER IF EXISTS update_prompt_translations_updated_at ON prompt_translations;
CREATE TRIGGER update_prompt_translations_updated_at 
  BEFORE UPDATE ON prompt_translations
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 分类翻译表触发器
DROP TRIGGER IF EXISTS update_category_translations_updated_at ON category_translations;
CREATE TRIGGER update_category_translations_updated_at 
  BEFORE UPDATE ON category_translations
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS (Row Level Security) 策略
-- ============================================================================

-- 启用 RLS
ALTER TABLE prompt_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;

-- 提示词翻译：所有人可读，只有管理员可写
CREATE POLICY "prompt_translations_select_policy" 
  ON prompt_translations FOR SELECT 
  USING (true);

CREATE POLICY "prompt_translations_insert_policy" 
  ON prompt_translations FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "prompt_translations_update_policy" 
  ON prompt_translations FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "prompt_translations_delete_policy" 
  ON prompt_translations FOR DELETE 
  USING (auth.role() = 'authenticated');

-- 分类翻译：所有人可读，只有管理员可写
CREATE POLICY "category_translations_select_policy" 
  ON category_translations FOR SELECT 
  USING (true);

CREATE POLICY "category_translations_insert_policy" 
  ON category_translations FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "category_translations_update_policy" 
  ON category_translations FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "category_translations_delete_policy" 
  ON category_translations FOR DELETE 
  USING (auth.role() = 'authenticated');

-- 6. 注释
-- ============================================================================

COMMENT ON TABLE prompt_translations IS '提示词多语言翻译表';
COMMENT ON TABLE category_translations IS '分类多语言翻译表';

COMMENT ON COLUMN prompt_translations.translation_status IS '翻译状态: pending(待翻译), ai_translated(AI已翻译), reviewed(已审核), published(已发布)';
COMMENT ON COLUMN prompt_translations.translated_by IS '翻译者: ai 或用户ID';
COMMENT ON COLUMN prompt_translations.tags IS '翻译后的标签数组';
COMMENT ON COLUMN prompt_translations.use_cases IS '翻译后的使用场景数组';
COMMENT ON COLUMN prompt_translations.prompt_type IS '翻译后的提示词类型数组';

COMMENT ON COLUMN category_translations.translation_status IS '翻译状态: pending(待翻译), ai_translated(AI已翻译), reviewed(已审核), published(已发布)';
COMMENT ON COLUMN category_translations.translated_by IS '翻译者: ai 或用户ID';
