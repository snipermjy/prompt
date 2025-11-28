/**
 * 测试计数器功能的脚本
 * 运行方式: npx tsx scripts/test-counter.ts
 */

import { createClient } from '@supabase/supabase-js';

// 从环境变量读取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 缺少环境变量:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testCounter() {
  console.log('🔍 开始测试计数器功能...\n');

  // 1. 获取一个已发布的提示词
  console.log('1️⃣ 获取已发布的提示词...');
  const { data: prompts, error: fetchError } = await supabase
    .from('prompts')
    .select('id, title, view_count, copy_count, share_count, status')
    .eq('status', 'published')
    .limit(1);

  if (fetchError) {
    console.error('❌ 获取提示词失败:', fetchError);
    return;
  }

  if (!prompts || prompts.length === 0) {
    console.error('❌ 没有找到已发布的提示词');
    return;
  }

  const prompt = prompts[0];
  console.log('✅ 找到提示词:', prompt.title);
  console.log('   ID:', prompt.id);
  console.log('   当前统计:', {
    view_count: prompt.view_count,
    copy_count: prompt.copy_count,
    share_count: prompt.share_count,
  });
  console.log();

  // 2. 测试 RPC 函数是否存在
  console.log('2️⃣ 测试 RPC 函数...');
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    'increment_prompt_counter',
    {
      prompt_id: prompt.id,
      counter_name: 'view_count',
    }
  );

  if (rpcError) {
    console.error('❌ RPC 调用失败:', rpcError);
    console.error('   错误代码:', rpcError.code);
    console.error('   错误信息:', rpcError.message);
    console.error('   错误详情:', rpcError.details);
    console.error('   错误提示:', rpcError.hint);
    return;
  }

  console.log('✅ RPC 调用成功');
  console.log();

  // 3. 验证计数是否增加
  console.log('3️⃣ 验证计数是否增加...');
  const { data: updatedPrompts, error: verifyError } = await supabase
    .from('prompts')
    .select('view_count, copy_count, share_count')
    .eq('id', prompt.id)
    .single();

  if (verifyError) {
    console.error('❌ 验证失败:', verifyError);
    return;
  }

  console.log('✅ 更新后的统计:', updatedPrompts);
  console.log('   浏览量变化:', prompt.view_count, '->', updatedPrompts.view_count);
  
  if (updatedPrompts.view_count === prompt.view_count + 1) {
    console.log('✅ 计数器工作正常！');
  } else {
    console.log('❌ 计数器没有增加');
  }
  console.log();

  // 4. 测试其他计数器
  console.log('4️⃣ 测试复制量计数器...');
  const { error: copyError } = await supabase.rpc('increment_prompt_counter', {
    prompt_id: prompt.id,
    counter_name: 'copy_count',
  });

  if (copyError) {
    console.error('❌ 复制量计数失败:', copyError);
  } else {
    console.log('✅ 复制量计数成功');
  }

  console.log('\n✅ 测试完成！');
}

testCounter().catch(console.error);
