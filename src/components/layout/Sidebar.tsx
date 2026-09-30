'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Zap,
  Sparkles,
  Layers,
  Calculator,
  ArrowLeft,
} from 'lucide-react';

const navItems = [
  { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
  { name: '営業モード', href: '/sales', icon: Zap },
  { name: '店舗自動収集', href: '/discover', icon: Sparkles },
  { name: 'リード管理', href: '/leads', icon: Users },
  { name: 'サンプル管理', href: '/samples', icon: Package },
  { name: '受発注', href: '/orders', icon: ShoppingCart },
  { name: '分析', href: '/analytics', icon: BarChart3 },
  { name: '設定', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm z-20">
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg text-slate-800">
          <span className="text-2xl">🚀</span>
          <span>URERU <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-normal">営業促進</span></span>
        </Link>
      </div>

      {/* Switch tool or back to portal */}
      <div className="px-4 pt-3 pb-1 border-b border-slate-100 bg-slate-50/50 space-y-1.5">
        <Link
          href="/"
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>TOPポータルに戻る</span>
        </Link>
        <Link
          href="/cost/recipes"
          className="flex items-center justify-between px-2.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200/60"
        >
          <span className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>レシピ原価管理へ</span>
          </span>
          <span className="text-[10px] bg-amber-200/80 px-1 py-0.5 rounded">切替</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 ${
                isActive 
                  ? 'bg-green-50 text-emerald-600 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-slate-900 truncate">ユーザー名</span>
            <span className="text-xs text-slate-500 truncate">user@soystories.jp</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
