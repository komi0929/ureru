'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Store, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  ShoppingBag, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  Calendar,
  Coffee,
  HelpCircle
} from 'lucide-react';
import StoreHeader from '@/components/store/StoreHeader';
import { 
  getDailySales, 
  getProductSales, 
  getGrowthDiagnosis, 
  getAvailablePeriods 
} from '@/lib/store-api';
import { DailySalesRecord, ProductSalesRecord, GrowthDiagnosis } from '@/types/store';

export default function StoreDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-09');
  const [dailySales, setDailySales] = useState<DailySalesRecord[]>([]);
  const [allDailySales, setAllDailySales] = useState<DailySalesRecord[]>([]);
  const [productSales, setProductSales] = useState<ProductSalesRecord[]>([]);
  const [diagnosis, setDiagnosis] = useState<GrowthDiagnosis | null>(null);
  const [loading, setLoading] = useState(true);

  // 比較対象（前年同月）の算出 (例: 2026-09 -> 2025-09)
  const comparePeriod = useMemo(() => {
    const parts = selectedPeriod.split('-');
    if (parts.length === 2) {
      const prevYear = parseInt(parts[0], 10) - 1;
      return `${prevYear}-${parts[1]}`;
    }
    return '2025-09';
  }, [selectedPeriod]);

  // データロード
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [curDS, allDS, curPS, diag] = await Promise.all([
        getDailySales(selectedPeriod),
        getDailySales(), // 全期間 (3年半トレンド用)
        getProductSales(selectedPeriod),
        getGrowthDiagnosis(selectedPeriod, comparePeriod),
      ]);

      setDailySales(curDS);
      setAllDailySales(allDS);
      setProductSales(curPS);
      setDiagnosis(diag);
      setLoading(false);
    }
    loadData();
  }, [selectedPeriod, comparePeriod]);

  // 当月の主要KPI集計
  const currentMonthKPI = useMemo(() => {
    const totalSales = dailySales.reduce((sum, d) => sum + d.sales, 0);
    const totalOrders = dailySales.reduce((sum, d) => sum + d.order_count, 0);
    const totalCustomers = dailySales.reduce((sum, d) => sum + d.customer_count, 0);
    const totalItems = dailySales.reduce((sum, d) => sum + d.item_count, 0);
    const avgSpend = totalCustomers > 0 ? Math.round(totalSales / totalCustomers) : 0;
    const itemsPerOrder = totalOrders > 0 ? Number((totalItems / totalOrders).toFixed(2)) : 0;
    const sales10pct = dailySales.reduce((sum, d) => sum + d.sales_10pct, 0);
    const sales8pct = dailySales.reduce((sum, d) => sum + d.sales_8pct, 0);
    const eatInRatio = totalSales > 0 ? Number(((sales10pct / totalSales) * 100).toFixed(1)) : 0;
    const cashlessTotal = dailySales.reduce((sum, d) => sum + d.cashless_total, 0);
    const cashlessRatio = totalSales > 0 ? Number(((cashlessTotal / totalSales) * 100).toFixed(1)) : 0;

    return {
      totalSales,
      totalCustomers,
      avgSpend,
      itemsPerOrder,
      eatInRatio,
      cashlessRatio,
    };
  }, [dailySales]);

  // 3年半の月次トレンド推移データ (全期間)
  const monthlyTrendData = useMemo(() => {
    const monthlyMap = new Map<string, {
      period: string;
      sales: number;
      customers: number;
      avgSpend: number;
      itemsPerOrder: number;
    }>();

    allDailySales.forEach(d => {
      const p = d.period;
      if (!monthlyMap.has(p)) {
        monthlyMap.set(p, {
          period: p,
          sales: 0,
          customers: 0,
          avgSpend: 0,
          itemsPerOrder: 0,
        });
      }
      const entry = monthlyMap.get(p)!;
      entry.sales += d.sales;
      entry.customers += d.customer_count;
    });

    const result = Array.from(monthlyMap.values())
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(item => ({
        ...item,
        avgSpend: item.customers > 0 ? Math.round(item.sales / item.customers) : 0,
        salesInMan: Math.round(item.sales / 10000), // 万円単位
      }));

    return result;
  }, [allDailySales]);

  // 曜日別売上集計
  const weekdayData = useMemo(() => {
    const days = ['月', '火', '水', '木', '金', '土', '日'];
    const map = new Map<string, { day: string; sales: number; count: number }>();
    days.forEach(d => map.set(d, { day: d, sales: 0, count: 0 }));

    dailySales.forEach(d => {
      const entry = map.get(d.day_of_week);
      if (entry) {
        entry.sales += d.sales;
        entry.count += 1;
      }
    });

    return days.map(d => {
      const e = map.get(d)!;
      return {
        day: d,
        avgDailySales: e.count > 0 ? Math.round(e.sales / e.count) : 0,
      };
    });
  }, [dailySales]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans">
      <StoreHeader 
        currentPeriod={selectedPeriod} 
        onPeriodChange={setSelectedPeriod} 
      />

      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">

        {/* 1. Growth Diagnosis Hero Banner (成長鈍化・要因診断) */}
        {diagnosis && (
          <div className={`p-6 rounded-2xl border transition-all shadow-2xs relative overflow-hidden ${
            diagnosis.overall_status === 'growing'
              ? 'bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/40 border-emerald-200'
              : diagnosis.overall_status === 'slowing'
              ? 'bg-gradient-to-r from-amber-50/90 via-white to-amber-50/40 border-amber-200'
              : 'bg-gradient-to-r from-rose-50/90 via-white to-rose-50/40 border-rose-200'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
              
              {/* Diagnosis Summary Left */}
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    diagnosis.overall_status === 'growing'
                      ? 'bg-emerald-600 text-white'
                      : diagnosis.overall_status === 'slowing'
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    {diagnosis.status_label}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    前年同月 ({comparePeriod}) との比較診断
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {diagnosis.summary_message}
                </h2>

                {/* Factors List */}
                <div className="pt-2 space-y-2">
                  {diagnosis.key_factors.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      {f.impact === 'negative' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong className="text-slate-900 mr-1.5">{f.factor}:</strong>
                        <span className="text-slate-600">{f.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* YoY Key Metrics Cards Right */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 w-full lg:w-auto">
                {/* 1. 売上 YoY */}
                <div className="bg-white/95 p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">月売上 前年比</div>
                  <div className={`text-base font-bold font-mono mt-0.5 flex items-center justify-center gap-0.5 ${
                    diagnosis.yoy_sales_change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {diagnosis.yoy_sales_change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span>{diagnosis.yoy_sales_change > 0 ? `+${diagnosis.yoy_sales_change}` : diagnosis.yoy_sales_change}%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    ¥{Math.round(currentMonthKPI.totalSales / 10000)}万円
                  </div>
                </div>

                {/* 2. 客数 YoY */}
                <div className="bg-white/95 p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">客数 前年比</div>
                  <div className={`text-base font-bold font-mono mt-0.5 flex items-center justify-center gap-0.5 ${
                    diagnosis.yoy_customer_change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {diagnosis.yoy_customer_change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span>{diagnosis.yoy_customer_change > 0 ? `+${diagnosis.yoy_customer_change}` : diagnosis.yoy_customer_change}%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {currentMonthKPI.totalCustomers.toLocaleString()}名
                  </div>
                </div>

                {/* 3. 客単価 YoY */}
                <div className="bg-white/95 p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">客単価 前年比</div>
                  <div className={`text-base font-bold font-mono mt-0.5 flex items-center justify-center gap-0.5 ${
                    diagnosis.yoy_avg_spend_change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {diagnosis.yoy_avg_spend_change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span>{diagnosis.yoy_avg_spend_change > 0 ? `+${diagnosis.yoy_avg_spend_change}` : diagnosis.yoy_avg_spend_change}%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    ¥{currentMonthKPI.avgSpend.toLocaleString()}
                  </div>
                </div>

                {/* 4. 買上点数 YoY */}
                <div className="bg-white/95 p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">買上点数 前年比</div>
                  <div className={`text-base font-bold font-mono mt-0.5 flex items-center justify-center gap-0.5 ${
                    diagnosis.yoy_items_per_order_change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {diagnosis.yoy_items_per_order_change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span>{diagnosis.yoy_items_per_order_change > 0 ? `+${diagnosis.yoy_items_per_order_change}` : diagnosis.yoy_items_per_order_change}%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {currentMonthKPI.itemsPerOrder}点 / 組
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* 2. Top Movers: 成長を牽引した商品 vs 落ち込み要因となった商品 */}
        {diagnosis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 落ち込み商品ワースト5 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                    <TrendingDown className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-bold text-xs text-slate-900">売上を押し下げている商品 (前年同月比)</span>
                    <div className="text-[10px] text-slate-400">成長鈍化の主因となっている品目</div>
                  </div>
                </div>
                <Link
                  href="/store/products"
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  詳細分析 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2">
                {diagnosis.declining_products.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50/70 hover:bg-slate-100/70 transition-colors">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-800 truncate">{p.product_name}</div>
                      <div className="text-[10px] text-slate-400">{p.category}</div>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <div className="font-bold text-rose-600">-¥{p.loss_amount.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">{p.change_rate}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 成長牽引商品ベスト5 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-bold text-xs text-slate-900">売上を伸ばしている商品 (前年同月比)</span>
                    <div className="text-[10px] text-slate-400">次の柱として成長中の品目</div>
                  </div>
                </div>
                <Link
                  href="/store/products"
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  詳細分析 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2">
                {diagnosis.growing_products.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50/70 hover:bg-slate-100/70 transition-colors">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-800 truncate">{p.product_name}</div>
                      <div className="text-[10px] text-slate-400">{p.category}</div>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <div className="font-bold text-emerald-600">+¥{p.gain_amount.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">+{p.change_rate}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 3. Multi-Year Long Term Trend (3年半の月次推移チャート) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  過去3年半の月次トレンド推移 (売上 ＆ 客数・客単価)
                </span>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  2023年4月 〜 現在 (42ヶ月)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                棒グラフ: 月間売上 (万円) / 折れ線: 客数 (名) ＆ 客単価 (円)。夏の季節跳ねと、2025年以降の踊り場が確認できます。
              </p>
            </div>

            <Link
              href="/store/seasonality"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 shrink-0"
            >
              季節トレンド比較へ <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrendData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 10 }} 
                  interval={2}
                />
                <YAxis 
                  yAxisId="left" 
                  unit="万" 
                  tick={{ fontSize: 10 }}
                  label={{ value: '売上(万円)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  unit="名" 
                  tick={{ fontSize: 10 }}
                  label={{ value: '客数(名)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name.includes('売上') ? `¥${(val * 10000).toLocaleString()}` : `${Number(val).toLocaleString()}`,
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="salesInMan" name="月売上 (万円)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="customers" name="客数 (名)" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Monthly KPI Breakdown & Weekday Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 当月内訳カード */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="pb-2 border-b border-slate-100 font-bold text-xs text-slate-900 flex items-center justify-between">
              <span>当月 ({selectedPeriod}) の運営構成比</span>
              <span className="text-[10px] text-slate-400">Airレジ日別集計</span>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">イートイン (10%) vs テイクアウト (8%)</span>
                  <span className="font-bold text-slate-900">{currentMonthKPI.eatInRatio}% 店内</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div style={{ width: `${currentMonthKPI.eatInRatio}%` }} className="bg-amber-500 h-full"></div>
                  <div style={{ width: `${100 - currentMonthKPI.eatInRatio}%` }} className="bg-emerald-500 h-full"></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>店内イートイン: {currentMonthKPI.eatInRatio}%</span>
                  <span>お持ち帰り: {(100 - currentMonthKPI.eatInRatio).toFixed(1)}%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">決済手段: キャッシュレス比率</span>
                  <span className="font-bold text-slate-900">{currentMonthKPI.cashlessRatio}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div style={{ width: `${currentMonthKPI.cashlessRatio}%` }} className="bg-blue-500 h-full"></div>
                  <div style={{ width: `${100 - currentMonthKPI.cashlessRatio}%` }} className="bg-slate-300 h-full"></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Airペイ / PayPay: {currentMonthKPI.cashlessRatio}%</span>
                  <span>現金: {(100 - currentMonthKPI.cashlessRatio).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 曜日別平均日商チャート */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 lg:col-span-2">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900">曜日別 平均日商比較 (当月)</span>
                <span className="text-[10px] text-slate-400 ml-2">平日 vs 土日祝の集客バランス</span>
              </div>
            </div>

            <div className="h-44 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weekdayData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis unit="円" tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any) => [`¥${Number(val).toLocaleString()}`, '平均売上']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                  />
                  <Bar dataKey="avgDailySales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
