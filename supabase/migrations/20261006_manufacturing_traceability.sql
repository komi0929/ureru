-- ============================================================
-- SoyStories - 製造管理 ＆ HACCP品質トレーサビリティ スキーマ
-- ============================================================

-- 1. 商品マスタ（既存の products テーブルがある場合は拡張）
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    flavor TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'ice_cream',
    price_per_unit NUMERIC(10, 2) DEFAULT 0,
    retail_price NUMERIC(10, 2),
    sku TEXT UNIQUE,
    shelf_life_days INT DEFAULT 180,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 製造ロット（Lots）
-- ステータス: WIP (仕掛品・内蓋未貼付等) / QA_Passed (検品済・出荷可能) / Quarantined (保留・隔離)
CREATE TABLE IF NOT EXISTS public.lots (
    lot_id TEXT PRIMARY KEY,                       -- 例: 'LOT-20261006-VAN-01'
    product_id TEXT NOT NULL REFERENCES public.products(id) ON UPDATE CASCADE,
    manufactured_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE NOT NULL,
    operator_name TEXT NOT NULL,                  -- 製造担当者（氏名）
    planned_quantity INT NOT NULL CHECK (planned_quantity > 0),
    actual_quantity INT NOT NULL DEFAULT 0 CHECK (actual_quantity >= 0),
    current_quantity INT NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
    status TEXT NOT NULL DEFAULT 'WIP' CHECK (status IN ('WIP', 'QA_Passed', 'Quarantined')),
    
    -- HACCP デジタル検品記録（QAゲート）
    qa_inspector TEXT,                            -- 検品責任者
    qa_inspected_at TIMESTAMPTZ,                  -- 検品実施日時
    qa_checklist JSONB DEFAULT '{}'::jsonb,       -- { seal_verified: bool, label_verified: bool, lot_print_verified: bool, temp_ccp_verified: bool, notes: text }
    
    -- 保留・隔離情報
    quarantine_reason TEXT,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_lots_product_id ON public.lots(product_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON public.lots(status);
CREATE INDEX IF NOT EXISTS idx_lots_manufactured_date ON public.lots(manufactured_date);
CREATE INDEX IF NOT EXISTS idx_lots_expiration_date ON public.lots(expiration_date);

-- 3. 在庫変動履歴（Inventory_Transactions）
-- ★ 絶対に改ざん不可（IMMUTABLE）な監査ログ
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id TEXT NOT NULL REFERENCES public.lots(lot_id) ON UPDATE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON UPDATE CASCADE,
    transaction_type TEXT NOT NULL CHECK (
        transaction_type IN (
            'MANUFACTURE_WIP',      -- 製造完了・仕掛品計上
            'QA_PASS_INITIAL',     -- HACCP検品合格・出荷可能在庫化
            'SHIPMENT',            -- 出荷引当・出庫
            'INVENTORY_ADJUSTMENT',-- 厳格な棚卸調整
            'QUARANTINE_SCRAP',    -- 隔離・廃棄
            'RETURN'               -- 返品受入
        )
    ),
    quantity_change INT NOT NULL,                 -- 変動数 (+100, -20 など)
    quantity_after INT NOT NULL,                  -- 変動後のロット在庫数
    operator_name TEXT NOT NULL,                  -- 操作実施者
    reason TEXT NOT NULL,                         -- 必須の増減理由（例: '製造完了', '定期棚卸差異', 'シール浮き廃棄'）
    notes TEXT,                                   -- 補足・備考
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL -- 記録日時（更新不可）
);

CREATE INDEX IF NOT EXISTS idx_inv_tx_lot_id ON public.inventory_transactions(lot_id);
CREATE INDEX IF NOT EXISTS idx_inv_tx_created_at ON public.inventory_transactions(created_at);

-- 4. 出荷・納品（Shipments）
CREATE TABLE IF NOT EXISTS public.shipments (
    id TEXT PRIMARY KEY,                           -- 例: 'SHP-20261006-001'
    destination_name TEXT NOT NULL,               -- 納品先店舗名（例: 'Vegan Ramen YADOKARI'）
    destination_address TEXT,
    customer_id TEXT,
    order_id TEXT,
    shipment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    carrier TEXT DEFAULT 'ヤマト運輸（クール冷凍便）',
    tracking_number TEXT,
    status TEXT NOT NULL DEFAULT 'shipped' CHECK (status IN ('draft', 'shipped', 'delivered', 'cancelled')),
    created_by TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 出荷明細（Shipment_Items: ロット紐付け必須）
CREATE TABLE IF NOT EXISTS public.shipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id TEXT NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
    lot_id TEXT NOT NULL REFERENCES public.lots(lot_id) ON UPDATE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON UPDATE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    is_fifo_violation BOOLEAN DEFAULT FALSE,
    fifo_override_reason TEXT,                    -- 先入れ先出しをあえて外した理由
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment ON public.shipment_items(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_items_lot ON public.shipment_items(lot_id);

-- ============================================================
-- セキュリティ ＆ 改ざん防止トリガー (Immutability Enforcement)
-- ============================================================

-- 在庫履歴テーブルの更新・削除を物理的に禁止する関数
CREATE OR REPLACE FUNCTION prevent_inventory_transaction_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Inventory transactions are immutable and cannot be updated or deleted for HACCP audit compliance.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_inv_tx ON public.inventory_transactions;
CREATE TRIGGER trg_immutable_inv_tx
BEFORE UPDATE OR DELETE ON public.inventory_transactions
FOR EACH ROW EXECUTE FUNCTION prevent_inventory_transaction_modification();

-- ============================================================
-- Row Level Security (RLS) 設定
-- ============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_items ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーまたはアノニマス（開発用）に全操作を許可
CREATE POLICY "Allow read on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow modify on products" ON public.products FOR ALL USING (true);

CREATE POLICY "Allow read on lots" ON public.lots FOR SELECT USING (true);
CREATE POLICY "Allow modify on lots" ON public.lots FOR ALL USING (true);

CREATE POLICY "Allow read on inventory_transactions" ON public.inventory_transactions FOR SELECT USING (true);
CREATE POLICY "Allow insert on inventory_transactions" ON public.inventory_transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read on shipments" ON public.shipments FOR SELECT USING (true);
CREATE POLICY "Allow modify on shipments" ON public.shipments FOR ALL USING (true);

CREATE POLICY "Allow read on shipment_items" ON public.shipment_items FOR SELECT USING (true);
CREATE POLICY "Allow modify on shipment_items" ON public.shipment_items FOR ALL USING (true);
