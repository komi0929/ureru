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
  RotateCcw,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Material, MaterialCategory, UnitType } from '@/types/cost';
import { getMaterials, saveMaterial, deleteMaterial, toggleMaterialProvisional } from '@/lib/cost-api';
import TutorialModal from '@/components/cost/TutorialModal';

export default function MaterialsMasterPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'ingredient' | 'packaging' | 'provisional'>('all');
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
  const [isProvisional, setIsProvisional] = useState<boolean>(false);
  const [provisionalNotes, setProvisionalNotes] = useState<string>('');

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
    setIsProvisional(false);
    setProvisionalNotes('');
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
    setIsProvisional(!!item.is_provisional);
    setProvisionalNotes(item.provisional_notes || '');
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
      is_provisional: isProvisional,
      provisional_notes: isProvisional ? provisionalNotes.trim() : '',
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

  // ワンクリックで暫定/確定ステータスを切り替え
  const handleToggleProvisional = async (item: Material) => {
    const nextStatus = !item.is_provisional;
    let newNotes = item.provisional_notes || '';
    if (nextStatus && !newNotes) {
      newNotes = '未確定・概算試算';
    }
    await toggleMaterialProvisional(item.id, nextStatus, newNotes);
    await loadMaterials();
  };

  // Filtered materials
  const provisionalCount = materials.filter(m => m.is_provisional).length;
  const ingredientCount = materials.filter(m => m.category === 'ingredient').length;
  const packagingCount = materials.filter(m => m.category === 'packaging').length;

  const filteredMaterials = materials.filter(m => {
    if (activeTab === 'provisional') {
      if (!m.is_provisional) return false;
    } else if (activeTab !== 'all' && m.category !== activeTab) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchSupplier = (m.supplier || '').toLowerCase().includes(q);
      const matchNotes = (m.notes || '').toLowerCase().includes(q);
      const matchProvNotes = (m.provisional_notes || '').toLowerCase().includes(q);
      return matchName || matchSupplier || matchNotes || matchProvNotes;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              マスター管理
            </span>
            <span className="text-xs text-slate-400">レシピ原価と自動同期</span>
            {provisionalCount > 0 && (
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                暫定入力: {provisionalCount}件
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">材料・資材マスター</h1>
          <p className="text-xs text-slate-500 mt-1">
            仕入れ単価（税込）と送料から1gおよび1個あたりの単価を自動計算。未確定情報は「暫定」として記録・明示できます。
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

      {/* Provisional Notice Banner (if any provisional items exist) */}
      {provisionalCount > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-amber-950">
                未確定・暫定で登録されている品目が {provisionalCount} 件あります
              </span>
              <p className="text-amber-800/80 text-[11px] mt-0.5">
                新商品の試作や見積もり待ちの品目です。仕入れ先からの確定単価が入手でき次第、本登録へ更新してください。
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab(activeTab === 'provisional' ? 'all' : 'provisional')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 transition-colors cursor-pointer border ${
              activeTab === 'provisional'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            {activeTab === 'provisional' ? '✓ 暫定フィルター中（解除）' : '⚠️ 暫定品目のみを表示'}
          </button>
        </div>
      )}

      {/* Filter and Tab Control */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            すべて ({materials.length})
          </button>
          <button
            onClick={() => setActiveTab('ingredient')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeTab === 'packaging'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>資材</span>
            <span className="text-[11px] opacity-70">({packagingCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('provisional')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeTab === 'provisional'
                ? 'bg-amber-100 text-amber-900 font-bold shadow-2xs'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>未確定・暫定</span>
            <span className="text-[11px] bg-amber-200/80 px-1.5 py-0.2 rounded-full font-bold">
              {provisionalCount}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="品名・仕入れ先・暫定メモを検索..."
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
                <th className="py-3 px-4">品名 / 仕入れ先 / 確定ステータス</th>
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
                    {activeTab === 'provisional' 
                      ? '未確定・暫定で登録された材料・資材はありません（すべて確定済み）' 
                      : '登録されている材料・資材がありません'}
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((item) => {
                  const isIng = item.category === 'ingredient';
                  const isProv = !!item.is_provisional;

                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors group ${
                        isProv 
                          ? 'bg-amber-50/35 hover:bg-amber-50/60 border-l-4 border-l-amber-400' 
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 text-xs">
                            {item.name}
                          </span>
                          
                          {/* ⚠️ 暫定バッジ（一目で未確定とわかる） */}
                          {isProv && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                              title={item.provisional_notes || '未確定・暫定価格です'}
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>暫定</span>
                              {item.provisional_notes && (
                                <span className="font-normal opacity-85 text-[9px] max-w-[140px] truncate">
                                  : {item.provisional_notes}
                                </span>
                              )}
                            </span>
                          )}
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
                        {isProv && <span className="text-[10px] text-amber-600 block">(仮)</span>}
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
                        <div className={`text-xs font-bold ${isProv ? 'text-amber-900' : 'text-slate-900'}`}>
                          ¥{item.unit_cost.toFixed(isIng ? (item.unit_cost < 1 ? 3 : 2) : 2)}
                          <span className="text-[10px] font-normal text-slate-400 ml-1">
                            / {item.unit_type === 'piece' ? '個' : item.unit_type}
                          </span>
                        </div>
                        {isProv && (
                          <span className="text-[9px] text-amber-700 font-semibold block">
                            ※試算用暫定単価
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* 暫定 / 確定 クイック切替ボタン */}
                          <button
                            onClick={() => handleToggleProvisional(item)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer text-[10px] font-semibold flex items-center gap-1 ${
                              isProv
                                ? 'bg-amber-100 hover:bg-emerald-100 text-amber-800 hover:text-emerald-800'
                                : 'text-slate-400 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                            title={isProv ? 'クリックして確定済みに変更' : 'クリックして暫定入力に変更'}
                          >
                            {isProv ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="hidden sm:inline">確定にする</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                                <span className="hidden sm:inline">暫定にする</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="編集"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingId ? '材料・資材マスター編集' : '新規材料・資材の登録'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
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

              {/* ⚠️ 暫定・未確定情報としての記録パネル */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                isProvisional 
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20' 
                  : 'bg-slate-50/60 border-slate-200/80'
              }`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{isProvisional ? '⚠️' : '📌'}</span>
                    <div>
                      <span className="font-bold text-xs text-slate-800">
                        未確定情報・暫定単価として記録する
                      </span>
                      <p className="text-[11px] text-slate-500">
                        見積もり前や仮設定の場合にチェック。一覧やレシピ上で「暫定」と一目で識別できます。
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isProvisional}
                    onChange={(e) => setIsProvisional(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                </label>

                {isProvisional && (
                  <div className="mt-3 pt-2.5 border-t border-amber-200/80">
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      暫定理由・未確定の内容メモ (任意)
                    </label>
                    <input
                      type="text"
                      value={provisionalNotes}
                      onChange={(e) => setProvisionalNotes(e.target.value)}
                      placeholder="例: 問屋見積もり回答待ち、1kg仮単価、カタログ参考価格 等"
                      className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 placeholder:text-amber-700/40"
                    />
                  </div>
                )}
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
              <div className={`p-3 rounded-lg border flex items-center justify-between ${
                isProvisional ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block flex items-center gap-1.5">
                    自動計算結果
                    {isProvisional && (
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                        ⚠️ 試算用暫定
                      </span>
                    )}
                  </span>
                  <div className="text-xs text-slate-500">
                    送料込総額: <strong className="font-mono text-slate-800">¥{calculatedTotal.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400">
                    {category === 'ingredient' ? '1g(ml)あたり税込単価' : '1個あたり税込単価'}
                  </div>
                  <div className={`text-base font-bold font-mono ${isProvisional ? 'text-amber-900' : 'text-slate-900'}`}>
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
                  placeholder="例: 有機JAS認定、アレルギー物質なし 等"
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
