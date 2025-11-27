-- AI提示词库 - 数据库表结构
-- 参考: docs/数据库设计文档.md

-- 1. 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(10) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建提示词表
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  target_ai TEXT[] DEFAULT '{}',
  difficulty VARCHAR(20) DEFAULT 'beginner',
  language VARCHAR(10) DEFAULT 'zh-CN',
  view_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  author_name VARCHAR(100),
  author_link VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT prompts_difficulty_check CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  CONSTRAINT prompts_language_check CHECK (language IN ('zh-CN', 'en-US', 'ja-JP', 'other')),
  CONSTRAINT prompts_status_check CHECK (status IN ('draft', 'pending', 'published', 'rejected'))
);

-- 3. 创建用户提交表
CREATE TABLE IF NOT EXISTS user_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200),
  content TEXT NOT NULL,
  description TEXT,
  submitter_name VARCHAR(100),
  submitter_email VARCHAR(100),
  author_name VARCHAR(100),
  author_link VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT user_submissions_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_view_count ON prompts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_user_submissions_status ON user_submissions(status);

-- 5. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. 设置 RLS (行级安全策略)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_submissions ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取已发布的提示词
CREATE POLICY "允许读取已发布的提示词" ON prompts
  FOR SELECT USING (status = 'published');

-- 允许所有人读取分类
CREATE POLICY "允许读取所有分类" ON categories
  FOR SELECT USING (true);

-- 允许所有人创建提交
CREATE POLICY "允许创建用户提交" ON user_submissions
  FOR INSERT WITH CHECK (true);

-- 注意: 管理员权限需要使用 service_role key，不需要额外的 RLS 策略

-- 7. 创建原子递增函数（避免 race condition）
CREATE OR REPLACE FUNCTION increment_prompt_counter(
  prompt_id UUID,
  counter_name TEXT
)
RETURNS VOID AS $$
BEGIN
  -- 只允许特定的计数器名称
  IF counter_name NOT IN ('view_count', 'copy_count', 'share_count') THEN
    RAISE EXCEPTION 'Invalid counter name';
  END IF;
  
  -- 只更新已发布的提示词
  IF counter_name = 'view_count' THEN
    UPDATE prompts SET view_count = view_count + 1 
    WHERE id = prompt_id AND status = 'published';
  ELSIF counter_name = 'copy_count' THEN
    UPDATE prompts SET copy_count = copy_count + 1 
    WHERE id = prompt_id AND status = 'published';
  ELSIF counter_name = 'share_count' THEN
    UPDATE prompts SET share_count = share_count + 1 
    WHERE id = prompt_id AND status = 'published';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 允许所有人调用计数器函数
GRANT EXECUTE ON FUNCTION increment_prompt_counter(UUID, TEXT) TO anon, authenticated;

