import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI提示词库 - 精选优质AI提示词",
    template: "%s | AI提示词库"
  },
  description: "收录各类优质AI提示词,涵盖ChatGPT、Claude、Midjourney等主流AI工具,助力高效AI创作",
  keywords: ["AI提示词", "prompt", "ChatGPT", "Claude", "Midjourney", "AI工具", "提示词库", "人工智能", "AI创作"],
  authors: [{ name: "AI提示词库" }],
  creator: "AI提示词库",
  publisher: "AI提示词库",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI提示词库',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteUrl,
    title: 'AI提示词库 - 精选优质AI提示词',
    description: '收录各类优质AI提示词,涵盖ChatGPT、Claude、Midjourney等主流AI工具',
    siteName: 'AI提示词库',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI提示词库 - 精选优质AI提示词',
    description: '收录各类优质AI提示词,涵盖ChatGPT、Claude、Midjourney等主流AI工具',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}

