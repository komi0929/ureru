'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import CostSidebar from '@/components/cost/CostSidebar';
import CostHeader from '@/components/cost/CostHeader';
import StoreSidebar from '@/components/store/StoreSidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 1. TOPポータルハブ画面 ＆ お客様向け発注ポータル（フルスクリーン・スタンドアロン）
  if (pathname === '/' || pathname === '/order') {
    return (
      <div className="min-h-screen w-full bg-slate-50/60 text-slate-900 flex flex-col">
        {children}
      </div>
    );
  }

  // 2. 店舗経営分析画面 (STORE LAB) の場合
  if (pathname.startsWith('/store')) {
    return (
      <div className="min-h-screen flex bg-slate-50/60 text-slate-900">
        <StoreSidebar />
        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // 3. レシピ原価管理画面の場合
  if (pathname.startsWith('/cost')) {
    return (
      <div className="min-h-screen flex bg-slate-50/60 text-slate-900">
        <CostSidebar />
        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          <CostHeader />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // 3. 営業促進画面（従来のレイアウト）
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
