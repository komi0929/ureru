import { 
  B2BOrder, 
  OrderItem, 
  B2BCustomer, 
  ShippingBoxSize, 
  BulkSize, 
  YamatoShippingRate,
  YamatoContractRate,
  ShippingBreakdown,
  OrderStatus 
} from '@/types/order';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================
// ヤマト運輸 運送契約基本条件書（2026年09月17日付 福岡早良営業所）
// 九州エリア発 特約宅急便運賃マスター（税抜）
// ============================================================
export const YAMATO_CONTRACT_BASE_RATES: YamatoContractRate[] = [
  {
    region: '九州',
    prefectures: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'],
    rates: { '60': 850, '80': 1110, '100': 1390, '120': 1850 },
  },
  {
    region: '中国',
    prefectures: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
    rates: { '60': 850, '80': 1110, '100': 1390, '120': 1850 },
  },
  {
    region: '四国',
    prefectures: ['徳島県', '香川県', '愛媛県', '高知県'],
    rates: { '60': 960, '80': 1220, '100': 1500, '120': 1970 },
  },
  {
    region: '関西',
    prefectures: ['滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
    rates: { '60': 960, '80': 1220, '100': 1500, '120': 1970 },
  },
  {
    region: '中部',
    prefectures: ['岐阜県', '静岡県', '愛知県', '三重県'],
    rates: { '60': 1080, '80': 1340, '100': 1620, '120': 2100 },
  },
  {
    region: '北陸',
    prefectures: ['富山県', '石川県', '福井県'],
    rates: { '60': 1080, '80': 1340, '100': 1620, '120': 2100 },
  },
  {
    region: '信越',
    prefectures: ['新潟県', '長野県'],
    rates: { '60': 1320, '80': 1580, '100': 1860, '120': 2370 },
  },
  {
    region: '関東',
    prefectures: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '山梨県'],
    rates: { '60': 1320, '80': 1580, '100': 1860, '120': 2370 },
  },
  {
    region: '南東北',
    prefectures: ['宮城県', '山形県', '福島県'],
    rates: { '60': 1600, '80': 1860, '100': 2140, '120': 2670 },
  },
  {
    region: '北東北',
    prefectures: ['青森県', '岩手県', '秋田県'],
    rates: { '60': 1600, '80': 1860, '100': 2140, '120': 2670 },
  },
  {
    region: '北海道',
    prefectures: ['北海道'],
    rates: { '60': 2120, '80': 2380, '100': 2660, '120': 3250 },
  },
  {
    region: '沖縄',
    prefectures: ['沖縄県'],
    rates: { '60': 1200, '80': 1760, '100': 2340, '120': 2930 },
  },
];

// 資材代・発送代金（梱包用保冷段ボール・保冷剤・出荷作業手数料：税抜200円加算）
export const PACKAGING_HANDLING_FEE = 200;

// ヤマト運輸 クール宅急便（冷凍便）付加料金（全国一律・税抜）
export const YAMATO_COOL_SURCHARGE: Record<ShippingBoxSize, number> = {
  '60': 250,
  '80': 300,
  '100': 400,
  '120': 650,
};

// 互換用：資材代200円とクール料金を含んだ税込送料テーブル（事前計算版）
export const YAMATO_SHIPPING_RATES: YamatoShippingRate[] = YAMATO_CONTRACT_BASE_RATES.map(item => {
  const calcRate = (size: ShippingBoxSize) => {
    const base = item.rates[size];
    const cool = YAMATO_COOL_SURCHARGE[size];
    const fee = PACKAGING_HANDLING_FEE;
    const subtotal = base + cool + fee;
    return Math.floor(subtotal * 1.10);
  };
  return {
    region: item.region,
    prefectures: item.prefectures,
    rates: {
      '60': calcRate('60'),
      '80': calcRate('80'),
      '100': calcRate('100'),
      '120': calcRate('120'),
    },
  };
});

