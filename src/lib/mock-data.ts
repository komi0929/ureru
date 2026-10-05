import {
  Lead,
  Product,
  Sample,
  Order,
  DmTemplate,
  GeneratedDmMessage,
  FunnelData,
  TemplatePerformanceData,
  MonthlyCostRevenueData,
  PacingStats,
} from '@/types';

import { getInitialVeganLeads } from './vegan-restaurants-master';

export const mockLeads: Lead[] = getInitialVeganLeads();

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'SoyStories バニラ',
    flavor: 'バニラ',
    description: 'マダガスカル産バニラビーンズを使用した、王道のバニラフレーバー。豆乳のまろやかさと相性抜群です。',
    price_per_unit: 500,
    sku: 'ICE-VAN-001',
    is_active: true,
  },
  {
    id: 'prod-2',
    name: 'SoyStories チョコレート',
    flavor: 'チョコレート',
    description: 'カカオ70%の高品質クーベルチュールチョコレートを使用した、濃厚でリッチな味わい。',
    price_per_unit: 550,
    sku: 'ICE-CHO-001',
    is_active: true,
  },
  {
    id: 'prod-3',
    name: 'SoyStories 抹茶',
    flavor: '抹茶',
    description: '京都宇治の老舗茶園の抹茶を贅沢に使用。苦味と甘味のバランスが絶妙な和のフレーバー。',
    price_per_unit: 550,
    sku: 'ICE-MAC-001',
    is_active: true,
  },
  {
    id: 'prod-4',
    name: 'SoyStories ストロベリー',
    flavor: 'ストロベリー',
    description: '国産いちごの果肉をふんだんに混ぜ込んだ、フレッシュで甘酸っぱいフレーバー。',
    price_per_unit: 520,
    sku: 'ICE-STR-001',
    is_active: true,
  },
  {
    id: 'prod-5',
    name: 'SoyStories マンゴー',
    flavor: 'マンゴー',
    description: '完熟アルフォンソマンゴーのピューレを使用した、トロピカルで爽やかな味わい。',
    price_per_unit: 520,
    sku: 'ICE-MAN-001',
    is_active: true,
  },
  {
    id: 'prod-6',
    name: 'SoyStories ピスタチオ',
    flavor: 'ピスタチオ',
    description: 'イタリア・シチリア産ピスタチオペーストを使用した、香ばしく濃厚なプレミアムフレーバー。',
    price_per_unit: 600,
    sku: 'ICE-PIS-001',
    is_active: true,
  },
];

