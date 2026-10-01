'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  UploadCloud, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Store
} from 'lucide-react';
import { getAvailablePeriods, resetStoreDataToSeed } from '@/lib/store-api';

interface StoreHeaderProps {
  currentPeriod?: string;
  onPeriodChange?: (period: string) => void;
}

export default function StoreHeader({
  currentPeriod = '2026-09',
  onPeriodChange,
}: StoreHeaderProps) {
  const router = useRouter();
  const [periods, setPeriods] = useState<string[]>(['2026-09']);
  const [resetNotice, setResetNotice] = useState(false);

  useEffect(() => {
    async function load() {
      const p = await getAvailablePeriods();
      setPeriods(p);
    }
    load();
  }, []);

  const handleReset = async () => {
    if (confirm('3年半のサンプルデータ状態に初期化しますか？（アップロードしたデータも初期状態に戻ります）')) {
      await resetStoreDataToSeed();
      setResetNotice(true);
      setTimeout(() => {
        setResetNotice(false);
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-8 flex items-center justify-between sticky top-0 z-30 font-sans shadow-2xs">
      {/* Left: Mode Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
          <Store className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm tracking-tight">
              直営店舗 経営分析 (STORE LAB)
            </span>
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
              3年半データ分析
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            AirレジCSV連携 / 季節トレンド / 成長鈍化・盛衰要因分析
          </div>
        </div>
      </div>

      {/* Right: Controls & Period Selector */}
      <div className="flex items-center gap-3">
        {resetNotice && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>初期データをロードしました</span>
          </div>
        )}

        {/* Period Selector (プルダウン) */}
        {onPeriodChange && (
          <div className="flex items-center gap-1.5 bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200/80">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] text-slate-600 font-medium">分析対象月:</span>
            <select
              value={currentPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="bg-transparent text-xs font-bold font-mono text-slate-900 focus:outline-none cursor-pointer"
            >
              {periods.map(p => (
                <option key={p} value={p}>
                  {p} ({p.split('-')[0]}年{parseInt(p.split('-')[1], 10)}月)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reset Demo Data Button */}
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
          title="3年半のデモデータにリセット"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">初期データリセット</span>
        </button>

        {/* Import CSV Button */}
        <Link
          href="/store/import"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>CSVインポート</span>
        </Link>
      </div>
    </header>
  );
}
