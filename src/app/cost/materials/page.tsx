'use client';

import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  X, 
  Calculator,
  Truck,
  Tag,
  AlertCircle,
  HelpCircle,
  PackageCheck,
  RotateCcw
} from 'lucide-react';
import { Material, MaterialCategory, UnitType } from '@/types/cost';
import { getMaterials, saveMaterial, deleteMaterial } from '@/lib/cost-api';
import TutorialModal from '@/components/cost/TutorialModal';

export default function MaterialsMasterPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'ingredient' | 'packaging'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [category, setCategory] = useState<MaterialCategory>('ingredient');
  const [name, setName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [packageUnitName, setPackageUnitName] = useState('');
  const [packageQuantity, setPackageQuantity] = useState<number>(1000);
  const [unitType, setUnitType] = useState<UnitType>('g');
  const [packagePrice, setPackagePrice] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Computed values for form preview
  const calculatedTotal = Number(packagePrice || 0) + Number(shippingCost || 0);
  const qty = Number(packageQuantity) > 0 ? Number(packageQuantity) : 1;
  const calculatedUnitCost = calculatedTotal / qty;

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    const data = await getMaterials();
    setMaterials(data);
    setLoading(false);
  };

  const handleOpenAddModal = (defaultCategory: MaterialCategory = 'ingredient') => {
    setEditingId(null);
    setCategory(defaultCategory);
    setName('');
    setSupplier('');
    setPackageUnitName(defaultCategory === 'ingredient' ? '1袋 (1kg)' : '1箱 (1000個)');
    setPackageQuantity(defaultCategory === 'ingredient' ? 1000 : 1000);
    setUnitType(defaultCategory === 'ingredient' ? 'g' : 'piece');
    setPackagePrice(0);
    setShippingCost(0);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Material) => {
    setEditingId(item.id);
    setCategory(item.category);
    setName(item.name);
    setSupplier(item.supplier || '');
    setPackageUnitName(item.package_unit_name);
    setPackageQuantity(item.package_quantity);
    setUnitType(item.unit_type);
    setPackagePrice(item.package_price);
    setShippingCost(item.shipping_cost);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleCategoryChange = (newCat: MaterialCategory) => {
    setCategory(newCat);
    if (newCat === 'ingredient') {
      if (unitType === 'piece') setUnitType('g');
      if (!packageUnitName || packageUnitName.includes('箱')) setPackageUnitName('1袋 (1kg)');
    } else {
      setUnitType('piece');
      if (!packageUnitName || packageUnitName.includes('袋')) setPackageUnitName('1箱 (1000個)');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('品名を入力してください');
      return;
    }
    if (packageQuantity <= 0) {
      alert('内容量・入数は1以上を入力してください');
      return;
    }

    await saveMaterial({
      id: editingId || undefined,
      category,
      name: name.trim(),
      supplier: supplier.trim(),
      package_unit_name: packageUnitName.trim() || (category === 'ingredient' ? '1式' : '1ロット'),
      package_quantity: Number(packageQuantity),
      unit_type: unitType,
      package_price: Number(packagePrice),
      shipping_cost: Number(shippingCost),
      notes: notes.trim(),
    });

    setIsModalOpen(false);
    await loadMaterials();
  };

  const handleDelete = async (id: string, itemName: string) => {
    if (confirm(`「${itemName}」を削除してもよろしいですか？\n※この材料を使用しているレシピの計算に影響する場合があります。`)) {
      await deleteMaterial(id);
      await loadMaterials();
    }
  };

  // Filtered materials
  const filteredMaterials = materials.filter(m => {
    if (activeTab !== 'all' && m.category !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchSupplier = (m.supplier || '').toLowerCase().includes(q);
      const matchNotes = (m.notes || '').toLowerCase().includes(q);
      return matchName || matchSupplier || matchNotes;
    }
    return true;
  });

  const ingredientCount = materials.filter(m => m.category === 'ingredient').length;
  const packagingCount = materials.filter(m => m.category === 'packaging').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              マスター管理
            </span>
            <span className="text-xs text-slate-400">レシピ原価と自動同期</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">材料・資材マスター</h1>
          <p className="text-xs text-slate-500 mt-1">
            仕入れ単価（税込）と送料（税込）から、1gおよび1個あたりの単価を自動計算してレシピに連携します。
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

          <button
            onClick={() => handleOpenAddModal('ingredient')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>原材料を追加</span>
          </button>
          <button
            onClick={() => handleOpenAddModal('packaging')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-all active:scale-95 cursor-pointer border border-slate-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>資材を追加</span>
          </button>
        </div>
      </div>

      {/* Filter and Tab Control */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs (Google-like Clean Pill) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            すべて ({materials.length})
          </button>
          <button
            onClick={() => setActiveTab('ingredient')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'ingredient'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>原材料</span>
            <span className="text-[11px] opacity-70">({ingredientCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('packaging')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'packaging'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>資材</span>
            <span className="text-[11px] opacity-70">({packagingCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="品名・仕入れ先を検索..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/90 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-medium">
                <th className="py-3 px-4">種別</th>
                <th className="py-3 px-4">品名 / 仕入れ先</th>
                <th className="py-3 px-4 text-right">仕入れ単位・入数</th>
                <th className="py-3 px-4 text-right">仕入れ単価 (税込)</th>
                <th className="py-3 px-4 text-right">送料 (税込)</th>
                <th className="py-3 px-4 text-right">送料込総額</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-800">
                  {activeTab === 'packaging' ? '1個あたり単価' : '1g(ml)あたり単価'}
                </th>
                <th className="py-3 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    データを読み込み中...
                  </td>
                </tr>
              ) : filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    登録されている材料・資材がありません
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((item) => {
                  const isIng = item.category === 'ingredient';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                            isIng
                              ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isIng ? '原材料' : '資材'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-xs">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-slate-400 text-[11px]">
                          {item.supplier && <span>{item.supplier}</span>}
                          {item.notes && <span className="text-slate-400 truncate max-w-xs">（{item.notes}）</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="text-slate-700">{item.package_unit_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.package_quantity.toLocaleString()} {item.unit_type}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-slate-600">
                        ¥{item.package_price.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono">
                        {item.shipping_cost > 0 ? (
                          <span className="text-slate-500">¥{item.shipping_cost.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">無料</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-slate-700 font-medium">
                        ¥{item.total_package_cost.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono">
                        <div className="text-xs font-bold text-slate-900">
                          ¥{item.unit_cost.toFixed(isIng ? (item.unit_cost < 1 ? 3 : 2) : 2)}
                          <span className="text-[10px] font-normal text-slate-400 ml-1">
                            / {item.unit_type === 'piece' ? '個' : item.unit_type}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="編集"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingId ? '材料・資材マスター編集' : '新規材料・資材の登録'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">種別選択 *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => handleCategoryChange('ingredient')}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      category === 'ingredient'
                        ? 'border-slate-900 bg-slate-50 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={category === 'ingredient'}
                      onChange={() => handleCategoryChange('ingredient')}
                      className="text-slate-900"
                    />
                    <span>🥣 原材料（食品原料）</span>
                  </label>

                  <label
                    onClick={() => handleCategoryChange('packaging')}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      category === 'packaging'
                        ? 'border-slate-900 bg-slate-50 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={category === 'packaging'}
                      onChange={() => handleCategoryChange('packaging')}
                      className="text-slate-900"
                    />
                    <span>📦 資材・包材</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    品名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例: 国産無調整豆乳"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    仕入れ先 (任意)
                  </label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="例: マルサンアイ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    仕入れ単位名
                  </label>
                  <input
                    type="text"
                    required
                    value={packageUnitName}
                    onChange={(e) => setPackageUnitName(e.target.value)}
                    placeholder="1袋 (1kg)"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    単位の基準
                  </label>
                  {category === 'ingredient' ? (
                    <select
                      value={unitType}
                      onChange={(e) => setUnitType(e.target.value as UnitType)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    >
                      <option value="g">g (グラム)</option>
                      <option value="ml">ml / ℓ (水換算 1ml=1g)</option>
                    </select>
                  ) : (
                    <div className="px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-md text-xs">
                      個 / 枚 / 本
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    総内容量 / 入数 *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      step="any"
                      value={packageQuantity}
                      onChange={(e) => setPackageQuantity(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-mono"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[11px]">
                      {unitType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    仕入れ単価 (税込) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">¥</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={packagePrice}
                      onChange={(e) => setPackagePrice(Number(e.target.value))}
                      placeholder="1980"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    送料 (税込)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">¥</span>
                    <input
                      type="number"
                      min={0}
                      value={shippingCost}
                      onChange={(e) => setShippingCost(Number(e.target.value))}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Clean Preview */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    自動計算結果
                  </span>
                  <div className="text-xs text-slate-500">
                    送料込総額: <strong className="font-mono text-slate-800">¥{calculatedTotal.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400">
                    {category === 'ingredient' ? '1g(ml)あたり税込単価' : '1個あたり税込単価'}
                  </div>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    ¥{calculatedUnitCost.toFixed(category === 'ingredient' ? 4 : 2)}
                    <span className="text-[11px] font-normal text-slate-500 ml-1">
                      / {unitType === 'piece' ? '個' : unitType}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  備考・規格メモ (任意)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例: 有機JAS認定 等"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  {editingId ? '変更を保存' : 'マスターに登録'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}