export const mockSamples: Sample[] = [
  {
    id: 'samp-1',
    lead_id: 'lead-4',
    requested_at: '2026-09-15T10:00:00Z',
    status: 'requested',
    items: [
      { product_id: 'prod-1', quantity: 1 },
      { product_id: 'prod-4', quantity: 1 },
    ],
    shipping_address: '東京都渋谷区...',
    tracking_number: null,
    feedback_score: null,
    feedback_notes: null,
  },
  {
    id: 'samp-2',
    lead_id: 'lead-12',
    requested_at: '2026-09-14T11:00:00Z',
    status: 'packing',
    items: [
      { product_id: 'prod-1', quantity: 1 },
      { product_id: 'prod-2', quantity: 1 },
      { product_id: 'prod-3', quantity: 1 },
      { product_id: 'prod-4', quantity: 1 },
      { product_id: 'prod-5', quantity: 1 },
      { product_id: 'prod-6', quantity: 1 },
    ],
    shipping_address: '東京都港区...',
    tracking_number: null,
    feedback_score: null,
    feedback_notes: null,
  },
  {
    id: 'samp-3',
    lead_id: 'lead-5',
    requested_at: '2026-09-12T13:00:00Z',
    status: 'shipped',
    items: [
      { product_id: 'prod-3', quantity: 1 },
      { product_id: 'prod-6', quantity: 1 },
    ],
    shipping_address: '東京都世田谷区...',
    tracking_number: '123456789012',
    feedback_score: null,
    feedback_notes: null,
  },
  {
    id: 'samp-4',
    lead_id: 'lead-7',
    requested_at: '2026-09-01T09:00:00Z',
    status: 'feedback',
    items: [
      { product_id: 'prod-1', quantity: 1 },
      { product_id: 'prod-2', quantity: 1 },
    ],
    shipping_address: '東京都新宿区...',
    tracking_number: '987654321098',
    feedback_score: 5,
    feedback_notes: '豆乳特有の臭みがなく、非常に滑らかで美味しい。メニューへの導入を決定。',
  },
  {
    id: 'samp-5',
    lead_id: 'lead-8',
    requested_at: '2026-09-02T10:00:00Z',
    status: 'feedback',
    items: [
      { product_id: 'prod-4', quantity: 1 },
    ],
    shipping_address: '神奈川県鎌倉市...',
    tracking_number: '567890123456',
    feedback_score: 3,
    feedback_notes: '味は良いが、当店の客層には少し価格帯が高い。',
  },
  {
    id: 'samp-6',
    lead_id: 'lead-2',
    requested_at: '2026-09-20T14:00:00Z',
    status: 'delivered',
    items: [
      { product_id: 'prod-2', quantity: 1 },
      { product_id: 'prod-6', quantity: 1 },
    ],
    shipping_address: '東京都目黒区...',
    tracking_number: '345678901234',
    feedback_score: null,
    feedback_notes: null,
  },
  {
    id: 'samp-7',
    lead_id: 'lead-3',
    requested_at: '2026-09-25T09:30:00Z',
    status: 'requested',
    items: [
      { product_id: 'prod-1', quantity: 1 },
      { product_id: 'prod-3', quantity: 1 },
    ],
    shipping_address: '東京都武蔵野市...',
    tracking_number: null,
    feedback_score: null,
    feedback_notes: null,
  },
  {
    id: 'samp-8',
    lead_id: 'lead-10',
    requested_at: '2026-09-22T15:45:00Z',
    status: 'shipped',
    items: [
      { product_id: 'prod-5', quantity: 1 },
    ],
    shipping_address: '東京都品川区...',
    tracking_number: '876543210987',
    feedback_score: null,
    feedback_notes: null,
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord-1',
    lead_id: 'lead-7',
    created_at: '2026-09-15T11:00:00Z',
    status: 'delivered',
    total_amount: 32000,
    items: [
      { product_id: 'prod-1', quantity: 20, unit_price: 500 },
      { product_id: 'prod-2', quantity: 20, unit_price: 550 },
      { product_id: 'prod-3', quantity: 20, unit_price: 550 },
    ],
  },
  {
    id: 'ord-2',
    lead_id: 'lead-7',
    created_at: '2026-09-25T10:00:00Z',
    status: 'processing',
    total_amount: 16400,
    items: [
      { product_id: 'prod-4', quantity: 10, unit_price: 520 },
      { product_id: 'prod-5', quantity: 10, unit_price: 520 },
      { product_id: 'prod-6', quantity: 10, unit_price: 600 },
    ],
  },
  {
    id: 'ord-3',
    lead_id: 'lead-1',
    created_at: '2026-09-26T14:30:00Z',
    status: 'shipped',
    total_amount: 10000,
    items: [
      { product_id: 'prod-1', quantity: 20, unit_price: 500 },
    ],
  },
  {
    id: 'ord-4',
    lead_id: 'lead-6',
    created_at: '2026-09-27T09:15:00Z',
    status: 'pending',
    total_amount: 55000,
    items: [
      { product_id: 'prod-1', quantity: 50, unit_price: 500 },
      { product_id: 'prod-6', quantity: 50, unit_price: 600 },
    ],
  },
  {
    id: 'ord-5',
    lead_id: 'lead-2',
    created_at: '2026-09-28T10:00:00Z',
    status: 'pending',
    total_amount: 11000,
    items: [
      { product_id: 'prod-2', quantity: 20, unit_price: 550 },
    ],
  },
];

export const mockDmTemplates: DmTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'ヘルシー志向アピール',
    theme: 'health',
    content: 'こんにちは！{{name}}様の投稿を拝見し、素敵なメニューに惹かれてご連絡しました。私たちは「体に優しく、美味しい」をコンセプトにしたプラントベースアイス「SoyStories」を作っています。低カロリーでコレステロールゼロ、ヘルシー志向のお客様に大変好評です。もしよろしければ、無料サンプルをお試しいただけませんか？',
    created_at: '2026-08-01T00:00:00Z',
    performance_score: 85,
  },
  {
    id: 'tmpl-2',
    name: '美味しさ・品質アピール',
    theme: 'value',
    content: '突然のご連絡失礼いたします。{{name}}様のこだわりの詰まったお店作りに大変感銘を受けました。私たちが提供するプラントベースアイス「SoyStories」は、豆乳特有のクセをなくし、濃厚でなめらかな味わいを実現しています。プロのパティシエにも認められた品質で、デザートメニューをより魅力的にするお手伝いができると考えております。無料サンプルをお送りできますので、ぜひ一度ご試食ください。',
    created_at: '2026-08-05T00:00:00Z',
    performance_score: 92,
  },
  {
    id: 'tmpl-3',
    name: 'サステナビリティアピール',
    theme: 'sustainability',
    content: '初めまして！{{name}}様のアカウントを拝見し、環境や地域に配慮した取り組みに共感しご連絡いたしました。私たち「SoyStories」は、地球環境に優しいプラントベースアイスを製造しています。乳製品を使用しないことで環境負荷を減らしつつ、美味しさも妥協していません。エシカルな選択を求めるお客様への新メニューとしていかがでしょうか？無料サンプルをご用意しております。',
    created_at: '2026-08-10T00:00:00Z',
    performance_score: 78,
  },
];

