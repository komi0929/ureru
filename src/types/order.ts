// ============================================================
// B2B受発注管理・オンライン発注ポータル 型定義
// ============================================================

export type BulkSize = '1L' | '2L';
export type ShippingBoxSize = '60' | '80' | '100' | '120';
export type OrderStatus = 'pending' | 'processing' | 'ready' | 'shipped' | 'completed' | 'cancelled';

/**
 * 発注商品アイテム
 */
export interface OrderItem {
  id: string;
  recipe_id: string;
  recipe_name: string;
  size: BulkSize;           // '1L' | '2L'
  unit_price: number;       // 1本あたり卸価格 (税込)
  quantity: number;         // 注文本数
  total_volume_liters: number; // 合計リットル数 (1L×数量 or 2L×数量)
  subtotal: number;         // 小計 (税込)
}

/**
 * 顧客・発注元情報
 */
export interface B2BCustomer {
  id?: string;
  store_name: string;       // 店舗名 / 会社名
  contact_name: string;     // ご担当者名
  email: string;            // メールアドレス
  phone: string;            // 電話番号
  postal_code: string;      // 郵便番号
  prefecture: string;       // 都道府県
  city: string;             // 市区町村
  address_line: string;     // 番地・建物名
  notes?: string;           // ご要望・備考
  is_member?: boolean;      // 会員登録フラグ
}

/**
 * 送料内訳情報（基本運賃 + クール便代 + 資材代・発送代金200円 + 税）
 */
export interface ShippingBreakdown {
  base_rate: number;         // 特約基本運賃 (税抜)
  cool_fee: number;          // クール便加算額 (税抜: 60=250, 80=300, 100=400, 120=650)
  handling_fee: number;      // 資材代・発送代金 (税抜: 200円)
  unit_tax_excluded: number; // 1箱あたり税抜送料小計 (基本 + クール + 資材代)
  unit_tax: number;          // 1箱あたり消費税 (10%)
  unit_tax_included: number; // 1箱あたり税込送料
  box_count: number;         // 箱数
  total_shipping_fee: number;// 税込合計送料 (unit_tax_included * box_count)
}

/**
 * 配送指定
 */
export interface ShippingPreference {
  box_size: ShippingBoxSize; // '60' | '80' | '100' | '120'
  box_count: number;         // 箱数 (通常1箱、容量オーバー時は複数箱)
  shipping_fee: number;      // 冷凍クール便送料 (税込)
  breakdown?: ShippingBreakdown; // 送料詳細内訳
  estimated_shipping_date: string; // 発送予定日 (最短3営業日後)
  preferred_delivery_date?: string; // 配達希望日
  delivery_time_slot: string; // ヤマト運輸 配達時間帯指定
  tracking_number?: string;   // ヤマトお問い合わせ送り状番号
}

/**
 * 発注（受注）レコード
 */
export interface B2BOrder {
  id: string;
  order_number: string;      // 例: ORD-20261002-001
  created_at: string;
  customer: B2BCustomer;
  items: OrderItem[];
  total_volume_liters: number; // 総合計リットル数
  subtotal: number;            // 商品合計 (税込)
  shipping: ShippingPreference;// 配送・送料情報
  grand_total: number;         // 請求合計 (商品合計 + 送料)
  payment_method: 'invoice';   // 月末締め翌月末請求書払い
  status: OrderStatus;
  admin_notes?: string;
  updated_at?: string;
}

/**
 * ヤマト運輸 特約運賃テーブル (契約書原本データ)
 */
export interface YamatoContractRate {
  region: string;            // 地域名 (九州, 関東 等)
  prefectures: string[];     // 属する都道府県一覧
  rates: Record<ShippingBoxSize, number>; // 60, 80, 100, 120の税抜特約運賃
}

/**
 * ヤマト運輸 クール冷凍便 料金テーブル
 */
export interface YamatoShippingRate {
  region: string;            // 地域名 (九州, 関東 等)
  prefectures: string[];     // 属する都道府県一覧
  rates: Record<ShippingBoxSize, number>; // 60, 80, 100, 120の税込送料
}

