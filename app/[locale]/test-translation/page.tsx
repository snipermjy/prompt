import { getTranslations } from 'next-intl/server';

export default async function TestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'category' });
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Translation Test - Locale: {locale}</h1>
      <div className="space-y-2">
        <p>category.all: {t('all')}</p>
        <p>category.latest: {t('latest')}</p>
        <p>category.popular: {t('popular')}</p>
        <p>category.total: {t('total')}</p>
      </div>
    </div>
  );
}