// ============================================================
// 業務用バルクアイス卸価格設定（1ml = 2円 税抜、食品軽減税率8%）
// 1L: 2,000円（+税8% = 税込2,160円）
// 2L: 4,000円（+税8% = 税込4,320円）
// ============================================================
export const BULK_PRICING: Record<BulkSize, {
  volumeMl: number;
  priceExclTax: number;     // 税抜価格 (1L: 2,000円 / 2L: 4,000円)
  taxRate: number;          // 軽減税率 8% (0.08)
  taxAmount: number;        // 消費税額 (1L: 160円 / 2L: 320円)
  priceInclTax: number;     // 税込価格 (1L: 2,160円 / 2L: 4,320円)
  label: string;
}> = {
  '1L': {
    volumeMl: 1000,
    priceExclTax: 2000,
    taxRate: 0.08,
    taxAmount: 160,
    priceInclTax: 2160,
    label: '1L コンパクト容器（約10ディッシャー）',
  },
  '2L': {
    volumeMl: 2000,
    priceExclTax: 4000,
    taxRate: 0.08,
    taxAmount: 320,
    priceInclTax: 4320,
    label: '2L 業務用バルク容器（約20ディッシャー）',
  },
};

// ヤマト運輸 配達時間帯指定
export const YAMATO_DELIVERY_TIME_SLOTS = [
  '希望なし',
  '午前中（8:00〜12:00）',
  '14:00〜16:00',
  '16:00〜18:00',
  '18:00〜20:00',
  '19:00〜21:00',
];

// ============================================================
// 箱サイズ・重量上限および最大積載リットル数（1L=1kg計算）
// ============================================================
export const BOX_CAPACITIES: Record<ShippingBoxSize, { 
  maxLiters: number; 
  maxWeightKg: number; 
  description: string;
  recommendedPackaging: string;
}> = {
  '60': {
    maxLiters: 2,
    maxWeightKg: 2,
    description: '最大 2ℓ まで (2kg以内)',
    recommendedPackaging: '2Lバルク×1本 または 1Lバルク×2本',
  },
  '80': {
    maxLiters: 4,
    maxWeightKg: 5,
    description: '最大 4ℓ まで (5kg以内)',
    recommendedPackaging: '2Lバルク×2本 または 1Lバルク×4本',
  },
  '100': {
    maxLiters: 8,
    maxWeightKg: 10,
    description: '最大 8ℓ まで (10kg以内 / 試算推奨)',
    recommendedPackaging: '2Lバルク×4本 または 1Lバルク×8本',
  },
  '120': {
    maxLiters: 12,
    maxWeightKg: 15,
    description: '最大 12ℓ まで (15kg以内 クール便最大上限 / 試算推奨)',
    recommendedPackaging: '2Lバルク×6本 または 1Lバルク×12本',
  },
};

/**
 * 総容量（リットル）から最適なヤマト箱サイズを自動判定
 */
export function calculateRecommendedBoxSize(totalLiters: number): {
  boxSize: ShippingBoxSize;
  boxCount: number;
  exceedsSingleBox: boolean;
} {
  if (totalLiters <= 0) {
    return { boxSize: '60', boxCount: 1, exceedsSingleBox: false };
  }
  if (totalLiters <= 2) {
    return { boxSize: '60', boxCount: 1, exceedsSingleBox: false };
  }
  if (totalLiters <= 4) {
    return { boxSize: '80', boxCount: 1, exceedsSingleBox: false };
  }
  if (totalLiters <= 8) {
    return { boxSize: '100', boxCount: 1, exceedsSingleBox: false };
  }
  if (totalLiters <= 12) {
    return { boxSize: '120', boxCount: 1, exceedsSingleBox: false };
  }

  // 12Lを超える場合は120サイズ複数個口で計算
  const count = Math.ceil(totalLiters / 12);
  return { boxSize: '120', boxCount: count, exceedsSingleBox: true };
}

/**
 * 都道府県と箱サイズから送料詳細内訳を算出
 * （特約基本運賃 + クール代金 + 資材代・発送代200円 + 消費税10%）
 */
export function calculateShippingBreakdown(
  prefecture: string, 
  boxSize: ShippingBoxSize, 
  boxCount: number = 1,
  includeCoolFee: boolean = true
): ShippingBreakdown {
  const count = Math.max(1, boxCount);
  const cleanPref = prefecture ? prefecture.trim() : '福岡県';

  const matched = YAMATO_CONTRACT_BASE_RATES.find(rate => 
    rate.prefectures.some(p => p.includes(cleanPref) || cleanPref.includes(p.replace(/都|府|県/g, '')))
  );

  const baseRate = matched ? matched.rates[boxSize] : (YAMATO_CONTRACT_BASE_RATES[0].rates[boxSize] || 850);
  const coolFee = includeCoolFee ? (YAMATO_COOL_SURCHARGE[boxSize] || 0) : 0;
  const handlingFee = PACKAGING_HANDLING_FEE; // 資材代・発送代金 200円

  const unitTaxExcluded = baseRate + coolFee + handlingFee;
  const unitTax = Math.floor(unitTaxExcluded * 0.10);
  const unitTaxIncluded = unitTaxExcluded + unitTax;
  const totalShippingFee = unitTaxIncluded * count;

  return {
    base_rate: baseRate,
    cool_fee: coolFee,
    handling_fee: handlingFee,
    unit_tax_excluded: unitTaxExcluded,
    unit_tax: unitTax,
    unit_tax_included: unitTaxIncluded,
    box_count: count,
    total_shipping_fee: totalShippingFee,
  };
}

