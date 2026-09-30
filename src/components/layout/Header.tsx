'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, Home, ChevronRight, Calculator } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'ポータル',
  '/dashboard': 'ダッシュボード',
  '/sales': '営業モード',
  '/discover': '店舗自動収集',
  '/leads': 'リード管理',
  '/samples': 'サンプル管理',
  '/orders': '受発注',
  '/analytics': '分析',
  '/settings': '設定',
};

export default function Header() {
  const pathname = usePathname();
  
  const title = pageTitles[pathname] || 'SoyStories';

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-8 sticky top-0 z-10 shadow-2xs font-sans">
      
      {/* Breadcrumb Navigation */}
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
          href="/dashboard" 
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors font-medium p-1 rounded-md hover:bg-slate-100"
        >
          <span>営業促進 (URERU)</span>
        </Link>

        <ChevronRight className="w-3 h-3 text-slate-300" />

        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Shortcut to Cost Management */}
        <Link
          href="/cost/recipes"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200/70"
          title="レシピ原価管理システム（COST LAB）へ移動"
        >
          <Calculator className="w-3.5 h-3.5 text-amber-700" />
          <span>原価管理へ切替</span>
        </Link>

        {/* DM Pacing Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200/80 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-600 font-medium">DM送信枠: 42/50</span>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="店舗・案件を検索..." 
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 w-48 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
