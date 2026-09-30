'use client';

import React, { useState, useMemo } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { Material, Recipe, RecipeIngredient, RecipePackaging } from '@/types/cost';
import { calculateRecipeCost, saveRecipe } from '@/lib/cost-api';

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

  // Form States
  const [name, setName] = useState(initialRecipe?.name || '');
  const [category, setCategory] = useState(initialRecipe?.category || '米粉アイス');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [targetQuantity, setTargetQuantity] = useState<number>(initialRecipe?.target_quantity || 65);
  const [laborCost, setLaborCost] = useState<number>(initialRecipe?.labor_cost ?? 3000);
  const [targetRetailPrice, setTargetRetailPrice] = useState<number>(initialRecipe?.target_retail_price ?? 500);
  const [targetWholesalePrice, setTargetWholesalePrice] = useState<number>(initialRecipe?.target_wholesale_price ?? 340);
  const [notes, setNotes] = useState(initialRecipe?.notes || '');

  // Ingredients state
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    initialRecipe?.ingredients || [
      { id: 'ing-1', material_id: materials.find(m => m.category === 'ingredient')?.id || '', amount: 1000, unit: 'ml' }
    ]
  );

  // Packagings state
  const [packagings, setPackagings] = useState<RecipePackaging[]>(
    initialRecipe?.packagings || [
      { id: 'pkg-1', material_id: materials.find(m => m.category === 'packaging')?.id || '', quantity_per_unit: 1 }
    ]
  );

  // Materials split
  const ingredientMasters = useMemo(() => materials.filter(m => m.category === 'ingredient'), [materials]);
  const packagingMasters = useMemo(() => materials.filter(m => m.category === 'packaging'), [materials]);

  // Current Recipe Object for calculation
  const currentRecipe: Recipe = useMemo(() => ({
    id: initialRecipe?.id || 'temp',
    name: name || '名称未設定レシピ',
    category,
    description,
    target_quantity: Number(targetQuantity) > 0 ? Number(targetQuantity) : 1,
    labor_cost: Number(laborCost || 0),
    target_retail_price: Number(targetRetailPrice || 0),
    target_wholesale_price: Number(targetWholesalePrice || 0),
    ingredients,
    packagings,
    notes,
  }), [name, category, description, targetQuantity, laborCost, targetRetailPrice, targetWholesalePrice, ingredients, packagings, notes, initialRecipe]);

  // Real-time calculation
  const calculation = useMemo(() => {
    return calculateRecipeCost(currentRecipe, materials);
  }, [currentRecipe, materials]);

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

  // Packaging Handlers
  const handleAddPackaging = () => {
    const defaultPkg = packagingMasters[0]?.id || '';
    setPackagings(prev => [
      ...prev,
      {
        id: `pkg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        material_id: defaultPkg,
        quantity_per_unit: 1,
      },
    ]);
  };

  const handleUpdatePackaging = (index: number, field: keyof RecipePackaging, value: any) => {
    setPackagings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemovePackaging = (index: number) => {
    setPackagings(prev => prev.filter((_, i) => i !== index));
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('レシピ名・商品名を入力してください');
      return;
    }
    if (targetQuantity <= 0) {
      alert('仕上がり総定数は1以上を入力してください');
      return;
    }

    setSaving(true);
    try {
      await saveRecipe({
        id: initialRecipe?.id,
        name: name.trim(),
        category,
        description: description.trim(),
        target_quantity: Number(targetQuantity),
        labor_cost: Number(laborCost || 0),
        target_retail_price: Number(targetRetailPrice || 0),
        target_wholesale_price: Number(targetWholesalePrice || 0),
        ingredients,
        packagings,
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

  return (
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
              <span className="text-xs text-slate-400 font-mono">1仕込み総定数: {targetQuantity}個</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {name || '新規レシピ配合'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/cost/recipes"
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? '保存中...' : 'レシピを保存'}</span>
          </button>
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
              基本情報 & 仕上がり総定数
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  レシピ・商品名 * <span className="text-slate-400 font-normal">(例: 米粉アイス【アールグレイ】)</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  仕上がり総定数 (1仕込みの製造個数) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={1}
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-base font-bold text-slate-900 font-mono pr-12 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                    個
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ※材料費や人件費をこの個数で割り、1個あたり単価を算出します
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">商品特徴・メモ</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="九州産有機大豆豆乳使用、風味の特長など"
                  className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          {/* 2. 材料配合 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">2</span>
                材料配合（何が何g / ml 入るか）
              </h2>
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
                const costPerUnit = rowCost / (targetQuantity > 0 ? targetQuantity : 1);

                return (
                  <div
                    key={item.id || index}
                    className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:border-slate-300 transition-all text-xs"
                  >
                    {/* Material Select */}
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

                    {/* Amount & Unit */}
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

                    {/* Cost Preview */}
                    <div className="w-full md:w-44 text-right bg-white p-2 rounded-lg border border-slate-100 flex md:flex-col justify-between items-center md:items-end">
                      <div className="text-[10px] text-slate-400">小計 (1仕込み)</div>
                      <div className="font-mono font-semibold text-slate-900">
                        ¥{Math.round(rowCost).toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          (¥{costPerUnit.toFixed(1)}/個)
                        </span>
                      </div>
                    </div>

                    {/* Delete Button */}
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

            {/* Ingredient Subtotal Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800">🥣 材料費 小計</span>
                <div className="text-[11px] text-slate-500">
                  使用材料 {ingredients.length}品目
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-600">
                  1仕込み合計: <strong className="font-mono text-slate-900">¥{Math.round(calculation.total_ingredient_cost).toLocaleString()}</strong>
                </div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  ¥{calculation.unit_ingredient_cost.toFixed(1)}
                  <span className="text-xs font-normal text-slate-500 ml-1">/ 1個あたり</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 資材代 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">3</span>
                資材代（1個あたりに使用するカップ・包材）
              </h2>
              <button
                type="button"
                onClick={handleAddPackaging}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>資材を追加</span>
              </button>
            </div>

            {/* Packaging Rows */}
            <div className="space-y-2">
              {packagings.map((item, index) => {
                const mat = materials.find(m => m.id === item.material_id);
                const unitCost = mat?.unit_cost || 0;
                const costPerUnit = item.quantity_per_unit * unitCost;

                return (
                  <div
                    key={item.id || index}
                    className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:border-slate-300 transition-all text-xs"
                  >
                    <div className="flex-1">
                      <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                        資材名 #{index + 1}
                      </label>
                      <select
                        value={item.material_id}
                        onChange={(e) => handleUpdatePackaging(index, 'material_id', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                      >
                        <option value="">-- 資材を選択 --</option>
                        {packagingMasters.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} (¥{m.unit_cost.toFixed(1)}/個)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-36">
                      <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                        1個あたり使用数
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={item.quantity_per_unit}
                          onChange={(e) => handleUpdatePackaging(index, 'quantity_per_unit', Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold pr-10 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                          個
                        </span>
                      </div>
                    </div>

                    <div className="w-full md:w-44 text-right bg-white p-2 rounded-lg border border-slate-100 flex md:flex-col justify-between items-center md:items-end">
                      <div className="text-[10px] text-slate-400">1製品あたり資材費</div>
                      <div className="font-mono font-semibold text-slate-900">
                        ¥{costPerUnit.toFixed(1)}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          (仕込み: ¥{Math.round(costPerUnit * targetQuantity).toLocaleString()})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePackaging(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors self-end md:self-center"
                      title="この資材を削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Packaging Subtotal Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800">📦 資材費 小計</span>
                <div className="text-[11px] text-slate-500">
                  資材 {packagings.length}種類
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-600">
                  1仕込み合計: <strong className="font-mono text-slate-900">¥{Math.round(calculation.total_packaging_cost).toLocaleString()}</strong>
                </div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  ¥{calculation.unit_packaging_cost.toFixed(1)}
                  <span className="text-xs font-normal text-slate-500 ml-1">/ 1個あたり</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. 人件費 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">4</span>
              人件費（1仕込みあたり直接入力）
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  1仕込みの人件費 (直接入力) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">¥</span>
                  <input
                    type="number"
                    min={0}
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    placeholder="3000"
                    className="w-full pl-8 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-base font-bold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ※製造スタッフの作業工数に見合った人件費総額
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-center">
                <div className="text-xs font-medium text-slate-500 mb-1">1個あたり人件費 (自動算出)</div>
                <div className="text-xl font-bold text-slate-900 font-mono">
                  ¥{calculation.unit_labor_cost.toFixed(1)}
                  <span className="text-xs font-normal text-slate-500 ml-1">/ 1個</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  ¥{Number(laborCost).toLocaleString()} ÷ {targetQuantity}個
                </div>
              </div>
            </div>
          </div>

          {/* 5. 備考・製法メモ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              製造工程メモ・注意事項
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="フリージング温度設定、急速冷凍時間、アレルゲン配慮メモなど"
              className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>

        </div>

        {/* Right Column (1 col): Clean White Summary Card */}
        <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-24">
          
          {/* Main Manufacturing Cost Card (Clean White) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-slate-500" />
                製造原価 算出結果
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                総定数 {targetQuantity}個
              </span>
            </div>

            {/* Highlight: 1個あたり製造原価 */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <div className="text-xs text-slate-500 font-medium mb-1">
                1個あたりの製造原価
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                ¥{Math.round(calculation.unit_manufacturing_cost).toLocaleString()}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  ({calculation.unit_manufacturing_cost.toFixed(1)}円)
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                材料費 ＋ 資材代 ＋ 人件費
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
                  <span className="font-semibold text-slate-900">¥{calculation.unit_ingredient_cost.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">({calculation.ingredient_ratio.toFixed(0)}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  資材費 (カップ等)
                </span>
                <div className="font-mono text-right">
                  <span className="font-semibold text-slate-900">¥{calculation.unit_packaging_cost.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">({calculation.packaging_ratio.toFixed(0)}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  人件費
                </span>
                <div className="font-mono text-right">
                  <span className="font-semibold text-slate-900">¥{calculation.unit_labor_cost.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">({calculation.labor_ratio.toFixed(0)}%)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-slate-500 text-[11px]">
                <span>1仕込み総原価:</span>
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
                価格＆粗利益シミュレーション
              </h3>
            </div>

            {/* Wholesale */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">🏪 想定卸売価格</span>
                <span className="text-[10px] text-slate-400">B2B店舗向け</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">¥</span>
                <input
                  type="number"
                  min={0}
                  value={targetWholesalePrice}
                  onChange={(e) => setTargetWholesalePrice(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              <div className="pt-1 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400">卸 原価率</div>
                  <div className={`text-sm font-bold font-mono ${
                    calculation.wholesale.cost_ratio > 60 ? 'text-rose-600' : 'text-emerald-700'
                  }`}>
                    {calculation.wholesale.cost_ratio.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400">1個あたり粗利</div>
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    ¥{Math.round(calculation.wholesale.gross_margin)}
                  </div>
                </div>
              </div>
            </div>

            {/* Retail */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">🛒 想定小売価格</span>
                <span className="text-[10px] text-slate-400">店頭販売向け</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">¥</span>
                <input
                  type="number"
                  min={0}
                  value={targetRetailPrice}
                  onChange={(e) => setTargetRetailPrice(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              <div className="pt-1 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400">小売 原価率</div>
                  <div className="text-sm font-bold font-mono text-slate-900">
                    {calculation.retail.cost_ratio.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400">1個あたり粗利</div>
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    ¥{Math.round(calculation.retail.gross_margin)}
                  </div>
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
  );
}
