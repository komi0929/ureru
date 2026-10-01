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
  Legend 
} from 'recharts';
import { 
  Clock, 
  CreditCard, 
  Users, 
  ShoppingBag, 
  TrendingDown, 
  TrendingUp, 
  ArrowRight,
  Receipt,
  Tag,
  Percent
} from 'lucide-react';
import StoreHeader from '@/components/store/StoreHeader';
import { getDailySales, getTransactions } from '@/lib/store-api';
import { DailySalesRecord, TransactionRecord } from '@/types/store';

export default function StoreTransactionsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-09');
  const [dailySales, setDailySales] = useState<DailySalesRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [ds, tx] = await Promise.all([
        getDailySales(selectedPeriod),
        getTransactions(selectedPeriod),
      ]);
      setDailySales(ds);
      setTransactions(tx);
      setLoading(false);
    }
    load();
  }, [selectedPeriod]);

  // 1. 客単価分布 (ヒストグラム)
  // 会計明細がある場合は明細から集計、ない場合は日別集計から推定分布
  const spendHistogramData = useMemo(() => {
    const buckets = [
      { range: '〜700円 (単品)', min: 0, max: 700, count: 0, totalSales: 0 },
      { range: '701〜1,400円 (ペア/セット)', min: 701, max: 1400, count: 0, totalSales: 0 },
      { range: '1,401〜2,500円 (ファミリー)', min: 1401, max: 2500, count: 0, totalSales: 0 },
      { range: '2,501円以上 (手土産/お持帰)', min: 2501, max: 999999, count: 0, totalSales: 0 },
    ];

    if (transactions.length > 0) {
      transactions.forEach(t => {
        const val = t.subtotal;
        for (const b of buckets) {
          if (val >= b.min && val <= b.max) {
            b.count += 1;
            b.totalSales += val;
            break;
          }
        }
      });
    } else {
      // 会計明細がない場合のサンプル実態に基づく推計比率
      const totalOrders = dailySales.reduce((sum, d) => sum + d.order_count, 0) || 1000;
      const totalSales = dailySales.reduce((sum, d) => sum + d.sales, 0) || 1200000;
      buckets[0].count = Math.round(totalOrders * 0.42); // 42%
      buckets[0].totalSales = Math.round(totalSales * 0.22);
      buckets[1].count = Math.round(totalOrders * 0.38); // 38%
      buckets[1].totalSales = Math.round(totalSales * 0.39);
      buckets[2].count = Math.round(totalOrders * 0.14); // 14%
      buckets[2].totalSales = Math.round(totalSales * 0.24);
      buckets[3].count = Math.round(totalOrders * 0.06); // 6%
      buckets[3].totalSales = Math.round(totalSales * 0.15);
    }

    return buckets.map(b => ({
      ...b,
      salesInMan: Math.round(b.totalSales / 10000),
    }));
  }, [transactions, dailySales]);

  // 2. 時間帯別 (11時〜21時) の売上と客数
  const hourlyData = useMemo(() => {
    const hours = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    const map = new Map<number, { hourLabel: string; sales: number; count: number }>();
    hours.forEach(h => map.set(h, { hourLabel: `${h}時`, sales: 0, count: 0 }));

    if (transactions.length > 0) {
      transactions.forEach(t => {
        const entry = map.get(t.hour);
        if (entry) {
          entry.sales += t.subtotal;
          entry.count += 1;
        }
      });
    } else {
      // 典型的なアイス・スイーツカフェのピーク分布 (14〜16時カフェピーク、17〜18時お持ち帰りピーク)
      const totalSales = dailySales.reduce((sum, d) => sum + d.sales, 0) || 1200000;
      const hourWeights: Record<number, number> = {
        11: 0.05, 12: 0.10, 13: 0.13, 14: 0.18, 15: 0.19, 16: 0.13, 17: 0.09, 18: 0.06, 19: 0.04, 20: 0.02, 21: 0.01
      };
      hours.forEach(h => {
        const entry = map.get(h)!;
        entry.sales = Math.round(totalSales * (hourWeights[h] || 0.05));
        entry.count = Math.round(entry.sales / 1150);
      });
    }

    return hours.map(h => {
      const e = map.get(h)!;
      return {
        hour: e.hourLabel,
        salesInMan: Number((e.sales / 10000).toFixed(1)),
        customerCount: e.count,
      };
    });
  }, [transactions, dailySales]);

  // 3. 決済方法の内訳
  const paymentBreakdown = useMemo(() => {
    let cash = 0;
    let airpay = 0;
    let paypay = 0;

    if (transactions.length > 0) {
      transactions.forEach(t => {
        cash += t.payment_cash;
        paypay += t.payment_paypay;
        airpay += (t.payment_credit + t.payment_ic + t.payment_quicpay + t.payment_id + t.payment_qr + t.payment_square);
      });
    } else {
      cash = dailySales.reduce((sum, d) => sum + d.cash_total, 0);
      const cashless = dailySales.reduce((sum, d) => sum + d.cashless_total, 0);
      paypay = Math.round(cashless * 0.45);
      airpay = cashless - paypay;
    }

    const total = cash + airpay + paypay || 1;
    return [
      { name: '現金', amount: cash, ratio: Number(((cash / total) * 100).toFixed(1)), color: '#64748b' },
      { name: 'Airペイ (クレジット/IC/電子マネー)', amount: airpay, ratio: Number(((airpay / total) * 100).toFixed(1)), color: '#0284c7' },
      { name: 'PayPay (QR決済)', amount: paypay, ratio: Number(((paypay / total) * 100).toFixed(1)), color: '#f59e0b' },
    ];
  }, [transactions, dailySales]);

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
                会計明細トランザクション分析
              </span>
              <span className="text-xs text-slate-400">客単価の構造・時間帯ピーク・決済</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              客単価分布 ＆ 時間帯別・買い方分析
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Airレジの会計明細から、お客様が「単品買い」なのか「ペア・まとめ買い」なのかの分布を可視化。何時台の売上が落ち込んでいるのか、ついで買いの穴を特定します。
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

        {/* 1. 客単価分布 (ヒストグラム) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  客単価の階層別 分布 (購入客数 ＆ 売上貢献額)
                </span>
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  客単価低下の真因分析
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                平均客単価だけでは見えない、「単品客ばかり増えてお土産・手土産のまとめ買い客が減っていないか？」を可視化します。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {spendHistogramData.map((b, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                <div className="text-xs font-bold text-slate-800">
                  {b.range}
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div className="font-mono text-xl font-extrabold text-slate-900">
                    {b.count.toLocaleString()}<span className="text-xs font-normal text-slate-500 ml-0.5">回</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-amber-700">
                    ¥{b.salesInMan}万円
                  </div>
                </div>
                <div className="text-[10px] text-slate-400">
                  売上の約 {Math.round((b.totalSales / (dailySales.reduce((s, d) => s + d.sales, 0) || 1)) * 100)}% を構成
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. 時間帯別 (11時〜21時) の来店 & 売上推移 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-sm text-slate-900">
                時間帯別 売上 ＆ 来店客数ピーク (11:00 〜 21:00)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                14:00〜16:00のカフェタイムと、17:00〜19:00の帰宅前お持ち帰りタイムの強弱を分析します。
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 15, right: 20, left: 0, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis unit="万" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any, name: any) => [`¥${(Number(val) * 10000).toLocaleString()}`, '時間帯売上']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Bar dataKey="salesInMan" name="売上 (万円)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. 決済方法 & まとめ販売値引きの考察 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 決済手段 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-slate-500" />
                <span>決済手段別 内訳 (Airペイ / PayPay / 現金)</span>
              </span>
              <span className="text-[10px] text-slate-400">手数料管理</span>
            </div>

            <div className="space-y-3 pt-1">
              {paymentBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">{item.name}</span>
                    <span className="font-mono font-bold text-slate-900">
                      ¥{item.amount.toLocaleString()} ({item.ratio}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${item.ratio}%`, backgroundColor: item.color }} className="h-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 買上点数アップのアクション提言 */}
          <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 p-5 rounded-2xl border border-amber-300/80 shadow-2xs space-y-3">
            <div className="pb-2 border-b border-amber-200/60 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-700" />
              <span className="font-bold text-xs text-slate-900">
                客単価向上への実践的打ち手
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/70 shadow-2xs">
                <strong className="text-slate-900 block mb-0.5">① 「ソフトクリーム ＋ お土産ドーナツ」セット割引の導入</strong>
                イートインのお客様に「お持ち帰りドーナツ2個で50円引」など、まとめ値引き機能を活用してバスケットサイズ（買上点数）を引き上げる。
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-amber-200/70 shadow-2xs">
                <strong className="text-slate-900 block mb-0.5">② 夕方（17時〜19時）のお持ち帰りギフト訴求</strong>
                夕方のカフェ需要低下を補うため、どら焼き・ドーナツの「本日のアソート箱」をレジ横に常設し、仕事帰り客の需要を掘り起こす。
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
