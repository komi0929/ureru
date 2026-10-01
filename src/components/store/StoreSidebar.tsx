'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Store, 
  BarChart3, 
  CalendarRange, 
  Layers, 
  Clock, 
  UploadCloud, 
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calculator,
  HelpCircle
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    name: '総合診断 & 成長分析',
    href: '/store',
    icon: BarChart3,
  },
  {
    name: '季節トレンド & 月別推移',
    href: '/store/seasonality',
    icon: CalendarRange,
    badge: '3年比較',
  },
  {
    name: '商品ポートフォリオ & 盛衰',
    href: '/store/products',
    icon: Layers,
  },
  {
    name: '客単価 & 買上点数・時間帯',
    href: '/store/transactions',
    icon: Clock,
  },
  {
    name: 'Airレジ CSVインポート',
    href: '/store/import',
    icon: UploadCloud,
    badge: '自動判別',
  },
];

export default function StoreSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 z-40 text-slate-300 font-sans">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md group-hover:scale-105 transition-transform">
            🏪
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wider uppercase">
              STORE LAB
            </div>
            <div className="text-[10px] text-amber-400 font-medium">
              直営店舗・経営分析
            </div>
          </div>
        </Link>
      </div>

      {/* Mode Badge & Guidance */}
      <div className="p-3 mx-4 my-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs">
        <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px] mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Airレジ連携 経営ダッシュボード</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          AirレジのCSV（商品別・日別・会計明細）から季節トレンドと成長鈍化の要因を自動特定します。
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
          店舗分析メニュー
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isActive
                      ? 'bg-slate-900/20 text-slate-950'
                      : 'bg-slate-800 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Mode Switcher */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30 space-y-2">
        <div className="text-[10px] font-semibold text-slate-500 px-1 uppercase tracking-wider">
          他モードへ切り替え
        </div>

        <Link
          href="/cost/recipes"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors border border-slate-700/60 group"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🏭</span>
            <span>製造・レシピ原価管理</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </Link>

        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors border border-slate-800"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>ポータルハブに戻る</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
