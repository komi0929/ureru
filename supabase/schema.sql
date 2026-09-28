-- ============================================================
-- SoyStories B2B 営業支援 & 受発注管理システム
-- Supabase PostgreSQL Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE lead_status AS ENUM (
  'new',           -- 未対応
  'dm_drafted',    -- DMドラフト作成済
  'dm_sent',       -- DM送信済
  'replied',       -- 返信あり
  'sample_sent',   -- サンプル送付済
  'negotiating',   -- 商談中
  'contracted',    -- 契約済
  'lost'           -- 失注
);

CREATE TYPE sample_status AS ENUM (
  'requested',     -- サンプル依頼受付
  'packing',       -- 梱包中
  'shipped',       -- 発送済
  'delivered',     -- 到着確認
  'feedback'       -- フィードバック回収
);

CREATE TYPE order_status AS ENUM (
  'pending',       -- 発注待ち
  'confirmed',     -- 受注確定
  'preparing',     -- 準備中
  'shipped',       -- 発送済
  'delivered',     -- 納品完了
  'cancelled'      -- キャンセル
);

CREATE TYPE invoice_status AS ENUM (
  'draft',         -- 下書き
  'sent',          -- 送付済
  'paid',          -- 入金済
  'overdue'        -- 支払い遅延
);

CREATE TYPE dm_message_status AS ENUM (
  'generated',     -- 生成済み（未コピー）
  'copied',        -- コピー済み
  'sent',          -- 送信済み
  'replied'        -- 返信あり
);

-- ============================================================
-- 1. LEADS (見込み客)
-- ============================================================

CREATE TABLE leads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instagram_id  TEXT UNIQUE NOT NULL,
  instagram_url TEXT,
  display_name  TEXT,
  profile_text  TEXT,
  business_type TEXT,                          -- カフェ、レストラン、ベーカリー等
  status        lead_status NOT NULL DEFAULT 'new',
  tags          TEXT[] DEFAULT '{}',            -- カスタムタグ
  follower_count INTEGER,
  post_count     INTEGER,
  metadata      JSONB DEFAULT '{}',            -- 追加情報（投稿傾向、エンゲージメント率等）
  notes         TEXT,
  assigned_to   UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_business_type ON leads(business_type);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_tags ON leads USING GIN(tags);

-- ============================================================
-- 2. DM_TEMPLATES (DMテンプレート / A/Bテスト)
-- ============================================================

