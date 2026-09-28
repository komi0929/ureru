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
} from 'lucide-react';

const navItems = [
  { name: 'ダッシュボード', href: '/', icon: LayoutDashboard },
  { name: 'リード管理', href: '/leads', icon: Users },
  { name: 'DM生成', href: '/dm', icon: MessageSquare },
  { name: 'サンプル管理', href: '/samples', icon: Package },
  { name: '受発注', href: '/orders', icon: ShoppingCart },
  { name: '分析', href: '/analytics', icon: BarChart3 },
  { name: '設定', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm z-20">
      <div className="flex h-16 items-center px-6 border-b border-slate-100 shrink-0">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-slate-800">
          <span className="text-2xl">🚀</span>
          URERU
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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
