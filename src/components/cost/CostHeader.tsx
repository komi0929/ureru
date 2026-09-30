'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Plus, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  Home, 
  HelpCircle, 
  Zap, 
  Calculator,
  Search,
  BookOpen
} from 'lucide-react';
import TutorialModal from '@/components/cost/TutorialModal';

const costPageTitles: Record<string, string> = {
  '/cost': '原価ダッシュボード',
  '/cost/recipes': 'レシピ一覧・原価計算',
  '/cost/recipes/new': 'レシピ新規登録',
  '/cost/materials': '材料・資材マスター',
  '/cost/summary': '原価・粗利サマリー',
};

export default function CostHeader() {
  const pathname = usePathname();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  let pageTitle = costPageTitles[pathname];
  if (!pageTitle) {
    if (pathname.startsWith('/cost/recipes/')) {
      pageTitle = 'レシピ編集・シミュレーション';
    } else {
      pageTitle = 'レシピ原価管理';
    }
  }

  return (
    <>
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-8 sticky top-0 z-20 shadow-2xs font-sans">
        
        {/* Breadcrumb Navigation (Clear Wayfinding) */}
        <div className="flex items-center gap-2 text-xs">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-md hover:bg-slate-100"
            title="ポータルTOPへ戻る"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="font-medium hidden sm:inline">ポータル</span>
          </Link>

          <ChevronRight className="w-3 h-3 text-slate-300" />

          <Link 
            href="/cost/recipes" 
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors font-medium p-1 rounded-md hover:bg-slate-100"
          >
            <span>COST LAB</span>
          </Link>

          <ChevronRight className="w-3 h-3 text-slate-300" />

          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
            {pageTitle}
          </span>
        </div>

        {/* Right Navigation & Action Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Tutorial / Help Button (Key request for beginners) */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/70 font-semibold text-xs transition-colors shadow-2xs cursor-pointer group"
            title="4ステップで使い方を見る"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>使い方ガイド</span>
          </button>

          {/* Switch to Sales Tool shortcut */}
          <Link
            href="/dashboard"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 rounded-lg transition-colors border border-emerald-200/60"
            title="営業促進ツール（URERU）へ移動"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>営業ツールへ切替</span>
          </Link>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* Quick action: Add Recipe */}
          <Link
            href="/cost/recipes/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">レシピ新規登録</span>
            <span className="sm:hidden">新規</span>
          </Link>
        </div>
      </header>

      {/* Tutorial Modal */}
      <TutorialModal 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />
    </>
  );
}
