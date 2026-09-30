'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Calculator, Layers, Sparkles } from 'lucide-react';

const costPageTitles: Record<string, string> = {
  '/cost': '原価管理ダッシュボード',
  '/cost/recipes': 'レシピ一覧・原価計算',
  '/cost/recipes/new': 'レシピ新規登録',
  '/cost/materials': '材料・資材マスター管理',
  '/cost/summary': '原価・粗利サマリー分析',
};

export default function CostHeader() {
  const pathname = usePathname();

  let title = costPageTitles[pathname];
  if (!title) {
    if (pathname.startsWith('/cost/recipes/')) {
      title = 'レシピ詳細・原価シミュレーション';
    } else {
      title = 'レシピ原価管理';
    }
  }

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-8 sticky top-0 z-10 shadow-2xs">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick action: Add Material */}
        <Link
          href="/cost/materials"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100/80 hover:bg-slate-200/80 hover:text-slate-900 rounded-lg transition-colors border border-slate-200/60"
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>材料・資材マスター</span>
        </Link>

        {/* Quick action: Add Recipe */}
        <Link
          href="/cost/recipes/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>レシピ新規登録</span>
        </Link>
      </div>
    </header>
  );
}
