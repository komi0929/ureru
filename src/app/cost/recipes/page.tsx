'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  UtensilsCrossed, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Calculator, 
  TrendingUp, 
  Sparkles, 
  Boxes, 
  Layers, 
  ArrowRight, 
  Copy, 
  Sliders, 
  Package, 
  Check,
  HelpCircle,
  X,
  ChevronsUpDown,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { Recipe, Material, RecipeCostBreakdown, PackageType } from '@/types/cost';
import { getRecipes, getMaterials, calculateRecipeCost, deleteRecipe, saveRecipe } from '@/lib/cost-api';
import TutorialModal from '@/components/cost/TutorialModal';

export default function RecipesListPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Set of expanded recipe IDs for flexible accordion control
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Active Packaging Mode: 'cup' (個食カップ 120ml) or 'bulk' (業務用 2Lバルク)
  const [activePackageType, setActivePackageType] = useState<PackageType>('cup');

  // Tutorial modal & quick guide visibility
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [showQuickGuide, setShowQuickGuide] = useState(true);

  // Price Simulation Overrides for interactive sandbox
  const [simulatedWholesale, setSimulatedWholesale] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [recData, matData] = await Promise.all([
      getRecipes(),
      getMaterials(),
    ]);
    setRecipes(recData);
    setMaterials(matData);
    
    // By default, keep first recipe expanded so beginners immediately see detail
    if (recData.length > 0 && expandedIds.size === 0) {
      setExpandedIds(new Set([recData[0].id]));
    }
    setLoading(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    if (expandedIds.size === recipes.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(recipes.map(r => r.id)));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`レシピ「${name}」を削除してもよろしいですか？`)) {
      await deleteRecipe(id);
      await loadData();
    }
  };

  const handleDuplicate = async (sourceRecipe: Recipe) => {
    const copyName = `${sourceRecipe.name} (コピー)`;
    await saveRecipe({
      ...sourceRecipe,
      id: undefined,
      name: copyName,
    });
    await loadData();
  };

  // Calculate breakdowns for all recipes based on activePackageType
  const recipeBreakdowns = useMemo(() => {
    const map = new Map<string, RecipeCostBreakdown>();
    recipes.forEach(r => {
      // Apply simulation wholesale if overridden
      let effectiveRecipe = { ...r };
      const simPrice = simulatedWholesale[`${r.id}-${activePackageType}`];

      if (simPrice !== undefined) {
        if (activePackageType === 'bulk') {
          effectiveRecipe.bulk_config = {
            ...effectiveRecipe.bulk_config,
            target_wholesale_price: simPrice,
          };
        } else {
          effectiveRecipe.cup_config = {
            ...effectiveRecipe.cup_config,
            target_wholesale_price: simPrice,
          };
        }
      }

      map.set(r.id, calculateRecipeCost(effectiveRecipe, materials, activePackageType));
    });
    return map;
  }, [recipes, materials, activePackageType, simulatedWholesale]);

  // Filter recipes
  const filteredRecipes = recipes.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q) || (r.category || '').toLowerCase().includes(q);
  });

  const isBulk = activePackageType === 'bulk';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* Top Banner with Tutorial Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              米粉アイス 10フレーバー
            </span>
            <span className="text-xs text-slate-400">形態別（カップ ⇔ 2Lバルク）原価・価格戦略</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">レシピ一覧 & 製造原価管理</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            原材料配合は共通のまま、製造形態（カップ充填 ⇔ 2L業務用バルク）に応じた人件費・資材費・仕上がり本数ごとの原価と粗利を即座に試算します。
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Tutorial Guide Trigger */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/70 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>使い方ガイド</span>
          </button>

          <Link
            href="/cost/summary"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors border border-slate-200/80"
          >
            <PieChart className="w-4 h-4 text-slate-500" />
            <span>原価サマリー</span>
          </Link>

          <Link
            href="/cost/recipes/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>新規登録</span>
          </Link>
        </div>
      </div>

      {/* Beginner Quick Guide Banner (Dismissible) */}
      {showQuickGuide && (
        <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-2xs relative">
          <button
            onClick={() => setShowQuickGuide(false)}
            className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-amber-100/50 transition-colors"
            title="ガイドを閉じる（ヘッダーの使い方ガイドからいつでも再表示できます）"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className="p-1 rounded-md bg-amber-500 text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-slate-900">
              はじめての方へ：3ステップでわかる操作手順
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              直感的に原価と粗利のシミュレーションが行えます
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/90 p-3 rounded-xl border border-amber-100 flex items-start gap-2.5 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <div className="text-xs">
                <div className="font-semibold text-slate-800">カップ ⇔ 2Lバルクを切替</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  下のスイッチで、1個あたり（120ml）と2L角型容器1本あたりの原価を即座に再計算。
                </div>
              </div>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-amber-100 flex items-start gap-2.5 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div className="text-xs">
                <div className="font-semibold text-slate-800">カードを開いて粗利試算</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  各カードの「内訳・試算」を開くと、価格スライダーで卸先への提案価格と粗利率を検証可能。
                </div>
              </div>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-amber-100 flex items-start gap-2.5 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <div className="text-xs">
                <div className="font-semibold text-slate-800">配合や資材を自由に変更</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  右上の「編集」から豆乳・ピューレ等のg配合や、仕込み個数、人件費をカスタマイズ。
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Package Type Switcher, Search, and Bulk Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Segmented Control for Cup vs Bulk */}
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

        {/* Right Controls: Search, Expand All, Count Badge */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Search Input with Clear Button */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="フレーバー・材料で検索..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200/90 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Expand/Collapse All Button */}
          <button
            onClick={handleExpandAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200/90 shadow-2xs transition-colors shrink-0"
            title="すべてのレシピカードの詳細を一括で開く / 閉じる"
          >
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{expandedIds.size === recipes.length ? 'すべて閉じる' : 'すべて開く'}</span>
          </button>

          {/* Recipe Count Badge */}
          <div className="text-[11px] font-mono text-slate-500 px-2.5 py-1.5 rounded-lg bg-slate-100 shrink-0">
            {filteredRecipes.length} / {recipes.length}件
          </div>
        </div>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Avg Manufacturing Cost Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">
              平均製造原価 ({isBulk ? '2Lバルク1本' : '1個あたり'})
            </span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
              ¥{recipes.length > 0
                ? Math.round(
                    Array.from(recipeBreakdowns.values()).reduce((sum, b) => sum + b.unit_manufacturing_cost, 0) / recipes.length
                  ).toLocaleString()
                : 0}
              <span className="text-xs font-normal text-slate-400 ml-1">
                / {isBulk ? '本 (2L)' : '個'}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
        </div>

        {/* Avg Wholesale Margin Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">
              平均 卸売粗利率 ({isBulk ? 'バルク卸' : 'カップ卸'})
            </span>
            <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">
              {recipes.length > 0
                ? (
                    Array.from(recipeBreakdowns.values()).reduce((sum, b) => sum + b.wholesale.margin_ratio, 0) / recipes.length
                  ).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Avg Profit Amount Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">
              平均 1納品粗利額 ({isBulk ? '2Lバルク1本' : 'カップ1個'})
            </span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
              ¥{recipes.length > 0
                ? Math.round(
                    Array.from(recipeBreakdowns.values()).reduce((sum, b) => sum + b.wholesale.gross_margin, 0) / recipes.length
                  ).toLocaleString()
                : 0}
              <span className="text-xs font-normal text-slate-400 ml-1">
                / {isBulk ? '本' : '個'}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Package className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Recipes List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
            データを読み込み中...
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
            登録されているレシピがありません。
          </div>
        ) : (
          filteredRecipes.map((recipe) => {
            const breakdown = recipeBreakdowns.get(recipe.id);
            if (!breakdown) return null;

            const isExpanded = expandedIds.has(recipe.id);
            const simKey = `${recipe.id}-${activePackageType}`;
            const currentSimWholesale = simulatedWholesale[simKey] !== undefined
              ? simulatedWholesale[simKey]
              : (isBulk ? (recipe.bulk_config?.target_wholesale_price || 4320) : (recipe.cup_config?.target_wholesale_price || 340));

            return (
              <div
                key={recipe.id}
                className={`bg-white rounded-xl border transition-all overflow-hidden ${
                  isExpanded ? 'border-slate-300 shadow-xs' : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Main Card Summary Row */}
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    
                    {/* Left: Recipe Name & Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isBulk ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                        }`}>
                          {isBulk ? '📦 2L業務用バルク' : '🍨 個食カップ (120ml)'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          仕上がり: <strong>{breakdown.target_quantity}{breakdown.unit_name}</strong> / 仕込み
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900 tracking-tight truncate">
                        {recipe.name}
                      </h2>
                      {recipe.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {recipe.description}
                        </p>
                      )}
                    </div>

                    {/* Middle: 1単位あたり製造原価 */}
                    <div className="flex items-center gap-5 bg-slate-50/70 px-4 py-2.5 rounded-lg border border-slate-100 shrink-0">
                      <div>
                        <div className="text-[10px] font-medium uppercase text-slate-400">
                          {isBulk ? '2Lバルク 1本 製造原価' : '1個あたり製造原価'}
                        </div>
                        <div className="text-xl font-bold text-slate-900 font-mono">
                          ¥{Math.round(breakdown.unit_manufacturing_cost).toLocaleString()}
                          <span className="text-xs font-normal text-slate-500 ml-1">
                            ({breakdown.unit_manufacturing_cost.toFixed(1)}円)
                          </span>
                        </div>
                      </div>

                      {/* Mini Breakdown Pills */}
                      <div className="hidden sm:flex flex-col gap-0.5 text-[11px] font-mono border-l border-slate-200 pl-4">
                        <div className="flex items-center justify-between gap-3 text-slate-600">
                          <span className="text-slate-400">材料費:</span>
                          <span className="font-semibold text-slate-800">¥{Math.round(breakdown.unit_ingredient_cost).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-slate-600">
                          <span className="text-slate-400">{isBulk ? '容器代:' : '資材費:'}</span>
                          <span className="font-semibold text-slate-800">¥{Math.round(breakdown.unit_packaging_cost).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-slate-600">
                          <span className="text-slate-400">人件費:</span>
                          <span className="font-semibold text-slate-800">¥{Math.round(breakdown.unit_labor_cost).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: B2B 卸価格 & 粗利サマリー */}
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] font-medium text-slate-400">想定卸売価格</div>
                        <div className="text-base font-bold text-slate-900 font-mono">
                          ¥{breakdown.wholesale.price.toLocaleString()}
                        </div>
                        <div className="text-xs font-semibold text-emerald-700 flex items-center justify-end gap-1 mt-0.5 font-mono">
                          <span>粗利 ¥{Math.round(breakdown.wholesale.gross_margin).toLocaleString()}</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1 py-0.2 rounded font-semibold">
                            {breakdown.wholesale.margin_ratio.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Action buttons with Prominent Accordion Toggle */}
                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-100">
                        {/* Interactive Accordion Button with clear label */}
                        <button
                          onClick={() => toggleExpand(recipe.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isExpanded 
                              ? 'bg-slate-900 text-white shadow-xs' 
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                          title={isExpanded ? '詳細内訳・試算を閉じる' : '原材料配合・資材内訳・価格シミュレーターを開く'}
                        >
                          <span>{isExpanded ? '閉じる' : '内訳・試算'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <Link
                          href={`/cost/recipes/${recipe.id}`}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="配合・形態設定を編集"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(recipe)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="このレシピを複製"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(recipe.id, recipe.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="レシピを削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Expanded Accordion: Full Breakdown & Interactive Sandbox */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-6 text-xs">
                    
                    {/* Top Row: Visual Breakdown Ratio Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-xs">
                          <Calculator className="w-3.5 h-3.5 text-slate-500" />
                          {isBulk ? '2Lバルク 1本' : 'カップ 1個'}の原価構成比 (製造原価: ¥{Math.round(breakdown.unit_manufacturing_cost).toLocaleString()})
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          1仕込み総原価: ¥{Math.round(breakdown.total_manufacturing_cost).toLocaleString()} (仕上がり {breakdown.target_quantity}{breakdown.unit_name})
                        </span>
                      </div>
                      
                      <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${breakdown.ingredient_ratio}%` }}
                          className="bg-amber-400 transition-all"
                          title={`材料費: ${breakdown.ingredient_ratio.toFixed(1)}%`}
                        />
                        <div
                          style={{ width: `${breakdown.packaging_ratio}%` }}
                          className="bg-slate-400 transition-all"
                          title={`資材代: ${breakdown.packaging_ratio.toFixed(1)}%`}
                        />
                        <div
                          style={{ width: `${breakdown.labor_ratio}%` }}
                          className="bg-blue-400 transition-all"
                          title={`人件費: ${breakdown.labor_ratio.toFixed(1)}%`}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          <span>材料費 ¥{Math.round(breakdown.unit_ingredient_cost).toLocaleString()} ({breakdown.ingredient_ratio.toFixed(1)}%)</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          <span>{isBulk ? 'バルク容器代' : '資材費'} ¥{Math.round(breakdown.unit_packaging_cost).toLocaleString()} ({breakdown.packaging_ratio.toFixed(1)}%)</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          <span>人件費 ¥{Math.round(breakdown.unit_labor_cost).toLocaleString()} ({breakdown.labor_ratio.toFixed(1)}%)</span>
                        </span>
                      </div>
                    </div>

                    {/* 2-Columns: Ingredients & Packaging Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      
                      {/* Left: Ingredients Detailed Table (Shared between Cup and Bulk) */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            🥣 使用材料配合 ({breakdown.ingredient_items.length}品目・全形態共通)
                          </span>
                          <span className="font-mono text-slate-800 font-bold">
                            小計 ¥{Math.round(breakdown.total_ingredient_cost).toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                          {breakdown.ingredient_items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                              <div className="min-w-0 pr-2">
                                <div className="font-medium text-slate-800 truncate">{item.material.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {item.amount.toLocaleString()}{item.unit} × ¥{item.material.unit_cost.toFixed(3)}/{item.material.unit_type}
                                </div>
                              </div>
                              <div className="text-right shrink-0 font-mono">
                                <div className="font-semibold text-slate-900">¥{Math.round(item.cost).toLocaleString()}</div>
                                <div className="text-[10px] text-slate-400">¥{item.cost_per_unit.toFixed(1)}/{breakdown.unit_name}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Packaging & Labor Details (Unique to Cup or Bulk) */}
                      <div className="space-y-4">
                        {/* Packaging list */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                              📦 {isBulk ? '2Lバルク専用資材' : 'カップ専用資材'} ({breakdown.packaging_items.length}品目)
                            </span>
                            <span className="font-mono text-slate-800 font-bold">
                              小計 ¥{breakdown.unit_packaging_cost.toFixed(1)}/{breakdown.unit_name}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {breakdown.packaging_items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                                <div className="min-w-0 pr-2">
                                  <div className="font-medium text-slate-800 truncate">{item.material.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {item.quantity_per_unit}個 / 製品 (単価: ¥{item.unit_cost.toFixed(1)})
                                  </div>
                                </div>
                                <div className="text-right shrink-0 font-mono font-semibold text-slate-900">
                                  ¥{item.cost_per_unit.toFixed(1)}/{breakdown.unit_name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Labor details */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800">👤 {isBulk ? 'バルク充填人件費' : 'カップ充填人件費'}</span>
                            <div className="text-[11px] text-slate-400">
                              {isBulk ? '大容量バルク流し込み工数' : '個食カップ小分け・シーリング工数'}
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-sm font-bold text-slate-900">
                              ¥{breakdown.total_labor_cost.toLocaleString()} / 仕込み
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ¥{breakdown.unit_labor_cost.toFixed(1)} / {breakdown.unit_name}
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* Bottom Interactive Simulation Panel */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-slate-600" />
                          <span className="font-semibold text-slate-900 text-xs">
                            {isBulk ? '業務用バルク卸価格 シミュレーター' : 'カップ卸価格 シミュレーター'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          スライダーを動かして卸価格変更時の粗利率をテストできます
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-slate-600">
                            <span>卸価格テスト</span>
                            <span className="font-mono text-slate-900 font-bold">
                              ¥{currentSimWholesale.toLocaleString()} / {breakdown.unit_name}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={Math.round(breakdown.unit_manufacturing_cost * 1.05)}
                            max={isBulk ? 7000 : 700}
                            step={isBulk ? 100 : 10}
                            value={currentSimWholesale}
                            onChange={(e) => setSimulatedWholesale(prev => ({
                              ...prev,
                              [simKey]: Number(e.target.value)
                            }))}
                            className="w-full accent-slate-900"
                          />
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400">卸 原価率</span>
                            <div className={`text-sm font-bold font-mono ${
                              breakdown.wholesale.cost_ratio > 60 ? 'text-rose-600' : 'text-emerald-700'
                            }`}>
                              {breakdown.wholesale.cost_ratio.toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400">1{breakdown.unit_name}あたり粗利</span>
                            <div className="text-sm font-bold font-mono text-slate-900">
                              ¥{Math.round(breakdown.wholesale.gross_margin).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/cost/recipes/${recipe.id}`}
                            className="flex items-center gap-1 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
                          >
                            <span>配合・設定を編集</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Tutorial Modal */}
      <TutorialModal 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />
    </div>
  );
}
