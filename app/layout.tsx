import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI提示词库 - 精选优质AI提示词",
  description: "收录各类优质AI提示词，涵盖ChatGPT、Claude、Midjourney等主流AI工具，助力高效AI创作",
  keywords: "AI提示词,prompt,ChatGPT,Claude,AI工具,提示词库",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}

