-- 验证并创建 increment_prompt_counter RPC 函数
-- 这个脚本可以在 Supabase SQL Editor 中运行

-- 1. 删除旧函数（如果存在）
DROP FUNCTION IF EXISTS increment_prompt_counter(UUID, TEXT);

-- 2. 创建原子递增函数（避免 race condition）
CREATE OR REPLACE FUNCTION increment_prompt_counter(
  prompt_id UUID,
  counter_name TEXT
)
RETURNS VOID AS $$
BEGIN
  -- 只允许特定的计数器名称
  IF counter_name NOT IN ('view_count', 'copy_count', 'share_count') THEN
    RAISE EXCEPTION 'Invalid counter name: %', counter_name;
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
  
  -- 记录日志（可选，用于调试）
  RAISE NOTICE 'Updated % for prompt %', counter_name, prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 授予权限
GRANT EXECUTE ON FUNCTION increment_prompt_counter(UUID, TEXT) TO anon, authenticated;

-- 4. 验证函数是否创建成功
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  prosecdef as security_definer
FROM pg_proc 
WHERE proname = 'increment_prompt_counter';

-- 5. 测试函数（使用一个存在的 prompt_id）
-- 注意：请将下面的 UUID 替换为你数据库中实际存在的 prompt ID
-- SELECT increment_prompt_counter('your-prompt-id-here'::UUID, 'view_count');
