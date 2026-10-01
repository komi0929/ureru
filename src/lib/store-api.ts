/**
 * 店舗経営分析 (STORE LAB) API & データ処理エンジン
 * AirレジCSVの自動判別、ファイル名からの期間抽出、集計・分析ロジック
 */

import {
  ProductSalesRecord,
  DailySalesRecord,
  TransactionRecord,
  StoreCSVType,
  ImportFileMeta,
  GrowthDiagnosis,
} from '@/types/store';
import {
  generateMultiYearProductSales,
  generateMultiYearDailySales,
  RAW_PRODUCT_SALES_2026_09,
  RAW_DAILY_SALES_2026_09
} from './store-seed';

const STORAGE_KEY_PRODUCT_SALES = 'soystories_store_product_sales_v1';
const STORAGE_KEY_DAILY_SALES = 'soystories_store_daily_sales_v1';
const STORAGE_KEY_TRANSACTIONS = 'soystories_store_transactions_v1';
const STORAGE_KEY_IMPORT_HISTORY = 'soystories_store_import_history_v1';

// -------------------------------------------------------------
// 1. ファイル名から期間 (YYYY-MM) を自動読み取るロジック
// -------------------------------------------------------------
export function detectPeriodFromFileName(fileName: string, fileContent?: string): string {
  // パターン1: YYYYMMDD-YYYYMMDD または YYYYMMDD_YYYYMMDD (例: 商品別売上_20260801-20260831.csv)
  const rangeMatch = fileName.match(/(20\d{2})(\d{2})\d{2}[-_](20\d{2})(\d{2})\d{2}/);
  if (rangeMatch) {
    return `${rangeMatch[1]}-${rangeMatch[2]}`;
  }

  // パターン2: YYYYMM (例: 202609.csv, 売上_202609.csv)
  const yyyymmMatch = fileName.match(/(20\d{2})[-_]?(\d{2})(?!\d)/);
  if (yyyymmMatch) {
    const month = parseInt(yyyymmMatch[2], 10);
    if (month >= 1 && month <= 12) {
      return `${yyyymmMatch[1]}-${yyyymmMatch[2]}`;
    }
  }

  // パターン3: YYYY年M月 (例: 2026年9月_商品別売上.csv)
  const jpMatch = fileName.match(/(20\d{2})年(\d{1,2})月/);
  if (jpMatch) {
    return `${jpMatch[1]}-${jpMatch[2].padStart(2, '0')}`;
  }

  // パターン4: YYYY-MM または YYYY_MM
  const hyphenMatch = fileName.match(/(20\d{2})[-_](\d{2})/);
  if (hyphenMatch) {
    const month = parseInt(hyphenMatch[2], 10);
    if (month >= 1 && month <= 12) {
      return `${hyphenMatch[1]}-${hyphenMatch[2]}`;
    }
  }

  // フォールバック: ファイル名に日付がない場合、ファイル本文の日付から抽出
  if (fileContent) {
    // 例: 2026/09/01 or 2026-09-01 or 20260901
    const contentDateMatch = fileContent.match(/20\d{2}[\/-](\d{2})[\/-]\d{2}/) || fileContent.match(/20\d{2}(\d{2})\d{2}/);
    if (contentDateMatch) {
      const year = contentDateMatch[0].substring(0, 4);
      const month = contentDateMatch[1] || contentDateMatch[0].substring(4, 6);
      return `${year}-${month}`;
    }
  }

  // デフォルトは直近
  return '2026-09';
}

