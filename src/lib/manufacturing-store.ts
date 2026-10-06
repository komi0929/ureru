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
// デフォルト商品マスタ（1L 業務用バルクパック中心）
// -------------------------------------------------------------
export const DEFAULT_MANUFACTURING_PRODUCTS: ManufacturingProduct[] = [
  {
    id: 'prod-vanilla-1l',
    name: 'ソイプレミアム バニラ (業務用 1L)',
    flavor: 'バニラ',
    category: 'ice_cream_1l',
    sku: 'SOY-1L-VAN',
    shelf_life_days: 180,
    unit: '本 (1000ml)',
  },
  {
    id: 'prod-cacao-1l',
    name: 'ソイリッチ カカオ (業務用 1L)',
    flavor: 'カカオ',
    category: 'ice_cream_1l',
    sku: 'SOY-1L-CAC',
    shelf_life_days: 180,
    unit: '本 (1000ml)',
  },
  {
    id: 'prod-matcha-1l',
    name: '宇治抹茶 ソイアイス (業務用 1L)',
    flavor: '宇治抹茶',
    category: 'ice_cream_1l',
    sku: 'SOY-1L-MAT',
    shelf_life_days: 180,
    unit: '本 (1000ml)',
  },
  {
    id: 'prod-strawberry-1l',
    name: 'あまおう苺 ソイソルベ (業務用 1L)',
    flavor: 'あまおう苺',
    category: 'ice_cream_1l',
    sku: 'SOY-1L-STR',
    shelf_life_days: 180,
    unit: '本 (1000ml)',
  },
  {
    id: 'prod-pistachio-1l',
    name: 'シチリア ピスタチオ (業務用 1L)',
    flavor: 'ピスタチオ',
    category: 'ice_cream_1l',
    sku: 'SOY-1L-PIS',
    shelf_life_days: 180,
    unit: '本 (1000ml)',
  },
];

