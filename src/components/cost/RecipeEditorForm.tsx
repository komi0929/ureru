'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  ArrowLeft, 
  Save, 
  HelpCircle, 
  Layers, 
  Package, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  UtensilsCrossed,
  Sparkles,
  ExternalLink,
  Tag
} from 'lucide-react';
import { Material, Recipe, RecipeIngredient, RecipePackaging, PackageType, PackageConfig, UniformPricingConfig } from '@/types/cost';
import { calculateRecipeCost, saveRecipe, getUniformPricing, COMMON_CUP_PACKAGINGS, COMMON_BULK_PACKAGINGS } from '@/lib/cost-api';
import TutorialModal from '@/components/cost/TutorialModal';

interface RecipeEditorFormProps {
  initialRecipe?: Recipe;
  materials: Material[];
  isEditing?: boolean;
}

export default function RecipeEditorForm({
  initialRecipe,
  materials,
  isEditing = false,
}: RecipeEditorFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Active Tab for Package Configuration in Form: 'cup' | 'bulk'
  const [activePackageTab, setActivePackageTab] = useState<PackageType>('cup');

  // Basic Info States
  const [name, setName] = useState(initialRecipe?.name || '');
  const [category, setCategory] = useState(initialRecipe?.category || '米粉アイス');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [notes, setNotes] = useState(initialRecipe?.notes || '');

  // Ingredients (Shared across Cup & Bulk)
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    initialRecipe?.ingredients || [
      { id: 'ing-1', material_id: materials.find(m => m.category === 'ingredient')?.id || '', amount: 1000, unit: 'ml' }
    ]
  );

  // Cup Configuration
  const [cupQuantity, setCupQuantity] = useState<number>(
    initialRecipe?.cup_config?.target_quantity || initialRecipe?.target_quantity || 65
  );
  const [cupLaborCost, setCupLaborCost] = useState<number>(
    initialRecipe?.cup_config?.labor_cost ?? initialRecipe?.labor_cost ?? 3000
  );
  const [cupWholesalePrice, setCupWholesalePrice] = useState<number>(
    initialRecipe?.cup_config?.target_wholesale_price ?? initialRecipe?.target_wholesale_price ?? 340
  );
  const [cupRetailPrice, setCupRetailPrice] = useState<number>(
    initialRecipe?.cup_config?.target_retail_price ?? initialRecipe?.target_retail_price ?? 520
  );
  const [cupPackagings, setCupPackagings] = useState<RecipePackaging[]>(
    initialRecipe?.cup_config?.packagings || initialRecipe?.packagings || [...COMMON_CUP_PACKAGINGS]
  );

  // Bulk Configuration (2L業務用)
  const [bulkQuantity, setBulkQuantity] = useState<number>(
    initialRecipe?.bulk_config?.target_quantity || 3
  );
  const [bulkLaborCost, setBulkLaborCost] = useState<number>(
    initialRecipe?.bulk_config?.labor_cost ?? 3600
  );
  const [bulkWholesalePrice, setBulkWholesalePrice] = useState<number>(
    initialRecipe?.bulk_config?.target_wholesale_price ?? 4320
  );
  const [bulkRetailPrice, setBulkRetailPrice] = useState<number>(
    initialRecipe?.bulk_config?.target_retail_price ?? 6000
  );
  const [bulkPackagings, setBulkPackagings] = useState<RecipePackaging[]>(
    initialRecipe?.bulk_config?.packagings || [...COMMON_BULK_PACKAGINGS]
  );

  // Uniform Pricing Config
  const [uniformPricing, setUniformPricing] = useState<UniformPricingConfig | null>(null);

  useEffect(() => {
    async function loadPricing() {
      const p = await getUniformPricing();
      setUniformPricing(p);
      // If newly creating a recipe, set default wholesale prices to uniform pricing
      if (!isEditing && !initialRecipe) {
        setCupWholesalePrice(p.cup_wholesale_price);
        setCupRetailPrice(p.cup_retail_price);
        setBulkWholesalePrice(p.bulk_wholesale_price);
        setBulkRetailPrice(p.bulk_retail_price);
      }
    }
    loadPricing();
  }, [isEditing, initialRecipe]);

  // Materials split
  const ingredientMasters = useMemo(() => materials.filter(m => m.category === 'ingredient'), [materials]);
  const packagingMasters = useMemo(() => materials.filter(m => m.category === 'packaging'), [materials]);

  // Total ingredients weight (g/ml) & estimated 100g cup count
  const totalIngredientWeight = useMemo(() => {
    return ingredients.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [ingredients]);
  const estimatedCupCount = useMemo(() => {
    return totalIngredientWeight > 0 ? Math.round(totalIngredientWeight / 100) : 65;
  }, [totalIngredientWeight]);

  // Current Recipe Object for calculation
  const currentRecipe: Recipe = useMemo(() => ({
    id: initialRecipe?.id || 'temp',
    name: name || '名称未設定レシピ',
    category,
    description,
    ingredients,
    cup_config: {
      package_type: 'cup',
      unit_name: '個',
      target_quantity: Number(cupQuantity) > 0 ? Number(cupQuantity) : 1,
      labor_cost: Number(cupLaborCost || 0),
      target_wholesale_price: Number(cupWholesalePrice || 0),
      target_retail_price: Number(cupRetailPrice || 0),
      packagings: cupPackagings,
    },
    bulk_config: {
      package_type: 'bulk',
      unit_name: '本 (2L)',
      target_quantity: Number(bulkQuantity) > 0 ? Number(bulkQuantity) : 1,
      labor_cost: Number(bulkLaborCost || 0),
      target_wholesale_price: Number(bulkWholesalePrice || 0),
      target_retail_price: Number(bulkRetailPrice || 0),
      packagings: bulkPackagings,
    },
    notes,
  }), [
    name, category, description, ingredients, 
    cupQuantity, cupLaborCost, cupWholesalePrice, cupRetailPrice, cupPackagings,
    bulkQuantity, bulkLaborCost, bulkWholesalePrice, bulkRetailPrice, bulkPackagings,
    notes, initialRecipe
  ]);

  // Real-time calculation for active package tab
  const calculation = useMemo(() => {
    return calculateRecipeCost(currentRecipe, materials, activePackageTab);
  }, [currentRecipe, materials, activePackageTab]);

  // Ingredient Handlers
  const handleAddIngredient = () => {
    const defaultMat = ingredientMasters[0]?.id || '';
    setIngredients(prev => [
      ...prev,
      {
        id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        material_id: defaultMat,
        amount: 100,
        unit: 'g',
      },
    ]);
  };

  const handleUpdateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    setIngredients(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      
      if (field === 'material_id') {
        const mat = materials.find(m => m.id === value);
        if (mat) {
          item.unit = mat.unit_type === 'ml' ? 'ml' : 'g';
        }
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  // Packaging Handlers (for current tab)
  const currentPackagings = activePackageTab === 'bulk' ? bulkPackagings : cupPackagings;
  const setCurrentPackagings = activePackageTab === 'bulk' ? setBulkPackagings : setCupPackagings;

  const handleAddPackaging = () => {
    const defaultPkg = packagingMasters[0]?.id || '';
    setCurrentPackagings(prev => [
      ...prev,
      {
        id: `pkg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        material_id: defaultPkg,
        quantity_per_unit: 1,
      },
    ]);
  };

  const handleUpdatePackaging = (index: number, field: keyof RecipePackaging, value: any) => {
    setCurrentPackagings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemovePackaging = (index: number) => {
    setCurrentPackagings(prev => prev.filter((_, i) => i !== index));
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('レシピ名を入力してください');
      return;
    }
    if (cupQuantity <= 0 || bulkQuantity <= 0) {
      alert('仕上がり数量は1以上を入力してください');
      return;
    }

    setSaving(true);
    try {
      await saveRecipe({
        id: initialRecipe?.id,
        name: name.trim(),
        category,
        description: description.trim(),
        ingredients,
        cup_config: {
          package_type: 'cup',
          unit_name: '個',
          target_quantity: Number(cupQuantity),
          labor_cost: Number(cupLaborCost || 0),
          target_wholesale_price: Number(cupWholesalePrice || 0),
          target_retail_price: Number(cupRetailPrice || 0),
          packagings: cupPackagings,
        },
        bulk_config: {
          package_type: 'bulk',
          unit_name: '本 (2L)',
          target_quantity: Number(bulkQuantity),
          labor_cost: Number(bulkLaborCost || 0),
          target_wholesale_price: Number(bulkWholesalePrice || 0),
          target_retail_price: Number(bulkRetailPrice || 0),
          packagings: bulkPackagings,
        },
        notes: notes.trim(),
      });
      router.push('/cost/recipes');
    } catch (err) {
      console.error(err);
      alert('保存中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const isBulk = activePackageTab === 'bulk';

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/cost/recipes"
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                {isEditing ? 'レシピ編集' : '新規レシピ作成'}
              </span>
              <span className="text-xs text-slate-400">カップ（100g・65個）＆ 2Lバルク（3本）同時管理</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {name || '新規レシピ配合'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsTutorialOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/70 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>使い方ガイド</span>
          </button>

          <Link
            href="/cost/recipes"
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? '保存中...' : 'レシピを保存'}</span>
          </button>
        </div>
      </div>

      {/* Beginner Guidance Box */}
      <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 p-4 rounded-xl border border-amber-200/80 shadow-2xs flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-amber-950 font-bold block mb-0.5">配合と形態設定のポイント：</strong>
          「2. 原材料配合」で豆乳・ピューレ等のg配合を入力すれば、個食カップ（100g・65個）と業務用2Lバルク（3本）の両方に共通反映されます。「3. 形態別設定」のタブで、それぞれの仕上がり数・資材・人件費・想定卸売価格を個別に調整可能です。
        </div>
      </div>

      {/* Main Grid: Left Editor & Right Sticky Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (2 cols): Input Fields */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. 基本情報 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">1</span>
              基本情報
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  レシピ・フレーバー名 * <span className="text-slate-400 font-normal">(例: 米粉アイス【アールグレイ】)</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="商品・レシピ名を入力"
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">カテゴリ</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                >
                  <option value="米粉アイス">米粉アイス (定番)</option>
                  <option value="季節限定">季節限定フレーバー</option>
                  <option value="OEM・特注">OEM・特注レシピ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">商品説明・特徴メモ</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="有機豆乳と米粉のなめらかさ、アールグレイの香り立ち等"
                className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>
          </div>

          {/* 2. 原材料配合 (全形態共通) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">2</span>
                  原材料配合（何が何g / ml 入るか）
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ※原材料はカップ・バルク共通です（1回の仕込みで計量する総量）
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/cost/materials"
                  target="_blank"
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1"
                >
                  <Layers className="w-3 h-3" />
                  <span>材料マスター</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>材料を追加</span>
                </button>
              </div>
            </div>

            {/* Ingredients Rows */}
            <div className="space-y-2">
              {ingredients.map((item, index) => {
                const mat = materials.find(m => m.id === item.material_id);
                const unitCost = mat?.unit_cost || 0;
                const rowCost = item.amount * unitCost;

                return (
                  <div
                    key={item.id || index}
                    className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:border-slate-300 transition-all text-xs"
                  >
                    <div className="flex-1">
                      <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                        使用材料 #{index + 1}
                      </label>
                      <select
                        value={item.material_id}
                        onChange={(e) => handleUpdateIngredient(index, 'material_id', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                      >
                        <option value="">-- 材料を選択 --</option>
                        {ingredientMasters.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} (¥{m.unit_cost.toFixed(3)}/{m.unit_type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-36">
                      <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                        配合量 (1仕込み)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={item.amount}
                          onChange={(e) => handleUpdateIngredient(index, 'amount', Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold pr-10 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                          {item.unit}
                        </span>
                      </div>
                    </div>

                    <div className="w-full md:w-40 text-right bg-white p-2 rounded-lg border border-slate-100 flex md:flex-col justify-between items-center md:items-end">
                      <div className="text-[10px] text-slate-400">小計 (1仕込み)</div>
                      <div className="font-mono font-semibold text-slate-900">
                        ¥{Math.round(rowCost).toLocaleString()}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors self-end md:self-center"
                      title="この材料を削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Total Ingredient Cost Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800">🥣 原材料費 小計 (1仕込み)</span>
                <div className="text-[11px] text-slate-500">
                  配合材料 {ingredients.length}品目 / 配合総量: {totalIngredientWeight.toLocaleString()}g (100gカップ換算: 約{estimatedCupCount}個分)
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-slate-900 font-mono">
                  ¥{Math.round(calculation.total_ingredient_cost).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* 3. 形態別（カップ / バルク）製造設定 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">3</span>
                  形態別（カップ / バルク）製造・資材・人件費設定
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  タブを切り替えてそれぞれの仕上がり数・資材・人件費・卸価格を編集できます
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setActivePackageTab('cup')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    !isBulk
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🍨 個食カップ設定 (100g)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePackageTab('bulk')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isBulk
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  📦 業務用 2Lバルク設定
                </button>
              </div>
            </div>

            {/* Tab Content: Current Package Config Form */}
            <div className="space-y-4">
              
              {/* Quantities & Labor Cost Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Quantity */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    仕上がり総定数 (1仕込みで作れる{isBulk ? '本数' : '個数'}) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      value={isBulk ? bulkQuantity : cupQuantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (isBulk) setBulkQuantity(val);
                        else setCupQuantity(val);
                      }}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-base font-bold text-slate-900 font-mono pr-16 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                      {isBulk ? '本 (2L)' : '個'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 mt-1">
                    <span>
                      {isBulk
                        ? '※2L容器 × 3本 ＝ 6リットル'
                        : `※100gカップ × ${cupQuantity}個 ＝ ${(cupQuantity * 100 / 1000).toFixed(1)}kg`}
                    </span>
                    {!isBulk && totalIngredientWeight > 0 && Math.round(totalIngredientWeight / 100) !== cupQuantity && (
                      <button
                        type="button"
                        onClick={() => setCupQuantity(Math.round(totalIngredientWeight / 100))}
                        className="text-amber-800 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-100 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        配合総量({totalIngredientWeight.toLocaleString()}g)から100g/個で自動反映 ({Math.round(totalIngredientWeight / 100)}個)
                      </button>
                    )}
                  </div>
                </div>

                {/* Labor Cost */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    1仕込みの人件費 (直接入力) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">¥</span>
                    <input
                      type="number"
                      min={0}
                      value={isBulk ? bulkLaborCost : cupLaborCost}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (isBulk) setBulkLaborCost(val);
                        else setCupLaborCost(val);
                      }}
                      className="w-full pl-7 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-base font-bold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isBulk ? '※大容量バルク流し込み人件費' : '※カップ小分け充填・シーリング人件費'}
                  </p>
                </div>
              </div>

              {/* Packaging Assignment for Current Tab */}
              <div className="border border-slate-200/80 rounded-xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                    📦 {isBulk ? '2Lバルク用資材' : 'カップ用資材'} ({currentPackagings.length}品目)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddPackaging}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>資材を追加</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {currentPackagings.map((item, index) => {
                    const mat = materials.find(m => m.id === item.material_id);
                    const unitCost = mat?.unit_cost || 0;
                    const costPerUnit = item.quantity_per_unit * unitCost;

                    return (
                      <div
                        key={item.id || index}
                        className="flex flex-col md:flex-row md:items-center gap-3 p-2.5 rounded-lg bg-slate-50/60 border border-slate-200/80 text-xs"
                      >
                        <div className="flex-1">
                          <select
                            value={item.material_id}
                            onChange={(e) => handleUpdatePackaging(index, 'material_id', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                          >
                            <option value="">-- 資材を選択 --</option>
                            {packagingMasters.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name} (¥{m.unit_cost.toFixed(1)}/個)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full md:w-32">
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              step={1}
                              value={item.quantity_per_unit}
                              onChange={(e) => handleUpdatePackaging(index, 'quantity_per_unit', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[11px]">
                              個
                            </span>
                          </div>
                        </div>

                        <div className="w-full md:w-32 text-right font-mono font-semibold text-slate-800">
                          ¥{costPerUnit.toFixed(1)} / {isBulk ? '本' : '個'}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemovePackaging(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors self-end md:self-center"
                          title="削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">1{isBulk ? '本' : '個'}あたり資材費合計:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ¥{calculation.unit_packaging_cost.toFixed(1)} / {isBulk ? '本 (2L)' : '個'}
                  </span>
                </div>
              </div>

              {/* Wholesale / Retail Price Row for Current Tab */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isBulk ? '2Lバルク 想定卸売価格 (税込)' : 'カップ 想定卸売価格 (税込)'} *</span>
                    </label>
                    {uniformPricing && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isBulk) setBulkWholesalePrice(uniformPricing.bulk_wholesale_price);
                          else setCupWholesalePrice(uniformPricing.cup_wholesale_price);
                        }}
                        className="text-[10px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        title="一律設定の卸価格を反映"
                      >
                        一律設定 (¥{(isBulk ? uniformPricing.bulk_wholesale_price : uniformPricing.cup_wholesale_price).toLocaleString()}) を適用
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">¥</span>
                    <input
                      type="number"
                      min={0}
                      value={isBulk ? bulkWholesalePrice : cupWholesalePrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (isBulk) setBulkWholesalePrice(val);
                        else setCupWholesalePrice(val);
                      }}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    ※全フレーバー一律の卸価格設定です（レシピ一覧・サマリー上部からも一括変更可能）
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      {isBulk ? '2Lバルク 想定小売価格 (参考)' : 'カップ 想定小売価格 (店頭)'}
                    </label>
                    {uniformPricing && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isBulk) setBulkRetailPrice(uniformPricing.bulk_retail_price);
                          else setCupRetailPrice(uniformPricing.cup_retail_price);
                        }}
                        className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        title="一律設定の参考小売価格を反映"
                      >
                        一律設定 (¥{(isBulk ? uniformPricing.bulk_retail_price : uniformPricing.cup_retail_price).toLocaleString()}) を適用
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">¥</span>
                    <input
                      type="number"
                      min={0}
                      value={isBulk ? bulkRetailPrice : cupRetailPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (isBulk) setBulkRetailPrice(val);
                        else setCupRetailPrice(val);
                      }}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 4. 製法メモ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              製造工程メモ・注意事項
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="フリージング温度設定、急速冷凍時間、α化手順など"
              className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>

        </div>

        {/* Right Column (1 col): Clean White Summary Card */}
        <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-24">
          
          {/* Main Manufacturing Cost Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            
            {/* Package Type Switcher for Preview */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-slate-500" />
                製造原価 算出結果
              </span>
              <div className="flex p-0.5 bg-slate-100 rounded-lg text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setActivePackageTab('cup')}
                  className={`px-2 py-0.5 rounded ${!isBulk ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                >
                  カップ
                </button>
                <button
                  type="button"
                  onClick={() => setActivePackageTab('bulk')}
                  className={`px-2 py-0.5 rounded ${isBulk ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                >
                  2Lバルク
                </button>
              </div>
            </div>

            {/* Highlight */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <div className="text-xs text-slate-500 font-medium mb-1">
                {isBulk ? '2Lバルク 1本 製造原価' : 'カップ 1個 製造原価'}
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                ¥{Math.round(calculation.unit_manufacturing_cost).toLocaleString()}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  ({calculation.unit_manufacturing_cost.toFixed(1)}円)
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                仕上がり総数: {calculation.target_quantity}{calculation.unit_name} / 仕込み
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  材料費
                </span>
                <div className="font-mono text-right">
                  <span className="font-semibold text-slate-900">¥{Math.round(calculation.unit_ingredient_cost).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">({calculation.ingredient_ratio.toFixed(0)}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  {isBulk ? 'バルク容器代' : '資材費'}
                </span>
                <div className="font-mono text-right">
                  <span className="font-semibold text-slate-900">¥{Math.round(calculation.unit_packaging_cost).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">({calculation.packaging_ratio.toFixed(0)}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  人件費
                </span>
                <div className="font-mono text-right">
                  <span className="font-semibold text-slate-900">¥{Math.round(calculation.unit_labor_cost).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">({calculation.labor_ratio.toFixed(0)}%)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-slate-500 text-[11px]">
                <span>1仕込み総製造原価:</span>
                <span className="font-mono font-bold text-slate-900">
                  ¥{Math.round(calculation.total_manufacturing_cost).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Visual Ratio Bar */}
            <div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${calculation.ingredient_ratio}%` }}
                  className="bg-amber-400 transition-all duration-300"
                />
                <div
                  style={{ width: `${calculation.packaging_ratio}%` }}
                  className="bg-slate-400 transition-all duration-300"
                />
                <div
                  style={{ width: `${calculation.labor_ratio}%` }}
                  className="bg-blue-400 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Profit Simulator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {isBulk ? '2Lバルク 粗利益分析' : 'カップ 粗利益分析'}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">卸 原価率</div>
                <div className={`text-base font-bold font-mono ${
                  calculation.wholesale.cost_ratio > 60 ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  {calculation.wholesale.cost_ratio.toFixed(1)}%
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">1{calculation.unit_name}あたり粗利</div>
                <div className="text-base font-bold text-slate-900 font-mono">
                  ¥{Math.round(calculation.wholesale.gross_margin).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 mt-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? '保存中...' : 'レシピを保存する'}</span>
            </button>
          </div>

        </div>

      </div>
    </form>

    {/* Tutorial Modal */}
    <TutorialModal
      isOpen={isTutorialOpen}
      onClose={() => setIsTutorialOpen(false)}
    />
  </>
  );
}
