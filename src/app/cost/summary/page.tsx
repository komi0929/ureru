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
  Info,
  Tag,
  CheckCircle2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Layers,
  Percent
} from 'lucide-react';
import { Recipe, Material, RecipeCostBreakdown, PackageType, UniformPricingConfig } from '@/types/cost';
import { getRecipes, getMaterials, calculateRecipeCost, getUniformPricing, saveUniformPricing, DEFAULT_UNIFORM_PRICING } from '@/lib/cost-api';
import TutorialModal from '@/components/cost/TutorialModal';

type SortKey = 'name' | 'ingredient_cost' | 'packaging_cost' | 'labor_cost' | 'manufacturing_cost' | 'gross_margin' | 'cost_ratio' | 'margin_ratio';
type SortOrder = 'asc' | 'desc';

export default function CostSummaryPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePackageType, setActivePackageType] = useState<PackageType>('cup');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [uniformPricing, setUniformPricing] = useState<UniformPricingConfig>(DEFAULT_UNIFORM_PRICING);
  const [priceSavedNotice, setPriceSavedNotice] = useState(false);

  // 並び替え (ソート) 状態
  const [sortKey, setSortKey] = useState<SortKey>('margin_ratio');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    async function load() {
      const [r, m, p] = await Promise.all([getRecipes(), getMaterials(), getUniformPricing()]);
      setRecipes(r);
      setMaterials(m);
      setUniformPricing(p);
      setLoading(false);
    }
    load();
  }, []);

  const isBulk = activePackageType === 'bulk';
  const unitLabel = isBulk ? '1本 (2L)' : '1個 (100g)';
  const shortUnit = isBulk ? '本' : '個';

  const handlePriceChange = async (type: PackageType, newPrice: number) => {
    const val = Number.isNaN(newPrice) ? 0 : Math.max(0, newPrice);
    const updated = type === 'bulk'
      ? { ...uniformPricing, bulk_wholesale_price: val }
      : { ...uniformPricing, cup_wholesale_price: val };
    setUniformPricing(updated);
    await saveUniformPricing(updated);
    setPriceSavedNotice(true);
    setTimeout(() => setPriceSavedNotice(false), 2000);
  };

  // 暫定材料のマップ（レシピ内に暫定材料が含まれるか判定）
  const provisionalMaterialIds = useMemo(() => {
    return new Set(materials.filter(m => m.is_provisional).map(m => m.id));
  }, [materials]);

  // 全レシピの原価詳細計算 ＋ 原価率内訳計算
  const breakdowns = useMemo(() => {
    const currentWholesale = isBulk
      ? uniformPricing.bulk_wholesale_price
      : uniformPricing.cup_wholesale_price;
    const currentRetail = isBulk
      ? uniformPricing.bulk_retail_price
      : uniformPricing.cup_retail_price;

    return recipes.map(r => {
      const b = calculateRecipeCost(r, materials, activePackageType, currentWholesale, currentRetail);
      
      // 想定卸売価格に対する各要素の原価率（％）
      const price = b.wholesale.price > 0 ? b.wholesale.price : 1;
      const ingredientPercentOfPrice = (b.unit_ingredient_cost / price) * 100;
      const packagingPercentOfPrice = (b.unit_packaging_cost / price) * 100;
      const laborPercentOfPrice = (b.unit_labor_cost / price) * 100;

      // 暫定材料を含むか
      const hasProvisionalMaterial = r.ingredients.some(ing => provisionalMaterialIds.has(ing.material_id)) ||
        (b.package_type === 'bulk' ? r.bulk_config.packagings : r.cup_config.packagings).some(p => provisionalMaterialIds.has(p.material_id));

      return {
        ...b,
        ingredientPercentOfPrice,
        packagingPercentOfPrice,
        laborPercentOfPrice,
        hasProvisionalMaterial,
      };
    });
  }, [recipes, materials, activePackageType, uniformPricing, isBulk, provisionalMaterialIds]);

  // ソートされたリスト
  const sortedBreakdowns = useMemo(() => {
    return [...breakdowns].sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (sortKey) {
        case 'name':
          valA = a.recipe.name;
          valB = b.recipe.name;
          return sortOrder === 'asc' 
            ? String(valA).localeCompare(String(valB), 'ja')
            : String(valB).localeCompare(String(valA), 'ja');
        case 'ingredient_cost':
          valA = a.unit_ingredient_cost;
          valB = b.unit_ingredient_cost;
          break;
        case 'packaging_cost':
          valA = a.unit_packaging_cost;
          valB = b.unit_packaging_cost;
          break;
        case 'labor_cost':
          valA = a.unit_labor_cost;
          valB = b.unit_labor_cost;
          break;
        case 'manufacturing_cost':
          valA = a.unit_manufacturing_cost;
          valB = b.unit_manufacturing_cost;
          break;
        case 'gross_margin':
          valA = a.wholesale.gross_margin;
          valB = b.wholesale.gross_margin;
          break;
        case 'cost_ratio':
          valA = a.wholesale.cost_ratio;
          valB = b.wholesale.cost_ratio;
          break;
        case 'margin_ratio':
        default:
          valA = a.wholesale.margin_ratio;
          valB = b.wholesale.margin_ratio;
          break;
      }

      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [breakdowns, sortKey, sortOrder]);

  // ヘッダークリック時のソート切替
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      // デフォルト順序: 原価系は昇順が好まれる場合もあるが、粗利系は降順、原価率は目的に応じる
      setSortOrder(key === 'cost_ratio' || key === 'manufacturing_cost' ? 'asc' : 'desc');
    }
  };

  // 全体平均値の計算
  const avgManufacturingCost = Math.round(
    breakdowns.reduce((sum, b) => sum + b.unit_manufacturing_cost, 0) / (breakdowns.length || 1)
  );
  const avgIngredientCost = 
    breakdowns.reduce((sum, b) => sum + b.unit_ingredient_cost, 0) / (breakdowns.length || 1);
  const avgPackagingCost = 
    breakdowns.reduce((sum, b) => sum + b.unit_packaging_cost, 0) / (breakdowns.length || 1);
  const avgLaborCost = 
    breakdowns.reduce((sum, b) => sum + b.unit_labor_cost, 0) / (breakdowns.length || 1);
  
  const currentWholesale = isBulk ? uniformPricing.bulk_wholesale_price : uniformPricing.cup_wholesale_price;
  const avgCostRatio = (avgManufacturingCost / (currentWholesale || 1)) * 100;
  const avgMarginRatio = 
    breakdowns.reduce((sum, b) => sum + b.wholesale.margin_ratio, 0) / (breakdowns.length || 1);
  const avgGrossMargin = Math.round(
    breakdowns.reduce((sum, b) => sum + b.wholesale.gross_margin, 0) / (breakdowns.length || 1)
  );

  const avgIngredientPercentOfPrice = (avgIngredientCost / (currentWholesale || 1)) * 100;
  const avgPackagingPercentOfPrice = (avgPackagingCost / (currentWholesale || 1)) * 100;
  const avgLaborPercentOfPrice = (avgLaborCost / (currentWholesale || 1)) * 100;

  // Chart 1: Cost Breakdown Stacked Bar Chart data
  const stackedChartData = useMemo(() => {
    return sortedBreakdowns.map(b => ({
      name: b.recipe.name.replace('米粉アイス【', '').replace('】', ''),
      '材料費': Number(b.unit_ingredient_cost.toFixed(1)),
      '資材代': Number(b.unit_packaging_cost.toFixed(1)),
      '人件費': Number(b.unit_labor_cost.toFixed(1)),
      '製造原価': Math.round(b.unit_manufacturing_cost),
      '想定卸価格': b.wholesale.price,
    }));
  }, [sortedBreakdowns]);

  // Chart 2: Margin Comparison data
  const marginChartData = useMemo(() => {
    return sortedBreakdowns.map(b => ({
      name: b.recipe.name.replace('米粉アイス【', '').replace('】', ''),
      '製造原価': Math.round(b.unit_manufacturing_cost),
      '卸粗利益': Math.round(b.wholesale.gross_margin),
      '卸価格': b.wholesale.price,
      '粗利率': Number(b.wholesale.margin_ratio.toFixed(1)),
    }));
  }, [sortedBreakdowns]);

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
            人件費・材料・資材の金額と構成比率（％）を精密に可視化。原価率や粗利の並び替えで課題フレーバーを瞬時に特定できます。
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
            <span>🍨 個食カップ (100g)</span>
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

      {/* Uniform Price Setting Card (全フレーバー一律 想定卸価格 設定パネル) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-900 text-white">
              <Tag className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">販売価格の一律設定（想定卸価格）</span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  全10フレーバー共通連動
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                直接数値を入力すると、下の全原価率内訳および平均粗利率・原価サマリーが即座に再試算されます。
              </p>
            </div>
          </div>

          {priceSavedNotice && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/70 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>一律価格を更新しました（全レシピに反映）</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3.5">
          {/* Cup Wholesale Input */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            !isBulk ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20' : 'bg-slate-50/60 border-slate-200/80'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🍨</span>
                <span className="text-xs font-bold text-slate-800">個食カップ (100g) 一律 想定卸価格</span>
              </div>
              {!isBulk && (
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  現在選択中
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">¥</span>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={uniformPricing.cup_wholesale_price || ''}
                  onChange={(e) => handlePriceChange('cup', Number(e.target.value))}
                  placeholder="340"
                  className="w-full pl-8 pr-12 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400 shadow-2xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">/ 個</span>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePriceChange('cup', Math.max(0, uniformPricing.cup_wholesale_price - 10))}
                  className="px-2.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  title="10円下げる"
                >
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceChange('cup', uniformPricing.cup_wholesale_price + 10)}
                  className="px-2.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  title="10円上げる"
                >
                  +10
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>参考店頭小売価格: ¥{uniformPricing.cup_retail_price.toLocaleString()}</span>
              <span className="text-slate-400">（容量: 100g基準）</span>
            </div>
          </div>

          {/* Bulk Wholesale Input */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isBulk ? 'bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-400/20' : 'bg-slate-50/60 border-slate-200/80'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">📦</span>
                <span className="text-xs font-bold text-slate-800">業務用 2Lバルク 一律 想定卸価格</span>
              </div>
              {isBulk && (
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  現在選択中
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">¥</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={uniformPricing.bulk_wholesale_price || ''}
                  onChange={(e) => handlePriceChange('bulk', Number(e.target.value))}
                  placeholder="4320"
                  className="w-full pl-8 pr-16 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400 shadow-2xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">/ 本 (2L)</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePriceChange('bulk', Math.max(0, uniformPricing.bulk_wholesale_price - 100))}
                  className="px-2.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  title="100円下げる"
                >
                  -100
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceChange('bulk', uniformPricing.bulk_wholesale_price + 100)}
                  className="px-2.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  title="100円上げる"
                >
                  +100
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>参考メニュー想定価格: ¥{uniformPricing.bulk_retail_price.toLocaleString()}</span>
              <span className="text-slate-400">（容量: 2L角型容器）</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards (★原価率の内訳をパッと見で把握できるカード追加) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: 平均製造原価 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            平均製造原価 ({unitLabel})
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            ¥{avgManufacturingCost.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>平均卸原価率:</span>
            <span className="font-bold text-slate-800 font-mono">{avgCostRatio.toFixed(1)}%</span>
          </div>
        </div>

        {/* Card 2: ★原価率の内訳（材料・資材・人件費） */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs md:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              平均原価率の内訳（対卸価格比）
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-900">
              合計 {avgCostRatio.toFixed(1)}%
            </span>
          </div>

          {/* ミニ スタックプログレスバー */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${Math.min(100, avgIngredientPercentOfPrice)}%` }} 
              className="bg-amber-400 hover:opacity-90 transition-all" 
              title={`材料費: ¥${avgIngredientCost.toFixed(1)} (${avgIngredientPercentOfPrice.toFixed(1)}%)`}
            />
            <div 
              style={{ width: `${Math.min(100, avgPackagingPercentOfPrice)}%` }} 
              className="bg-slate-400 hover:opacity-90 transition-all" 
              title={`資材代: ¥${avgPackagingCost.toFixed(1)} (${avgPackagingPercentOfPrice.toFixed(1)}%)`}
            />
            <div 
              style={{ width: `${Math.min(100, avgLaborPercentOfPrice)}%` }} 
              className="bg-blue-400 hover:opacity-90 transition-all" 
              title={`人件費: ¥${avgLaborCost.toFixed(1)} (${avgLaborPercentOfPrice.toFixed(1)}%)`}
            />
          </div>

          {/* 3要素の内訳数値 (いくらで何％か) */}
          <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-slate-100 text-center">
            <div className="bg-amber-50/60 p-1.5 rounded-lg border border-amber-200/60">
              <div className="text-[10px] text-amber-800 font-semibold flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                材料費
              </div>
              <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                ¥{avgIngredientCost.toFixed(1)}
              </div>
              <div className="text-[10px] text-amber-700 font-mono font-bold">
                {avgIngredientPercentOfPrice.toFixed(1)}%
              </div>
            </div>

            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-700 font-semibold flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
                資材代
              </div>
              <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                ¥{avgPackagingCost.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-600 font-mono font-bold">
                {avgPackagingPercentOfPrice.toFixed(1)}%
              </div>
            </div>

            <div className="bg-blue-50/60 p-1.5 rounded-lg border border-blue-200/60">
              <div className="text-[10px] text-blue-800 font-semibold flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                人件費
              </div>
              <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                ¥{avgLaborCost.toFixed(1)}
              </div>
              <div className="text-[10px] text-blue-700 font-mono font-bold">
                {avgLaborPercentOfPrice.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: 平均粗利 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            平均 卸粗利益 ({unitLabel})
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            ¥{avgGrossMargin.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center justify-between">
            <span>平均粗利率:</span>
            <span className="font-mono">{avgMarginRatio.toFixed(1)}%</span>
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

      {/* Comparison Detail Table with Enhanced Breakdown & Sorting */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Table Top Controls: Title & Quick Sort Buttons */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">
                全10種 原価内訳・マージン詳細一覧 ({unitLabel})
              </span>
              <span className="text-[11px] font-normal text-slate-500">
                {isBulk ? '仕込み1回 = 2L × 3本 (計6L)' : '仕込み1回 = 100g × 65個 (計6.5kg)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              各項目をクリックまたはクイックボタンで簡単に並び替え可能。原価率の内訳（材料・資材・人件費）も一目で分かります。
            </p>
          </div>

          {/* クイックソートボタン群 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">並び替え:</span>
            
            <button
              onClick={() => { setSortKey('margin_ratio'); setSortOrder('desc'); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                sortKey === 'margin_ratio' && sortOrder === 'desc'
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              💎 粗利率が高い順
            </button>

            <button
              onClick={() => { setSortKey('cost_ratio'); setSortOrder('asc'); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                sortKey === 'cost_ratio' && sortOrder === 'asc'
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              📉 原価率が低い順
            </button>

            <button
              onClick={() => { setSortKey('cost_ratio'); setSortOrder('desc'); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                sortKey === 'cost_ratio' && sortOrder === 'desc'
                  ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ⚠️ 原価率が高い順
            </button>

            <button
              onClick={() => { setSortKey('gross_margin'); setSortOrder('desc'); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                sortKey === 'gross_margin' && sortOrder === 'desc'
                  ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              💰 粗利額順
            </button>

            <button
              onClick={() => { setSortKey('ingredient_cost'); setSortOrder('asc'); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                sortKey === 'ingredient_cost' && sortOrder === 'asc'
                  ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🥣 材料費が安い順
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-medium select-none">
                {/* レシピ名 */}
                <th 
                  onClick={() => handleSort('name')} 
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>レシピ名</span>
                    {sortKey === 'name' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-slate-900" /> : <ArrowDown className="w-3.5 h-3.5 text-slate-900" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                {/* 仕上がり定数 */}
                <th className="py-3 px-3 text-right">仕上がり定数</th>

                {/* 材料費 (金額 ＆ ％) */}
                <th 
                  onClick={() => handleSort('ingredient_cost')} 
                  className={`py-3 px-3 text-right cursor-pointer hover:bg-slate-100/80 transition-colors ${
                    sortKey === 'ingredient_cost' ? 'bg-amber-50/60 font-bold text-amber-900' : ''
                  }`}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>材料費 (内訳%)</span>
                    {sortKey === 'ingredient_cost' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-700" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-700" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                {/* 資材代 (金額 ＆ ％) */}
                <th 
                  onClick={() => handleSort('packaging_cost')} 
                  className={`py-3 px-3 text-right cursor-pointer hover:bg-slate-100/80 transition-colors ${
                    sortKey === 'packaging_cost' ? 'bg-slate-100 font-bold text-slate-900' : ''
                  }`}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>資材代 (内訳%)</span>
                    {sortKey === 'packaging_cost' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-slate-800" /> : <ArrowDown className="w-3.5 h-3.5 text-slate-800" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                {/* 人件費 (金額 ＆ ％) */}
                <th 
                  onClick={() => handleSort('labor_cost')} 
                  className={`py-3 px-3 text-right cursor-pointer hover:bg-slate-100/80 transition-colors ${
                    sortKey === 'labor_cost' ? 'bg-blue-50/60 font-bold text-blue-900' : ''
                  }`}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>人件費 (内訳%)</span>
                    {sortKey === 'labor_cost' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-700" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-700" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                {/* 製造原価合計 */}
                <th 
                  onClick={() => handleSort('manufacturing_cost')} 
                  className={`py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors ${
                    sortKey === 'manufacturing_cost' ? 'bg-slate-100 font-bold text-slate-900' : 'font-semibold text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>製造原価 ({unitLabel})</span>
                    {sortKey === 'manufacturing_cost' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-slate-900" /> : <ArrowDown className="w-3.5 h-3.5 text-slate-900" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                {/* 想定卸売価格 */}
                <th className="py-3 px-3 text-right">想定卸価格</th>

                {/* 卸粗利益 */}
                <th 
                  onClick={() => handleSort('gross_margin')} 
                  className={`py-3 px-3 text-right cursor-pointer hover:bg-slate-100/80 transition-colors ${
                    sortKey === 'gross_margin' ? 'bg-emerald-50 font-bold text-emerald-900' : 'text-emerald-700 font-semibold'
                  }`}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>卸粗利益 (粗利率)</span>
                    {sortKey === 'gross_margin' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-700" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                {/* 卸原価率 ＆ ビジュアル内訳バー */}
                <th 
                  onClick={() => handleSort('cost_ratio')} 
                  className={`py-3 px-4 text-left cursor-pointer hover:bg-slate-100/80 transition-colors min-w-[190px] ${
                    sortKey === 'cost_ratio' ? 'bg-slate-100 font-bold text-slate-900' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>原価率 ＆ 内訳比率</span>
                    {sortKey === 'cost_ratio' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-slate-900" /> : <ArrowDown className="w-3.5 h-3.5 text-slate-900" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                <th className="py-3 px-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedBreakdowns.map((b) => {
                const isHighCost = b.wholesale.cost_ratio > 65;
                const isGreatMargin = b.wholesale.margin_ratio >= 40;

                return (
                  <tr key={b.recipe.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* レシピ名 ＆ 暫定バッジ */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{b.recipe.name}</span>
                        {b.hasProvisionalMaterial && (
                          <span 
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                            title="このレシピには未確定・暫定単価の材料が含まれています"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            暫定材料
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 定数 */}
                    <td className="py-3.5 px-3 text-right font-mono text-slate-500 whitespace-nowrap">
                      {b.target_quantity}{shortUnit}
                    </td>

                    {/* 材料費: 金額 ＆ 対売価％ */}
                    <td className="py-3.5 px-3 text-right font-mono whitespace-nowrap">
                      <div className="text-slate-900 font-medium">
                        ¥{b.unit_ingredient_cost.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-amber-700 font-semibold">
                        ({b.ingredientPercentOfPrice.toFixed(1)}%)
                      </div>
                    </td>

                    {/* 資材代: 金額 ＆ 対売価％ */}
                    <td className="py-3.5 px-3 text-right font-mono whitespace-nowrap">
                      <div className="text-slate-900 font-medium">
                        ¥{b.unit_packaging_cost.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        ({b.packagingPercentOfPrice.toFixed(1)}%)
                      </div>
                    </td>

                    {/* 人件費: 金額 ＆ 対売価％ */}
                    <td className="py-3.5 px-3 text-right font-mono whitespace-nowrap">
                      <div className="text-slate-900 font-medium">
                        ¥{b.unit_labor_cost.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-blue-700 font-semibold">
                        ({b.laborPercentOfPrice.toFixed(1)}%)
                      </div>
                    </td>

                    {/* 製造原価合計 */}
                    <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-900">
                        ¥{Math.round(b.unit_manufacturing_cost).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        1{shortUnit}あたり
                      </div>
                    </td>

                    {/* 想定卸売価格 */}
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                      ¥{b.wholesale.price.toLocaleString()}
                    </td>

                    {/* 卸粗利益 ＆ 粗利率 */}
                    <td className="py-3.5 px-3 text-right font-mono whitespace-nowrap">
                      <div className="text-xs font-bold text-emerald-600">
                        ¥{Math.round(b.wholesale.gross_margin).toLocaleString()}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-700">
                        {b.wholesale.margin_ratio.toFixed(1)}% 粗利
                      </div>
                    </td>

                    {/* 原価率 ＆ 3色ミニスタックバー (★パッと見てわかる内訳) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-between text-xs mb-1 font-mono">
                        <span className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
                          isHighCost 
                            ? 'bg-rose-100 text-rose-800' 
                            : isGreatMargin 
                              ? 'bg-emerald-100 text-emerald-900' 
                              : 'bg-slate-100 text-slate-800'
                        }`}>
                          {b.wholesale.cost_ratio.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          原価内訳
                        </span>
                      </div>

                      {/* 3要素のミニスタックバー */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex shadow-2xs">
                        <div 
                          style={{ width: `${Math.min(100, b.ingredientPercentOfPrice)}%` }} 
                          className="bg-amber-400" 
                          title={`材料費: ¥${b.unit_ingredient_cost.toFixed(1)} (${b.ingredientPercentOfPrice.toFixed(1)}%)`}
                        />
                        <div 
                          style={{ width: `${Math.min(100, b.packagingPercentOfPrice)}%` }} 
                          className="bg-slate-400" 
                          title={`資材代: ¥${b.unit_packaging_cost.toFixed(1)} (${b.packagingPercentOfPrice.toFixed(1)}%)`}
                        />
                        <div 
                          style={{ width: `${Math.min(100, b.laborPercentOfPrice)}%` }} 
                          className="bg-blue-400" 
                          title={`人件費: ¥${b.unit_labor_cost.toFixed(1)} (${b.laborPercentOfPrice.toFixed(1)}%)`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-1 gap-1">
                        <span className="text-amber-700">材 {b.ingredientPercentOfPrice.toFixed(0)}%</span>
                        <span className="text-slate-500">資 {b.packagingPercentOfPrice.toFixed(0)}%</span>
                        <span className="text-blue-700">人 {b.laborPercentOfPrice.toFixed(0)}%</span>
                      </div>
                    </td>

                    {/* 操作 */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <Link
                        href={`/cost/recipes/${b.recipe.id}`}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-block"
                      >
                        詳細・編集
                      </Link>
                    </td>
                  </tr>
                );
              })}
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
