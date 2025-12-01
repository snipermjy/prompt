-- 为 prompt_translations 表添加 tags 字段
-- 用于存储翻译后的标签

ALTER TABLE prompt_translations 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 添加注释
COMMENT ON COLUMN prompt_translations.tags IS '翻译后的标签数组';