// -------------------------------------------------------------
// デフォルト ロットデータ（WIP、完成品、隔離品）
// -------------------------------------------------------------
export const DEFAULT_LOTS: ManufacturingLot[] = [
  // 1. 仕掛品（WIP: 内蓋シール未貼付・未検品）★ 出荷画面には絶対に出ない
  {
    lot_id: 'LOT-20261006-VAN-01',
    product_id: 'prod-vanilla-1l',
    product_name: 'ソイプレミアム バニラ (業務用 1L)',
    flavor: 'バニラ',
    manufactured_date: '2026-10-06',
    expiration_date: '2027-04-04',
    operator_name: '田中 宏明 (製造部)',
    planned_quantity: 50,
    actual_quantity: 50,
    current_quantity: 50,
    status: 'WIP', // ★ 仕掛品
    notes: '午前バッチ充填完了。これから急速凍結およびトップシール工程へ移送。',
    created_at: '2026-10-06T09:30:00Z',
  },
  // 2. 完成品（QA_Passed: 最古ロット → FIFO最優先サジェスト）
  {
    lot_id: 'LOT-20260920-VAN-01',
    product_id: 'prod-vanilla-1l',
    product_name: 'ソイプレミアム バニラ (業務用 1L)',
    flavor: 'バニラ',
    manufactured_date: '2026-09-20',
    expiration_date: '2027-03-19',
    operator_name: '佐々木 健一 (製造部)',
    planned_quantity: 40,
    actual_quantity: 40,
    current_quantity: 15, // 出荷済み25本、残り15本
    status: 'QA_Passed',
    qa_inspector: '吉田 恵美 (品質管理責任者)',
    qa_inspected_at: '2026-09-20T16:45:00Z',
    qa_checklist: {
      seal_verified: true,
      label_verified: true,
      lot_print_verified: true,
      temp_ccp_verified: true,
      notes: '内蓋トップシール密着確認済、表示ラベル（大豆）鮮明、CCP-18℃急速凍結完了',
    },
    notes: '原料豆乳: 福岡産ふくゆたか使用',
    created_at: '2026-09-20T11:00:00Z',
  },
  // 3. 完成品（QA_Passed: 新しいロット）
  {
    lot_id: 'LOT-20261001-VAN-02',
    product_id: 'prod-vanilla-1l',
    product_name: 'ソイプレミアム バニラ (業務用 1L)',
    flavor: 'バニラ',
    manufactured_date: '2026-10-01',
    expiration_date: '2027-03-30',
    operator_name: '田中 宏明 (製造部)',
    planned_quantity: 30,
    actual_quantity: 30,
    current_quantity: 30,
    status: 'QA_Passed',
    qa_inspector: '吉田 恵美 (品質管理責任者)',
    qa_inspected_at: '2026-10-01T17:10:00Z',
    qa_checklist: {
      seal_verified: true,
      label_verified: true,
      lot_print_verified: true,
      temp_ccp_verified: true,
      notes: '全品検品パス、シール浮きなし',
    },
    created_at: '2026-10-01T10:15:00Z',
  },
  // 4. 完成品（カカオ）
  {
    lot_id: 'LOT-20261002-CAC-01',
    product_id: 'prod-cacao-1l',
    product_name: 'ソイリッチ カカオ (業務用 1L)',
    flavor: 'カカオ',
    manufactured_date: '2026-10-02',
    expiration_date: '2027-03-31',
    operator_name: '佐々木 健一 (製造部)',
    planned_quantity: 45,
    actual_quantity: 45,
    current_quantity: 40, // 出荷済み5本、残り40本
    status: 'QA_Passed',
    qa_inspector: '吉田 恵美 (品質管理責任者)',
    qa_inspected_at: '2026-10-02T16:30:00Z',
    qa_checklist: {
      seal_verified: true,
      label_verified: true,
      lot_print_verified: true,
      temp_ccp_verified: true,
      notes: 'カカオパウダー攪拌均一確認、CCPクリア',
    },
    created_at: '2026-10-02T09:00:00Z',
  },
  // 5. 完成品（抹茶）
  {
    lot_id: 'LOT-20261004-MAT-01',
    product_id: 'prod-matcha-1l',
    product_name: '宇治抹茶 ソイアイス (業務用 1L)',
    flavor: '宇治抹茶',
    manufactured_date: '2026-10-04',
    expiration_date: '2027-04-02',
    operator_name: '田中 宏明 (製造部)',
    planned_quantity: 25,
    actual_quantity: 25,
    current_quantity: 25,
    status: 'QA_Passed',
    qa_inspector: '吉田 恵美 (品質管理責任者)',
    qa_inspected_at: '2026-10-04T15:20:00Z',
    qa_checklist: {
      seal_verified: true,
      label_verified: true,
      lot_print_verified: true,
      temp_ccp_verified: true,
      notes: '京都宇治産有機抹茶使用、検品完了',
    },
    created_at: '2026-10-04T10:00:00Z',
  },
  // 6. 隔離保留品（Quarantined）
  {
    lot_id: 'LOT-20260928-STR-01',
    product_id: 'prod-strawberry-1l',
    product_name: 'あまおう苺 ソイソルベ (業務用 1L)',
    flavor: 'あまおう苺',
    manufactured_date: '2026-09-28',
    expiration_date: '2027-03-27',
    operator_name: '佐々木 健一 (製造部)',
    planned_quantity: 10,
    actual_quantity: 10,
    current_quantity: 10,
    status: 'Quarantined',
    qa_inspector: '吉田 恵美 (品質管理責任者)',
    qa_inspected_at: '2026-09-28T18:00:00Z',
    quarantine_reason: '内蓋トップシールの圧着温度CCPに一時的なブレがあったため、隔離検査中。出荷禁止。',
    notes: '検体サンプルを再検査中',
    created_at: '2026-09-28T14:00:00Z',
  },
];

