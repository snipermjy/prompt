'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createSubmission } from '@/app/actions/submissions';
import { checkDuplicates } from '@/app/actions/prompts';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Modal, { ModalBody } from '@/components/ui/Modal';
import DuplicateChecker from '@/components/ui/DuplicateChecker';
import { validateEmail, validateUrl, checkRateLimit } from '@/lib/utils/validation';

/**
 * 用户提交表单组件
 */

// 验证规则
const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 10000;
const MAX_DESCRIPTION_LENGTH = 200;

export default function SubmitForm() {
  const router = useRouter();
  const t = useTranslations('submit');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  
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
        errors.content = t('contentRequired');
      } else if (content.length < MIN_CONTENT_LENGTH) {
        errors.content = t('contentMinLength', { min: MIN_CONTENT_LENGTH, current: content.length });
      }
    }

    // 验证邮箱
    if (touched.email && submitterEmail) {
      if (!validateEmail(submitterEmail)) {
        errors.email = t('invalidEmail');
      }
    }

    // 验证URL
    if (touched.authorLink && authorLink) {
      if (!validateUrl(authorLink)) {
        errors.authorLink = t('invalidUrl');
      }
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0 && content.trim().length >= MIN_CONTENT_LENGTH,
    };
  }, [content, submitterEmail, authorLink, touched, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 标记所有字段为已触摸
    setTouched({ content: true, email: true, authorLink: true });

    // 验证表单
    if (!validation.isValid) {
      setMessage({ type: 'error', text: t('checkFormErrors') });
      return;
    }
    
    if (!content.trim() || content.length < MIN_CONTENT_LENGTH) {
      setMessage({ type: 'error', text: t('contentMinLength', { min: MIN_CONTENT_LENGTH, current: content.length }) });
      return;
    }
    
    // 客户端限流检查（防止恶意提交）
    if (!checkRateLimit('submit_form', 3, 60000)) {
      setMessage({ type: 'error', text: t('rateLimitExceeded') });
      return;
    }

    // 检查重复
    setChecking(true);
    setMessage(null);
    try {
      const duplicateResults = await checkDuplicates(content.trim());
      setDuplicates(duplicateResults);
      
      if (duplicateResults.length > 0) {
        setChecking(false);
        setShowDuplicateDialog(true);
        return;
      }
    } catch {
      // 检查失败不阻止提交
    } finally {
      setChecking(false);
    }
    
    await submitForm();
  };

  // 实际提交
  const submitForm = async () => {
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
    } catch {
      setMessage({ type: 'error', text: t('failed') });
    } finally {
      setLoading(false);
    }
  };

  // 继续提交（忽略重复警告）
  const handleContinueSubmit = () => {
    setShowSuccessModal(false);
  };

  // 忽略重复，继续提交
  const handleIgnoreDuplicate = () => {
    setShowDuplicateDialog(false);
    submitForm();
  };

  // 取消提交
  const handleCancelSubmit = () => {
    setShowDuplicateDialog(false);
    setDuplicates([]);
  };

  const handleBackHome = () => {
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 提示词内容 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Textarea
          label={t('contentLabel')}
          placeholder={t('contentPlaceholder')}
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
          {t('contentMinLength', { min: MIN_CONTENT_LENGTH, current: content.length })}
        </p>
      </div>

      {/* 提示词简介 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Textarea
          label={t('descriptionLabel')}
          placeholder={t('descriptionPlaceholder')}
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
          {t('submitterInfo')}
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          {t('submitterInfoHint')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label={t('authorName')}
            placeholder={t('authorNamePlaceholder')}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={50}
          />
          <div>
            <Input
              label={t('authorLink')}
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
          {t('submitterInfo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label={t('submitterName')}
            placeholder={t('submitterNamePlaceholder')}
            value={submitterName}
            onChange={(e) => setSubmitterName(e.target.value)}
            maxLength={50}
          />
          <div>
            <Input
              label={t('submitterEmail')}
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
          {t('submitHint')}
        </p>
        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          loading={loading || checking}
          disabled={!validation.isValid && touched.content}
        >
          {checking ? t('checking') : loading ? t('submitting') : t('submitButton')}
        </Button>
      </div>

      {/* 重复检查对话框 */}
      {showDuplicateDialog && duplicates.length > 0 && (
        <DuplicateChecker
          duplicates={duplicates}
          newContent={content}
          onContinue={handleIgnoreDuplicate}
          onCancel={handleCancelSubmit}
        />
      )}

      {/* 成功模态框 */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <ModalBody className="text-center py-8">
          {/* 成功图标 */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('success')}</h3>
          <p className="text-gray-600 mb-6" dangerouslySetInnerHTML={{ __html: t('successMessage') }} />

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleContinueSubmit}
              className="w-full"
            >
              {t('continueSubmit')}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleBackHome}
              className="w-full"
            >
              {t('backToHome')}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </form>
  );
}