CREATE TABLE dm_templates (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,                -- テンプレート名 (例: "健康訴求A")
  prompt_template  TEXT NOT NULL,                -- AIへのプロンプトテンプレート
  appeal_type      TEXT NOT NULL DEFAULT 'general', -- 訴求タイプ (health, value, trend, sustainability)
  description      TEXT,                         -- テンプレートの説明
  sent_count       INTEGER NOT NULL DEFAULT 0,   -- 送信数
  reply_count      INTEGER NOT NULL DEFAULT 0,   -- 返信数
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. DM_MESSAGES (生成DM文面)
-- ============================================================

CREATE TABLE dm_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  template_id     UUID REFERENCES dm_templates(id) ON DELETE SET NULL,
  generated_text  TEXT NOT NULL,                 -- AI生成された文面
  status          dm_message_status NOT NULL DEFAULT 'generated',
  copied_at       TIMESTAMPTZ,                   -- コピーされた日時
  sent_at         TIMESTAMPTZ,                   -- 送信マーク日時
  replied_at      TIMESTAMPTZ,                   -- 返信受信日時
  ab_variant      TEXT,                          -- A/Bテストバリアント識別子
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dm_messages_lead ON dm_messages(lead_id);
CREATE INDEX idx_dm_messages_template ON dm_messages(template_id);
CREATE INDEX idx_dm_messages_status ON dm_messages(status);
CREATE INDEX idx_dm_messages_sent_at ON dm_messages(sent_at DESC);

-- ============================================================
-- 4. DM_SEND_LOG (送信ペーシング管理)
-- ============================================================

CREATE TABLE dm_send_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  message_id  UUID REFERENCES dm_messages(id) ON DELETE SET NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dm_send_log_sent_at ON dm_send_log(sent_at DESC);

-- ============================================================
-- 5. PRODUCTS (商品マスタ)
-- ============================================================

CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  flavor        TEXT NOT NULL,
  description   TEXT,
  category      TEXT DEFAULT 'ice_cream',        -- ice_cream, topping, etc.
  price_per_unit INTEGER NOT NULL,               -- 1個あたり卸価格（円）
  retail_price   INTEGER,                        -- 参考小売価格（円）
  min_lot_size  INTEGER NOT NULL DEFAULT 1,      -- 最小ロット数
  unit          TEXT NOT NULL DEFAULT '個',       -- 単位
  sku           TEXT UNIQUE,                     -- SKUコード
  image_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. CUSTOMERS (契約済み顧客)
-- ============================================================

CREATE TABLE customers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id        UUID UNIQUE REFERENCES leads(id) ON DELETE SET NULL,
  company_name   TEXT NOT NULL,
  contact_name   TEXT,
  email          TEXT,
  phone          TEXT,
  postal_code    TEXT,
  address        TEXT,
  payment_terms  TEXT DEFAULT '月末締め翌月末払い',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_company ON customers(company_name);

-- ============================================================
-- 7. SAMPLES (サンプル送付管理)
-- ============================================================

CREATE TABLE samples (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id          UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status           sample_status NOT NULL DEFAULT 'requested',
  tracking_number  TEXT,
  shipping_carrier TEXT,                          -- 配送業者
  shipping_cost    INTEGER DEFAULT 0,             -- 送料（円）
  feedback         TEXT,
  feedback_rating  INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  items            JSONB DEFAULT '[]',            -- サンプル内容 [{product_id, quantity, flavor}]
  recipient_name   TEXT,
  recipient_address TEXT,
  notes            TEXT,
  requested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  packed_at        TIMESTAMPTZ,
  shipped_at       TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  feedback_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_samples_lead ON samples(lead_id);
CREATE INDEX idx_samples_status ON samples(status);

-- ============================================================
-- 8. ORDERS (受発注)
-- ============================================================

CREATE TABLE orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  order_number  TEXT UNIQUE NOT NULL,            -- SS-2026-0001 形式
  status        order_status NOT NULL DEFAULT 'pending',
  total_amount  INTEGER NOT NULL DEFAULT 0,      -- 合計金額（税抜）
  tax_amount    INTEGER NOT NULL DEFAULT 0,      -- 消費税
  shipping_fee  INTEGER NOT NULL DEFAULT 0,      -- 送料
  grand_total   INTEGER NOT NULL DEFAULT 0,      -- 合計（税込+送料）
  notes         TEXT,
  ordered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at  TIMESTAMPTZ,
  shipped_at    TIMESTAMPTZ,
  delivered_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_ordered_at ON orders(ordered_at DESC);

-- ============================================================
-- 9. ORDER_ITEMS (注文明細)
-- ============================================================

CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  INTEGER NOT NULL,                  -- 注文時の単価
  subtotal    INTEGER NOT NULL                   -- quantity * unit_price
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- 10. INVOICES (請求書)
-- ============================================================

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number  TEXT UNIQUE NOT NULL,           -- INV-2026-0001 形式
  status          invoice_status NOT NULL DEFAULT 'draft',
  amount          INTEGER NOT NULL,               -- 請求金額
  tax_amount      INTEGER NOT NULL DEFAULT 0,
  total_amount    INTEGER NOT NULL,               -- 税込合計
  due_date        DATE NOT NULL,
  paid_at         TIMESTAMPTZ,
  pdf_url         TEXT,                           -- Supabase Storage URL
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dm_templates_updated_at
  BEFORE UPDATE ON dm_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_samples_updated_at
  BEFORE UPDATE ON samples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 注文番号自動生成関数
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  seq_num INTEGER;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 'SS-' || year_str || '-(\d+)') AS INTEGER)
  ), 0) + 1 INTO seq_num
  FROM orders
  WHERE order_number LIKE 'SS-' || year_str || '-%';
  
  NEW.order_number := 'SS-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- 請求書番号自動生成関数
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  seq_num INTEGER;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-' || year_str || '-(\d+)') AS INTEGER)
  ), 0) + 1 INTO seq_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_str || '-%';
  
  NEW.invoice_number := 'INV-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION generate_invoice_number();

-- DM送信時にリードステータスを自動更新
CREATE OR REPLACE FUNCTION sync_lead_status_on_dm_copy()
RETURNS TRIGGER AS $$
BEGIN
  -- コピーされたら「DM送信済」に更新
  IF NEW.status = 'copied' AND OLD.status = 'generated' THEN
    UPDATE leads SET status = 'dm_sent' WHERE id = NEW.lead_id AND status IN ('new', 'dm_drafted');
  END IF;
  -- 返信があったらリードも「返信あり」に更新
  IF NEW.status = 'replied' AND OLD.status != 'replied' THEN
    UPDATE leads SET status = 'replied' WHERE id = NEW.lead_id AND status = 'dm_sent';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_lead_status_trigger
  AFTER UPDATE ON dm_messages
  FOR EACH ROW EXECUTE FUNCTION sync_lead_status_on_dm_copy();

-- DM送信数・返信数をテンプレートに集計する関数
CREATE OR REPLACE FUNCTION update_template_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE dm_templates SET
      sent_count = (SELECT COUNT(*) FROM dm_messages WHERE template_id = NEW.template_id AND status IN ('copied', 'sent', 'replied')),
      reply_count = (SELECT COUNT(*) FROM dm_messages WHERE template_id = NEW.template_id AND status = 'replied')
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_stats_trigger
  AFTER UPDATE ON dm_messages
  FOR EACH ROW EXECUTE FUNCTION update_template_stats();

