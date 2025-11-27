'use client';

import { useState, KeyboardEvent } from 'react';
import type { BatchTask } from '@/lib/types/batch';
import type { Category } from '@/lib/types/database';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { commonAIModels } from '@/lib/config/site';

interface TaskEditFormProps {
  task: BatchTask;
  categories: Category[];
  onSave: (taskId: string, updates: Partial<BatchTask['result']>) => void;
  onCancel: () => void;
}

/**
 * 任务就地编辑表单
 */
export default function TaskEditForm({ task, categories, onSave, onCancel }: TaskEditFormProps) {
  const [title, setTitle] = useState(task.result?.title || '');
  const [description, setDescription] = useState(task.result?.description || '');
  const [category, setCategory] = useState(task.result?.category || '');
  const [tags, setTags] = useState<string[]>(task.result?.tags || []);
  const [targetAI, setTargetAI] = useState<string[]>(task.result?.target_ai || []);
  const [language, setLanguage] = useState(task.result?.language || 'zh-CN');
  
  const [tagInput, setTagInput] = useState('');
  const [aiModelInput, setAIModelInput] = useState('');

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

  // 处理AI模型输入
  const handleAIModelInput = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = aiModelInput.trim();
      if (value && !targetAI.includes(value)) {
        setTargetAI([...targetAI, value]);
        setAIModelInput('');
      }
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const removeAIModel = (model: string) => {
    setTargetAI(targetAI.filter(m => m !== model));
  };

  const addAIModel = (model: string) => {
    if (!targetAI.includes(model)) {
      setTargetAI([...targetAI, model]);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !category) {
      alert('请填写标题和分类');
      return;
    }

    onSave(task.id, {
      title: title.trim(),
      description: description.trim(),
      category,
      tags,
      target_ai: targetAI,
      language: language as 'zh-CN' | 'en-US' | 'ja-JP' | 'other',
    });
  };

  return (
    <div className="bg-white rounded-lg border-2 border-blue-300 p-6 space-y-4">
      {/* 标题 */}
      <Input
        label="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="输入提示词标题"
        required
      />

      {/* 描述 */}
      <Textarea
        label="描述"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="输入提示词描述"
        rows={3}
      />

      {/* 分类 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          分类 <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          required
        >
          <option value="">请选择分类</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 标签 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          标签
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-blue-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagInput}
          placeholder="输入标签后按回车"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        />
      </div>

      {/* 适用AI模型 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          适用AI模型
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {targetAI.map((model, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
            >
              {model}
              <button
                type="button"
                onClick={() => removeAIModel(model)}
                className="hover:text-purple-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={aiModelInput}
          onChange={(e) => setAIModelInput(e.target.value)}
          onKeyDown={handleAIModelInput}
          placeholder="输入AI模型后按回车"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm mb-2"
        />
        <div className="flex flex-wrap gap-2">
          {commonAIModels.map((model) => (
            <button
              key={model}
              type="button"
              onClick={() => addAIModel(model)}
              disabled={targetAI.includes(model)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {model}
            </button>
          ))}
        </div>
      </div>

      {/* 语言 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          语言
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'zh-CN' | 'en-US' | 'ja-JP' | 'other')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="zh-CN">中文</option>
          <option value="en-US">英文</option>
          <option value="ja-JP">日文</option>
          <option value="other">其他</option>
        </select>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <Button onClick={handleSave} variant="primary">
          保存修改
        </Button>
        <Button onClick={onCancel} variant="secondary">
          取消
        </Button>
      </div>
    </div>
  );
}
