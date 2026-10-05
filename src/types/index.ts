// ============================================================
// SoyStories CRM - Type Definitions
// Aligned with mock data and all page components
// ============================================================

// ============================================================
// Lead (見込み客)
// ============================================================

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'dm_drafted'
  | 'dm_sent'
  | 'replied'
  | 'sample_requested'
  | 'sample_shipped'
  | 'sample_sent'
  | 'negotiating'
  | 'contracted'
  | 'won'
  | 'lost';

export type LeadPriority = 'high' | 'medium' | 'low';

export interface Lead {
  id: string;
  instagram_id: string;
  instagram_url?: string | null;
  name: string | null;
  display_name?: string | null;
  profile_text: string | null;
  business_type: string | null;
  status: LeadStatus;
  priority?: LeadPriority;
  tags?: string[];
  followers_count?: number | null;
  follower_count?: number | null;
  following_count?: number | null;
  post_count?: number | null;
  website_url?: string | null;
  metadata?: Record<string, unknown>;
  notes: string | null;
  assigned_to?: string | null;
  created_at: string;
  updated_at?: string;
  genre?: string | null;
  area?: string | null;
  prefecture?: string | null;
  features?: string[];
  excluded?: boolean;
}

// ============================================================
// DM Template
// ============================================================

export type AppealType = 'health' | 'value' | 'sustainability' | 'trend' | 'general' | 'benefit' | 'empathy' | 'social_proof' | 'curiosity';

export interface DmTemplate {
  id: string;
  name: string;
  prompt_template?: string;
  content?: string;
  theme?: string;
  appeal_type?: AppealType;
  description?: string | null;
  sent_count?: number;
  reply_count?: number;
  is_active?: boolean;
  performance_score?: number;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
}

// ============================================================
// DM Message
// ============================================================

export type DmMessageStatus = 'generated' | 'approved' | 'copied' | 'sent' | 'replied';

export interface DmMessage {
  id: string;
  lead_id: string;
  template_id: string | null;
  generated_text?: string;
  generated_content?: string;
  status: DmMessageStatus;
  copied_at?: string | null;
  sent_at: string | null;
  replied_at?: string | null;
  ab_variant?: string | null;
  created_at?: string;
  // Relations
  lead?: Lead;
  template?: DmTemplate;
}

// Alias for backward compatibility
export type GeneratedDmMessage = DmMessage;

// ============================================================
// DM Pacing
// ============================================================

export interface DmSendLog {
  id: string;
  lead_id: string;
  message_id: string | null;
  sent_at: string;
}

export interface DmPacingStats {
  sent_last_hour?: number;
  sent_last_24h?: number;
  sent_last_7d?: number;
  pacing_status?: 'OK' | 'WARNING' | 'STOP';
  daily_limit?: number;
  sent_today?: number;
  remaining_today?: number;
  warning_level?: 'safe' | 'warning' | 'critical';
}

// Alias
export type PacingStats = DmPacingStats;

// ============================================================
// Product (商品)
// ============================================================

export interface Product {
  id: string;
  name: string;
  flavor: string;
  description: string | null;
  category?: string;
  price_per_unit: number;
  retail_price?: number | null;
  min_lot_size?: number;
  unit?: string;
  sku: string | null;
  image_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// Customer (顧客)
// ============================================================

export interface Customer {
  id: string;
  lead_id: string | null;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  postal_code?: string | null;
  address: string | null;
  payment_terms?: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  lead?: Lead;
}

// ============================================================
// Sample (サンプル)
// ============================================================

export type SampleStatus = 'requested' | 'packing' | 'shipped' | 'delivered' | 'feedback';

export interface SampleItem {
  product_id: string;
  quantity: number;
  flavor?: string;
}

export interface Sample {
  id: string;
  lead_id: string;
  status: SampleStatus;
  tracking_number: string | null;
  shipping_carrier?: string | null;
  shipping_cost?: number;
  shipping_address?: string;
  feedback?: string | null;
  feedback_score?: number | null;
  feedback_rating?: number | null;
  feedback_notes?: string | null;
  items: SampleItem[];
  recipient_name?: string | null;
  recipient_address?: string | null;
  notes?: string | null;
  requested_at: string;
  packed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  feedback_at?: string | null;
  created_at?: string;
  updated_at?: string;
  // Relations
  lead?: Lead;
}

// ============================================================
// Order (受発注)
// ============================================================

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  id?: string;
  order_id?: string;
  subtotal?: number;
  // Relations
  product?: Product;
}

