'use client';

import { 
  ManufacturingProduct, 
  ManufacturingLot, 
  InventoryTransaction, 
  Shipment, 
  ShipmentItem,
  QAChecklist,
  LotStatus
} from '@/types/manufacturing';

// -------------------------------------------------------------
// 実運用 商品マスタ（カップアイス プレーン ＆ カカオ）
// -------------------------------------------------------------
export const DEFAULT_MANUFACTURING_PRODUCTS: ManufacturingProduct[] = [
  {
    id: 'prod-cup-plain',
    name: 'プレーンアイス（カップ）',
    flavor: 'プレーン',
    category: 'ice_cream_cup',
    sku: 'SOY-CUP-PLN',
    shelf_life_days: 180,
    unit: '個 (100ml)',
  },
  {
    id: 'prod-cup-cacao',
    name: 'カカオアイス（カップ）',
    flavor: 'カカオ',
    category: 'ice_cream_cup',
    sku: 'SOY-CUP-CAC',
    shelf_life_days: 180,
    unit: '個 (100ml)',
  },
];

// -------------------------------------------------------------
// 実運用 納品先初期マスター
// -------------------------------------------------------------
export const DEFAULT_DESTINATIONS: string[] = [
  '株式会社ココウェル',
  'ココウェル',
];

// -------------------------------------------------------------
// ロットデータ（実データ入力前のため初期状態は空）
// -------------------------------------------------------------
export const DEFAULT_LOTS: ManufacturingLot[] = [];

// -------------------------------------------------------------
// 在庫履歴（実データ入力前のため初期状態は空）
// -------------------------------------------------------------
export const DEFAULT_TRANSACTIONS: InventoryTransaction[] = [];

// -------------------------------------------------------------
// 出荷データ（実データ入力前のため初期状態は空）
// -------------------------------------------------------------
export const DEFAULT_SHIPMENTS: Shipment[] = [];

// -------------------------------------------------------------
// ローカルストレージ キー (v2: 実運用クリーンデータ)
// -------------------------------------------------------------
const STORAGE_KEYS = {
  PRODUCTS: 'soystories_mfg_products_v2',
  LOTS: 'soystories_mfg_lots_v2',
  TRANSACTIONS: 'soystories_mfg_transactions_v2',
  SHIPMENTS: 'soystories_mfg_shipments_v2',
};

