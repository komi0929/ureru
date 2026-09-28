'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'ダッシュボード',
  '/leads': 'リード管理',
  '/dm': 'DM生成',
  '/samples': 'サンプル管理',
  '/orders': '受発注',
  '/analytics': '分析',
  '/settings': '設定',
};

export default function Header() {
  const pathname = usePathname();
  
  // Get title or default to generic name if nested path
  const title = pageTitles[pathname] || 'SoyStories';

  return (
    <header className="h-16 bg-slate-50 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* DM Pacing Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-slate-100">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-600">DM送信枠: 42/50</span>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="検索..." 
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors focus:outline-none">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-50"></span>
        </button>
      </div>
    </header>
  );
}
