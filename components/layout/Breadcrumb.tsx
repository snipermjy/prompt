"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

/**
 * 面包屑导航组件
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'zh';
  const tNav = useTranslations('nav');

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <Link href={`/${locale}`} className="hover:text-blue-600 transition-colors">
        {tNav('home')}
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          {item.href ? (
            <Link href={item.href} className="hover:text-blue-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
