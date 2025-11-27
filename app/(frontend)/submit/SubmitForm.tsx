'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createSubmission } from '@/app/actions/submissions';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Modal, { ModalBody } from '@/components/ui/Modal';
import { validateEmail, validateUrl, validateLength, checkRateLimit } from '@/lib/utils/validation';

/**
 * 用户提交表单组件
 */

// 验证规则
const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 10000;
const MAX_DESCRIPTION_LENGTH = 200;

export default function SubmitForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // 表单数据
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorLink, setAuthorLink] = useState('');

  // 字段触摸状态（用户是否已编辑过该字段）
  const [touched, setTouched] = useState({
    content: false,
    email: false,
    authorLink: false,
  });

  // 实时验证
  const validation = useMemo(() => {
    const errors: Record<string, string> = {};

    // 验证提示词内容
    if (touched.content) {
      if (!content.trim()) {
        errors.content = '请输入提示词内容';
      } else if (content.length < MIN_CONTENT_LENGTH) {
        errors.content = `内容至少需要 ${MIN_CONTENT_LENGTH} 个字符（当前 ${content.length} 个）`;
      }
    }

    // 验证邮箱
    if (touched.email && submitterEmail) {
      if (!validateEmail(submitterEmail)) {
        errors.email = '请输入有效的邮箱地址';
      }
    }

    // 验证URL
    if (touched.authorLink && authorLink) {
      if (!validateUrl(authorLink)) {
        errors.authorLink = '请输入有效的链接（以 http:// 或 https:// 开头）';
      }
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0 && content.trim().length >= MIN_CONTENT_LENGTH,
    };
  }, [content, submitterEmail, authorLink, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 标记所有字段为已触摸
    setTouched({ content: true, email: true, authorLink: true });

    // 验证表单
    if (!validation.isValid) {
      setMessage({ type: 'error', text: '请检查表单中的错误项' });
      return;
    }
    
    if (!content.trim() || content.length < MIN_CONTENT_LENGTH) {
      setMessage({ type: 'error', text: `提示词内容至少需要 ${MIN_CONTENT_LENGTH} 个字符` });
      return;
    }
    
    // 客户端限流检查（防止恶意提交）
    if (!checkRateLimit('submit_form', 3, 60000)) {
      setMessage({ type: 'error', text: '提交过于频繁，请稍后再试' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const result = await createSubmission({
        content: content.trim(),
        description: description.trim() || undefined,
        submitter_name: submitterName.trim() || undefined,
        submitter_email: submitterEmail.trim() || undefined,
        author_name: authorName.trim() || undefined,
        author_link: authorLink.trim() || undefined,
      });
      
      if (result.success) {
        // 显示成功模态框
        setShowSuccessModal(true);
        // 清空表单
        setContent('');
        setDescription('');
        setSubmitterName('');
        setSubmitterEmail('');
        setAuthorName('');
        setAuthorLink('');
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '提交失败，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueSubmit = () => {
    setShowSuccessModal(false);
  };

  const handleBackHome = () => {
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 提示词内容 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Textarea
          label="提示词内容"
          placeholder="请输入你的AI提示词内容..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => setTouched(prev => ({ ...prev, content: true }))}
          rows={10}
          required
          maxLength={MAX_CONTENT_LENGTH}
          showCount
          currentCount={content.length}
        />
        {validation.errors.content && (
          <p className="text-xs text-red-600 mt-2">{validation.errors.content}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          请确保提示词内容清晰、实用，能够帮助他人更好地使用AI工具（至少 {MIN_CONTENT_LENGTH} 个字符）
        </p>
      </div>

      {/* 提示词简介 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Textarea
          label="提示词简介/说明（选填）"
          placeholder="简单描述这个提示词的用途和特点..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={MAX_DESCRIPTION_LENGTH}
          showCount
          currentCount={description.length}
        />
      </div>

      {/* 提交人信息 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          提交人信息（选填）
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          如果您希望展示您的社交媒体账号，可以填写以下信息。审核通过后，会在提示词详情页展示。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="账号名称"
            placeholder="例如：小红书昵称、B站UP主名"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={50}
          />
          <div>
            <Input
              label="账号链接"
              type="url"
              placeholder="https://..."
              value={authorLink}
              onChange={(e) => setAuthorLink(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, authorLink: true }))}
            />
            {validation.errors.authorLink && (
              <p className="text-xs text-red-600 mt-1">{validation.errors.authorLink}</p>
            )}
          </div>
        </div>
      </div>

      {/* 联系方式（可选） */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          联系方式（选填，仅用于通知审核结果）
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="您的昵称"
            placeholder="昵称"
            value={submitterName}
            onChange={(e) => setSubmitterName(e.target.value)}
            maxLength={50}
          />
          <div>
            <Input
              label="您的邮箱"
              type="email"
              placeholder="email@example.com"
              value={submitterEmail}
              onChange={(e) => setSubmitterEmail(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            />
            {validation.errors.email && (
              <p className="text-xs text-red-600 mt-1">{validation.errors.email}</p>
            )}
          </div>
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

      {/* 提交按钮 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          提交后我们会进行审核，通过后将自动发布
        </p>
        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          loading={loading}
          disabled={!validation.isValid && touched.content}
        >
          {loading ? '提交中...' : '提交审核'}
        </Button>
      </div>

      {/* 成功模态框 */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <ModalBody className="text-center py-8">
          {/* 成功图标 */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">提交成功！</h3>
          <p className="text-gray-600 mb-6">
            感谢您的分享！<br />
            我们会尽快审核您的提示词，审核通过后将自动发布。
            {submitterEmail && <><br />审核结果将发送到您的邮箱。</>}
          </p>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleContinueSubmit}
              className="w-full"
            >
              继续提交提示词
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleBackHome}
              className="w-full"
            >
              返回首页
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </form>
  );
}