/**
 * 都道府県と箱サイズから送料（税込合計）を計算
 */
export function getShippingFee(
  prefecture: string, 
  boxSize: ShippingBoxSize, 
  boxCount: number = 1,
  includeCoolFee: boolean = true
): number {
  const breakdown = calculateShippingBreakdown(prefecture, boxSize, boxCount, includeCoolFee);
  return breakdown.total_shipping_fee;
}

/**
 * 最短発送日を計算（本日より土日祝を除いた3営業日後）
 */
export function getMinShippingDate(fromDate: Date = new Date()): string {
  let count = 0;
  const current = new Date(fromDate);

  while (count < 3) {
    current.setDate(current.getDate() + 1);
    const day = current.getDay();
    // 0: 日曜日, 6: 土曜日 は営業日カウントから除外
    if (day !== 0 && day !== 6) {
      count++;
    }
  }

  // YYYY-MM-DD 形式
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, '0');
  const date = String(current.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

// ============================================================
// ローカルストレージ＆Supabase CRUD
// ============================================================
const STORAGE_KEY_ORDERS = 'soystories_b2b_orders_v1';
const STORAGE_KEY_CURRENT_CUSTOMER = 'soystories_b2b_customer_profile';

// 初期サンプル受注データ（画面初期表示・動作確認用）
export const INITIAL_ORDERS: B2BOrder[] = [
  {
    id: 'ord-init-001',
    order_number: 'ORD-20261002-001',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer: {
      store_name: 'ヴィーガンカフェ GREEN SPOON 福岡店',
      contact_name: '佐藤 健一',
      email: 'sato@greenspoon-fuk.jp',
      phone: '092-712-3456',
      postal_code: '810-0041',
      prefecture: '福岡県',
      city: '福岡市中央区大名',
      address_line: '1-12-8 大名ビル 2F',
      notes: '店舗裏口からの搬入をお願いします',
      is_member: true,
    },
    items: [
      {
        id: 'item-1',
        recipe_id: 'recipe-earl-grey',
        recipe_name: '米粉アイス【アールグレイ】',
        size: '2L',
        unit_price: 4320,
        quantity: 2,
        total_volume_liters: 4,
        subtotal: 8640,
      }
    ],
    total_volume_liters: 4,
    subtotal: 8640,
    shipping: {
      box_size: '80',
      box_count: 1,
      shipping_fee: 1771,
      breakdown: {
        base_rate: 1110,
        cool_fee: 300,
        handling_fee: 200,
        unit_tax_excluded: 1610,
        unit_tax: 161,
        unit_tax_included: 1771,
        box_count: 1,
        total_shipping_fee: 1771,
      },
      estimated_shipping_date: getMinShippingDate(),
      preferred_delivery_date: getMinShippingDate(),
      delivery_time_slot: '午前中（8:00〜12:00）',
      tracking_number: '3412-8901-2345',
    },
    grand_total: 10411,
    payment_method: 'invoice',
    status: 'ready',
    admin_notes: '常連店舗様。アールグレイ人気急増中',
  },
  {
    id: 'ord-init-002',
    order_number: 'ORD-20261001-002',
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    customer: {
      store_name: '薬膳拉麺 蓮（REN）東京',
      contact_name: '山田 太郎',
      email: 'yamada@ren-ramen.tokyo',
      phone: '03-5412-9876',
      postal_code: '150-0001',
      prefecture: '東京都',
      city: '渋谷区神宮前',
      address_line: '4-3-2 原宿サウス 1F',
      is_member: false,
    },
    items: [
      {
        id: 'item-2',
        recipe_id: 'recipe-matcha',
        recipe_name: '米粉アイス【抹茶】',
        size: '2L',
        unit_price: 4320,
        quantity: 1,
        total_volume_liters: 2,
        subtotal: 4320,
      },
      {
        id: 'item-3',
        recipe_id: 'recipe-vanilla',
        recipe_name: '米粉アイス【バニラ】',
        size: '1L',
        unit_price: 2160,
        quantity: 2,
        total_volume_liters: 2,
        subtotal: 4320,
      }
    ],
    total_volume_liters: 4,
    subtotal: 8640,
    shipping: {
      box_size: '80',
      box_count: 1,
      shipping_fee: 2288,
      breakdown: {
        base_rate: 1580,
        cool_fee: 300,
        handling_fee: 200,
        unit_tax_excluded: 2080,
        unit_tax: 208,
        unit_tax_included: 2288,
        box_count: 1,
        total_shipping_fee: 2288,
      },
      estimated_shipping_date: getMinShippingDate(),
      preferred_delivery_date: getMinShippingDate(),
      delivery_time_slot: '14:00〜16:00',
    },
    grand_total: 10928,
    payment_method: 'invoice',
    status: 'processing',
    admin_notes: 'ラーメン店様食後デザート用発注',
  }
];

let inMemoryOrders: B2BOrder[] = [...INITIAL_ORDERS];

/**
 * 全受注一覧の取得
 */
export async function getB2BOrders(): Promise<B2BOrder[]> {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryOrders = parsed;
          return inMemoryOrders;
        }
      } catch (e) {
        console.error('Failed to parse orders from localStorage', e);
      }
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('b2b_orders').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        inMemoryOrders = data as B2BOrder[];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(inMemoryOrders));
        }
        return inMemoryOrders;
      }
    } catch {
      // fallback
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(inMemoryOrders));
  }
  return inMemoryOrders;
}

