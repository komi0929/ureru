'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calculator, 
  UtensilsCrossed, 
  Boxes, 
  PlusCircle, 
  PieChart, 
  ArrowLeft,
  ArrowRight,
  Zap,
  RotateCcw,
  Sparkles,
  Store
} from 'lucide-react';
import { resetToDefaultPreset } from '@/lib/cost-api';
import TutorialModal from '@/components/cost/TutorialModal';
import { HelpCircle } from 'lucide-react';

const costNavItems = [
  { name: 'レシピ一覧・原価計算', href: '/cost/recipes', icon: UtensilsCrossed },
  { name: 'レシピ新規登録', href: '/cost/recipes/new', icon: PlusCircle },
  { name: '材料・資材マスター', href: '/cost/materials', icon: Boxes },
  { name: '原価・粗利サマリー', href: '/cost/summary', icon: PieChart },
];

export default function CostSidebar() {
  const pathname = usePathname();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const handleReset = async () => {
    if (confirm('本番米粉アイス10種・材料マスターの初期設定にリセットしますか？')) {
      await resetToDefaultPreset();
      window.location.reload();
    }
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200/90 flex flex-col shadow-xs z-20 font-sans">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <Link href="/cost/recipes" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm tracking-tight">COST LAB</span>
              <span className="text-[10px] text-slate-400 font-medium">レシピ原価管理システム</span>
            </div>
          </Link>
        </div>

        {/* Switch tool or back to portal */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/60 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200/80"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>TOPポータルに戻る</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 rounded-lg transition-colors border border-emerald-200/60"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>営業促進ツールへ</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-mono">切替</span>
          </Link>
        </div>

        {/* Navigation Menu (Google-like Clean Pill style) */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            原価メニュー
          </div>
          {costNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/cost/recipes' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200/60 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-700' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Info, Tutorial Guide & Reset */}
        <div className="p-3 border-t border-slate-100 shrink-0 space-y-2">
          {/* Tutorial Quick Button */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100/80 rounded-lg transition-colors border border-amber-200/70 shadow-2xs cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>4ステップ使い方ガイド</span>
          </button>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/70"
            title="初期の10種データに戻します"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>本番データを再読込</span>
          </button>

          <Link
            href="/store"
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200/80 shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span>🏪</span>
              <span>店舗経営分析 (STORE LAB)</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
          </Link>

        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
            SS
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-slate-800 truncate">SoyStories 原価室</span>
            <span className="text-[10px] text-slate-400 truncate">10フレーバー運用中</span>
          </div>
        </div>
      </div>
    </aside>

    {/* Tutorial Modal */}
    <TutorialModal
      isOpen={isTutorialOpen}
      onClose={() => setIsTutorialOpen(false)}
    />
  </>
  );
}