// -------------------------------------------------------------
// ストア操作ヘルパー
// -------------------------------------------------------------
export const manufacturingStore = {
  // 初期化・取得
  getProducts(): ManufacturingProduct[] {
    if (typeof window === 'undefined') return DEFAULT_MANUFACTURING_PRODUCTS;
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_MANUFACTURING_PRODUCTS));
      return DEFAULT_MANUFACTURING_PRODUCTS;
    }
    return JSON.parse(data);
  },

  getLots(): ManufacturingLot[] {
    if (typeof window === 'undefined') return DEFAULT_LOTS;
    const data = localStorage.getItem(STORAGE_KEYS.LOTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(DEFAULT_LOTS));
      return DEFAULT_LOTS;
    }
    return JSON.parse(data);
  },

  getTransactions(): InventoryTransaction[] {
    if (typeof window === 'undefined') return DEFAULT_TRANSACTIONS;
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
      return DEFAULT_TRANSACTIONS;
    }
    return JSON.parse(data);
  },

  getShipments(): Shipment[] {
    if (typeof window === 'undefined') return DEFAULT_SHIPMENTS;
    const data = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(DEFAULT_SHIPMENTS));
      return DEFAULT_SHIPMENTS;
    }
    return JSON.parse(data);
  },

  // 1. 製造登録（初期ステータスは必ずWIP！）
  createWipLot(data: {
    productId: string;
    operatorName: string;
    plannedQuantity: number;
    notes?: string;
  }): { success: boolean; lot?: ManufacturingLot; error?: string } {
    const products = this.getProducts();
    const product = products.find(p => p.id === data.productId);
    if (!product) return { success: false, error: '指定された商品が存在しません。' };

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    // ロット番号自動生成: LOT-YYYYMMDD-SKU-SERIAL
    const existingLots = this.getLots();
    const prefix = `LOT-${dateStr}-${product.sku.replace('SOY-1L-', '')}`;
    const samePrefixCount = existingLots.filter(l => l.lot_id.startsWith(prefix)).length;
    const serial = String(samePrefixCount + 1).padStart(2, '0');
    const lotId = `${prefix}-${serial}`;

    // 賞味期限計算（製造日 + shelf_life_days）
    const expDate = new Date(today);
    expDate.setDate(expDate.getDate() + (product.shelf_life_days || 180));
    const expDateStr = expDate.toISOString().split('T')[0];

    const newLot: ManufacturingLot = {
      lot_id: lotId,
      product_id: product.id,
      product_name: product.name,
      flavor: product.flavor,
      manufactured_date: today.toISOString().split('T')[0],
      expiration_date: expDateStr,
      operator_name: data.operatorName,
      planned_quantity: data.plannedQuantity,
      actual_quantity: data.plannedQuantity,
      current_quantity: data.plannedQuantity,
      status: 'WIP', // ★ 厳格にWIP初期化（出荷可能在庫には計上されない）
      notes: data.notes || '',
      created_at: new Date().toISOString(),
    };

    // 在庫変動履歴に「製造完了・仕掛品計上」を記録（イミュータブルログ）
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      lot_id: lotId,
      product_id: product.id,
      product_name: product.name,
      transaction_type: 'MANUFACTURE_WIP',
      quantity_change: data.plannedQuantity,
      quantity_after: data.plannedQuantity,
      operator_name: data.operatorName,
      reason: '製造バッチ完了（仕掛品として登録・検品待ち）',
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    const updatedLots = [newLot, ...existingLots];
    const updatedTxs = [newTx, ...this.getTransactions()];

    localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(updatedLots));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTxs));

    return { success: true, lot: newLot };
  },

  // 2. HACCPデジタル検品ゲート（QA通過で完成品化、出荷可能在庫へ）
  passQAGate(
    lotId: string,
    inspector: string,
    checklist: QAChecklist,
    actualQuantity?: number
  ): { success: boolean; error?: string } {
    // チェック項目の検証: 4項目すべてtrueである必要がある
    if (!checklist.seal_verified || !checklist.label_verified || !checklist.lot_print_verified || !checklist.temp_ccp_verified) {
      return { success: false, error: 'HACCP必須4項目（内蓋シール、表示ラベル、ロット印字、CCP温度）がすべて確認されていないため合格できません。' };
    }
    if (!inspector.trim()) {
      return { success: false, error: '検品責任者氏名の入力が必須です。' };
    }

    const lots = this.getLots();
    const lotIndex = lots.findIndex(l => l.lot_id === lotId);
    if (lotIndex === -1) return { success: false, error: '該当ロットが見つかりません。' };

    const lot = lots[lotIndex];
    if (lot.status !== 'WIP') {
      return { success: false, error: `このロットはすでに ${lot.status} ステータスです。` };
    }

    const finalQty = actualQuantity !== undefined ? actualQuantity : lot.actual_quantity;

    lot.status = 'QA_Passed'; // ★ 完成品・出荷可能在庫に昇格
    lot.qa_inspector = inspector;
    lot.qa_inspected_at = new Date().toISOString();
    lot.qa_checklist = checklist;
    lot.actual_quantity = finalQty;
    lot.current_quantity = finalQty;

    // トランザクション記録
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      lot_id: lot.lot_id,
      product_id: lot.product_id,
      product_name: lot.product_name,
      transaction_type: 'QA_PASS_INITIAL',
      quantity_change: 0,
      quantity_after: finalQty,
      operator_name: inspector,
      reason: 'HACCP検品合格（トップシール密閉・ラベル・印字・CCP確認完了）により出荷可能在庫へ昇格',
      notes: checklist.notes,
      created_at: new Date().toISOString(),
    };

    lots[lotIndex] = lot;
    const updatedTxs = [newTx, ...this.getTransactions()];

    localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(lots));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTxs));

    return { success: true };
  },

  // 3. ロット隔離（保留 / Quarantined）
  quarantineLot(lotId: string, reason: string, operator: string): { success: boolean; error?: string } {
    if (!reason.trim()) return { success: false, error: '隔離理由を入力してください。' };

    const lots = this.getLots();
    const lot = lots.find(l => l.lot_id === lotId);
    if (!lot) return { success: false, error: '該当ロットが見つかりません。' };

    lot.status = 'Quarantined';
    lot.quarantine_reason = reason;

    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      lot_id: lot.lot_id,
      product_id: lot.product_id,
      product_name: lot.product_name,
      transaction_type: 'QUARANTINE_SCRAP',
      quantity_change: 0,
      quantity_after: lot.current_quantity,
      operator_name: operator,
      reason: `ロット保留・隔離設定: ${reason}`,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(lots));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([newTx, ...this.getTransactions()]));

    return { success: true };
  },

  // 4. 厳格な棚卸・在庫調整（ロット指定 ＆ 理由必須）
  adjustInventory(data: {
    lotId: string;
    quantityChange: number; // 例: -3 または +5
    reason: string;         // 必須！
    operator: string;       // 必須！
    notes?: string;
  }): { success: boolean; error?: string } {
    if (!data.reason.trim()) {
      return { success: false, error: '在庫数の変更には「調整理由（例: 不良除外、サンプル使用、実棚差異）」の入力が必須です。' };
    }
    if (!data.operator.trim()) {
      return { success: false, error: '操作担当者氏名の入力が必須です。' };
    }
    if (data.quantityChange === 0) {
      return { success: false, error: '変動数量を0以外で指定してください。' };
    }

    const lots = this.getLots();
    const lot = lots.find(l => l.lot_id === data.lotId);
    if (!lot) return { success: false, error: '該当ロットが見つかりません。' };

    const nextQty = lot.current_quantity + data.quantityChange;
    if (nextQty < 0) {
      return { success: false, error: `在庫数がマイナス（現在庫: ${lot.current_quantity}、調整後: ${nextQty}）になる操作はできません。` };
    }

    lot.current_quantity = nextQty;

    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      lot_id: lot.lot_id,
      product_id: lot.product_id,
      product_name: lot.product_name,
      transaction_type: 'INVENTORY_ADJUSTMENT',
      quantity_change: data.quantityChange,
      quantity_after: nextQty,
      operator_name: data.operator,
      reason: data.reason,
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(lots));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([newTx, ...this.getTransactions()]));

    return { success: true };
  },

  // 5. FIFOサジェスト＆出荷登録
  getFifoRecommendedLot(productId: string): ManufacturingLot | null {
    const lots = this.getLots();
    // 出荷可能なのは 'QA_Passed' かつ 在庫 > 0 のみ！ WIP や Quarantined は絶対に除外
    const availableLots = lots.filter(
      l => l.product_id === productId && l.status === 'QA_Passed' && l.current_quantity > 0
    );
    if (availableLots.length === 0) return null;

    // 賞味期限または製造日が一番古いもの（昇順ソート）
    return availableLots.sort((a, b) => 
      new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
    )[0];
  },

  // 出荷可能ロット一覧（QA_Passed かつ 残在庫 > 0 のみ）
  getAvailableLotsForProduct(productId: string): ManufacturingLot[] {
    const lots = this.getLots();
    return lots
      .filter(l => l.product_id === productId && l.status === 'QA_Passed' && l.current_quantity > 0)
      .sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime());
  },

  // 出荷登録（ロット引当＆FIFO検証）
  createShipment(data: {
    destinationName: string;
    destinationAddress?: string;
    carrier?: string;
    trackingNumber?: string;
    operator: string;
    notes?: string;
    items: {
      productId: string;
      lotId: string;
      quantity: number;
      fifoOverrideReason?: string;
    }[];
  }): { success: boolean; shipmentId?: string; error?: string } {
    if (!data.destinationName.trim()) return { success: false, error: '納品先店舗名を入力してください。' };
    if (!data.operator.trim()) return { success: false, error: '出荷担当者氏名を入力してください。' };
    if (!data.items || data.items.length === 0) return { success: false, error: '出荷商品・ロットを1件以上指定してください。' };

    const lots = this.getLots();
    const shipmentId = `SHP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-3)}`;
    const shipmentItems: ShipmentItem[] = [];
    const newTxs: InventoryTransaction[] = [];

    // 事前バリデーション
    for (const item of data.items) {
      const lot = lots.find(l => l.lot_id === item.lotId);
      if (!lot) return { success: false, error: `ロット ${item.lotId} が見つかりません。` };
      if (lot.status !== 'QA_Passed') {
        return { success: false, error: `ロット ${item.lotId} は「${lot.status}」のため出荷できません。出荷できるのは検品合格済（QA_Passed）のみです。` };
      }
      if (lot.current_quantity < item.quantity) {
        return { success: false, error: `ロット ${item.lotId} の現在庫（${lot.current_quantity}）が出荷数量（${item.quantity}）を満たしていません。` };
      }

      // FIFOチェック: もし同じ商品でより古いロットが存在するのに、このロットを選んでいる場合
      const fifoLot = this.getFifoRecommendedLot(item.productId);
      const isViolation = fifoLot && fifoLot.lot_id !== item.lotId;
      if (isViolation && (!item.fifoOverrideReason || !item.fifoOverrideReason.trim())) {
        return {
          success: false,
          error: `【FIFO（先入れ先出し）違反】より古いロット「${fifoLot.lot_id}（賞味期限: ${fifoLot.expiration_date}）」が存在します。別ロット「${item.lotId}」を出荷する場合は「FIFO逸脱理由」の入力が必須です。`
        };
      }

      // 在庫引当減算
      lot.current_quantity -= item.quantity;

      shipmentItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        shipment_id: shipmentId,
        lot_id: lot.lot_id,
        product_id: lot.product_id,
        product_name: lot.product_name,
        flavor: lot.flavor,
        quantity: item.quantity,
        is_fifo_violation: !!isViolation,
        fifo_override_reason: isViolation ? item.fifoOverrideReason : undefined,
      });

      // 在庫変動履歴にイミュータブル記録
      newTxs.push({
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        lot_id: lot.lot_id,
        product_id: lot.product_id,
        product_name: lot.product_name,
        transaction_type: 'SHIPMENT',
        quantity_change: -item.quantity,
        quantity_after: lot.current_quantity,
        operator_name: data.operator,
        reason: `出荷引当 (${shipmentId}: ${data.destinationName})` + (isViolation ? ` [FIFO例外理由: ${item.fifoOverrideReason}]` : ''),
        created_at: new Date().toISOString(),
      });
    }

    const newShipment: Shipment = {
      id: shipmentId,
      destination_name: data.destinationName,
      destination_address: data.destinationAddress,
      shipment_date: new Date().toISOString().split('T')[0],
      carrier: data.carrier || 'ヤマト運輸（クール冷凍便）',
      tracking_number: data.trackingNumber,
      status: 'shipped',
      created_by: data.operator,
      items: shipmentItems,
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(lots));
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify([newShipment, ...this.getShipments()]));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([...newTxs, ...this.getTransactions()]));

    return { success: true, shipmentId };
  },

  // 6. 一気通貫トレーサビリティ：ロット番号からのタイムライン検索
  getTraceabilityByLot(lotId: string) {
    const lots = this.getLots();
    const lot = lots.find(l => l.lot_id === lotId || l.lot_id.toLowerCase() === lotId.toLowerCase());
    if (!lot) return null;

    const txs = this.getTransactions().filter(t => t.lot_id === lot.lot_id);
    const shipments = this.getShipments().filter(s => s.items.some(i => i.lot_id === lot.lot_id));

    return {
      lot,
      transactions: txs,
      shipments: shipments.map(s => ({
        shipment_id: s.id,
        destination_name: s.destination_name,
        shipment_date: s.shipment_date,
        carrier: s.carrier,
        tracking_number: s.tracking_number,
        quantity: s.items.filter(i => i.lot_id === lot.lot_id).reduce((sum, i) => sum + i.quantity, 0),
        fifo_override_reason: s.items.find(i => i.lot_id === lot.lot_id)?.fifo_override_reason,
      }))
    };
  },

  // 7. 一気通貫トレーサビリティ：納品先からの過去ロット逆引き
  getTraceabilityByDestination(destinationQuery: string) {
    const shipments = this.getShipments();
    const query = destinationQuery.trim().toLowerCase();
    const matchedShipments = shipments.filter(s => 
      s.destination_name.toLowerCase().includes(query)
    );

    const resultLots: {
      lot_id: string;
      product_name: string;
      flavor: string;
      shipment_id: string;
      destination_name: string;
      shipment_date: string;
      quantity: number;
      carrier: string;
    }[] = [];

    matchedShipments.forEach(s => {
      s.items.forEach(item => {
        resultLots.push({
          lot_id: item.lot_id,
          product_name: item.product_name,
          flavor: item.flavor,
          shipment_id: s.id,
          destination_name: s.destination_name,
          shipment_date: s.shipment_date,
          quantity: item.quantity,
          carrier: s.carrier,
        });
      });
    });

    return {
      destinationQuery,
      totalShipments: matchedShipments.length,
      lots: resultLots,
    };
  },

  // デモデータリセット
  resetToDefaultData() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_MANUFACTURING_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(DEFAULT_LOTS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(DEFAULT_SHIPMENTS));
  }
};