/**
 * 新規受注（発注）の作成・保存
 */
export async function createB2BOrder(orderData: Omit<B2BOrder, 'id' | 'order_number' | 'created_at' | 'status'>): Promise<B2BOrder> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(100 + Math.random() * 900);
  const orderNumber = `ORD-${dateStr}-${rand}`;

  const breakdown = orderData.shipping.breakdown || calculateShippingBreakdown(
    orderData.customer.prefecture,
    orderData.shipping.box_size,
    orderData.shipping.box_count
  );

  const newOrder: B2BOrder = {
    ...orderData,
    shipping: {
      ...orderData.shipping,
      breakdown,
    },
    id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    order_number: orderNumber,
    created_at: now.toISOString(),
    status: 'pending',
  };

  const current = await getB2BOrders();
  const updated = [newOrder, ...current];
  inMemoryOrders = updated;

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    // 顧客情報をログイン状態として保存
    if (orderData.customer) {
      localStorage.setItem(STORAGE_KEY_CURRENT_CUSTOMER, JSON.stringify(orderData.customer));
    }
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('b2b_orders').upsert([newOrder]);
    } catch (e) {
      console.warn('Supabase b2b_orders upsert error:', e);
    }
  }

  return newOrder;
}

/**
 * 受注ステータス・伝票番号等の更新
 */
export async function updateB2BOrderStatus(id: string, status: OrderStatus, trackingNumber?: string, adminNotes?: string): Promise<B2BOrder | null> {
  const current = await getB2BOrders();
  const index = current.findIndex(o => o.id === id);
  if (index === -1) return null;

  const order = current[index];
  const updated: B2BOrder = {
    ...order,
    status,
    shipping: {
      ...order.shipping,
      tracking_number: trackingNumber !== undefined ? trackingNumber : order.shipping.tracking_number,
    },
    admin_notes: adminNotes !== undefined ? adminNotes : order.admin_notes,
    updated_at: new Date().toISOString(),
  };

  current[index] = updated;
  inMemoryOrders = [...current];

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(inMemoryOrders));
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('b2b_orders').upsert([updated]);
    } catch (e) {
      console.warn('Supabase b2b_orders update error:', e);
    }
  }

  return updated;
}

/**
 * 顧客プロファイルの保存・取得（ログイン状態保持）
 */
export function getSavedCustomerProfile(): B2BCustomer | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(STORAGE_KEY_CURRENT_CUSTOMER);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function saveCustomerProfile(customer: B2BCustomer): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_CURRENT_CUSTOMER, JSON.stringify(customer));
}

export function clearCustomerProfile(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_CURRENT_CUSTOMER);
}
