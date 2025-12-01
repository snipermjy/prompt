'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { BatchTask, BatchTaskStats } from '@/lib/types/batch';
import type { Category } from '@/lib/types/database';
import type { AIGeneratedMetadata } from '@/lib/ai/generate';
import { getCategories } from '@/app/actions/categories';
import { createPrompt, checkDuplicates } from '@/app/actions/prompts';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { BatchDuplicateChecker } from '@/components/ui/DuplicateChecker';
import DuplicateChecker from '@/components/ui/DuplicateChecker';
import TaskDetailModal from './TaskDetailModal';
import TaskEditForm from './TaskEditForm';

const STORAGE_KEY = 'batch_tasks';
const DEBUG = process.env.NODE_ENV === 'development'; // 开发环境启用调试日志

// 调试日志辅助函数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.log(...args);
  }
};

/**
 * 批量添加提示词页面
 */
export default function BatchAddPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [tasks, setTasks] = useState<BatchTask[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [duplicateResults, setDuplicateResults] = useState<any[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [singleDuplicateTask, setSingleDuplicateTask] = useState<BatchTask | null>(null);
  const tasksRef = useRef<BatchTask[]>([]);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 加载分类
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // 从localStorage恢复任务
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTasks(parsed);
      } catch (e) {
        console.error('Failed to restore tasks:', e);
      }
    }
  }, []);

  // 保存任务到localStorage并同步ref
  useEffect(() => {
    tasksRef.current = tasks;
    if (tasks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } else {
      // 如果任务列表为空，清除localStorage
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [tasks]);

  // 组件卸载时清理所有超时和请求
  useEffect(() => {
    // 在 effect 运行时捕获当前的 Map 引用，避免在 cleanup 中直接访问 ref.current
    const abortControllers = abortControllersRef.current;
    const timeouts = timeoutsRef.current;

    return () => {
      // 取消所有进行中的请求
      abortControllers.forEach((controller) => {
        controller.abort();
      });
      abortControllers.clear();
      
      // 清理所有超时
      timeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
      timeouts.clear();
      
      debugLog('批量处理页面卸载，已清理所有资源');
    };
  }, []);

  // 计算统计信息
  const stats: BatchTaskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    processing: tasks.filter(t => t.status === 'processing').length,
    success: tasks.filter(t => t.status === 'success').length,
    error: tasks.filter(t => t.status === 'error').length,
  };

  // 添加任务
  const handleAddTask = () => {
    if (!content.trim()) {
      alert('请输入提示词内容');
      return;
    }

    if (content.trim().length < 20) {
      alert('提示词内容至少需要20个字符');
      return;
    }

    const newTask: BatchTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      status: 'pending',
      progress: 0,
      progressText: '等待处理',
      result: null,
      translation: null,
      translationStatus: 'pending',
      translationError: null,
      error: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      selected: false,
      isEditing: false,
    };

    setTasks(prev => [...prev, newTask]);
    setContent('');

    // 立即开始处理这个任务，直接传递content
    processTask(newTask.id, newTask.content);
  };

  // 处理单个任务（跳过重复检测，直接AI分析）
  const processTaskWithAI = async (taskId: string, taskContent?: string) => {
    // 如果没有传content，从ref获取
    if (!taskContent) {
      const task = tasksRef.current.find(t => t.id === taskId);
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }
      taskContent = task.content;
    }

    // 更新状态为处理中
    updateTask(taskId, {
      status: 'processing',
      progress: 10,
      progressText: '正在连接AI服务...',
    });

    // 清理旧的controller和timeout
    const oldController = abortControllersRef.current.get(taskId);
    if (oldController) {
      oldController.abort();
      abortControllersRef.current.delete(taskId);
    }
    const oldTimeout = timeoutsRef.current.get(taskId);
    if (oldTimeout) {
      clearTimeout(oldTimeout);
      timeoutsRef.current.delete(taskId);
    }

    // 使用 AbortController 来支持取消请求
    const abortController = new AbortController();
    abortControllersRef.current.set(taskId, abortController);
    let isTimedOut = false;

    try {
      // 设置超时（60秒）
      debugLog(`[${taskId}] 设置60秒超时计时器 (processTaskWithAI)`);
      const startTime = Date.now();
      const timeoutId = setTimeout(() => {
        const elapsed = Date.now() - startTime;
        debugLog(`[${taskId}] ⏰ 超时触发！已等待 ${elapsed}ms`);
        isTimedOut = true;
        abortController.abort(); // 取消请求
        abortControllersRef.current.delete(taskId);
        timeoutsRef.current.delete(taskId);
        updateTask(taskId, {
          status: 'error',
          progress: 0,
          progressText: '处理超时',
          error: 'AI处理超时（60秒），请重试或检查网络连接。如果持续超时，可能是AI服务繁忙。',
        });
      }, 60000); // 60秒超时
      
      timeoutsRef.current.set(taskId, timeoutId);

      // 调用AI生成
      updateTask(taskId, {
        progress: 30,
        progressText: '正在分析内容...',
      });

      debugLog(`[${taskId}] 开始fetch请求 (processTaskWithAI)...`);
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: taskContent }),
        signal: abortController.signal, // 添加取消信号
      });

      updateTask(taskId, {
        progress: 60,
        progressText: '正在处理结果...',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `AI生成失败 (HTTP ${response.status})`);
      }

      if (data.success && data.data) {
        // 清理timeout和controller
        const timeoutId = timeoutsRef.current.get(taskId);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutsRef.current.delete(taskId);
        }
        abortControllersRef.current.delete(taskId);
        
        updateTask(taskId, {
          status: 'success',
          progress: 85,
          progressText: '开始翻译...',
          result: { ...data.data, duplicates: [] },
        });
        
        // 立即开始翻译
        console.log('AI分析成功，调用translateTask:', taskId, data.data);
        translateTask(taskId, data.data);
      } else {
        throw new Error('AI返回数据格式错误');
      }
    } catch (error) {
      // 清理timeout和controller
      const timeoutId = timeoutsRef.current.get(taskId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutsRef.current.delete(taskId);
      }
      abortControllersRef.current.delete(taskId);
      
      // 如果是超时导致的取消，不需要再次更新状态
      if (isTimedOut) {
        return;
      }
      
      // 如果是用户取消
      if (error instanceof Error && error.name === 'AbortError') {
        updateTask(taskId, {
          status: 'error',
          progress: 0,
          progressText: '已取消',
          error: '请求已被取消',
        });
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('批量处理错误:', errorMessage, error);
      
      updateTask(taskId, {
        status: 'error',
        progress: 0,
        progressText: '生成失败',
        error: errorMessage,
      });
    }
  };

  // 处理单个任务（包含重复检测）
  const processTask = async (taskId: string, taskContent?: string) => {
    // 如果没有传content，从ref获取
    if (!taskContent) {
      const task = tasksRef.current.find(t => t.id === taskId);
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }
      taskContent = task.content;
    }

    // 更新状态为处理中
    updateTask(taskId, {
      status: 'processing',
      progress: 5,
      progressText: '正在连接AI服务...',
    });

    // 清理旧的controller和timeout
    const oldController = abortControllersRef.current.get(taskId);
    if (oldController) {
      oldController.abort();
      abortControllersRef.current.delete(taskId);
    }
    const oldTimeout = timeoutsRef.current.get(taskId);
    if (oldTimeout) {
      clearTimeout(oldTimeout);
      timeoutsRef.current.delete(taskId);
    }

    // 使用 AbortController 来支持取消请求
    const abortController = new AbortController();
    abortControllersRef.current.set(taskId, abortController);
    let isTimedOut = false;
    
    try {
      // 直接开始AI分析，不做前置重复检测（提高速度）
      updateTask(taskId, {
        progress: 10,
        progressText: '正在连接AI服务...',
      });

      // 设置超时（60秒）
      debugLog(`[${taskId}] 设置60秒超时计时器 (processTask)`);
      const startTime = Date.now();
      const timeoutId = setTimeout(() => {
        const elapsed = Date.now() - startTime;
        debugLog(`[${taskId}] ⏰ 超时触发！已等待 ${elapsed}ms`);
        isTimedOut = true;
        abortController.abort(); // 取消请求
        abortControllersRef.current.delete(taskId);
        timeoutsRef.current.delete(taskId);
        updateTask(taskId, {
          status: 'error',
          progress: 0,
          progressText: '处理超时',
          error: 'AI处理超时（60秒），请重试或检查网络连接。如果持续超时，可能是AI服务繁忙。',
        });
      }, 60000); // 60秒超时
      
      timeoutsRef.current.set(taskId, timeoutId);

      // 调用AI生成
      updateTask(taskId, {
        progress: 30,
        progressText: '正在分析内容...',
      });

      debugLog(`[${taskId}] 开始fetch请求 (processTask)...`);
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: taskContent }),
        signal: abortController.signal, // 添加取消信号
      });

      updateTask(taskId, {
        progress: 60,
        progressText: '正在处理结果...',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `AI生成失败 (HTTP ${response.status})`);
      }

      if (data.success && data.data) {
        // AI生成成功后，检查重复
        updateTask(taskId, {
          progress: 80,
          progressText: '检查重复中...',
        });

        const duplicates = await checkDuplicates(taskContent, data.data.title);
        
        // 清理timeout和controller
        const tid = timeoutsRef.current.get(taskId);
        if (tid) {
          clearTimeout(tid);
          timeoutsRef.current.delete(taskId);
        }
        abortControllersRef.current.delete(taskId);
        
        updateTask(taskId, {
          status: 'success',
          progress: 85,
          progressText: '开始翻译...',
          result: { ...data.data, duplicates },
        });
        
        // 立即开始翻译
        translateTask(taskId, data.data);
      } else {
        throw new Error('AI返回数据格式错误');
      }
    } catch (error) {
      // 清理timeout和controller
      const tid = timeoutsRef.current.get(taskId);
      if (tid) {
        clearTimeout(tid);
        timeoutsRef.current.delete(taskId);
      }
      abortControllersRef.current.delete(taskId);
      
      // 如果是超时导致的取消，不需要再次更新状态
      if (isTimedOut) {
        return;
      }
      
      // 如果是用户取消
      if (error instanceof Error && error.name === 'AbortError') {
        updateTask(taskId, {
          status: 'error',
          progress: 0,
          progressText: '已取消',
          error: '请求已被取消',
        });
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('批量处理错误:', errorMessage, error);
      
      updateTask(taskId, {
        status: 'error',
        progress: 0,
        progressText: '生成失败',
        error: errorMessage,
      });
    }
  };

  // 翻译任务
  const translateTask = async (taskId: string, aiData: AIGeneratedMetadata) => {
    console.log('=== translateTask 开始 ===', taskId);
    console.log('aiData:', aiData);
    try {
      const task = tasksRef.current.find(t => t.id === taskId);
      if (!task) {
        throw new Error('任务不存在');
      }
      console.log('找到任务:', task);

      updateTask(taskId, {
        translationStatus: 'translating',
        progress: 90,
        progressText: '正在翻译...',
      });
      console.log('开始调用翻译API...');

      const response = await fetch('/api/translate/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: aiData.title,
          description: aiData.description,
          content: task.content,
          tags: aiData.tags || [],
          use_cases: aiData.use_cases || [],
          prompt_type: aiData.prompt_type || [],
        }),
      });

      if (!response.ok) {
        throw new Error('翻译API调用失败');
      }

      const result = await response.json();
      console.log('翻译API返回:', result);

      updateTask(taskId, {
        translation: result.translation,
        translationStatus: 'success',
        progress: 100,
        progressText: '生成完成（已翻译）',
      });
      console.log('=== translateTask 完成 ===', result.translation);
    } catch (error) {
      console.error('翻译失败:', error);
      updateTask(taskId, {
        translationStatus: 'failed',
        translationError: error instanceof Error ? error.message : '翻译失败',
        progress: 100,
        progressText: '生成完成（翻译失败）',
      });
    }
  };

  // 更新任务
  const updateTask = (taskId: string, updates: Partial<BatchTask>) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, ...updates, updatedAt: Date.now() }
          : t
      )
    );
  };

  // 重试任务
  const handleRetry = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    updateTask(taskId, {
      status: 'pending',
      progress: 0,
      progressText: '等待处理',
      error: null,
    });
    processTask(taskId, task.content);
  };

  // 删除任务
  const handleDelete = (taskId: string) => {
    // 如果任务正在处理中，取消请求
    const controller = abortControllersRef.current.get(taskId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(taskId);
    }
    
    // 清理超时计时器
    const timeout = timeoutsRef.current.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(taskId);
    }
    
    // 从任务列表中移除
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // 切换选中状态
  const handleToggleSelect = (taskId: string) => {
    updateTask(taskId, {
      selected: !tasks.find(t => t.id === taskId)?.selected,
    });
  };

  // 全选/取消全选
  const handleToggleSelectAll = () => {
    const successTasks = tasks.filter(t => t.status === 'success');
    const allSelected = successTasks.every(t => t.selected);
    
    setTasks(prev =>
      prev.map(t =>
        t.status === 'success'
          ? { ...t, selected: !allSelected }
          : t
      )
    );
  };

  // 切换编辑状态
  const handleToggleEdit = (taskId: string) => {
    updateTask(taskId, {
      isEditing: !tasks.find(t => t.id === taskId)?.isEditing,
    });
  };

  // 保存编辑
  const handleSaveEdit = (taskId: string, updates: Partial<BatchTask['result']>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.result) return;

    updateTask(taskId, {
      result: { ...task.result, ...updates },
      isEditing: false,
    });
  };

  // 批量发布选中的任务
  const handlePublishSelected = async () => {
    const selectedTasks = tasks.filter(t => t.status === 'success' && t.selected && t.result);
    
    if (selectedTasks.length === 0) {
      alert('请先选择要发布的任务');
      return;
    }

    // 检查是否有重复项需要确认
    const tasksWithDuplicates = selectedTasks.filter(
      t => t.result?.duplicates && t.result.duplicates.length > 0
    );

    if (tasksWithDuplicates.length > 0) {
      // 显示重复确认对话框
      const duplicateResults = tasksWithDuplicates.map(t => ({
        taskId: t.id,
        content: t.content,
        title: t.result?.title,
        duplicates: t.result?.duplicates || [],
        aiResult: t.result,
      }));
      setDuplicateResults(duplicateResults);
      setShowDuplicateDialog(true);
      return;
    }

    // 没有重复项，直接发布
    await publishTasks(selectedTasks);
  };

  // 实际发布任务
  const publishTasks = async (tasksToPublish: BatchTask[]) => {
    const titles = tasksToPublish.map(t => `• ${t.result!.title}`).join('\n');
    if (!confirm(`确定要发布以下 ${tasksToPublish.length} 个提示词吗？\n\n${titles}`)) {
      return;
    }

    // 统一匹配分类
    const { batchMatchCategories } = await import('@/lib/utils/categorySimilarity');
    const newCategories = tasksToPublish
      .map(t => t.result?.category)
      .filter((c): c is string => !!c);
    
    const categoryMatches = batchMatchCategories(newCategories, categories, 90);
    
    let published = 0;
    let failed = 0;
    const newCategoriesCreated = new Map<string, string>(); // 新分类名 -> slug

    for (const task of tasksToPublish) {
      if (!task.result) continue;

      try {
        const aiCategory = task.result.category;
        const matchResult = categoryMatches.get(aiCategory);
        
        let categorySlug: string;
        
        if (matchResult?.matchedCategory) {
          // 使用匹配到的现有分类
          categorySlug = matchResult.matchedCategory.slug;
        } else if (newCategoriesCreated.has(aiCategory)) {
          // 使用已创建的新分类
          categorySlug = newCategoriesCreated.get(aiCategory)!;
        } else {
          // 需要创建新分类
          const aiSlug = task.result.category_slug || aiCategory.toLowerCase().replace(/\s+/g, '-');
          const aiDescription = task.result.category_description || `${aiCategory}相关的提示词`;
          const aiIcon = task.result.category_icon || '📁';
          const aiParentCategory = task.result.parent_category; // 获取一级分类
          
          // 自动创建新分类（包含一级分类）
          const { createCategory } = await import('@/app/actions/categories');
          const newCategory = await createCategory(aiCategory, aiSlug, aiDescription, aiIcon, aiParentCategory);
          
          if (newCategory) {
            categorySlug = newCategory.slug;
            // 更新本地分类列表
            categories.push(newCategory);
          } else {
            // 创建失败，使用AI生成的slug
            categorySlug = aiSlug;
          }
          
          newCategoriesCreated.set(aiCategory, categorySlug);
        }

        await createPrompt({
          title: task.result.title,
          content: task.content,
          description: task.result.description,
          category: categorySlug,
          tags: task.result.tags,
          prompt_type: task.result.prompt_type || [],
          use_cases: task.result.use_cases || [],
          difficulty: 'beginner',
          language: task.result.language,
          status: 'published',
        }, task.translation || undefined); // 传递预翻译结果

        // 发布成功，从列表移除
        handleDelete(task.id);
        published++;
      } catch (error) {
        console.error('发布失败:', error);
        updateTask(task.id, {
          status: 'error',
          error: '发布失败: ' + (error instanceof Error ? error.message : '未知错误'),
          selected: false,
        });
        failed++;
      }
    }

    // 显示发布结果
    let resultMessage = '';
    
    if (published > 0 && failed === 0) {
      resultMessage = `✅ 成功发布 ${published} 个提示词！`;
    } else if (published > 0 && failed > 0) {
      resultMessage = `发布完成！\n✅ 成功: ${published} 个\n❌ 失败: ${failed} 个`;
    } else {
      resultMessage = `❌ 发布失败！所有任务都未能发布成功`;
    }
    
    // 添加新分类信息
    if (newCategoriesCreated.size > 0) {
      const newCatList = Array.from(newCategoriesCreated.entries())
        .map(([name, slug]) => `  • ${name} (${slug})`)
        .join('\n');
      resultMessage += `\n\n🆕 自动创建了 ${newCategoriesCreated.size} 个新分类：\n${newCatList}`;
    }
    
    if (published > 0 && failed === 0) {
      const viewPrompts = confirm(`${resultMessage}\n\n点击"确定"查看已发布的提示词，点击"取消"继续添加`);
      if (viewPrompts) {
        localStorage.removeItem(STORAGE_KEY);
        router.push('/admin/prompts');
      }
    } else {
      alert(resultMessage + (failed > 0 ? '\n\n失败的任务已保留，可以重试' : ''));
    }
  };

  // 清空所有任务
  const handleClearAll = () => {
    if (!confirm('确定要清空所有任务吗？')) return;
    
    // 取消所有进行中的请求
    abortControllersRef.current.forEach((controller) => {
      controller.abort();
    });
    abortControllersRef.current.clear();
    
    // 清理所有超时计时器
    timeoutsRef.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    timeoutsRef.current.clear();
    
    // 清空任务列表和localStorage
    setTasks([]);
    tasksRef.current = [];
    localStorage.removeItem(STORAGE_KEY);
  };

  // 清空失败的任务
  const handleClearErrors = () => {
    setTasks(prev => prev.filter(t => t.status !== 'error'));
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">批量添加提示词</h1>
        <p className="text-sm text-gray-600 mt-1">
          输入提示词内容后，AI将自动生成标题、分类、标签等信息
        </p>
      </div>

      {/* 输入区域 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Textarea
          label="提示词内容"
          placeholder="输入提示词内容（至少20个字符）..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          maxLength={10000}
          showCount
          currentCount={content.length}
        />
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            添加后将自动开始AI分析，您可以继续添加下一个
          </p>
          <Button
            onClick={handleAddTask}
            variant="primary"
            disabled={!content.trim() || content.trim().length < 20}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加到队列
          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">总任务数</div>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-yellow-700">等待中</div>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <div className="text-xs text-blue-700">处理中</div>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <div className="text-xs text-green-700">已完成</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            <div className="text-xs text-red-700">失败</div>
          </div>
        </div>
      )}

      {/* 批量操作 */}
      {tasks.length > 0 && (
        <div className="space-y-3">
          {/* 选择和统计 */}
          {stats.success > 0 && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tasks.filter(t => t.status === 'success').every(t => t.selected)}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">全选</span>
                </label>
                <span className="text-sm text-gray-600">
                  已选中 {tasks.filter(t => t.selected).length} / {stats.success} 个
                </span>
              </div>
              <Button
                onClick={handlePublishSelected}
                variant="primary"
                disabled={tasks.filter(t => t.selected).length === 0}
              >
                发布选中的 ({tasks.filter(t => t.selected).length})
              </Button>
            </div>
          )}
          
          {/* 其他操作 */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleClearErrors}
              variant="secondary"
              disabled={stats.error === 0}
            >
              清空失败的 ({stats.error})
            </Button>
            <Button
              onClick={handleClearAll}
              variant="secondary"
            >
              清空所有
            </Button>
          </div>
        </div>
      )}

      {/* 任务列表 */}
      {tasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">任务队列</h2>
          {tasks.map((task) => (
            task.isEditing ? (
              <TaskEditForm
                key={task.id}
                task={task}
                categories={categories}
                onSave={handleSaveEdit}
                onCancel={() => handleToggleEdit(task.id)}
              />
            ) : (
              <TaskCard
                key={task.id}
                task={task}
                categories={categories}
                onRetry={handleRetry}
                onDelete={handleDelete}
                onToggleSelect={handleToggleSelect}
                onToggleEdit={handleToggleEdit}
                onViewDetail={() => setSelectedTaskId(task.id)}
                onViewDuplicate={() => setSingleDuplicateTask(task)}
              />
            )
          ))}
        </div>
      )}

      {/* 空状态 */}
      {tasks.length === 0 && (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有任务</h3>
          <p className="text-sm text-gray-600">
            在上方输入提示词内容，点击「添加到队列」开始批量处理
          </p>
        </div>
      )}

      {/* 详情预览Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          task={tasks.find(t => t.id === selectedTaskId)!}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* 单个任务重复检测对话框 */}
      {singleDuplicateTask && singleDuplicateTask.result?.duplicates && (
        <DuplicateChecker
          duplicates={singleDuplicateTask.result.duplicates}
          newContent={singleDuplicateTask.content}
          newTitle={singleDuplicateTask.result.title}
          onContinue={() => {
            // 用户选择继续添加，需要调用AI分析
            setSingleDuplicateTask(null);
            // 重新处理这个任务，强制AI分析
            const taskId = singleDuplicateTask.id;
            updateTask(taskId, {
              status: 'pending',
              progress: 0,
              progressText: '等待AI分析...',
              result: null,
            });
            // 调用AI分析（跳过重复检测）
            processTaskWithAI(taskId, singleDuplicateTask.content);
          }}
          onCancel={() => {
            // 用户取消，删除这个任务
            handleDelete(singleDuplicateTask.id);
            setSingleDuplicateTask(null);
          }}
        />
      )}

      {/* 批量重复检查对话框 */}
      {showDuplicateDialog && duplicateResults.length > 0 && (
        <BatchDuplicateChecker
          results={duplicateResults}
          onResolve={(taskId, action) => {
            if (action === 'skip') {
              // 取消选中
              updateTask(taskId, { selected: false });
            }
            // 从待处理列表中移除
            setDuplicateResults(prev => prev.filter(r => r.taskId !== taskId));
            // 如果没有待处理的了，关闭对话框
            if (duplicateResults.length <= 1) {
              setShowDuplicateDialog(false);
              // 发布剩余的无重复任务
              const remainingTasks = tasks.filter(
                t => t.status === 'success' && 
                t.selected && 
                (!t.result?.duplicates || t.result.duplicates.length === 0)
              );
              if (remainingTasks.length > 0) {
                publishTasks(remainingTasks);
              }
            }
          }}
          onResolveAll={(action) => {
            if (action === 'skip') {
              // 取消所有有重复的任务的选中状态
              duplicateResults.forEach(r => {
                updateTask(r.taskId, { selected: false });
              });
            }
            setShowDuplicateDialog(false);
            setDuplicateResults([]);
            
            // 发布剩余的任务
            const remainingTasks = tasks.filter(
              t => t.status === 'success' && 
              t.selected && 
              (action === 'add' || !t.result?.duplicates || t.result.duplicates.length === 0)
            );
            if (remainingTasks.length > 0) {
              publishTasks(remainingTasks);
            }
          }}
          onClose={() => {
            setShowDuplicateDialog(false);
            setDuplicateResults([]);
          }}
        />
      )}
    </div>
  );
}

