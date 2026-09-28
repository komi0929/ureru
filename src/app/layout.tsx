import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'URERU - 営業支援＆受発注管理',
  description: 'SoyStories B2B営業自動化プラットフォーム URERU',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex`}>
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
