'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { 
  Calculator, 
  TrendingUp, 
  PieChart, 
  Boxes,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Info
} from 'lucide-react';
import { Recipe, Material, RecipeCostBreakdown, PackageType } from '@/types/cost';
import { getRecipes, getMaterials, calculateRecipeCost } from '@/lib/cost-api';
import TutorialModal from '@/components/cost/TutorialModal';

export default function CostSummaryPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePackageType, setActivePackageType] = useState<PackageType>('cup');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const [r, m] = await Promise.all([getRecipes(), getMaterials()]);
      setRecipes(r);
      setMaterials(m);
      setLoading(false);
    }
    load();
  }, []);

  const isBulk = activePackageType === 'bulk';
  const unitLabel = isBulk ? '1本 (2L)' : '1個 (120ml)';
  const shortUnit = isBulk ? '本' : '個';

  const breakdowns = useMemo(() => {
    return recipes.map(r => calculateRecipeCost(r, materials, activePackageType));
  }, [recipes, materials, activePackageType]);

  // Chart 1: Cost Breakdown Stacked Bar Chart data
  const stackedChartData = useMemo(() => {
    return breakdowns.map(b => ({
      name: b.recipe.name.replace('米粉アイス【', '').replace('】', ''),
      '材料費': Number(b.unit_ingredient_cost.toFixed(1)),
      '資材代': Number(b.unit_packaging_cost.toFixed(1)),
      '人件費': Number(b.unit_labor_cost.toFixed(1)),
      '製造原価': Math.round(b.unit_manufacturing_cost),
      '想定卸価格': b.wholesale.price,
    }));
  }, [breakdowns]);

  // Chart 2: Margin Comparison data
  const marginChartData = useMemo(() => {
    return breakdowns.map(b => ({
      name: b.recipe.name.replace('米粉アイス【', '').replace('】', ''),
      '製造原価': Math.round(b.unit_manufacturing_cost),
      '卸粗利益': Math.round(b.wholesale.gross_margin),
      '卸価格': b.wholesale.price,
      '粗利率': Number(b.wholesale.margin_ratio.toFixed(1)),
    }));
  }, [breakdowns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 text-xs">データを分析中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              原価構造・粗利分析
            </span>
            <span className="text-xs text-slate-400">全10フレーバー比較（カップ ⇔ 2Lバルク）</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">原価・粗利サマリー分析</h1>
          <p className="text-xs text-slate-500 mt-1">
            製造形態（個食カップ / 業務用2Lバルク）を切り替えて、材料費・資材費・人件費の構成バランスと卸売粗利マージンを比較分析します。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/70 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>使い方ガイド</span>
          </button>

          <Link
            href="/cost/recipes"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors border border-slate-200/80"
          >
            <span>レシピ一覧に戻る</span>
          </Link>
        </div>
      </div>

      {/* Segmented Switcher for Cup vs Bulk */}
      <div className="flex items-center justify-between">
        <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setActivePackageType('cup')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              !isBulk
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>🍨 個食カップ (120ml)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${!isBulk ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'}`}>
              65個 / 仕込み
            </span>
          </button>

          <button
            onClick={() => setActivePackageType('bulk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              isBulk
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>📦 業務用 2Lバルク</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isBulk ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-600'}`}>
              3本 (6L) / 仕込み
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          表示基準: <span className="font-semibold text-slate-800">{unitLabel} あたり</span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            平均製造原価 ({unitLabel})
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            ¥{Math.round(
              breakdowns.reduce((sum, b) => sum + b.unit_manufacturing_cost, 0) / (breakdowns.length || 1)
            ).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            材料・資材・人件費の全種平均
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            平均 卸売粗利率 ({isBulk ? 'バルク卸' : 'カップ卸'})
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {(
              breakdowns.reduce((sum, b) => sum + b.wholesale.margin_ratio, 0) / (breakdowns.length || 1)
            ).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            全レシピ平均マージン率
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            平均 粗利額 (卸売 / {unitLabel})
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            ¥{Math.round(
              breakdowns.reduce((sum, b) => sum + b.wholesale.gross_margin, 0) / (breakdowns.length || 1)
            ).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isBulk ? '飲食店・カフェへの2L納品ごとの手残り額' : '小売店・カフェへの1個納品ごとの手残り額'}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Cost Breakdown Stacked Bar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-500" />
              {unitLabel}あたりの製造原価 構成比較 (円)
            </h2>
            <span className="text-[11px] text-slate-400">積層比較</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedChartData} margin={{ top: 15, right: 20, left: 0, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis unit="円" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any, name: any) => [`¥${Number(val).toLocaleString()}`, name]}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="材料費" stackId="a" fill="#fbbf24" />
                <Bar dataKey="資材代" stackId="a" fill="#94a3b8" />
                <Bar dataKey="人件費" stackId="a" fill="#60a5fa" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Margin & Wholesale Price Comparison */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              卸売価格の内訳 (製造原価 vs 粗利益)
            </h2>
            <span className="text-[11px] text-slate-400">マージン分析</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marginChartData} margin={{ top: 15, right: 20, left: 0, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis unit="円" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any, name: any) => [`¥${Number(val).toLocaleString()}`, name]}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="製造原価" stackId="b" fill="#64748b" />
                <Bar dataKey="卸粗利益" stackId="b" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Comparison Detail Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
          <span>全10種 原価・マージン詳細一覧 ({unitLabel})</span>
          <span className="text-[11px] font-normal text-slate-500">
            {isBulk ? '仕込み1回 = 2L × 3本 (計6L)' : '仕込み1回 = 120ml × 65個'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-medium">
                <th className="py-2.5 px-4">レシピ名</th>
                <th className="py-2.5 px-4 text-right">仕上がり定数</th>
                <th className="py-2.5 px-4 text-right">材料費 (1{shortUnit})</th>
                <th className="py-2.5 px-4 text-right">資材代 (1{shortUnit})</th>
                <th className="py-2.5 px-4 text-right">人件費 (1{shortUnit})</th>
                <th className="py-2.5 px-4 text-right font-semibold text-slate-900">{unitLabel}あたり製造原価</th>
                <th className="py-2.5 px-4 text-right">想定卸売価格</th>
                <th className="py-2.5 px-4 text-right text-emerald-700 font-semibold">卸粗利益</th>
                <th className="py-2.5 px-4 text-right">卸原価率</th>
                <th className="py-2.5 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdowns.map((b) => (
                <tr key={b.recipe.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {b.recipe.name}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {b.target_quantity}{shortUnit}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    ¥{b.unit_ingredient_cost.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    ¥{b.unit_packaging_cost.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    ¥{b.unit_labor_cost.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ¥{Math.round(b.unit_manufacturing_cost).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    ¥{b.wholesale.price.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600">
                    ¥{Math.round(b.wholesale.gross_margin).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                      {b.wholesale.cost_ratio.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/cost/recipes/${b.recipe.id}`}
                      className="px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}