export interface Order {
  id: string;
  customer_id?: string;
  lead_id?: string;
  order_number?: string;
  status: OrderStatus;
  total_amount: number;
  tax_amount?: number;
  shipping_fee?: number;
  grand_total?: number;
  items: OrderItem[];
  notes?: string | null;
  ordered_at?: string;
  confirmed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
  updated_at?: string;
  // Relations
  customer?: Customer;
}

// ============================================================
// Invoice (請求書)
// ============================================================

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  amount: number;
  tax_amount: number;
  total_amount: number;
  due_date: string;
  paid_at: string | null;
  pdf_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  order?: Order;
}

// ============================================================
// Dashboard / Analytics Types
// ============================================================

export interface FunnelData {
  total_scraped?: number;
  dm_sent?: number;
  replied?: number;
  sample_requested?: number;
  won?: number;
  // Array format
  stage?: string;
  count?: number;
  percentage?: number;
}

export interface TemplatePerformance {
  template_id: string;
  template_name: string;
  appeal_type?: AppealType;
  sent_count: number;
  reply_count?: number;
  reply_rate?: number;
  sample_rate?: number;
  cvr?: number;
}

// Alias
export type TemplatePerformanceData = TemplatePerformance;

export interface MonthlyCostVsRevenue {
  month: string;
  cost: number;
  revenue: number;
  sample_cost?: number;
  ltv?: number;
}

// Alias
export type MonthlyCostRevenueData = MonthlyCostVsRevenue;

// ============================================================
// UI Helper Types
// ============================================================

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: '未対応',
  contacted: 'DM送信済',
  dm_drafted: 'DMドラフト作成済',
  dm_sent: 'DM送信済',
  replied: '返信あり',
  sample_requested: 'サンプル依頼',
  sample_shipped: 'サンプル発送済',
  sample_sent: 'サンプル送付済',
  negotiating: '商談中',
  contracted: '契約済',
  won: '契約済',
  lost: '失注',
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-gray-100 text-gray-700',
  contacted: 'bg-blue-100 text-blue-700',
  dm_drafted: 'bg-blue-100 text-blue-700',
  dm_sent: 'bg-indigo-100 text-indigo-700',
  replied: 'bg-yellow-100 text-yellow-700',
  sample_requested: 'bg-cyan-100 text-cyan-700',
  sample_shipped: 'bg-orange-100 text-orange-700',
  sample_sent: 'bg-orange-100 text-orange-700',
  negotiating: 'bg-purple-100 text-purple-700',
  contracted: 'bg-green-100 text-green-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

export const SAMPLE_STATUS_LABELS: Record<SampleStatus, string> = {
  requested: 'サンプル依頼受付',
  packing: '梱包中',
  shipped: '発送済',
  delivered: '到着確認',
  feedback: 'フィードバック回収',
};

export const SAMPLE_STATUS_COLORS: Record<SampleStatus, string> = {
  requested: 'bg-blue-100 text-blue-700',
  packing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  feedback: 'bg-purple-100 text-purple-700',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '発注待ち',
  confirmed: '受注確定',
  processing: '処理中',
  preparing: '準備中',
  shipped: '発送済',
  delivered: '納品完了',
  cancelled: 'キャンセル',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  preparing: 'bg-cyan-100 text-cyan-700',
  shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};