// -------------------------------------------------------------
// 2. CSVヘッダー行またはファイル名からCSV種別を自動判別するロジック
// -------------------------------------------------------------
export function detectCSVType(firstLine: string, fileName?: string): StoreCSVType {
  // A. ファイル名による判定 (最も確実)
  if (fileName) {
    const fName = fileName.toLowerCase();
    if (fName.includes('商品別売上') || fName.includes('商品別')) {
      return 'product_sales';
    }
    if (fName.includes('売上集計') || fName.includes('日別売上') || fName.includes('日別')) {
      return 'daily_sales';
    }
    if (fName.includes('会計明細') || fName.includes('取引明細') || fName.includes('レシート') || fName.includes('伝票')) {
      return 'transactions';
    }
  }

  // B. ヘッダー行テキストによる判定 (BOM除去後)
  const line = firstLine.replace(/^\uFEFF/, '').toLowerCase();

  // 商品別売上CSV: 「商品名」「純売上金額」「構成比」「売上商品数」など
  if (
    line.includes('商品名') || 
    line.includes('純売上') || 
    line.includes('カテゴリー') || 
    line.includes('売上商品数') ||
    line.includes('jes[') || 
    line.includes('i,jes[')
  ) {
    return 'product_sales';
  }

  // 日別売上集計CSV: 「集計対象日」「組数」「組単価」「客数」「客単価」「商品点数」
  if (
    line.includes('集計対象日') || 
    line.includes('組単価') || 
    line.includes('客単価') || 
    line.includes('組数') ||
    line.includes('wv') || 
    line.includes('qv')
  ) {
    return 'daily_sales';
  }

  // 会計明細CSV: 「伝票no」「会計日時」「airペイ」「paypay」「まとめ販売値引き」
  if (
    line.includes('伝票no') || 
    line.includes('会計日時') || 
    line.includes('airペイ') || 
    line.includes('paypay') || 
    line.includes('まとめ販売値引き') ||
    line.includes('no,v')
  ) {
    return 'transactions';
  }

  return 'unknown';
}

// -------------------------------------------------------------
// 3. CSVパーサー群
// -------------------------------------------------------------

/**
 * 商品別売上CSVのパース
 */
