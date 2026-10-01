'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  CalendarRange, 
  Sun, 
  Snowflake, 
  CloudSun, 
  Leaf, 
  TrendingUp, 
  ArrowRight, 
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import StoreHeader from '@/components/store/StoreHeader';
import { getProductSales, getAvailablePeriods } from '@/lib/store-api';
import { ProductSalesRecord } from '@/types/store';

export default function SeasonalityPage() {
  const [allProductSales, setAllProductSales] = useState<ProductSalesRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 1〜12月
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getProductSales();
      setAllProductSales(data);
      setLoading(false);
    }
    load();
  }, []);

  // 1. 1月〜12月の月別カテゴリー構成比サイクル
  const monthlyCategoryCycle = useMemo(() => {
    const monthMap = new Map<number, {
      month: number;
      monthLabel: string;
      '冷菓 (ソフト・アイス)': number;
      '焼菓子 (ドーナツ・ワッフル)': number;
      '和菓子 (どらやき)': number;
      'ドリンク': number;
      'その他': number;
    }>();

    for (let m = 1; m <= 12; m++) {
      monthMap.set(m, {
        month: m,
        monthLabel: `${m}月`,
        '冷菓 (ソフト・アイス)': 0,
        '焼菓子 (ドーナツ・ワッフル)': 0,
        '和菓子 (どらやき)': 0,
        'ドリンク': 0,
        'その他': 0,
      });
    }

    allProductSales.forEach(item => {
      const parts = item.period.split('-');
      if (parts.length === 2) {
        const m = parseInt(parts[1], 10);
        const entry = monthMap.get(m);
        if (entry) {
          const cat = item.category || '';
          const name = item.product_name || '';
          if (cat.includes('ソフト') || cat.includes('アイス') || name.includes('スムージー')) {
            entry['冷菓 (ソフト・アイス)'] += item.net_sales;
          } else if (cat.includes('ドーナツ') || cat.includes('ワッフル')) {
            entry['焼菓子 (ドーナツ・ワッフル)'] += item.net_sales;
          } else if (cat.includes('どらやき')) {
            entry['和菓子 (どらやき)'] += item.net_sales;
          } else if (cat.includes('ドリンク')) {
            entry['ドリンク'] += item.net_sales;
          } else {
            entry['その他'] += item.net_sales;
          }
        }
      }
    });

    // 万円単位に変換
    return Array.from(monthMap.values()).map(item => ({
      ...item,
      '冷菓 (ソフト・アイス)': Math.round(item['冷菓 (ソフト・アイス)'] / 10000),
      '焼菓子 (ドーナツ・ワッフル)': Math.round(item['焼菓子 (ドーナツ・ワッフル)'] / 10000),
      '和菓子 (どらやき)': Math.round(item['和菓子 (どらやき)'] / 10000),
      'ドリンク': Math.round(item['ドリンク'] / 10000),
      'その他': Math.round(item['その他'] / 10000),
    }));
  }, [allProductSales]);

  // 2. 選択された「月（例: 9月）」の歴代年次比較 (2023年 vs 2024年 vs 2025年 vs 2026年)
  const yearlySameMonthComparison = useMemo(() => {
    const monthStr = String(selectedMonth).padStart(2, '0');
    const filtered = allProductSales.filter(p => p.period.endsWith(`-${monthStr}`));

    const yearMap = new Map<string, {
      year: string;
      totalSales: number;
      topProduct: string;
      topProductSales: number;
      coldSales: number;
      bakedSales: number;
    }>();

    ['2023', '2024', '2025', '2026'].forEach(yr => {
      yearMap.set(yr, {
        year: `${yr}年`,
        totalSales: 0,
        topProduct: '',
        topProductSales: 0,
        coldSales: 0,
        bakedSales: 0,
      });
    });

    const productByYear = new Map<string, Map<string, number>>();

    filtered.forEach(item => {
      const yr = item.period.split('-')[0];
      const entry = yearMap.get(yr);
      if (entry) {
        entry.totalSales += item.net_sales;
        if (item.category.includes('ソフト') || item.category.includes('アイス')) {
          entry.coldSales += item.net_sales;
        } else {
          entry.bakedSales += item.net_sales;
        }

        if (!productByYear.has(yr)) productByYear.set(yr, new Map());
        const pMap = productByYear.get(yr)!;
        pMap.set(item.product_name, (pMap.get(item.product_name) || 0) + item.net_sales);
      }
    });

    // 各年のトップ商品を決定
    productByYear.forEach((pMap, yr) => {
      let maxSales = 0;
      let maxName = '';
      pMap.forEach((sales, name) => {
        if (sales > maxSales) {
          maxSales = sales;
          maxName = name;
        }
      });
      const entry = yearMap.get(yr);
      if (entry) {
        entry.topProduct = maxName;
        entry.topProductSales = maxSales;
      }
    });

    return Array.from(yearMap.values()).map(y => ({
      ...y,
      salesInMan: Math.round(y.totalSales / 10000),
      coldSalesInMan: Math.round(y.coldSales / 10000),
      bakedSalesInMan: Math.round(y.bakedSales / 10000),
    }));
  }, [allProductSales, selectedMonth]);

  // 3. 主要商品の季節指数 (Seasonal Index: 年平均を1.0としたときの各月の出数倍率)
  const seasonalIndexItems = useMemo(() => {
    const targetProducts = [
      'ワッフルソフト（コーン）',
      'マンゴースムージー',
      'シナモン',
      'きなこ',
      'プレーンワッフル',
      'コーヒー',
      '豆乳クリーム（どらやき）',
      'チョコ（ワッフルアイス）'
    ];

    const result: {
      product_name: string;
      category: string;
      summerPeak: number; // 7-8月指数
      winterIndex: number; // 12-2月指数
      bestMonth: string;
      recommendation: string;
    }[] = [];

    targetProducts.forEach(prod => {
      const items = allProductSales.filter(p => p.product_name === prod);
      if (items.length === 0) return;

      const monthSums = new Array(12).fill(0);
      const monthCounts = new Array(12).fill(0);

      items.forEach(p => {
        const m = parseInt(p.period.split('-')[1], 10) - 1;
        monthSums[m] += p.quantity;
        monthCounts[m] += 1;
      });

      const monthAverages = monthSums.map((sum, i) => monthCounts[i] > 0 ? sum / monthCounts[i] : 0);
      const overallAvg = monthAverages.reduce((a, b) => a + b, 0) / 12 || 1;

      const indices = monthAverages.map(avg => Number((avg / overallAvg).toFixed(2)));
      const summerPeak = Math.max(indices[6], indices[7]); // 7月 or 8月
      const winterIndex = Number(((indices[11] + indices[0] + indices[1]) / 3).toFixed(2)); // 12〜2月平均

      let maxMonthIdx = 0;
      let maxVal = 0;
      indices.forEach((val, i) => {
        if (val > maxVal) {
          maxVal = val;
          maxMonthIdx = i;
        }
      });

      let recommendation = '';
      if (summerPeak > 1.4) {
        recommendation = '夏特化商材。6月上旬から資材確保、8月末から仕込みを絞りロス防止。';
      } else if (winterIndex > 1.1) {
        recommendation = '秋冬の安定柱。10月以降に手土産セットやホットドリンクとのセット訴求が有効。';
      } else {
        recommendation = '年間定番。季節変動が少なく、仕込み計画のベースに最適。';
      }

      result.push({
        product_name: prod,
        category: items[0].category,
        summerPeak,
        winterIndex,
        bestMonth: `${maxMonthIdx + 1}月 (平月の${maxVal}倍)`,
        recommendation,
      });
    });

    return result;
  }, [allProductSales]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans">
      <StoreHeader />

      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">

        {/* Page Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                シーズナリティ分析
              </span>
              <span className="text-xs text-slate-400">夏跳ね・冬落ちサイクルの科学</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              季節トレンド ＆ 商品交代サイクル
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Airレジでは単月でしか見られなかった商品売上を、12ヶ月の季節サイクルおよび歴代の同月比較で横断分析。冷菓と焼菓子の主役交代のタイミングを可視化します。
            </p>
          </div>

          <Link
            href="/store"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs"
          >
            <span>総合診断へ戻る</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 1. 12ヶ月のカテゴリー交代サイクル (積層面グラフ) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  12ヶ月のカテゴリー構成比サイクル (冷菓 vs 焼菓子・和菓子・ドリンク)
                </span>
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  年間波形
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                夏（7〜8月）に冷菓が急拡大し、秋〜冬（10〜2月）にSOYドーナツ・ワッフル・どら焼きの比率が約50%まで高まる交代サイクルです。
              </p>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCategoryCycle} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                <YAxis unit="万" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any, name: any) => [`¥${(Number(val) * 10000).toLocaleString()}`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="冷菓 (ソフト・アイス)" stackId="1" stroke="#f59e0b" fill="#fbbf24" fillOpacity={0.8} />
                <Area type="monotone" dataKey="焼菓子 (ドーナツ・ワッフル)" stackId="1" stroke="#d97706" fill="#b45309" fillOpacity={0.7} />
                <Area type="monotone" dataKey="和菓子 (どらやき)" stackId="1" stroke="#10b981" fill="#34d399" fillOpacity={0.6} />
                <Area type="monotone" dataKey="ドリンク" stackId="1" stroke="#3b82f6" fill="#60a5fa" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. 歴代の「同月」3年比較 (2023 vs 2024 vs 2025 vs 2026) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  歴代の「同月」比較 (年次推移)
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                  季節要因を除いた真の成長力
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                調べたい「月」を選択すると、過去3年半のその月だけの売上・冷菓vs焼菓子比率・看板商品の移り変わりを定点比較できます。
              </p>
            </div>

            {/* 月選択セレクター */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMonth(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedMonth === m
                      ? 'bg-amber-500 text-slate-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {m}月
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* 棒グラフ */}
            <div className="h-64 w-full lg:col-span-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlySameMonthComparison} margin={{ top: 15, right: 20, left: 0, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis unit="万" tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [`¥${(Number(val) * 10000).toLocaleString()}`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                  <Bar dataKey="coldSalesInMan" name="冷菓売上 (万円)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bakedSalesInMan" name="焼菓子・その他 (万円)" fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 各年のトピックス */}
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                歴代【{selectedMonth}月】のトレンド変化
              </div>
              {yearlySameMonthComparison.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/60 last:border-none">
                  <div>
                    <span className="font-bold text-slate-800">{item.year}:</span>
                    <div className="text-[11px] text-slate-500">
                      最多: {item.topProduct || 'データなし'}
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-slate-900">
                    ¥{(item.totalSales).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. 商品別 季節指数ヒートマップ & 仕込み提言 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-slate-900">
                主要商品の季節指数 ＆ 仕込み・メニュー切替提言
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                各商品が平月に比べて夏・冬に何倍売れるかを科学的に指数化。仕込み量調整や限定メニューの投入時期を最適化します。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seasonalIndexItems.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-amber-300 transition-all shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {item.product_name}
                  </div>
                  <span className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                    {item.category}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-1">
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <div className="text-[10px] text-amber-600 font-semibold flex items-center justify-center gap-0.5">
                      <Sun className="w-3 h-3" /> 夏ピーク
                    </div>
                    <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                      {item.summerPeak}倍
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <div className="text-[10px] text-blue-600 font-semibold flex items-center justify-center gap-0.5">
                      <Snowflake className="w-3 h-3" /> 冬指数
                    </div>
                    <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                      {item.winterIndex}倍
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <div className="text-[10px] text-emerald-600 font-semibold flex items-center justify-center gap-0.5">
                      <Sparkles className="w-3 h-3" /> 最盛期
                    </div>
                    <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                      {item.bestMonth}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                  <strong className="text-amber-900">💡 アクション提言: </strong>
                  {item.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
