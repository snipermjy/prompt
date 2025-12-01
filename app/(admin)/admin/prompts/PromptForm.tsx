'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createPrompt, updatePrompt, checkDuplicates } from '@/app/actions/prompts';
import type { Prompt, Category, CreatePromptInput, Language, PromptStatus } from '@/lib/types/database';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import DuplicateChecker from '@/components/ui/DuplicateChecker';

/**
 * 提示词表单组件（添加/编辑）
 */

interface PromptFormProps {
  categories: Category[];
  initialData?: Prompt;
}

export default function PromptForm({ categories, initialData }: PromptFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiProgressText, setAiProgressText] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showFormatPreview, setShowFormatPreview] = useState(false);
  const [originalContent, setOriginalContent] = useState('');

  // 从 sessionStorage 读取转换的提交数据（如果有）
  const [convertedData, setConvertedData] = useState<any>(null);

  // 表单数据 - 优先使用 initialData，然后是 convertedData，最后是默认值
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || convertedData?.content || '');
  const [description, setDescription] = useState(initialData?.description || convertedData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [promptType, setPromptType] = useState<string[]>(initialData?.prompt_type || []);
  const [useCases, setUseCases] = useState<string[]>(initialData?.use_cases || []);
  const [language, setLanguage] = useState(initialData?.language || 'zh-CN');
  const [status, setStatus] = useState(initialData?.status || 'published'); // 默认改为已发布
  const [authorName, setAuthorName] = useState(initialData?.author_name || convertedData?.author_name || '');
  const [authorLink, setAuthorLink] = useState(initialData?.author_link || convertedData?.author_link || '');

  // 组件挂载时检查 sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialData) {
      const stored = sessionStorage.getItem('convertSubmission');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setConvertedData(data);
          setContent(data.content || '');
          setDescription(data.description || '');
          setAuthorName(data.author_name || '');
          setAuthorLink(data.author_link || '');
          
          // 保存提交ID（如果有），用于发布后更新提交状态
          if (data.submissionId) {
            sessionStorage.setItem('submissionId', data.submissionId);
          }
          
          // 清除转换数据
          sessionStorage.removeItem('convertSubmission');
          setMessage({ type: 'success', text: '已自动填充用户提交的内容，请补充标题、分类等信息后发布' });
        } catch (error) {
          console.error('Failed to parse converted data:', error);
        }
      }
    }
  }, []); // 只在挂载时执行一次

  // 标签输入
  const [tagInput, setTagInput] = useState('');
  const [promptTypeInput, setPromptTypeInput] = useState('');
  const [useCaseInput, setUseCaseInput] = useState('');

  // 处理标签输入
  const handleTagInput = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !tags.includes(value)) {
        setTags([...tags, value]);
        setTagInput('');
      }
    }
  };

  // 处理提示词类型输入
  const handlePromptTypeInput = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = promptTypeInput.trim();
      if (value && !promptType.includes(value)) {
        setPromptType([...promptType, value]);
        setPromptTypeInput('');
      }
    }
  };

  // 处理使用场景输入
  const handleUseCaseInput = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = useCaseInput.trim();
      if (value && !useCases.includes(value)) {
        setUseCases([...useCases, value]);
        setUseCaseInput('');
      }
    }
  };

  // 移除标签
  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // 移除提示词类型
  const removePromptType = (type: string) => {
    setPromptType(promptType.filter((t) => t !== type));
  };

  // 移除使用场景
  const removeUseCase = (useCase: string) => {
    setUseCases(useCases.filter((c) => c !== useCase));
  };

  // AI 自动生成
  const handleAIGenerate = async () => {
    if (!content.trim()) {
      setMessage({ type: 'error', text: '请先输入提示词内容' });
      return;
    }

    if (content.trim().length < 20) {
      setMessage({ type: 'error', text: '提示词内容至少需要 20 个字符才能进行 AI 分析' });
      return;
    }

    setAiGenerating(true);
    setAiProgress(0);
    setMessage(null);

    try {
      // 阶段 1: 准备分析
      setAiProgressText('正在准备分析...');
      setAiProgress(10);
      await new Promise(resolve => setTimeout(resolve, 300));

      // 阶段 2: 连接 AI 服务
      setAiProgressText('正在连接 AI 服务...');
      setAiProgress(20);
      await new Promise(resolve => setTimeout(resolve, 200));

      // 阶段 3: 分析内容
      setAiProgressText('正在深度分析提示词内容...');
      setAiProgress(35);

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      // 阶段 4: 处理响应
      setAiProgressText('正在处理 AI 响应...');
      setAiProgress(60);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI 生成失败');
      }

      if (data.success && data.data) {
        const metadata = data.data;

        // 阶段 5: 生成标题
        setAiProgressText('正在生成标题...');
        setAiProgress(70);
        await new Promise(resolve => setTimeout(resolve, 200));
        setTitle(metadata.title || '');

        // 阶段 6: 生成描述
        setAiProgressText('正在生成描述...');
        setAiProgress(80);
        await new Promise(resolve => setTimeout(resolve, 200));
        setDescription(metadata.description || '');
        
        // 阶段 7: 提取标签
        setAiProgressText('正在提取关键标签...');
        setAiProgress(85);
        await new Promise(resolve => setTimeout(resolve, 200));
        setTags(metadata.tags || []);

        // 阶段 8: 匹配分类
        setAiProgressText('正在智能匹配分类...');
        setAiProgress(85);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 处理分类：支持二级分类
        if (metadata.category) {
          // 优先匹配 category_slug
          let existingCategory = categories.find(
            (cat) => cat.slug === metadata.category_slug
          );
          
          // 如果没找到，尝试匹配分类名称
          if (!existingCategory) {
            existingCategory = categories.find(
              (cat) => cat.name === metadata.category
            );
          }
          
          if (existingCategory) {
            setCategory(existingCategory.slug);
            setMessage({
              type: 'success',
              text: `AI 已匹配到分类"${existingCategory.name}"${metadata.parent_category ? `（${metadata.parent_category}）` : ''}`,
            });
          } else {
            // AI 建议了新分类
            const parentInfo = metadata.parent_category ? `（属于${metadata.parent_category}）` : '';
            setMessage({
              type: 'success',
              text: `AI 建议新分类"${metadata.category}"${parentInfo}，将自动创建。如不合适，请手动选择其他分类。`,
            });
          }
        }

        // 阶段 9: 识别提示词类型
        setAiProgressText('正在识别提示词类型...');
        setAiProgress(90);
        await new Promise(resolve => setTimeout(resolve, 200));
        setPromptType(metadata.prompt_type || []);

        // 阶段 10: 提取使用场景
        setAiProgressText('正在提取使用场景...');
        setAiProgress(95);
        await new Promise(resolve => setTimeout(resolve, 200));
        setUseCases(metadata.use_cases || []);
        setLanguage(metadata.language || 'zh-CN');

        // 完成
        setAiProgressText('生成完成！');
        setAiProgress(100);
        await new Promise(resolve => setTimeout(resolve, 300));

        setMessage({ type: 'success', text: 'AI 生成成功！请检查并调整生成的内容' });
      }
    } catch (error) {
      console.error('AI 生成错误:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'AI 生成失败，请稍后重试',
      });
      setAiProgress(0);
      setAiProgressText('');
    } finally {
      setTimeout(() => {
        setAiGenerating(false);
        setAiProgress(0);
        setAiProgressText('');
      }, 500);
    }
  };

  // 检查重复
  const handleCheckDuplicates = async () => {
    if (!content.trim() || content.trim().length < 20) {
      return;
    }

    setChecking(true);
    try {
      const results = await checkDuplicates(content.trim(), title.trim());
      setDuplicates(results);
      return results;
    } catch (error) {
      console.error('检查重复失败:', error);
      return [];
    } finally {
      setChecking(false);
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !category) {
      setMessage({ type: 'error', text: '请填写必填字段' });
      return;
    }

    // 编辑模式不检查重复
    if (!initialData) {
      // 检查重复
      setMessage(null);
      const duplicateResults = await handleCheckDuplicates();
      if (duplicateResults && duplicateResults.length > 0) {
        setShowDuplicateDialog(true);
        return;
      }
    }

    await submitForm();
  };

  // 实际提交
  const submitForm = async () => {
    setLoading(true);
    setMessage(null);

    try {
      console.log('表单提交开始...');
      console.log('标题:', title);
      console.log('内容长度:', content.length);
      console.log('分类:', category);
      console.log('标签:', tags);
      console.log('提示词类型:', promptType);
      console.log('使用场景:', useCases);

      const data: CreatePromptInput = {
        title: title.trim(),
        content: content.trim(),
        description: description.trim() || undefined,
        category,
        tags,
        prompt_type: promptType,
        use_cases: useCases,
        difficulty: 'beginner',
        language: language as Language,
        status: status as PromptStatus,
        author_name: authorName.trim() || undefined,
        author_link: authorLink.trim() || undefined,
      };

      console.log('准备提交的数据:', data);

      let result;
      if (initialData) {
        // 编辑
        console.log('执行编辑操作...');
        result = await updatePrompt(initialData.id, data);
      } else {
        // 新增
        console.log('执行新增操作...');
        result = await createPrompt(data);
      }

      console.log('操作结果:', result);

      if (result) {
        console.log('✅ 操作成功！准备显示成功消息并跳转');
        
        // 如果是从用户提交转换来的，更新提交状态为已通过
        if (typeof window !== 'undefined' && !initialData) {
          const submissionId = sessionStorage.getItem('submissionId');
          if (submissionId) {
            try {
              console.log('更新用户提交状态为已通过:', submissionId);
              const { updateSubmissionStatus } = await import('@/app/actions/submissions');
              await updateSubmissionStatus(submissionId, 'approved');
              sessionStorage.removeItem('submissionId');
            } catch (error) {
              console.error('Failed to update submission status:', error);
            }
          }
        }
        
        setMessage({
          type: 'success',
          text: initialData ? '更新成功' : '添加成功',
        });
        
        console.log('📍 准备跳转到列表页，1秒后执行...');
        const timerId = setTimeout(() => {
          console.log('⏰ setTimeout 触发！开始跳转到 /admin/prompts');
          try {
            router.push('/admin/prompts');
            console.log('✅ router.push 调用成功');
          } catch (err) {
            console.error('❌ router.push 调用失败:', err);
          }
        }, 1000);
        console.log('⏱️ setTimeout 已设置，ID:', timerId);
      } else {
        console.error('操作失败：result 为 null');
        setMessage({ type: 'error', text: '操作失败：数据保存未成功，请检查控制台' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('错误详情:', errorMessage);
      setMessage({ 
        type: 'error', 
        text: `操作失败：${errorMessage}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // 继续添加（忽略重复警告）
  const handleContinueAdd = () => {
    setShowDuplicateDialog(false);
    submitForm();
  };

  // 取消添加
  const handleCancelAdd = () => {
    setShowDuplicateDialog(false);
    setDuplicates([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 基本信息 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">基本信息</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAIGenerate}
            loading={aiGenerating}
            disabled={!content.trim() || aiGenerating}
          >
            {aiGenerating ? (
              <>
                <span className="inline-block w-3 h-3 mr-1.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                AI 生成中...
              </>
            ) : (
              <>
                <span className="mr-1.5">🤖</span>
                AI 自动生成
              </>
            )}
          </Button>
        </div>

        {/* AI 生成进度条 */}
        {aiGenerating && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                🤖 {aiProgressText}
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {aiProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${aiProgress}%` }}
              >
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              AI 正在智能分析您的提示词内容，请稍候...
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* 内容输入区域 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                提示词内容 <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  if (!showFormatPreview) {
                    setOriginalContent(content);
                    setShowFormatPreview(true);
                  } else {
                    setShowFormatPreview(false);
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showFormatPreview ? '隐藏预览' : '📝 格式化预览'}
              </button>
            </div>

            {showFormatPreview ? (
              /* 左右分栏预览 */
              <div className="grid grid-cols-2 gap-4">
                {/* 原始内容 */}
                <div>
                  <div className="text-xs text-gray-600 mb-1">原始内容</div>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    required
                    maxLength={10000}
                    placeholder="请输入提示词内容..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setContent(originalContent);
                      setShowFormatPreview(false);
                    }}
                    className="mt-2 text-xs text-gray-600 hover:text-gray-800"
                  >
                    ↶ 恢复原始内容
                  </button>
                </div>

                {/* 格式化预览 */}
                <div>
                  <div className="text-xs text-gray-600 mb-1">格式化预览</div>
                  <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 h-[300px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                      {(() => {
                        try {
                          const { formatPromptContent } = require('@/lib/utils/formatContent');
                          return formatPromptContent(content);
                        } catch {
                          return content;
                        }
                      })()}
                    </pre>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    💡 保存时会自动应用格式化
                  </div>
                </div>
              </div>
            ) : (
              /* 普通输入 */
              <Textarea
                placeholder="请输入提示词内容...（至少 20 字符才能使用 AI 生成）"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                required
                maxLength={10000}
              />
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              💡 <strong>使用提示：</strong>先输入提示词内容（至少 20 字符），然后点击右上角"AI 自动生成"按钮，
              AI 会自动分析内容并生成标题、描述、分类、标签等信息。生成后请检查并按需调整。
            </p>
          </div>

          {/* 标题 */}
          <Input
            label="标题"
            placeholder="请输入提示词标题（或使用 AI 生成）"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
          />

          {/* 简介 */}
          <Textarea
            label="简介/说明（选填）"
            placeholder="简单描述这个提示词的用途和特点..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={200}
            showCount
            currentCount={description.length}
          />
        </div>
      </div>

      {/* 分类和标签 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">分类和标签</h3>

        <div className="space-y-4">
          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类 <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            >
              <option value="">请选择分类（AI 会从现有分类中智能匹配）</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              💡 AI 会从现有分类中智能选择，如果没有合适的分类会提示你
            </p>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签（按 Enter 或逗号添加，3-5个为佳）
            </label>
            <div className="border border-gray-300 rounded-lg p-3 min-h-[80px] flex flex-wrap gap-2 items-start cursor-text"
                 onClick={() => document.getElementById('tagInput')?.focus()}
            >
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-sm rounded"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-purple-400 hover:text-purple-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="tagInput"
                type="text"
                placeholder="输入标签...（AI 会自动生成）"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
                className="flex-1 min-w-[150px] outline-none border-none text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              💡 AI 会根据内容灵活生成标签，不局限于预设，你也可以手动添加
            </p>
          </div>

          {/* 提示词类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提示词类型（按 Enter 或逗号添加）
            </label>
            <div className="border border-gray-300 rounded-lg p-3 min-h-[80px] flex flex-wrap gap-2 items-start cursor-text"
                 onClick={() => document.getElementById('promptTypeInput')?.focus()}
            >
              {promptType.map((type, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-sm rounded"
                >
                  <span>{type}</span>
                  <button
                    type="button"
                    onClick={() => removePromptType(type)}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="promptTypeInput"
                type="text"
                placeholder="例如：智能体、工作流、单次对话...（AI 会自动生成）"
                value={promptTypeInput}
                onChange={(e) => setPromptTypeInput(e.target.value)}
                onKeyDown={handlePromptTypeInput}
                className="flex-1 min-w-[200px] outline-none border-none text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              💡 AI 会根据内容自动判断类型：agent（智能体）、workflow（工作流）、single（单次对话）等
            </p>
          </div>

          {/* 使用场景 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              使用场景（按 Enter 或逗号添加，3-5个为佳）
            </label>
            <div className="border border-gray-300 rounded-lg p-3 min-h-[80px] flex flex-wrap gap-2 items-start cursor-text"
                 onClick={() => document.getElementById('useCaseInput')?.focus()}
            >
              {useCases.map((useCase, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-sm rounded"
                >
                  <span>{useCase}</span>
                  <button
                    type="button"
                    onClick={() => removeUseCase(useCase)}
                    className="text-green-400 hover:text-green-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="useCaseInput"
                type="text"
                placeholder="例如：代码审查、文案写作、数据分析...（AI 会自动生成）"
                value={useCaseInput}
                onChange={(e) => setUseCaseInput(e.target.value)}
                onKeyDown={handleUseCaseInput}
                className="flex-1 min-w-[200px] outline-none border-none text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              💡 AI 会根据内容自动提取应用场景，完全开放不受限制
            </p>
          </div>
        </div>
      </div>

      {/* 其他设置 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">其他设置</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 语言 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">语言</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            >
              <option value="zh-CN">🇨🇳 中文</option>
              <option value="en-US">🇺🇸 English</option>
              <option value="ja-JP">🇯🇵 日本語</option>
              <option value="other">🌐 其他</option>
            </select>
          </div>

          {/* 状态 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PromptStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            >
              <option value="draft">草稿</option>
              <option value="pending">待审核</option>
              <option value="published">已发布</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
        </div>
      </div>

      {/* 来源信息 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">来源信息（选填）</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="来源作者名称"
            placeholder="例如：小红书昵称、B站UP主名"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={100}
          />
          <Input
            label="来源作者链接"
            type="url"
            placeholder="https://..."
            value={authorLink}
            onChange={(e) => setAuthorLink(e.target.value)}
          />
        </div>
      </div>

      {/* 提示信息 */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading || checking}
        >
          取消
        </Button>
        <Button type="submit" variant="primary" size="lg" loading={loading || checking}>
          {checking ? '检查重复中...' : loading ? '保存中...' : initialData ? '保存修改' : '添加提示词'}
        </Button>
      </div>

      {/* 重复检查对话框 */}
      {showDuplicateDialog && duplicates.length > 0 && (
        <DuplicateChecker
          duplicates={duplicates}
          newContent={content}
          newTitle={title}
          onContinue={handleContinueAdd}
          onCancel={handleCancelAdd}
        />
      )}
    </form>
  );
}

