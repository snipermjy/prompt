import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/ui/BackToTop';
import { ClientProviders } from '@/components/providers/ClientProviders';

/**
 * 前端页面布局
 * 所有前端页面都使用此布局（包含Header和Footer）
 */

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProviders>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
      </div>
    </ClientProviders>
  );
}

