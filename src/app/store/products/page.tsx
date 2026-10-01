'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Star, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  ArrowRight,
  Filter
} from 'lucide-react';
import StoreHeader from '@/components/store/StoreHeader';
import { getProductSales, getAvailablePeriods } from '@/lib/store-api';
import { ProductSalesRecord, ProductLifecycleCategory } from '@/types/store';

const COLORS = ['#f59e0b', '#0284c7', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#94a3b8'];

export default function StoreProductsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-09');
  const [productSales, setProductSales] = useState<ProductSalesRecord[]>([]);
  const [compareProductSales, setCompareProductSales] = useState<ProductSalesRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 比較期間 (前年同月)
  const comparePeriod = useMemo(() => {
    const parts = selectedPeriod.split('-');
    if (parts.length === 2) {
      const prevYear = parseInt(parts[0], 10) - 1;
      return `${prevYear}-${parts[1]}`;
    }
    return '2025-09';
  }, [selectedPeriod]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [cur, prev] = await Promise.all([
        getProductSales(selectedPeriod),
        getProductSales(comparePeriod),
      ]);
      setProductSales(cur);
      setCompareProductSales(prev);
      setLoading(false);
    }
    load();
  }, [selectedPeriod, comparePeriod]);

  // 前年同月データとマージして比較数値を算出
  const mergedProducts = useMemo(() => {
    const prevMap = new Map<string, ProductSalesRecord>();
    compareProductSales.forEach(p => prevMap.set(p.product_name, p));

    const avgSales = productSales.reduce((sum, p) => sum + p.net_sales, 0) / (productSales.length || 1);

    return productSales.map(item => {
      const prev = prevMap.get(item.product_name);
      const prevSales = prev ? prev.net_sales : 0;
      const prevQty = prev ? prev.quantity : 0;
      const salesDiff = item.net_sales - prevSales;
      const salesDiffPct = prevSales > 0 ? Number(((salesDiff / prevSales) * 100).toFixed(1)) : 100;
      const qtyDiff = item.quantity - prevQty;

      // 4象限判定
      let lifecycle: ProductLifecycleCategory = 'review';
      const isHighSales = item.net_sales >= avgSales;
      const isGrowing = salesDiffPct >= 0;

      if (isHighSales && isGrowing) lifecycle = 'driver';
      else if (isHighSales && !isGrowing) lifecycle = 'declining_pillar';
      else if (!isHighSales && isGrowing) lifecycle = 'star';
      else lifecycle = 'review';

      return {
        ...item,
        prevSales,
        prevQty,
        salesDiff,
        salesDiffPct,
        qtyDiff,
        lifecycle,
      };
    });
  }, [productSales, compareProductSales]);

  // 4象限ごとの商品グループ
  const lifecycleGroups = useMemo(() => {
    const driver = mergedProducts.filter(p => p.lifecycle === 'driver');
    const decliningPillar = mergedProducts.filter(p => p.lifecycle === 'declining_pillar');
    const star = mergedProducts.filter(p => p.lifecycle === 'star');
    const review = mergedProducts.filter(p => p.lifecycle === 'review');

    return { driver, decliningPillar, star, review };
  }, [mergedProducts]);

  // カテゴリー一覧
  const categories = useMemo(() => {
    const set = new Set<string>();
    productSales.forEach(p => p.category && set.add(p.category));
    return Array.from(set);
  }, [productSales]);

  // カテゴリー別売上シェア (円グラフ用)
  const categoryPieData = useMemo(() => {
    const map = new Map<string, number>();
    productSales.forEach(p => {
      const cat = p.category || '未分類';
      map.set(cat, (map.get(cat) || 0) + p.net_sales);
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [productSales]);

  // フィルター
  const filteredProducts = useMemo(() => {
    return mergedProducts
      .filter(p => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return p.product_name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => b.net_sales - a.net_sales);
  }, [mergedProducts, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans">
      <StoreHeader 
        currentPeriod={selectedPeriod} 
        onPeriodChange={setSelectedPeriod} 
      />

      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">

        {/* Page Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                商品ポートフォリオ分析
              </span>
              <span className="text-xs text-slate-400">前年同期 ({comparePeriod}) 比</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              商品の盛衰 ＆ 4象限ライフサイクル診断
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              全商品を「大黒柱」「鈍化の主犯」「成長新星」「見直し候補」の4象限に自動分類。どの商品が売上を支え、どの商品が前年割れを起こしているかを解剖します。
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

        {/* 1. 4象限ライフサイクルマトリクス */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 🌟 1. 大黒柱 (Driver) */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                <span>大黒柱 (売上大 × 成長中)</span>
              </span>
              <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                {lifecycleGroups.driver.length}品
              </span>
            </div>
            <p className="text-[10px] text-emerald-700 leading-tight">
              店を支える強力な看板商品。絶対に欠品させずクオリティを死守。
            </p>
            <div className="space-y-1.5 pt-1">
              {lifecycleGroups.driver.slice(0, 4).map((p, idx) => (
                <div key={idx} className="bg-white/90 p-2 rounded-lg border border-emerald-100 text-xs flex justify-between">
                  <span className="font-bold text-slate-800 truncate mr-1">{p.product_name}</span>
                  <span className="font-mono text-emerald-700 font-bold shrink-0">+{p.salesDiffPct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* ⚠️ 2. 鈍化の主犯 (Declining Pillar) */}
          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>鈍化の主犯 (売上大 × 衰退中)</span>
              </span>
              <span className="text-[10px] font-bold bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full">
                {lifecycleGroups.decliningPillar.length}品
              </span>
            </div>
            <p className="text-[10px] text-rose-700 leading-tight">
              【最重要テコ入れ】売上規模が大きいが前年割れ。リピーター飽きのサイン。
            </p>
            <div className="space-y-1.5 pt-1">
              {lifecycleGroups.decliningPillar.slice(0, 4).map((p, idx) => (
                <div key={idx} className="bg-white/90 p-2 rounded-lg border border-rose-100 text-xs flex justify-between">
                  <span className="font-bold text-slate-800 truncate mr-1">{p.product_name}</span>
                  <span className="font-mono text-rose-600 font-bold shrink-0">{p.salesDiffPct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 🌱 3. 期待の新星 (Star) */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>期待の新星 (売上小 × 急成長)</span>
              </span>
              <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                {lifecycleGroups.star.length}品
              </span>
            </div>
            <p className="text-[10px] text-amber-700 leading-tight">
              新作や限定品で勢いがある品目。露出を増やして次の柱へ育成。
            </p>
            <div className="space-y-1.5 pt-1">
              {lifecycleGroups.star.slice(0, 4).map((p, idx) => (
                <div key={idx} className="bg-white/90 p-2 rounded-lg border border-amber-100 text-xs flex justify-between">
                  <span className="font-bold text-slate-800 truncate mr-1">{p.product_name}</span>
                  <span className="font-mono text-amber-700 font-bold shrink-0">+{p.salesDiffPct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 💤 4. 見直し候補 (Review) */}
          <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>見直し候補 (売上小 × 衰退中)</span>
              </span>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                {lifecycleGroups.review.length}品
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              仕込みロスやメニュー複雑化の原因。終売や季節限定化を検討。
            </p>
            <div className="space-y-1.5 pt-1">
              {lifecycleGroups.review.slice(0, 4).map((p, idx) => (
                <div key={idx} className="bg-white/90 p-2 rounded-lg border border-slate-200/60 text-xs flex justify-between">
                  <span className="font-bold text-slate-800 truncate mr-1">{p.product_name}</span>
                  <span className="font-mono text-slate-500 font-bold shrink-0">{p.salesDiffPct}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 2. カテゴリー別シェア円グラフ & コントロールバー */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* カテゴリー円グラフ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">カテゴリー別 売上シェア</span>
              <span className="text-[10px] text-slate-400">当月構成比</span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={2}
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`¥${Number(val).toLocaleString()}`, '売上']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1 text-xs pt-1 max-h-36 overflow-y-auto">
              {categoryPieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-slate-700 truncate">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    ¥{item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 全商品一覧テーブル (検索 & フィルター付き) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">商品別売上 ＆ 前年比一覧 ({filteredProducts.length}品)</span>
              </div>

              {/* 検索 & カテゴリーフィルター */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="商品名で検索..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">全カテゴリー</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* テーブル */}
            <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-[11px] sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">順位</th>
                    <th className="py-2.5 px-3 font-semibold">商品名</th>
                    <th className="py-2.5 px-3 font-semibold">カテゴリー</th>
                    <th className="py-2.5 px-3 font-semibold text-right">売上金額</th>
                    <th className="py-2.5 px-3 font-semibold text-right">出数</th>
                    <th className="py-2.5 px-3 font-semibold text-right">前年売上比</th>
                    <th className="py-2.5 px-3 font-semibold text-center">区分</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 font-mono text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{p.product_name}</td>
                      <td className="py-2 px-3 text-slate-500">{p.category}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900 text-right">
                        ¥{p.net_sales.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600 text-right">
                        {p.quantity.toLocaleString()}個
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-right">
                        <span className={p.salesDiffPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {p.salesDiffPct > 0 ? `+${p.salesDiffPct}` : p.salesDiffPct}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          p.lifecycle === 'driver' ? 'bg-emerald-100 text-emerald-800' :
                          p.lifecycle === 'declining_pillar' ? 'bg-rose-100 text-rose-800' :
                          p.lifecycle === 'star' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {p.lifecycle === 'driver' ? '大黒柱' :
                           p.lifecycle === 'declining_pillar' ? '鈍化主犯' :
                           p.lifecycle === 'star' ? '新星' : '見直し'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
