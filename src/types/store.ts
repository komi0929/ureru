/**
 * 店舗経営分析モード (STORE LAB) の型定義
 * Airレジの3大CSV（商品別売上、日別売上集計、会計明細）に対応
 */

// 1. 商品別売上レコード (Product Sales)
export interface ProductSalesRecord {
  id: string;
  period: string; // 対象年月 (例: '2026-09')
  product_name: string; // 商品名 (例: 'ワッフルソフト（コーン）')
  category: string; // カテゴリー (例: 'ワッフルソフトクリーム', 'SOYドーナツ', 'ドリンク')
  tax_type: string; // 税区分 (内税など)
  net_sales: number; // 純売上金額 (円)
  sales_ratio: number; // 売上構成比 (%)
  discount_amount: number; // 値引・割引額
  quantity: number; // 純売上商品数
  quantity_ratio: number; // 数量構成比 (%)
  return_quantity: number; // 返品商品数
  product_id?: string; // 商品ID
  product_code?: string; // 商品コード
}

// 2. 日別売上集計レコード (Daily Sales Summary)
export interface DailySalesRecord {
  id: string;
  date: string; // 日付 (YYYY-MM-DD)
  period: string; // 対象年月 (YYYY-MM)
  day_of_week: string; // 曜日 ('月', '火', ...)
  is_weekend: boolean; // 土日祝フラグ
  sales: number; // 売上金額 (円)
  order_count: number; // 組数 (会計数)
  order_avg: number; // 組単価 (円)
  customer_count: number; // 客数
  customer_avg: number; // 客単価 (円)
  item_count: number; // 商品点数
  items_per_order: number; // 買上点数 (商品点数 / 組数)
  cash_total: number; // 現金支払合計額
  cashless_total: number; // 現金以外 (キャッシュレス) 合計額
  sales_10pct: number; // イートイン売上 (10%標準)
  sales_8pct: number; // テイクアウト売上 (8%軽減)
  refund_10pct: number; // 返品金額 (10%)
  refund_8pct: number; // 返品金額 (8%)
}

// 3. 会計明細レコード (Transaction Details)
export interface TransactionRecord {
  id: string;
  slip_no: string; // 伝票No
  timestamp: string; // 会計日時 (YYYY/MM/DD HH:mm:ss)
  date: string; // 日付 (YYYY-MM-DD)
  period: string; // 対象年月 (YYYY-MM)
  hour: number; // 時間帯 (0〜23)
  subtotal: number; // 小計 (支払総額)
  subtotal_10pct: number; // 10%標準 (イートイン)
  subtotal_8pct: number; // 8%軽減 (テイクアウト)
  total: number; // 合計
  tax: number; // 消費税等
  payment_method: string; // 主な決済手段 ('現金', 'Airペイ', 'PayPay', etc.)
  payment_cash: number;
  payment_credit: number;
  payment_ic: number;
  payment_quicpay: number;
  payment_id: number;
  payment_qr: number;
  payment_square: number;
  payment_paypay: number;
  bulk_discount_amount: number; // まとめ販売値引き
  bulk_discount_reason?: string; // まとめ値引き理由
  item_estimate_count?: number; // 会計内推定購入点数
}

// CSVインポートのメタ情報
export type StoreCSVType = 'product_sales' | 'daily_sales' | 'transactions' | 'unknown';

export interface ImportFileMeta {
  file_name: string;
  detected_type: StoreCSVType;
  detected_period: string; // YYYY-MM
  record_count: number;
  imported_at: string;
}

// 季節区分
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

// 成長鈍化診断サマリー
export interface GrowthDiagnosis {
  overall_status: 'growing' | 'slowing' | 'declining';
  status_label: string;
  summary_message: string;
  yoy_sales_change: number; // 前年同期比 売上増減率 (%)
  yoy_customer_change: number; // 前年同期比 客数増減率 (%)
  yoy_avg_spend_change: number; // 前年同期比 客単価増減率 (%)
  yoy_items_per_order_change: number; // 前年同期比 買上点数増減率 (%)
  key_factors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    detail: string;
  }[];
  declining_products: {
    product_name: string;
    category: string;
    loss_amount: number;
    change_rate: number;
  }[];
  growing_products: {
    product_name: string;
    category: string;
    gain_amount: number;
    change_rate: number;
  }[];
}

// 商品ライフサイクル分類 (4象限)
export type ProductLifecycleCategory = 
  | 'driver' // 大黒柱 (売上大 × 成長中)
  | 'declining_pillar' // 鈍化の主犯 (売上大 × 衰退中)
  | 'star' // 新星 (売上小 × 急成長)
  | 'review'; // 見直し候補 (売上小 × 衰退)