export function parseProductSalesCSV(csvText: string, period: string): ProductSalesRecord[] {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const records: ProductSalesRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 5) continue;

    const productName = cols[0];
    const category = cols[1] || '未分類';
    const taxType = cols[2] || '内税';
    const netSales = Number(cols[3]) || 0;
    const salesRatio = Number(cols[4]) || 0;
    const discountAmount = Number(cols[5]) || 0;
    const quantity = Number(cols[7]) || 0;
    const quantityRatio = Number(cols[8]) || 0;
    const returnQty = Number(cols[9]) || 0;
    const productId = cols[11] || '';

    if (!productName || netSales < 0) continue;

    records.push({
      id: `ps-${period}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      period,
      product_name: productName,
      category,
      tax_type: taxType,
      net_sales: netSales,
      sales_ratio: salesRatio,
      discount_amount: discountAmount,
      quantity,
      quantity_ratio: quantityRatio,
      return_quantity: returnQty,
      product_id: productId,
    });
  }

  return records;
}

/**
 * 日別売上集計CSVのパース
 */
export function parseDailySalesCSV(csvText: string, period: string): DailySalesRecord[] {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const records: DailySalesRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 5) continue;

    // 日付フォーマット: 20260901 or 2026/09/01 or 2026-09-01
    let rawDate = cols[0];
    let dateStr = '';
    if (rawDate.length === 8 && /^\d{8}$/.test(rawDate)) {
      dateStr = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
    } else if (rawDate.includes('/')) {
      dateStr = rawDate.replace(/\//g, '-');
    } else {
      dateStr = rawDate;
    }

    const dt = new Date(dateStr);
    const dayOfWeekIdx = isNaN(dt.getTime()) ? 0 : dt.getDay();
    const daysMap = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = daysMap[dayOfWeekIdx];
    const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 6;

    const sales = Number(cols[1]) || 0;
    const orderCount = Number(cols[2]) || 0;
    const orderAvg = Number(cols[3]) || 0;
    const customerCount = Number(cols[4]) || 0;
    const customerAvg = Number(cols[5]) || 0;
    const itemCount = Number(cols[6]) || 0;
    const cashTotal = Number(cols[7]) || 0;
    const cashlessTotal = Number(cols[8]) || 0;
    const sales10pct = Number(cols[9]) || 0;
    const sales8pct = Number(cols[10]) || 0;

    const itemsPerOrder = orderCount > 0 ? Number((itemCount / orderCount).toFixed(2)) : 0;

    records.push({
      id: `ds-${dateStr}`,
      date: dateStr,
      period: dateStr.substring(0, 7) || period,
      day_of_week: dayOfWeek,
      is_weekend: isWeekend,
      sales,
      order_count: orderCount,
      order_avg: orderAvg,
      customer_count: customerCount,
      customer_avg: customerAvg,
      item_count: itemCount,
      items_per_order: itemsPerOrder,
      cash_total: cashTotal,
      cashless_total: cashlessTotal,
      sales_10pct: sales10pct,
      sales_8pct: sales8pct,
      refund_10pct: 0,
      refund_8pct: 0,
    });
  }

  return records;
}

/**
 * 会計明細CSVのパース
 */
export function parseTransactionsCSV(csvText: string, period: string): TransactionRecord[] {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const records: TransactionRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 5) continue;

    const slipNo = cols[0];
    const rawDate = cols[1]; // 2026/09/01 or 2026/09/01 12:01:50
    if (!slipNo || !rawDate) continue;

    const date = rawDate.split(' ')[0].replace(/\//g, '-');
    const time = rawDate.split(' ')[1] || '12:00:00';
    const hour = parseInt(time.split(':')[0], 10) || 12;

    const subtotal = Number(cols[2]) || 0;
    const subtotal10 = Number(cols[3]) || 0;
    const subtotal8 = Number(cols[4]) || 0;
    const total = Number(cols[7]) || subtotal;
    const tax = Number(cols[8]) || 0;

    const cash = Number(cols[15]) || 0;
    const credit = Number(cols[16]) || 0;
    const ic = Number(cols[17]) || 0;
    const quicpay = Number(cols[18]) || 0;
    const idPay = Number(cols[19]) || 0;
    const qr = Number(cols[20]) || 0;
    const square = Number(cols[22]) || 0;
    const paypay = Number(cols[23]) || 0;
    const bulkDiscount = Number(cols[24]) || 0;

    let paymentMethod = '現金';
    if (paypay > 0) paymentMethod = 'PayPay';
    else if (credit > 0) paymentMethod = 'クレジットカード';
    else if (ic > 0) paymentMethod = '交通系IC';
    else if (quicpay > 0 || idPay > 0) paymentMethod = '電子マネー';
    else if (qr > 0) paymentMethod = 'QR決済';
    else if (square > 0) paymentMethod = 'Square';

    records.push({
      id: `tx-${slipNo}-${i}`,
      slip_no: slipNo,
      timestamp: `${date} ${time}`,
      date,
      period: date.substring(0, 7) || period,
      hour,
      subtotal,
      subtotal_10pct: subtotal10,
      subtotal_8pct: subtotal8,
      total,
      tax,
      payment_method: paymentMethod,
      payment_cash: cash,
      payment_credit: credit,
      payment_ic: ic,
      payment_quicpay: quicpay,
      payment_id: idPay,
      payment_qr: qr,
      payment_square: square,
      payment_paypay: paypay,
      bulk_discount_amount: bulkDiscount,
    });
  }

  return records;
}

// -------------------------------------------------------------
// 4. ストレージ管理 & 初期化
// -------------------------------------------------------------

export async function getProductSales(period?: string): Promise<ProductSalesRecord[]> {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY_PRODUCT_SALES);
  let records: ProductSalesRecord[] = [];

  if (raw) {
    try {
      records = JSON.parse(raw);
    } catch {
      records = [];
    }
  }

  // データが空ならシードデータを生成して格納
  if (records.length === 0) {
    records = generateMultiYearProductSales();
    localStorage.setItem(STORAGE_KEY_PRODUCT_SALES, JSON.stringify(records));
  }

  if (period) {
    return records.filter(r => r.period === period);
  }
  return records;
}

export async function getDailySales(period?: string): Promise<DailySalesRecord[]> {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY_DAILY_SALES);
  let records: DailySalesRecord[] = [];

  if (raw) {
    try {
      records = JSON.parse(raw);
    } catch {
      records = [];
    }
  }

  if (records.length === 0) {
    records = generateMultiYearDailySales();
    localStorage.setItem(STORAGE_KEY_DAILY_SALES, JSON.stringify(records));
  }

  if (period) {
    return records.filter(r => r.period === period);
  }
  return records;
}

export async function getTransactions(period?: string): Promise<TransactionRecord[]> {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
  if (!raw) return [];
  try {
    const list: TransactionRecord[] = JSON.parse(raw);
    if (period) return list.filter(t => t.period === period);
    return list;
  } catch {
    return [];
  }
}

export async function saveProductSales(newRecords: ProductSalesRecord[]): Promise<void> {
  if (typeof window === 'undefined' || newRecords.length === 0) return;
  const current = await getProductSales();
  const period = newRecords[0].period;
  
  // 同一期間の古いデータを置き換え
  const filtered = current.filter(r => r.period !== period);
  const updated = [...filtered, ...newRecords];
  localStorage.setItem(STORAGE_KEY_PRODUCT_SALES, JSON.stringify(updated));
}

export async function saveDailySales(newRecords: DailySalesRecord[]): Promise<void> {
  if (typeof window === 'undefined' || newRecords.length === 0) return;
  const current = await getDailySales();
  const dates = new Set(newRecords.map(r => r.date));
  
  const filtered = current.filter(r => !dates.has(r.date));
  const updated = [...filtered, ...newRecords];
  localStorage.setItem(STORAGE_KEY_DAILY_SALES, JSON.stringify(updated));
}

export async function saveTransactions(newRecords: TransactionRecord[]): Promise<void> {
  if (typeof window === 'undefined' || newRecords.length === 0) return;
  const current = await getTransactions();
  const slips = new Set(newRecords.map(r => r.slip_no));
  
  const filtered = current.filter(r => !slips.has(r.slip_no));
  const updated = [...filtered, ...newRecords];
  // 5MB制限を考慮して直近1000件程度を保持
  const trimmed = updated.slice(-2000);
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(trimmed));
}

/**
 * 登録されている全年月リストを取得 (降順: 2026-09, 2026-08, ...)
 */
export async function getAvailablePeriods(): Promise<string[]> {
  const pSales = await getProductSales();
  const dSales = await getDailySales();
  
  const set = new Set<string>();
  pSales.forEach(r => r.period && set.add(r.period));
  dSales.forEach(r => r.period && set.add(r.period));

  const list = Array.from(set).sort().reverse();
  return list.length > 0 ? list : ['2026-09'];
}

// -------------------------------------------------------------
// 5. 成長鈍化診断エンジン (Growth Diagnosis Engine)
// -------------------------------------------------------------
export async function getGrowthDiagnosis(
  currentPeriod = '2026-09',
  comparePeriod = '2025-09'
): Promise<GrowthDiagnosis> {
  const [currentPS, comparePS, currentDS, compareDS] = await Promise.all([
    getProductSales(currentPeriod),
    getProductSales(comparePeriod),
    getDailySales(currentPeriod),
    getDailySales(comparePeriod),
  ]);

  // 売上合計
  const curSales = currentDS.reduce((sum, d) => sum + d.sales, 0) || currentPS.reduce((sum, p) => sum + p.net_sales, 0) || 1200000;
  const cmpSales = compareDS.reduce((sum, d) => sum + d.sales, 0) || comparePS.reduce((sum, p) => sum + p.net_sales, 0) || 1350000;
  const salesChange = cmpSales > 0 ? Number(((curSales - cmpSales) / cmpSales * 100).toFixed(1)) : 0;

  // 客数合計
  const curCust = currentDS.reduce((sum, d) => sum + d.customer_count, 0) || 1100;
  const cmpCust = compareDS.reduce((sum, d) => sum + d.customer_count, 0) || 1150;
  const custChange = cmpCust > 0 ? Number(((curCust - cmpCust) / cmpCust * 100).toFixed(1)) : 0;

  // 客単価
  const curAvgSpend = curCust > 0 ? Math.round(curSales / curCust) : 1100;
  const cmpAvgSpend = cmpCust > 0 ? Math.round(cmpSales / cmpCust) : 1180;
  const avgSpendChange = cmpAvgSpend > 0 ? Number(((curAvgSpend - cmpAvgSpend) / cmpAvgSpend * 100).toFixed(1)) : 0;

  // 買上点数
  const curItems = currentDS.reduce((sum, d) => sum + d.item_count, 0) || 2200;
  const cmpItems = compareDS.reduce((sum, d) => sum + d.item_count, 0) || 2500;
  const curItemsPerOrder = curCust > 0 ? Number((curItems / curCust).toFixed(2)) : 2.0;
  const cmpItemsPerOrder = cmpCust > 0 ? Number((cmpItems / cmpCust).toFixed(2)) : 2.2;
  const itemsChange = cmpItemsPerOrder > 0 ? Number(((curItemsPerOrder - cmpItemsPerOrder) / cmpItemsPerOrder * 100).toFixed(1)) : 0;

  // 商品別増減寄与度の集計
  const cmpProductMap = new Map<string, ProductSalesRecord>();
  comparePS.forEach(p => cmpProductMap.set(p.product_name, p));

  const productDiffs: {
    product_name: string;
    category: string;
    diff: number;
    pct: number;
  }[] = [];

  currentPS.forEach(cur => {
    const prev = cmpProductMap.get(cur.product_name);
    const prevSales = prev ? prev.net_sales : 0;
    const diff = cur.net_sales - prevSales;
    const pct = prevSales > 0 ? (diff / prevSales) * 100 : 100;
    productDiffs.push({
      product_name: cur.product_name,
      category: cur.category,
      diff,
      pct,
    });
  });

  // 落ち込みランキング (マイナスが大きい順)
  const declining = productDiffs
    .filter(p => p.diff < 0)
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 5)
    .map(p => ({
      product_name: p.product_name,
      category: p.category,
      loss_amount: Math.abs(p.diff),
      change_rate: Number(p.pct.toFixed(1)),
    }));

  // 成長ランキング (プラスが大きい順)
  const growing = productDiffs
    .filter(p => p.diff > 0)
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 5)
    .map(p => ({
      product_name: p.product_name,
      category: p.category,
      gain_amount: p.diff,
      change_rate: Number(p.pct.toFixed(1)),
    }));

  // 要因特定ロジック
  const factors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }[] = [];

  if (salesChange < 0) {
    if (avgSpendChange < -3 && itemsChange < -3) {
      factors.push({
        factor: '買上点数の減少（併せ買い・ついで買いの低下）',
        impact: 'negative',
        detail: `客1人あたりの購入点数が前年同期の ${cmpItemsPerOrder}点 から ${curItemsPerOrder}点 に低下（${itemsChange}%）。お土産ドーナツやドリンクのクロスセル率が落ちています。`,
      });
    }
    if (custChange < -3) {
      factors.push({
        factor: '来店客数の伸び悩み',
        impact: 'negative',
        detail: `月間客数が前年比で ${Math.abs(curCust - cmpCust)}名 減少（${custChange}%）。新規流入ペースの減速または平日リピート頻度の低下が見られます。`,
      });
    }
    if (declining.length > 0 && declining[0].product_name.includes('ワッフル')) {
      factors.push({
        factor: '主力看板商品の踊り場・飽き',
        impact: 'negative',
        detail: `最大シェアの「${declining[0].product_name}」の売上が前年同月比で ¥${declining[0].loss_amount.toLocaleString()} 減少（${declining[0].change_rate}%）。`,
      });
    }
  } else {
    factors.push({
      factor: '売上全体は順調に拡大',
      impact: 'positive',
      detail: `前年同月比 +${salesChange}% で成長を維持しています。`,
    });
  }

  if (growing.length > 0) {
    factors.push({
      factor: '新定番・好調商品の台頭',
      impact: 'positive',
      detail: `「${growing[0].product_name}」が前年比 +¥${growing[0].gain_amount.toLocaleString()}（+${growing[0].change_rate}%）と好調に牽引しています。`,
    });
  }

  const overall_status: 'growing' | 'slowing' | 'declining' =
    salesChange > 5 ? 'growing' : salesChange >= -5 ? 'slowing' : 'declining';
  
  const status_label = 
    overall_status === 'growing' ? '順調成長中' :
    overall_status === 'slowing' ? '成長鈍化・踊り場' : '売上減少フェーズ';

  const summary_message =
    overall_status === 'growing'
      ? `前年同月比 +${salesChange}% と拡大基調です。新商品の伸長が全体を牽引しています。`
      : overall_status === 'slowing'
      ? `前年同月比 ${salesChange}% と横ばい〜微減傾向です。客数自体は維持しているものの、「買上点数の低下（併せ買い減少）」および看板商品のリピート減少が成長鈍化の主因です。`
      : `前年同月比 ${salesChange}% と減少傾向です。客数と客単価の両方に下落要因があり、早急なメニュー再構築とプロモーションが必要です。`;

  return {
    overall_status,
    status_label,
    summary_message,
    yoy_sales_change: salesChange,
    yoy_customer_change: custChange,
    yoy_avg_spend_change: avgSpendChange,
    yoy_items_per_order_change: itemsChange,
    key_factors: factors,
    declining_products: declining,
    growing_products: growing,
  };
}

/**
 * データを初期シード状態へリセット
 */
export async function resetStoreDataToSeed(): Promise<void> {
  if (typeof window === 'undefined') return;
  const pSales = generateMultiYearProductSales();
  const dSales = generateMultiYearDailySales();
  localStorage.setItem(STORAGE_KEY_PRODUCT_SALES, JSON.stringify(pSales));
  localStorage.setItem(STORAGE_KEY_DAILY_SALES, JSON.stringify(dSales));
  localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
}