-- DM送信ペーシングチェック用ビュー
CREATE OR REPLACE VIEW dm_pacing_stats AS
SELECT
  COUNT(*) FILTER (WHERE sent_at > NOW() - INTERVAL '1 hour') AS sent_last_hour,
  COUNT(*) FILTER (WHERE sent_at > NOW() - INTERVAL '24 hours') AS sent_last_24h,
  COUNT(*) FILTER (WHERE sent_at > NOW() - INTERVAL '7 days') AS sent_last_7d,
  CASE
    WHEN COUNT(*) FILTER (WHERE sent_at > NOW() - INTERVAL '1 hour') >= 5 THEN 'STOP'
    WHEN COUNT(*) FILTER (WHERE sent_at > NOW() - INTERVAL '24 hours') >= 25 THEN 'WARNING'
    ELSE 'OK'
  END AS pacing_status
FROM dm_send_log;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_send_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーに全操作を許可（社内ツールのため）
CREATE POLICY "Authenticated users full access" ON leads
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON dm_templates
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON dm_messages
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON dm_send_log
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON products
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON customers
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON samples
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON orders
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON invoices
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA: 商品マスタ
-- ============================================================

INSERT INTO products (name, flavor, description, category, price_per_unit, retail_price, min_lot_size, unit, sku) VALUES
  ('プラントベースアイス', 'バニラ', '豆乳ベースのクリーミーバニラアイス。グルテンフリー対応。', 'ice_cream', 350, 550, 10, '個', 'SS-ICE-VAN-001'),
  ('プラントベースアイス', 'チョコレート', '有機カカオ使用のリッチなチョコアイス。ヴィーガン認証取得。', 'ice_cream', 380, 580, 10, '個', 'SS-ICE-CHO-001'),
  ('プラントベースアイス', '抹茶', '京都産抹茶を贅沢に使用。ほろ苦い大人のアイス。', 'ice_cream', 400, 620, 10, '個', 'SS-ICE-MAT-001'),
  ('プラントベースアイス', 'ストロベリー', '国産いちご果肉入り。鮮やかな色合いが映える一品。', 'ice_cream', 380, 580, 10, '個', 'SS-ICE-STR-001'),
  ('プラントベースアイス', 'マンゴー', 'アルフォンソマンゴーのトロピカルなフレーバー。', 'ice_cream', 400, 620, 10, '個', 'SS-ICE-MAN-001'),
  ('プラントベースアイス', 'ピスタチオ', '濃厚ピスタチオペーストを使用した贅沢フレーバー。', 'ice_cream', 420, 650, 10, '個', 'SS-ICE-PIS-001');

-- DMテンプレートのシードデータ
INSERT INTO dm_templates (name, prompt_template, appeal_type, description) VALUES
  (
    '健康・ヘルシー訴求',
    E'以下のカフェ/レストランのInstagramプロフィールを分析し、SoyStoriesのプラントベースアイスを紹介するDMを生成してください。\n\n【ターゲット情報】\nプロフィール: {{profile_text}}\n業種: {{business_type}}\n\n【SoyStoriesの強み】\n- 100%プラントベース（豆乳ベース）\n- 完全グルテンフリー\n- ヴィーガン認証取得\n- 健康志向のお客様に大人気\n\n【指示】\n- 相手のお店の特徴に合わせてパーソナライズ\n- 健康・ヘルシーな側面を強調\n- サイトURL https://www.soystories.cafe/ を自然に組み込む\n- 150-200文字程度で簡潔に\n- 営業感を出さず、自然な提案として\n- 最後にサンプル送付を提案',
    'health',
    '健康志向やヘルシーメニューを打ち出しているお店向け'
  ),
  (
    'カフェ付加価値訴求',
    E'以下のカフェ/レストランのInstagramプロフィールを分析し、SoyStoriesのプラントベースアイスを紹介するDMを生成してください。\n\n【ターゲット情報】\nプロフィール: {{profile_text}}\n業種: {{business_type}}\n\n【SoyStoriesの強み】\n- 他店との差別化メニューとして最適\n- SNS映えするプレゼンテーション\n- アレルギー対応でお客様の幅が広がる\n- 低ロットから仕入れ可能\n\n【指示】\n- 相手のお店の特徴に合わせてパーソナライズ\n- 付加価値向上・差別化の観点を強調\n- サイトURL https://www.soystories.cafe/ を自然に組み込む\n- 150-200文字程度で簡潔に\n- 営業感を出さず、ビジネスチャンスとして提案\n- 最後にサンプル送付を提案',
    'value',
    '差別化・付加価値向上を求めているカフェ向け'
  ),
  (
    'サステナビリティ訴求',
    E'以下のカフェ/レストランのInstagramプロフィールを分析し、SoyStoriesのプラントベースアイスを紹介するDMを生成してください。\n\n【ターゲット情報】\nプロフィール: {{profile_text}}\n業種: {{business_type}}\n\n【SoyStoriesの強み】\n- 環境負荷の低いプラントベース製品\n- サステナブルな食の選択肢\n- SDGs対応メニューとして訴求可能\n- エシカル消費トレンドに対応\n\n【指示】\n- 相手のお店のサステナビリティへの取り組みに触れる\n- 環境・社会貢献の観点を強調\n- サイトURL https://www.soystories.cafe/ を自然に組み込む\n- 150-200文字程度で簡潔に\n- 共感ベースのアプローチで\n- 最後にサンプル送付を提案',
    'sustainability',
    'サステナビリティやエシカル志向のお店向け'
  );
