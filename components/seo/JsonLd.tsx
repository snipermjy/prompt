import { Prompt } from '@/lib/types/database';

/**
 * JSON-LD 结构化数据组件
 * 用于提升 SEO 和搜索引擎理解
 */

interface WebsiteJsonLdProps {
  url: string;
}

export function WebsiteJsonLd({ url }: WebsiteJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI提示词库',
    description: '收录各类优质AI提示词，涵盖ChatGPT、Claude、Midjourney等主流AI工具',
    url: url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ArticleJsonLdProps {
  prompt: Prompt;
  url: string;
}

export function ArticleJsonLd({ prompt, url }: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: prompt.title,
    description: prompt.description || prompt.title,
    datePublished: prompt.created_at,
    dateModified: prompt.updated_at || prompt.created_at,
    author: prompt.author_name
      ? {
          '@type': 'Person',
          name: prompt.author_name,
          url: prompt.author_link,
        }
      : {
          '@type': 'Organization',
          name: 'AI提示词库',
        },
    publisher: {
      '@type': 'Organization',
      name: 'AI提示词库',
    },
    keywords: [...prompt.tags, ...prompt.target_ai, prompt.category].join(', '),
    articleSection: prompt.category,
    inLanguage: prompt.language,
    url: url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: Array<{ name: string; url?: string }>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
