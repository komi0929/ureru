import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SoyStories 統合プラットフォーム - 営業促進 & レシピ原価管理',
  description: 'SoyStories クラフトアイス B2B営業支援＆レシピ原価管理システム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} min-h-screen antialiased selection:bg-amber-400 selection:text-slate-900`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