// -------------------------------------------------------------
// デフォルト 在庫履歴（監査用イミュータブルログ）
// -------------------------------------------------------------
export const DEFAULT_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'tx-001',
    lot_id: 'LOT-20260920-VAN-01',
    product_id: 'prod-vanilla-1l',
    product_name: 'ソイプレミアム バニラ (業務用 1L)',
    transaction_type: 'MANUFACTURE_WIP',
    quantity_change: 40,
    quantity_after: 40,
    operator_name: '佐々木 健一',
    reason: '製造バッチ完了（仕掛品計上）',
    created_at: '2026-09-20T11:00:00Z',
  },
  {
    id: 'tx-002',
    lot_id: 'LOT-20260920-VAN-01',
    product_id: 'prod-vanilla-1l',
    product_name: 'ソイプレミアム バニラ (業務用 1L)',
    transaction_type: 'QA_PASS_INITIAL',
    quantity_change: 0,
    quantity_after: 40,
    operator_name: '吉田 恵美',
    reason: 'HACCP検品合格（内蓋シール・CCP確認完了）により出荷可能在庫へ昇格',
    created_at: '2026-09-20T16:45:00Z',
  },
  {
    id: 'tx-003',
    lot_id: 'LOT-20260920-VAN-01',
    product_id: 'prod-vanilla-1l',
    product_name: 'ソイプレミアム バニラ (業務用 1L)',
    transaction_type: 'SHIPMENT',
    quantity_change: -10,
    quantity_after: 30,
    operator_name: '田中 宏明',
    reason: '出荷引当 (SHP-20261003-001: Vegan Ramen YADOKARI 福岡店)',
    created_at: '2026-10-03T10:30:00Z',
  },
  {
    id: 'tx-004',
    lot_id: 'LOT-20260920-VAN-01',
    product_id: 'prod-vanilla-1l',
    product_name: 'ソイプレミアム バニラ (業務用 1L)',
    transaction_type: 'SHIPMENT',
    quantity_change: -15,
    quantity_after: 15,
    operator_name: '佐々木 健一',
    reason: '出荷引当 (SHP-20261005-002: GREEN BURGER TOKYO 渋谷店)',
    created_at: '2026-10-05T14:15:00Z',
  },
  {
    id: 'tx-005',
    lot_id: 'LOT-20261002-CAC-01',
    product_id: 'prod-cacao-1l',
    product_name: 'ソイリッチ カカオ (業務用 1L)',
    transaction_type: 'QA_PASS_INITIAL',
    quantity_change: 45,
    quantity_after: 45,
    operator_name: '吉田 恵美',
    reason: 'HACCP検品合格（出荷可能在庫化）',
    created_at: '2026-10-02T16:30:00Z',
  },
  {
    id: 'tx-006',
    lot_id: 'LOT-20261002-CAC-01',
    product_id: 'prod-cacao-1l',
    product_name: 'ソイリッチ カカオ (業務用 1L)',
    transaction_type: 'SHIPMENT',
    quantity_change: -5,
    quantity_after: 40,
    operator_name: '田中 宏明',
    reason: '出荷引当 (SHP-20261003-001: Vegan Ramen YADOKARI 福岡店)',
    created_at: '2026-10-03T10:30:00Z',
  },
  {
    id: 'tx-007',
    lot_id: 'LOT-20261006-VAN-01',
    product_id: 'prod-vanilla-1l',
    product_name: 'ソイプレミアム バニラ (業務用 1L)',
    transaction_type: 'MANUFACTURE_WIP',
    quantity_change: 50,
    quantity_after: 50,
    operator_name: '田中 宏明',
    reason: '製造バッチ完了（仕掛品として登録・検品待ち）',
    created_at: '2026-10-06T09:30:00Z',
  }
];

// -------------------------------------------------------------
// デフォルト 出荷データ（ロット紐付け必須）
// -------------------------------------------------------------
export const DEFAULT_SHIPMENTS: Shipment[] = [
  {
    id: 'SHP-20261003-001',
    destination_name: 'Vegan Ramen YADOKARI 福岡店',
    destination_address: '福岡県福岡市中央区警固1-2-3',
    shipment_date: '2026-10-03',
    delivery_date: '2026-10-04',
    carrier: 'ヤマト運輸（クール冷凍便）',
    tracking_number: '4820-1928-3019',
    status: 'shipped',
    created_by: '田中 宏明',
    items: [
      {
        id: 'shp-item-01',
        shipment_id: 'SHP-20261003-001',
        lot_id: 'LOT-20260920-VAN-01',
        product_id: 'prod-vanilla-1l',
        product_name: 'ソイプレミアム バニラ (業務用 1L)',
        flavor: 'バニラ',
        quantity: 10,
        is_fifo_violation: false,
      },
      {
        id: 'shp-item-02',
        shipment_id: 'SHP-20261003-001',
        lot_id: 'LOT-20261002-CAC-01',
        product_id: 'prod-cacao-1l',
        product_name: 'ソイリッチ カカオ (業務用 1L)',
        flavor: 'カカオ',
        quantity: 5,
        is_fifo_violation: false,
      }
    ],
    notes: '初回納品。店舗冷凍ストッカー（-18℃）直入れ希望',
    created_at: '2026-10-03T10:30:00Z',
  },
  {
    id: 'SHP-20261005-002',
    destination_name: 'GREEN BURGER TOKYO 渋谷店',
    destination_address: '東京都渋谷区神南1-10-5',
    shipment_date: '2026-10-05',
    delivery_date: '2026-10-07',
    carrier: 'ヤマト運輸（クール冷凍便）',
    tracking_number: '4820-2210-9981',
    status: 'shipped',
    created_by: '佐々木 健一',
    items: [
      {
        id: 'shp-item-03',
        shipment_id: 'SHP-20261005-002',
        lot_id: 'LOT-20260920-VAN-01',
        product_id: 'prod-vanilla-1l',
        product_name: 'ソイプレミアム バニラ (業務用 1L)',
        flavor: 'バニラ',
        quantity: 15,
        is_fifo_violation: false,
      }
    ],
    notes: '定期納品。午前指定',
    created_at: '2026-10-05T14:15:00Z',
  }
];

// -------------------------------------------------------------
// ローカルストレージ キー
// -------------------------------------------------------------
const STORAGE_KEYS = {
  PRODUCTS: 'soystories_mfg_products_v1',
  LOTS: 'soystories_mfg_lots_v1',
  TRANSACTIONS: 'soystories_mfg_transactions_v1',
  SHIPMENTS: 'soystories_mfg_shipments_v1',
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
