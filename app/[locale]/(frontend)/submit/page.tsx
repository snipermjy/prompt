import Breadcrumb from '@/components/layout/Breadcrumb';
import SubmitForm from './SubmitForm';
import { getTranslations } from 'next-intl/server';

/**
 * User submit prompt page
 */

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'submit' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  const siteName = tSite('name');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://promtp.mom';
  const basePath = '/submit';
  
  return {
    title: `${t('title')} - ${siteName}`,
    description: t('description'),
    openGraph: {
      title: `${t('title')} - ${siteName}`,
      description: t('description'),
    },
    alternates: {
      canonical: `${siteUrl}/${locale}${basePath}`,
      languages: {
        zh: `${siteUrl}/zh${basePath}`,
        en: `${siteUrl}/en${basePath}`,
      },
    },
  };
}

export default async function SubmitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'submit' });
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑导航 */}
      <Breadcrumb
        items={[
          { label: t('title') },
        ]}
      />
      
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">✨</span>
        <h1 className="text-2xl font-bold text-gray-900">{t('pageTitle')}</h1>
      </div>
      
      {/* 提交表单 */}
      <SubmitForm />
    </div>
  );
}

