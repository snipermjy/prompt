-- 移除 target_ai 字段
-- 执行时机：在部署新代码之前手动执行
-- 执行命令：psql -d your_database -f migration_remove_target_ai.sql

-- 1. 删除 target_ai 字段（如果存在的话）
-- 注意：如果字段已经不存在，这个操作会被忽略
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompts' AND column_name = 'target_ai'
  ) THEN
    ALTER TABLE prompts RENAME COLUMN target_ai TO target_ai_deprecated;
  END IF;
END $$;

-- 3. 添加新字段：提示词类型和使用场景
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS prompt_type TEXT[] DEFAULT '{}';
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS use_cases TEXT[] DEFAULT '{}';

-- 4. 添加系列提示词支持
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS series_id UUID;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS series_order INTEGER;

-- 5. 创建系列表
CREATE TABLE IF NOT EXISTS prompt_series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 创建索引
CREATE INDEX IF NOT EXISTS idx_prompts_prompt_type ON prompts USING GIN(prompt_type);
CREATE INDEX IF NOT EXISTS idx_prompts_use_cases ON prompts USING GIN(use_cases);
CREATE INDEX IF NOT EXISTS idx_prompts_series_id ON prompts(series_id);

-- 7. 添加注释
COMMENT ON COLUMN prompts.prompt_type IS '提示词类型：agent/single/workflow/series/template/creative/analysis等';
COMMENT ON COLUMN prompts.use_cases IS '使用场景：代码审查/文案写作/数据分析等，AI自由生成';
COMMENT ON COLUMN prompts.series_id IS '系列ID，如果此提示词属于某个系列';
COMMENT ON COLUMN prompts.series_order IS '在系列中的顺序';

-- 8. 验证迁移结果
DO $$
DECLARE
    total_count INTEGER;
    type_count INTEGER;
    cases_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM prompts;
    SELECT COUNT(*) INTO type_count FROM prompts WHERE prompt_type IS NOT NULL;
    SELECT COUNT(*) INTO cases_count FROM prompts WHERE use_cases IS NOT NULL;
    
    RAISE NOTICE '迁移完成！';
    RAISE NOTICE '总提示词数: %', total_count;
    RAISE NOTICE '已有类型数据: %', type_count;
    RAISE NOTICE '已有场景数据: %', cases_count;
END $$;