/**
 * 任务卡片组件
 */
function TaskCard(props: {
  task: BatchTask;
  categories: Category[];
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleEdit: (id: string) => void;
  onViewDetail: () => void;
  onViewDuplicate: () => void;
}) {
  const { task, onRetry, onDelete, onToggleSelect, onToggleEdit, onViewDetail, onViewDuplicate } = props;
  const getStatusColor = () => {
    switch (task.status) {
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'pending':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getStatusColor()}`}>
      <div className="flex items-start gap-4">
        {/* 选择框（仅成功状态显示） */}
        {task.status === 'success' && (
          <div className="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              checked={task.selected}
              onChange={() => onToggleSelect(task.id)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        )}

        {/* 状态图标 */}
        <div className="flex-shrink-0 mt-1">
          {getStatusIcon()}
        </div>

        {/* 内容区域 */}
        <div className="flex-1 min-w-0">
          {/* 提示词内容 */}
          <div className="mb-3">
            <details className="group">
              <summary className="text-sm text-gray-700 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors">
                {task.content}
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
                {task.content}
              </div>
            </details>
          </div>

          {/* 进度条 */}
          {task.status === 'processing' && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>{task.progressText}</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 成功结果 */}
          {task.status === 'success' && task.result && (
            <div className="space-y-2 mb-3">
              <div>
                <span className="text-xs font-semibold text-gray-700">标题：</span>
                <span className="text-sm text-gray-900">{task.result.title}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-700">分类：</span>
                <span className="text-sm text-gray-900">{task.result.category}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-700">标签：</span>
                <span className="text-sm text-gray-900">{task.result.tags.join(', ')}</span>
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {task.status === 'error' && (
            <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 mb-1">处理失败</p>
                  <p className="text-sm text-red-700">{task.error || '未知错误'}</p>
                  <p className="text-xs text-red-600 mt-2">
                    💡 提示：点击「重试」按钮重新处理，或检查提示词内容是否符合要求（至少20字符）
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {task.status === 'success' && (
              <>
                {task.result?.duplicates && task.result.duplicates.length > 0 ? (
                  <button
                    onClick={onViewDuplicate}
                    className="text-xs px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors font-medium"
                  >
                    ⚠️ 查看重复 ({task.result.duplicates.length})
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onViewDetail}
                      className="text-xs px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      查看详情
                    </button>
                    <button
                      onClick={() => onToggleEdit(task.id)}
                      className="text-xs px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      编辑
                    </button>
                  </>
                )}
              </>
            )}
            {task.status === 'processing' && (
              <button
                onClick={() => onRetry(task.id)}
                className="text-xs px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors font-medium"
              >
                🔄 重新生成
              </button>
            )}
            {task.status === 'error' && (
              <button
                onClick={() => onRetry(task.id)}
                className="text-xs px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
              >
                🔄 重试
              </button>
            )}
            {task.status === 'success' && (
              <button
                onClick={() => onRetry(task.id)}
                className="text-xs px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-medium"
              >
                🔄 重新生成
              </button>
            )}
            <button
              onClick={() => onDelete(task.id)}
              className="text-xs px-3 py-1 text-red-600 hover:bg-red-100 rounded transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


