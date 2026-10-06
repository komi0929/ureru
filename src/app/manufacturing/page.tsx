'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Factory, 
  ShieldCheck, 
  Boxes, 
  Truck, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  ChevronRight, 
  RotateCcw, 
  Plus, 
  User, 
  Calendar, 
  Tag, 
  HelpCircle, 
  Check, 
  X, 
  ExternalLink,
  ShieldAlert,
  Flame,
  FileText,
  AlertCircle,
  Eye,
  Info
} from 'lucide-react';
import { 
  manufacturingStore, 
  DEFAULT_MANUFACTURING_PRODUCTS 
} from '@/lib/manufacturing-store';
import { 
  ManufacturingLot, 
  ManufacturingProduct, 
  InventoryTransaction, 
  Shipment, 
  QAChecklist,
  LotStatus 
} from '@/types/manufacturing';

export default function ManufacturingPage() {
  // タブ状態: 'wip' | 'qa' | 'inventory' | 'shipment' | 'traceability'
  const [activeTab, setActiveTab] = useState<'wip' | 'qa' | 'inventory' | 'shipment' | 'traceability'>('wip');

  // データ状態
  const [products, setProducts] = useState<ManufacturingProduct[]>([]);
  const [lots, setLots] = useState<ManufacturingLot[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 初期ロード
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(manufacturingStore.getProducts());
    setLots(manufacturingStore.getLots());
    setTransactions(manufacturingStore.getTransactions());
    setShipments(manufacturingStore.getShipments());
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // -------------------------------------------------------------
  // タブ1: 製造登録・仕掛品 (WIP) State & Handlers
  // -------------------------------------------------------------
  const [newLotProduct, setNewLotProduct] = useState<string>('prod-vanilla-1l');
  const [newLotOperator, setNewLotOperator] = useState<string>('田中 宏明');
  const [newLotQuantity, setNewLotQuantity] = useState<number>(50);
  const [newLotNotes, setNewLotNotes] = useState<string>('');

  const handleCreateWip = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLotQuantity <= 0) {
      showToast('製造予定数は1以上で入力してください。', 'error');
      return;
    }
    const res = manufacturingStore.createWipLot({
      productId: newLotProduct,
      operatorName: newLotOperator,
      plannedQuantity: Number(newLotQuantity),
      notes: newLotNotes,
    });
    if (res.success && res.lot) {
      loadData();
      showToast(`仕掛品ロット「${res.lot.lot_id}」を登録しました（検品前のため出荷不可）。`);
      setNewLotNotes('');
    } else {
      showToast(res.error || '登録に失敗しました。', 'error');
    }
  };

  // -------------------------------------------------------------
  // タブ2: HACCPデジタル検品ゲート State & Handlers
  // -------------------------------------------------------------
  const [selectedLotForQA, setSelectedLotForQA] = useState<string>('');
  const [qaInspector, setQaInspector] = useState<string>('吉田 恵美 (品質管理責任者)');
  const [qaActualQty, setQaActualQty] = useState<number>(50);
  const [qaNotes, setQaNotes] = useState<string>('');
  const [qaChecklist, setQaChecklist] = useState<QAChecklist>({
    seal_verified: false,
    label_verified: false,
    lot_print_verified: false,
    temp_ccp_verified: false,
    notes: '',
  });

  // ロット選択時の自動セット
  const handleSelectQALot = (lotId: string) => {
    setSelectedLotForQA(lotId);
    const lot = lots.find(l => l.lot_id === lotId);
    if (lot) {
      setQaActualQty(lot.actual_quantity);
    }
    // チェックリストリセット
    setQaChecklist({
      seal_verified: false,
      label_verified: false,
      lot_print_verified: false,
      temp_ccp_verified: false,
      notes: '',
    });
  };

  // 検品合格実行
  const handlePassQAGate = () => {
    if (!selectedLotForQA) {
      showToast('検品対象のロットを選択してください。', 'error');
      return;
    }
    const res = manufacturingStore.passQAGate(
      selectedLotForQA,
      qaInspector,
      { ...qaChecklist, notes: qaNotes },
      Number(qaActualQty)
    );
    if (res.success) {
      loadData();
      showToast(`ロット「${selectedLotForQA}」のHACCP検品が完了し、出荷可能在庫（QA_Passed）に昇格しました！`);
      setSelectedLotForQA('');
    } else {
      showToast(res.error || '検品処理に失敗しました。', 'error');
    }
  };

  // 隔離保留実行
  const [quarantineReason, setQuarantineReason] = useState<string>('');
  const [isQuarantineModalOpen, setIsQuarantineModalOpen] = useState(false);

  const handleQuarantine = () => {
    if (!quarantineReason.trim()) {
      showToast('隔離・保留理由を入力してください。', 'error');
      return;
    }
    const res = manufacturingStore.quarantineLot(selectedLotForQA, quarantineReason, qaInspector);
    if (res.success) {
      loadData();
      showToast(`ロット「${selectedLotForQA}」を隔離保留（出荷禁止）に設定しました。`, 'error');
      setIsQuarantineModalOpen(false);
      setQuarantineReason('');
      setSelectedLotForQA('');
    } else {
      showToast(res.error || '処理に失敗しました。', 'error');
    }
  };

  // -------------------------------------------------------------
  // タブ3: ロット別在庫・厳格棚卸 State & Handlers
  // -------------------------------------------------------------
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | LotStatus>('ALL');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustLotId, setAdjustLotId] = useState('');
  const [adjustChange, setAdjustChange] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustOperator, setAdjustOperator] = useState('佐々木 健一');
  const [adjustNotes, setAdjustNotes] = useState('');

  const openAdjustModal = (lot: ManufacturingLot) => {
    setAdjustLotId(lot.lot_id);
    setAdjustChange(0);
    setAdjustReason('');
    setAdjustNotes('');
    setIsAdjustModalOpen(true);
  };

  const handleExecuteAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const res = manufacturingStore.adjustInventory({
      lotId: adjustLotId,
      quantityChange: Number(adjustChange),
      reason: adjustReason,
      operator: adjustOperator,
      notes: adjustNotes,
    });
    if (res.success) {
      loadData();
      showToast(`ロット「${adjustLotId}」の在庫数を調整し、監査ログに改ざん不可記録しました。`);
      setIsAdjustModalOpen(false);
    } else {
      showToast(res.error || '調整に失敗しました。', 'error');
    }
  };

  // -------------------------------------------------------------
  // タブ4: ロット指定出荷 ＆ FIFO強制 State & Handlers
  // -------------------------------------------------------------
  const [shipDestination, setShipDestination] = useState('Vegan Cafe LOHAS 警固店');
  const [shipProduct, setShipProduct] = useState('prod-vanilla-1l');
  const [shipLotId, setShipLotId] = useState('');
  const [shipQuantity, setShipQuantity] = useState<number>(5);
  const [shipOperator, setShipOperator] = useState('田中 宏明');
  const [shipFifoReason, setShipFifoReason] = useState('');
  const [shipCarrier, setShipCarrier] = useState('ヤマト運輸（クール冷凍便）');

  // 商品変更時に最古ロット（FIFO推奨）を自動選択
  useEffect(() => {
    const fifoLot = manufacturingStore.getFifoRecommendedLot(shipProduct);
    if (fifoLot) {
      setShipLotId(fifoLot.lot_id);
    } else {
      setShipLotId('');
    }
    setShipFifoReason('');
  }, [shipProduct]);

  // FIFO違反判定
  const currentFifoLot = manufacturingStore.getFifoRecommendedLot(shipProduct);
  const isFifoViolation = Boolean(currentFifoLot && shipLotId && currentFifoLot.lot_id !== shipLotId);
  const availableLotsForShipping = manufacturingStore.getAvailableLotsForProduct(shipProduct);

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipLotId) {
      showToast('出荷するロットを選択してください。', 'error');
      return;
    }
    const res = manufacturingStore.createShipment({
      destinationName: shipDestination,
      carrier: shipCarrier,
      operator: shipOperator,
      items: [
        {
          productId: shipProduct,
          lotId: shipLotId,
          quantity: Number(shipQuantity),
          fifoOverrideReason: isFifoViolation ? shipFifoReason : undefined,
        }
      ]
    });

    if (res.success) {
      loadData();
      showToast(`出荷伝票「${res.shipmentId}」を登録し、ロット在庫を引当てました。`);
      setShipFifoReason('');
    } else {
      showToast(res.error || '出荷登録に失敗しました。', 'error');
    }
  };

  // -------------------------------------------------------------
  // タブ5: 一気通貫トレーサビリティ State & Handlers
  // -------------------------------------------------------------
  const [searchLotQuery, setSearchLotQuery] = useState('LOT-20260920-VAN-01');
  const [searchDestQuery, setSearchDestQuery] = useState('YADOKARI');
  const [traceSearchType, setTraceSearchType] = useState<'lot' | 'destination'>('lot');

  const lotTraceResult = searchLotQuery.trim() 
    ? manufacturingStore.getTraceabilityByLot(searchLotQuery.trim()) 
    : null;

  const destTraceResult = searchDestQuery.trim()
    ? manufacturingStore.getTraceabilityByDestination(searchDestQuery.trim())
    : null;

  // デモデータリセット
  const handleResetData = () => {
    if (confirm('製造・在庫・検品データを初期デモデータにリセットしますか？')) {
      manufacturingStore.resetToDefaultData();
      loadData();
      showToast('デモデータを初期化しました。');
    }
  };

  // 仕掛品（WIP）の数
  const wipLotsCount = lots.filter(l => l.status === 'WIP').length;
  // 出荷可能ロット（QA_Passed）の数
  const qaPassedLotsCount = lots.filter(l => l.status === 'QA_Passed' && l.current_quantity > 0).length;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans antialiased pb-20">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'success' 
            ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20' 
            : 'bg-rose-900 text-white border-rose-700 shadow-rose-950/20'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="ポータルに戻る"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                <Factory className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
                    製造・品質管理
                  </h1>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-full">
                    HACCP & TRACE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5">
                  仕掛品混入ゼロ・デジタル検品・FIFO先入れ先出し・改ざん不可監査
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
              title="データを初期デモ状態にリセット"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">デモ初期化</span>
            </button>
            <Link
              href="/orders"
              className="hidden md:flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <span>受発注HUBへ</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Tabs (Mobile-first responsive scrollbar) */}
      <div className="bg-white border-b border-slate-200 sticky top-[61px] z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar">
            <button
              onClick={() => setActiveTab('wip')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'wip'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Factory className="w-4 h-4" />
              <span>① 製造登録・仕掛品 (WIP)</span>
              {wipLotsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'wip' ? 'bg-white text-teal-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {wipLotsCount}件待ち
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('qa')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'qa'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>② HACCP検品ゲート</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'qa' ? 'bg-white text-teal-700' : 'bg-slate-200 text-slate-700'
              }`}>
                QA Gate
              </span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>③ ロット別在庫・厳格棚卸</span>
            </button>

            <button
              onClick={() => setActiveTab('shipment')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'shipment'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>④ ロット指定出荷・FIFO強制</span>
            </button>

            <button
              onClick={() => setActiveTab('traceability')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'traceability'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>⑤ 一気通貫トレーサビリティ</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        
        {/* ========================================================= */}
        {/* TAB 1: 製造登録・仕掛品 (WIP) */}
        {/* ========================================================= */}
        {activeTab === 'wip' && (
          <div className="space-y-6">
            {/* Top Alert: 仕掛品混入防止ガイド */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="font-bold text-amber-950 block mb-0.5">
                  【インシデント防止ルール】製造直後は「仕掛品（WIP）」として隔離管理されます
                </strong>
                内蓋トップシールが未貼付の未完成品が出荷在庫に混入するのを防ぐため、登録されたロットは「HACCPデジタル検品」を通過するまで<strong>出荷画面および出荷可能在庫には一切反映されません</strong>。
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 製造登録フォーム */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                      <Plus className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">新規ロット製造登録</h2>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    初期状態: WIP
                  </span>
                </div>

                <form onSubmit={handleCreateWip} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      製造フレーバー (商品)
                    </label>
                    <select
                      value={newLotProduct}
                      onChange={(e) => setNewLotProduct(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      製造数量 (本/バルクパック)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newLotQuantity}
                      onChange={(e) => setNewLotQuantity(Number(e.target.value))}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      製造担当者 氏名
                    </label>
                    <input
                      type="text"
                      value={newLotOperator}
                      onChange={(e) => setNewLotOperator(e.target.value)}
                      placeholder="例: 田中 宏明"
                      required
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      仕込み・充填メモ
                    </label>
                    <textarea
                      rows={2}
                      value={newLotNotes}
                      onChange={(e) => setNewLotNotes(e.target.value)}
                      placeholder="例: 午前バッチ充填。原料ロット: 大豆2026-A"
                      className="w-full text-xs font-normal px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Factory className="w-4 h-4" />
                    <span>仕掛品（WIP）として登録</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    ※登録後、検品ゲートで内蓋シール確認を行うまで完成品在庫には計上されません
                  </p>
                </form>
              </div>

              {/* 仕掛品（WIP）一覧 */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        未検品の仕掛品 (WIP) 一覧
                      </h2>
                      <span className="text-[11px] text-slate-400">
                        内蓋シール貼付・CCP確認待ちのロット
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
                    {lots.filter(l => l.status === 'WIP').length} ロット待機中
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  {lots.filter(l => l.status === 'WIP').length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                      <span>現在、未検品の仕掛品（WIP）はありません。すべて検品完了しています。</span>
                    </div>
                  ) : (
                    lots.filter(l => l.status === 'WIP').map(lot => (
                      <div
                        key={lot.lot_id}
                        className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 hover:bg-amber-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md">
                              {lot.lot_id}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {lot.product_name}
                            </span>
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.2 rounded">
                              内蓋シール未確認
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-slate-500">
                            <span>製造日: {lot.manufactured_date}</span>
                            <span>製造担当: {lot.operator_name}</span>
                            <strong className="text-slate-800">数量: {lot.actual_quantity} 本</strong>
                          </div>
                          {lot.notes && (
                            <p className="text-[11px] text-slate-600 italic">
                              メモ: {lot.notes}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => {
                              handleSelectQALot(lot.lot_id);
                              setActiveTab('qa');
                            }}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>HACCP検品へ進む →</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: HACCPデジタル検品ゲート (QA Gate) */}
        {/* ========================================================= */}
        {activeTab === 'qa' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* QA Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  HACCP準拠 デジタル検品ゲート (QA Gate)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  内蓋トップシール密着・異物混入・表示ラベル・ロット印字・急速凍結CCPの全基準をクリアしたロットのみが完成品（出荷可能在庫）へ昇格します。
                </p>
              </div>
            </div>

            {/* ロット選択 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  検品対象ロットを選択
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lots.filter(l => l.status === 'WIP').map(l => (
                    <button
                      key={l.lot_id}
                      type="button"
                      onClick={() => handleSelectQALot(l.lot_id)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedLotForQA === l.lot_id
                          ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {l.lot_id}
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.2 rounded-full">
                          WIP (検品待ち)
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 font-semibold">{l.product_name}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        数量: {l.actual_quantity}本 · 製造: {l.operator_name}
                      </div>
                    </button>
                  ))}
                  {lots.filter(l => l.status === 'WIP').length === 0 && (
                    <div className="col-span-2 p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      検品待ちのWIPロットはありません。「① 製造登録」から仕掛品を登録してください。
                    </div>
                  )}
                </div>
              </div>

              {selectedLotForQA && (
                <div className="pt-4 border-t border-slate-100 space-y-6">
                  {/* ロット概要 */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">選択中ロット</span>
                      <strong className="font-mono text-sm text-slate-900 font-bold">{selectedLotForQA}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">検品後 確定数量 (本)</span>
                      <input
                        type="number"
                        min={1}
                        value={qaActualQty}
                        onChange={(e) => setQaActualQty(Number(e.target.value))}
                        className="font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-0.5 w-20 text-center"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">検品責任者 氏名</span>
                      <input
                        type="text"
                        value={qaInspector}
                        onChange={(e) => setQaInspector(e.target.value)}
                        className="font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-0.5 text-xs"
                      />
                    </div>
                  </div>

                  {/* 4大必須チェックリスト */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-teal-600" />
                      <span>HACCP必須 4大品質チェック（全項目合格が必須条件）</span>
                    </h3>

                    {/* Item 1: 内蓋トップシール */}
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      qaChecklist.seal_verified 
                        ? 'border-emerald-300 bg-emerald-50/50' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={qaChecklist.seal_verified}
                        onChange={(e) => setQaChecklist({ ...qaChecklist, seal_verified: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300 cursor-pointer"
                      />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">
                          ① 内蓋（トップシール）貼付・物理的密閉確認 【仕掛品混入防止CCP】
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          容器口部にアルミ/透明フィルムが完全に圧着され、シール剥がれ・浮き・シワ・異物噛み込みがないことを全数確認。
                        </p>
                      </div>
                    </label>

                    {/* Item 2: 法定表示ラベル */}
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      qaChecklist.label_verified 
                        ? 'border-emerald-300 bg-emerald-50/50' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={qaChecklist.label_verified}
                        onChange={(e) => setQaChecklist({ ...qaChecklist, label_verified: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300 cursor-pointer"
                      />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">
                          ② 外観・法定表示ラベル確認 【アレルゲン保証】
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          「特定原材料（大豆）」などのアレルギー注意書き、原材料名、保存方法（-18℃以下）が正しく印字貼付されていることを確認。
                        </p>
                      </div>
                    </label>

                    {/* Item 3: ロット印字・賞味期限印字 */}
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      qaChecklist.lot_print_verified 
                        ? 'border-emerald-300 bg-emerald-50/50' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={qaChecklist.lot_print_verified}
                        onChange={(e) => setQaChecklist({ ...qaChecklist, lot_print_verified: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300 cursor-pointer"
                      />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">
                          ③ ロット番号・賞味期限印字の鮮明度確認 【トレーサビリティ保証】
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          容器側面の賞味期限・ロット番号が鮮明に読解でき、擦れやカスレがないことを確認。
                        </p>
                      </div>
                    </label>

                    {/* Item 4: 急速凍結CCP */}
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      qaChecklist.temp_ccp_verified 
                        ? 'border-emerald-300 bg-emerald-50/50' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={qaChecklist.temp_ccp_verified}
                        onChange={(e) => setQaChecklist({ ...qaChecklist, temp_ccp_verified: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300 cursor-pointer"
                      />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">
                          ④ 急速凍結CCP（重要管理点）温度管理確認 【品質保持CCP】
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ショックフリーザーにて芯温-18℃以下に達しており、規定時間内の急速冷却が完了していることを確認。
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* 備考 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      検品特記事項・所見
                    </label>
                    <textarea
                      rows={2}
                      value={qaNotes}
                      onChange={(e) => setQaNotes(e.target.value)}
                      placeholder="例: 内蓋シール密着良好、全品目視チェック異常なし"
                      className="w-full text-xs font-normal px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* ボタン群 */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      disabled={!(qaChecklist.seal_verified && qaChecklist.label_verified && qaChecklist.lot_print_verified && qaChecklist.temp_ccp_verified)}
                      onClick={handlePassQAGate}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        qaChecklist.seal_verified && qaChecklist.label_verified && qaChecklist.lot_print_verified && qaChecklist.temp_ccp_verified
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-[0.99]'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>HACCP検品合格・完成品在庫へ昇格</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsQuarantineModalOpen(true)}
                      className="px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>異常発覚のため保留・隔離</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 隔離モーダル */}
            {isQuarantineModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center gap-2 text-rose-600">
                    <ShieldAlert className="w-5 h-5" />
                    <h3 className="font-bold text-sm">ロット隔離・保留処理</h3>
                  </div>
                  <p className="text-xs text-slate-600">
                    ロット「{selectedLotForQA}」を隔離します。隔離されたロットは出荷画面に出ず、物理的にも隔離スペースへ移動してください。
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      隔離・保留の理由 (必須)
                    </label>
                    <textarea
                      rows={3}
                      value={quarantineReason}
                      onChange={(e) => setQuarantineReason(e.target.value)}
                      placeholder="例: 内蓋シールの圧着温度不良の疑い。検体再検査のため出荷停止。"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsQuarantineModalOpen(false)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleQuarantine}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                    >
                      隔離を実行
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ロット別在庫・厳格棚卸 (Inventory & Audit) */}
        {/* ========================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Header Controls */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  ロット別 在庫一覧 ＆ 改ざん不可監査ログ
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  すべての増減操作は担当者名と理由付きでイミュータブルログに記録されます。
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(['ALL', 'QA_Passed', 'WIP', 'Quarantined'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStockStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      stockStatusFilter === status
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {status === 'ALL' && 'すべて'}
                    {status === 'QA_Passed' && '完成品のみ'}
                    {status === 'WIP' && '仕掛品のみ'}
                    {status === 'Quarantined' && '隔離品のみ'}
                  </button>
                ))}
              </div>
            </div>

            {/* Lots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lots
                .filter(l => stockStatusFilter === 'ALL' || l.status === stockStatusFilter)
                .map(lot => {
                  const isWip = lot.status === 'WIP';
                  const isPassed = lot.status === 'QA_Passed';
                  const isQuarantined = lot.status === 'Quarantined';

                  return (
                    <div
                      key={lot.lot_id}
                      className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col justify-between transition-all ${
                        isWip
                          ? 'border-amber-300 ring-2 ring-amber-500/10'
                          : isQuarantined
                          ? 'border-rose-300 ring-2 ring-rose-500/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Status Badge & Lot ID */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-extrabold text-slate-900">
                            {lot.lot_id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isWip
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isQuarantined
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {isWip && 'WIP (仕掛品・出荷不可)'}
                            {isQuarantined && '隔離・保留中'}
                            {isPassed && '検品合格・出荷可能'}
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-slate-800 mb-2">
                          {lot.product_name}
                        </h3>

                        {/* Dates & Quantities */}
                        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] mb-3">
                          <div>
                            <span className="text-slate-400 block text-[10px]">製造日</span>
                            <span className="font-semibold text-slate-700">{lot.manufactured_date}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">賞味期限</span>
                            <span className="font-semibold text-slate-700">{lot.expiration_date}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">製造担当</span>
                            <span className="font-semibold text-slate-700 truncate">{lot.operator_name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">現在庫数</span>
                            <span className={`font-mono text-sm font-bold ${
                              lot.current_quantity === 0 ? 'text-slate-400' : 'text-emerald-700'
                            }`}>
                              {lot.current_quantity} 本
                            </span>
                          </div>
                        </div>

                        {/* HACCP 検品ステータス */}
                        {isPassed && lot.qa_inspector && (
                          <div className="text-[10px] text-emerald-700 bg-emerald-50/80 p-2 rounded-lg mb-3 flex items-center gap-1.5 border border-emerald-100">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>検品合格: {lot.qa_inspector} ({lot.qa_inspected_at?.slice(0, 10)})</span>
                          </div>
                        )}

                        {isQuarantined && (
                          <div className="text-[10px] text-rose-700 bg-rose-50 p-2 rounded-lg mb-3 border border-rose-200">
                            <strong>隔離理由:</strong> {lot.quarantine_reason}
                          </div>
                        )}
                      </div>

                      {/* Stock Adjustment Action */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSearchLotQuery(lot.lot_id);
                            setActiveTab('traceability');
                          }}
                          className="text-[11px] font-semibold text-slate-500 hover:text-teal-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>履歴追跡</span>
                        </button>

                        <button
                          onClick={() => openAdjustModal(lot)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          棚卸・在庫調整
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* 改ざん不可（イミュータブル）監査ログ一覧 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      直近の在庫変動履歴（HACCP監査ログ・改ざん不可）
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      PostgreSQLトリガーによりUPDATE/DELETEが物理的に禁止された監査証跡
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Total: {transactions.length} logs
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase">
                      <th className="py-2 px-3">日時</th>
                      <th className="py-2 px-3">ロットID</th>
                      <th className="py-2 px-3">操作種別</th>
                      <th className="py-2 px-3 text-right">変動数</th>
                      <th className="py-2 px-3 text-right">変動後</th>
                      <th className="py-2 px-3">担当者</th>
                      <th className="py-2 px-3">必須理由・メモ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.slice(0, 10).map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                          {tx.created_at.slice(0, 16).replace('T', ' ')}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {tx.lot_id}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tx.transaction_type === 'MANUFACTURE_WIP'
                              ? 'bg-amber-100 text-amber-900'
                              : tx.transaction_type === 'QA_PASS_INITIAL'
                              ? 'bg-emerald-100 text-emerald-900'
                              : tx.transaction_type === 'SHIPMENT'
                              ? 'bg-blue-100 text-blue-900'
                              : tx.transaction_type === 'QUARANTINE_SCRAP'
                              ? 'bg-rose-100 text-rose-900'
                              : 'bg-purple-100 text-purple-900'
                          }`}>
                            {tx.transaction_type}
                          </span>
                        </td>
                        <td className={`py-2.5 px-3 font-mono font-bold text-right whitespace-nowrap ${
                          tx.quantity_change > 0 
                            ? 'text-emerald-600' 
                            : tx.quantity_change < 0 
                            ? 'text-rose-600' 
                            : 'text-slate-400'
                        }`}>
                          {tx.quantity_change > 0 ? `+${tx.quantity_change}` : tx.quantity_change}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 text-right whitespace-nowrap">
                          {tx.quantity_after} 本
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {tx.operator_name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {tx.reason}
                          {tx.notes && <span className="text-slate-400 ml-1">({tx.notes})</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 棚卸調整モーダル */}
            {isAdjustModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-teal-600" />
                      <h3 className="font-bold text-sm text-slate-900">厳格な在庫数調整（棚卸）</h3>
                    </div>
                    <button
                      onClick={() => setIsAdjustModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div>対象ロット: <strong className="font-mono text-slate-900">{adjustLotId}</strong></div>
                    <div>現在庫: <strong className="text-emerald-700">{lots.find(l => l.lot_id === adjustLotId)?.current_quantity} 本</strong></div>
                  </div>

                  <form onSubmit={handleExecuteAdjust} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        増減数 (例: -3 や +5)
                      </label>
                      <input
                        type="number"
                        value={adjustChange}
                        onChange={(e) => setAdjustChange(Number(e.target.value))}
                        required
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        調整理由 (必須！理由なき増減はシステム上不可)
                      </label>
                      <select
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                        required
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:border-teal-500 focus:outline-none mb-2"
                      >
                        <option value="">-- 理由を選択してください --</option>
                        <option value="定期棚卸差異（実棚カウント合致）">定期棚卸差異（実棚カウント合致）</option>
                        <option value="未完成品（仕掛品）混入発覚のため除外">未完成品（仕掛品）混入発覚のため除外</option>
                        <option value="店舗用テイスティング・サンプル払出">店舗用テイスティング・サンプル払出</option>
                        <option value="保管中破損・シール浮きロス破棄">保管中破損・シール浮きロス破棄</option>
                        <option value="その他特記事項（メモ記載）">その他特記事項（メモ記載）</option>
                      </select>
                      {adjustReason === 'その他特記事項（メモ記載）' && (
                        <input
                          type="text"
                          placeholder="具体的な理由を入力してください"
                          onChange={(e) => setAdjustReason(e.target.value)}
                          required
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        操作担当者 氏名 (必須)
                      </label>
                      <input
                        type="text"
                        value={adjustOperator}
                        onChange={(e) => setAdjustOperator(e.target.value)}
                        required
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAdjustModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        disabled={!adjustReason.trim() || adjustChange === 0}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          adjustReason.trim() && adjustChange !== 0
                            ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        調整を確定・改ざん不可記録
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ロット指定出荷 ＆ FIFO強制 (FIFO Shipping) */}
        {/* ========================================================= */}
        {activeTab === 'shipment' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  ロット指定出荷登録 ＆ FIFO（先入れ先出し）強制ゲート
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  仕掛品（WIP）は出荷画面に表示されません。システムが自動で最古ロットを推奨し、古いロットを残して新しいロットを出荷する場合は理由入力を強制します。
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateShipment} className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    納品先店舗名 (必須)
                  </label>
                  <input
                    type="text"
                    value={shipDestination}
                    onChange={(e) => setShipDestination(e.target.value)}
                    required
                    placeholder="例: Vegan Cafe LOHAS 警固店"
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    配送業者 / 便種
                  </label>
                  <input
                    type="text"
                    value={shipCarrier}
                    onChange={(e) => setShipCarrier(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* 出荷商品選択 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  出荷商品
                </label>
                <select
                  value={shipProduct}
                  onChange={(e) => setShipProduct(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ロット引当選択（★ ここが最重要！WIPは除外、FIFOサジェスト） */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    引当ロット番号の選択 (必須・完成品のみ)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    ※仕掛品（WIP）は出荷可能リストから除外されています
                  </span>
                </div>

                {availableLotsForShipping.length === 0 ? (
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs">
                    この商品の検品合格済在庫（QA_Passed）がありません。仕掛品の検品を行うか、新規製造してください。
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableLotsForShipping.map((lot, idx) => {
                      const isFifoRecommended = idx === 0; // 最古ロット
                      const isSelected = shipLotId === lot.lot_id;

                      return (
                        <label
                          key={lot.lot_id}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipLotRadio"
                              checked={isSelected}
                              onChange={() => setShipLotId(lot.lot_id)}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-900">
                                  {lot.lot_id}
                                </span>
                                {isFifoRecommended && (
                                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.2 rounded-full">
                                    ★ FIFO推奨（最古ロット）
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                賞味期限: <strong className="text-slate-800">{lot.expiration_date}</strong> (製造: {lot.manufactured_date})
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-emerald-700">
                              残 {lot.current_quantity} 本
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* FIFO逸脱時の理由入力強制ボックス */}
              {isFifoViolation && (
                <div className="p-4 rounded-xl border-2 border-rose-300 bg-rose-50/60 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>【FIFO逸脱アラート】より古いロットが存在します</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    推奨最古ロット「<strong>{currentFifoLot?.lot_id}</strong> (賞味期限: {currentFifoLot?.expiration_date})」をスキップして、新しいロット「<strong>{shipLotId}</strong>」を出荷しようとしています。<br />
                    古いロットが倉庫に残る原因となるため、<strong>「例外理由」の入力が必須</strong>です。
                  </p>
                  <div>
                    <input
                      type="text"
                      value={shipFifoReason}
                      onChange={(e) => setShipFifoReason(e.target.value)}
                      placeholder="例: 取引先より賞味期限〇ヶ月以上残存の指定があったため / 大口納品のため同ロット統一"
                      required
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-rose-300 bg-white text-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              )}

              {/* 数量 & 担当者 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    出荷数量 (本)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={shipQuantity}
                    onChange={(e) => setShipQuantity(Number(e.target.value))}
                    required
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    出荷作業担当者 氏名
                  </label>
                  <input
                    type="text"
                    value={shipOperator}
                    onChange={(e) => setShipOperator(e.target.value)}
                    required
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* 送信ボタン */}
              <button
                type="submit"
                disabled={Boolean(!shipLotId || (isFifoViolation && !shipFifoReason.trim()))}
                className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  shipLotId && (!isFifoViolation || shipFifoReason.trim())
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>ロットを引き当てて出荷確定</span>
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: 一気通貫トレーサビリティ (Traceability) */}
        {/* ========================================================= */}
        {activeTab === 'traceability' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5 text-teal-600" />
                <h2 className="text-base font-bold text-slate-900">
                  一気通貫トレーサビリティ・ダッシュボード
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                クレームや問い合わせ発生時に「いつ・誰が製造し、誰が検品し、どこへ出荷されたか」を即座に特定できます。
              </p>

              {/* Search Mode Toggle */}
              <div className="flex gap-2 border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => setTraceSearchType('lot')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    traceSearchType === 'lot'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ① ロット番号から追跡 (タイムライン)
                </button>
                <button
                  type="button"
                  onClick={() => setTraceSearchType('destination')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    traceSearchType === 'destination'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ② 納品先から逆引き (過去ロット一覧)
                </button>
              </div>

              {/* Search Input */}
              <div className="mt-4">
                {traceSearchType === 'lot' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      ロット番号を入力 (例: LOT-20260920-VAN-01)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchLotQuery}
                        onChange={(e) => setSearchLotQuery(e.target.value)}
                        placeholder="LOT-20260920-VAN-01"
                        className="flex-1 text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setSearchLotQuery('LOT-20260920-VAN-01')}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        サンプル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      納品先店舗名を入力 (例: YADOKARI, GREEN BURGER)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchDestQuery}
                        onChange={(e) => setSearchDestQuery(e.target.value)}
                        placeholder="YADOKARI"
                        className="flex-1 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setSearchDestQuery('YADOKARI')}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        サンプル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results: ロット番号からのタイムライン表示 */}
            {traceSearchType === 'lot' && (
              <div>
                {!lotTraceResult ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                    該当するロット番号が見つかりませんでした。
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-6">
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">ロット詳細</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <h3 className="font-mono text-base font-bold text-slate-900">
                            {lotTraceResult.lot.lot_id}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            lotTraceResult.lot.status === 'QA_Passed'
                              ? 'bg-emerald-100 text-emerald-900'
                              : lotTraceResult.lot.status === 'WIP'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}>
                            {lotTraceResult.lot.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">商品名</span>
                        <strong className="text-xs font-bold text-slate-800">
                          {lotTraceResult.lot.product_name}
                        </strong>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      
                      {/* Step 1: 製造 */}
                      <div className="relative">
                        <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-white">
                          1
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">🏭 製造バッチ完了（仕掛品として登録）</span>
                            <span className="text-[11px] text-slate-500">{lotTraceResult.lot.manufactured_date}</span>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            担当者: <strong className="text-slate-800">{lotTraceResult.lot.operator_name}</strong> · 製造予定数: {lotTraceResult.lot.planned_quantity}本
                          </div>
                          {lotTraceResult.lot.notes && (
                            <p className="text-[11px] text-slate-500 italic">メモ: {lotTraceResult.lot.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Step 2: HACCP検品 */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-white ${
                          lotTraceResult.lot.status === 'QA_Passed' ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}>
                          2
                        </div>
                        <div className={`p-4 rounded-xl border space-y-2 ${
                          lotTraceResult.lot.status === 'QA_Passed'
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-amber-50/40 border-amber-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              ✅ HACCPデジタル検品ゲート
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {lotTraceResult.lot.qa_inspected_at?.slice(0, 16).replace('T', ' ') || '未検品'}
                            </span>
                          </div>
                          {lotTraceResult.lot.qa_inspector ? (
                            <>
                              <div className="text-[11px] text-slate-700">
                                検品責任者: <strong className="text-slate-900">{lotTraceResult.lot.qa_inspector}</strong>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                                <div className="flex items-center gap-1 text-emerald-800">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>内蓋トップシール密着確認済</span>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-800">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>法定表示ラベル（大豆）確認済</span>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-800">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>ロット・賞味期限印字確認済</span>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-800">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>急速凍結CCP（-18℃以下）クリア</span>
                                </div>
                              </div>
                              {lotTraceResult.lot.qa_checklist?.notes && (
                                <p className="text-[10px] text-slate-500 italic mt-1">
                                  検品メモ: {lotTraceResult.lot.qa_checklist.notes}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-[11px] text-amber-800">
                              現在検品待ちです。出荷可能在庫にはまだ反映されていません。
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Step 3: 出荷・納品先一覧 */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-white ${
                          lotTraceResult.shipments.length > 0 ? 'bg-blue-600' : 'bg-slate-300'
                        }`}>
                          3
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              🚚 出荷実績 ＆ 納品先一覧
                            </span>
                            <span className="text-[11px] font-mono font-bold text-blue-700">
                              {lotTraceResult.shipments.length} 件の出荷先
                            </span>
                          </div>

                          {lotTraceResult.shipments.length === 0 ? (
                            <div className="text-[11px] text-slate-400 py-1">
                              このロットはまだどこにも出荷されていません（庫内在庫: {lotTraceResult.lot.current_quantity}本）。
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {lotTraceResult.shipments.map(s => (
                                <div
                                  key={s.shipment_id}
                                  className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                >
                                  <div>
                                    <strong className="text-slate-900 block">{s.destination_name}</strong>
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                      伝票ID: {s.shipment_id} · 出荷日: {s.shipment_date} · 運送: {s.carrier}
                                    </div>
                                    {s.fifo_override_reason && (
                                      <div className="text-[10px] text-amber-700 mt-1">
                                        FIFO例外理由: {s.fifo_override_reason}
                                      </div>
                                    )}
                                  </div>
                                  <div className="shrink-0 text-right">
                                    <span className="font-mono font-bold text-blue-700 text-sm">
                                      {s.quantity} 本
                                    </span>
                                    <span className="block text-[10px] text-slate-400">納品済</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results: 納品先からの逆引き */}
            {traceSearchType === 'destination' && (
              <div>
                {!destTraceResult || destTraceResult.lots.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                    「{searchDestQuery}」に一致する納品実績が見つかりませんでした。
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          納品先逆引き結果: 「{searchDestQuery}」
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          該当店舗へこれまでに納品された全商品のロット番号一覧
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        {destTraceResult.lots.length} ロットヒット
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {destTraceResult.lots.map((item, idx) => (
                        <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                {item.lot_id}
                              </span>
                              <span className="text-xs font-semibold text-slate-800">
                                {item.product_name}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-3">
                              <span>納品先: {item.destination_name}</span>
                              <span>出荷日: {item.shipment_date}</span>
                              <span>伝票: {item.shipment_id}</span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-3">
                            <span className="font-mono font-bold text-sm text-slate-900">
                              {item.quantity} 本
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchLotQuery(item.lot_id);
                                setTraceSearchType('lot');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              このロットを追跡 →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
