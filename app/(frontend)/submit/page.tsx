import Breadcrumb from '@/components/layout/Breadcrumb';
import SubmitForm from './SubmitForm';

/**
 * 用户提交提示词页面
 */

export const metadata = {
  title: '提交提示词 - AI提示词库',
  description: '分享你的优质AI提示词，帮助更多人提升AI使用效率',
  openGraph: {
    title: '提交提示词 - AI提示词库',
    description: '分享你的优质AI提示词，帮助更多人提升AI使用效率',
  },
};

export default function SubmitPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑导航 */}
      <Breadcrumb
        items={[
          { label: '提交提示词' },
        ]}
      />
      
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">✨</span>
        <h1 className="text-2xl font-bold text-gray-900">提交优质AI提示词</h1>
      </div>
      
      {/* 提交表单 */}
      <SubmitForm />
    </div>
  );
}

