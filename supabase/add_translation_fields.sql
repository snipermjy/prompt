-- 为 prompt_translations 表添加 tags, use_cases, prompt_type 字段
-- 用于存储翻译后的标签、使用场景和提示词类型

ALTER TABLE prompt_translations 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS use_cases text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS prompt_type text[] DEFAULT '{}';

-- 添加注释
COMMENT ON COLUMN prompt_translations.tags IS '翻译后的标签数组';
COMMENT ON COLUMN prompt_translations.use_cases IS '翻译后的使用场景数组';
COMMENT ON COLUMN prompt_translations.prompt_type IS '翻译后的提示词类型数组';