export const mockDmMessages: GeneratedDmMessage[] = [
  {
    id: 'msg-1',
    lead_id: 'lead-1',
    template_id: 'tmpl-1',
    generated_content: 'こんにちは！カフェ 木漏れ日様の投稿を拝見し、素敵なメニューに惹かれてご連絡しました。ヴィーガンメニューにも力を入れられているとのことで、私たちの「体に優しく、美味しい」プラントベースアイス「SoyStories」がぴったりだと感じました。低カロリーでコレステロールゼロ、ヘルシー志向のお客様に大変好評です。もしよろしければ、無料サンプルをお試しいただけませんか？',
    status: 'sent',
    sent_at: '2026-09-02T10:15:00Z',
  },
  {
    id: 'msg-2',
    lead_id: 'lead-2',
    template_id: 'tmpl-2',
    generated_content: '突然のご連絡失礼いたします。Bistro Terre様の有機野菜を使ったこだわりのメニュー作りに大変感銘を受けました。私たちが提供するプラントベースアイス「SoyStories」は、濃厚でなめらかな味わいを実現しており、ナチュールワインとのマリアージュもお楽しみいただけます。デザートメニューをより魅力的にするお手伝いができると考えております。無料サンプルをお送りできますので、ぜひ一度ご試食ください。',
    status: 'sent',
    sent_at: '2026-09-03T11:45:00Z',
  },
  {
    id: 'msg-3',
    lead_id: 'lead-9',
    template_id: 'tmpl-2',
    generated_content: '突然のご連絡失礼いたします。Gelateria Sole様の本格的なジェラート作りに大変感銘を受けました。私たちが提供するプラントベースアイス「SoyStories」は、豆乳特有のクセをなくし、濃厚でなめらかな味わいを実現しています。新しいヴィーガンオプションとして、ラインナップに加えていただくのはいかがでしょうか。無料サンプルをお送りできますので、ぜひ一度ご試食ください。',
    status: 'approved',
    sent_at: null,
  },
  {
    id: 'msg-4',
    lead_id: 'lead-10',
    template_id: 'tmpl-1',
    generated_content: 'こんにちは！Organic Deli Marche様の投稿を拝見し、オーガニック食材へのこだわりに惹かれてご連絡しました。私たちは「体に優しく、美味しい」をコンセプトにしたプラントベースアイス「SoyStories」を作っています。イートインのデザートとして、ヘルシー志向のお客様に大変好評いただけると思います。もしよろしければ、無料サンプルをお試しいただけませんか？',
    status: 'sent',
    sent_at: '2026-09-11T12:00:00Z',
  },
  {
    id: 'msg-5',
    lead_id: 'lead-11',
    template_id: 'tmpl-2',
    generated_content: '突然のご連絡失礼いたします。Bar Nocturne様の静かで素敵な空間作りに大変感銘を受けました。私たちが提供するプラントベースアイス「SoyStories」は、濃厚でなめらかな味わいを実現しており、お酒の後の〆のアイスや、カクテルとの相性も抜群です。無料サンプルをお送りできますので、ぜひ一度ご試食ください。',
    status: 'sent',
    sent_at: '2026-09-12T15:30:00Z',
  },
  {
    id: 'msg-6',
    lead_id: 'lead-12',
    template_id: 'tmpl-2',
    generated_content: '突然のご連絡失礼いたします。Pancake House Sunny様のこだわりのパンケーキに大変惹かれました。私たちが提供するプラントベースアイス「SoyStories」は、豆乳特有のクセをなくし、濃厚でなめらかな味わいを実現しています。パンケーキのトッピングとして、より魅力的な一皿にするお手伝いができると考えております。無料サンプルをお送りできますので、ぜひ一度ご試食ください。',
    status: 'sent',
    sent_at: '2026-09-13T10:00:00Z',
  },
];

export const mockFunnelData: FunnelData = {
  total_scraped: 500,
  dm_sent: 250,
  replied: 50,
  sample_requested: 30,
  won: 10,
};

export const mockTemplatePerformance: TemplatePerformanceData[] = [
  { template_id: 'tmpl-1', template_name: 'ヘルシー志向アピール', sent_count: 100, reply_rate: 15.5, sample_rate: 8.2 },
  { template_id: 'tmpl-2', template_name: '美味しさ・品質アピール', sent_count: 120, reply_rate: 22.1, sample_rate: 14.5 },
  { template_id: 'tmpl-3', template_name: 'サステナビリティアピール', sent_count: 30, reply_rate: 10.0, sample_rate: 5.0 },
];

export const mockMonthlyCostRevenue: MonthlyCostRevenueData[] = [
  { month: '2026-04', cost: 150000, revenue: 0 },
  { month: '2026-05', cost: 180000, revenue: 50000 },
  { month: '2026-06', cost: 160000, revenue: 120000 },
  { month: '2026-07', cost: 200000, revenue: 250000 },
  { month: '2026-08', cost: 220000, revenue: 400000 },
  { month: '2026-09', cost: 250000, revenue: 650000 },
];

export const mockPacingStats: PacingStats = {
  daily_limit: 40,
  sent_today: 15,
  remaining_today: 25,
  warning_level: 'safe', // 'safe', 'warning', 'critical'
};
