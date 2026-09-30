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
  DollarSign
} from 'lucide-react';
import { Recipe, Material, RecipeCostBreakdown } from '@/types/cost';
import { getRecipes, getMaterials, calculateRecipeCost, deleteRecipe, saveRecipe } from '@/lib/cost-api';

export default function RecipesListPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

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
    
    if (recData.length > 0 && !expandedRecipeId) {
      setExpandedRecipeId(recData[0].id);
    }
    setLoading(false);
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

  // Calculate breakdowns for all recipes
  const recipeBreakdowns = useMemo(() => {
    const map = new Map<string, RecipeCostBreakdown>();
    recipes.forEach(r => {
      const effectiveRecipe = {
        ...r,
        target_wholesale_price: simulatedWholesale[r.id] !== undefined ? simulatedWholesale[r.id] : r.target_wholesale_price,
      };
      map.set(r.id, calculateRecipeCost(effectiveRecipe, materials));
    });
    return map;
  }, [recipes, materials, simulatedWholesale]);

  // Filter recipes
  const filteredRecipes = recipes.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q) || (r.category || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* Top Banner (Clean & Elegant Header) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              米粉アイス 10フレーバー
            </span>
            <span className="text-xs text-slate-400">実製造原価・価格戦略管理</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">レシピ一覧 & 製造原価管理</h1>
          <p className="text-xs text-slate-500 mt-1">
            原材料の配合量、共通資材費、人件費から1個あたりの製造原価を精密計算し、卸売時の粗利マージンを管理します。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/cost/materials"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors border border-slate-200/80"
          >
            <Boxes className="w-4 h-4 text-slate-400" />
            <span>材料・資材マスター ({materials.length})</span>
          </Link>
          <Link
            href="/cost/recipes/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>レシピ新規作成</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Metric Cards (Google-style subtle borders and crisp typography) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="フレーバー名・材料で検索..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 shadow-2xs"
          />
        </div>

        {/* Avg Cost Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">平均製造原価 (1個あたり)</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
              ¥{recipes.length > 0
                ? Math.round(
                    Array.from(recipeBreakdowns.values()).reduce((sum, b) => sum + b.unit_manufacturing_cost, 0) / recipes.length
                  ).toLocaleString()
                : 0}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
        </div>

        {/* Avg Wholesale Margin Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">平均 卸売粗利率</span>
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

            const isExpanded = expandedRecipeId === recipe.id;
            const currentSimWholesale = simulatedWholesale[recipe.id] !== undefined
              ? simulatedWholesale[recipe.id]
              : recipe.target_wholesale_price;

            return (
              <div
                key={recipe.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Main Card Summary Row */}
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    
                    {/* Left: Recipe Name & Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {recipe.category || '米粉アイス'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          仕上がり総定数: {recipe.target_quantity}個 / バッチ
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

                    {/* Middle: 1個あたり製造原価 & 内訳バッジ */}
                    <div className="flex items-center gap-5 bg-slate-50/70 px-4 py-2.5 rounded-lg border border-slate-100 shrink-0">
                      <div>
                        <div className="text-[10px] font-medium uppercase text-slate-400">
                          1個あたり製造原価
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
                          <span className="font-semibold text-slate-800">¥{breakdown.unit_ingredient_cost.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-slate-600">
                          <span className="text-slate-400">資材費:</span>
                          <span className="font-semibold text-slate-800">¥{breakdown.unit_packaging_cost.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-slate-600">
                          <span className="text-slate-400">人件費:</span>
                          <span className="font-semibold text-slate-800">¥{breakdown.unit_labor_cost.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: B2B 卸価格 & 粗利サマリー */}
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] font-medium text-slate-400">想定卸売価格</div>
                        <div className="text-base font-bold text-slate-900 font-mono">
                          ¥{recipe.target_wholesale_price.toLocaleString()}
                        </div>
                        <div className="text-xs font-semibold text-emerald-700 flex items-center justify-end gap-1 mt-0.5 font-mono">
                          <span>粗利 ¥{Math.round(breakdown.wholesale.gross_margin)}</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1 py-0.2 rounded">
                            {breakdown.wholesale.margin_ratio.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-100">
                        <Link
                          href={`/cost/recipes/${recipe.id}`}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="配合・原価を編集"
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
                        <button
                          onClick={() => setExpandedRecipeId(isExpanded ? null : recipe.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isExpanded ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                          }`}
                          title={isExpanded ? '詳細を閉じる' : '原価詳細・シミュレーションを開く'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Expanded Accordion: Full Cost Breakdown & Interactive Sandbox */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-6 text-xs">
                    
                    {/* Top Row: Visual Breakdown Ratio Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-xs">
                          <Calculator className="w-3.5 h-3.5 text-slate-500" />
                          製造原価の内訳構成比 (1個あたり: ¥{breakdown.unit_manufacturing_cost.toFixed(1)})
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          1仕込み総原価: ¥{Math.round(breakdown.total_manufacturing_cost).toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Clean Slate & Emerald Tone Progress Bar */}
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
                          <span>材料費 ¥{breakdown.unit_ingredient_cost.toFixed(1)} ({breakdown.ingredient_ratio.toFixed(1)}%)</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          <span>資材代 ¥{breakdown.unit_packaging_cost.toFixed(1)} ({breakdown.packaging_ratio.toFixed(1)}%)</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          <span>人件費 ¥{breakdown.unit_labor_cost.toFixed(1)} ({breakdown.labor_ratio.toFixed(1)}%)</span>
                        </span>
                      </div>
                    </div>

                    {/* 2-Columns: Ingredients & Packaging Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      
                      {/* Left: Ingredients Detailed Table */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            🥣 使用材料一覧 ({breakdown.ingredient_items.length}品目)
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
                                <div className="text-[10px] text-slate-400">¥{item.cost_per_unit.toFixed(1)}/個</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Packaging & Labor Details */}
                      <div className="space-y-4">
                        {/* Packaging list */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                              📦 使用資材一覧 ({breakdown.packaging_items.length}品目)
                            </span>
                            <span className="font-mono text-slate-800 font-bold">
                              小計 ¥{breakdown.unit_packaging_cost.toFixed(1)}/個
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {breakdown.packaging_items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                                <div className="min-w-0 pr-2">
                                  <div className="font-medium text-slate-800 truncate">{item.material.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {item.quantity_per_unit}個/製品 (単価: ¥{item.unit_cost.toFixed(1)})
                                  </div>
                                </div>
                                <div className="text-right shrink-0 font-mono font-semibold text-slate-900">
                                  ¥{item.cost_per_unit.toFixed(1)}/個
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Labor details */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800">👤 1仕込み人件費 (直接入力)</span>
                            <div className="text-[11px] text-slate-400">
                              製造スタッフ工数総額
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-sm font-bold text-slate-900">
                              ¥{recipe.labor_cost.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ¥{breakdown.unit_labor_cost.toFixed(1)} / 1個
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
                            卸価格リアルタイム粗利シミュレーター
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
                              ¥{currentSimWholesale.toLocaleString()}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={Math.round(breakdown.unit_manufacturing_cost * 1.05)}
                            max={recipe.target_retail_price || 600}
                            step={10}
                            value={currentSimWholesale}
                            onChange={(e) => setSimulatedWholesale(prev => ({
                              ...prev,
                              [recipe.id]: Number(e.target.value)
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
                            <span className="text-[10px] text-slate-400">1個あたり粗利</span>
                            <div className="text-sm font-bold font-mono text-slate-900">
                              ¥{Math.round(breakdown.wholesale.gross_margin)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/cost/recipes/${recipe.id}`}
                            className="flex items-center gap-1 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
                          >
                            <span>配合を本格編集</span>
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
    </div>
  );
}
