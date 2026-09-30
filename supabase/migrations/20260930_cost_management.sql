-- ============================================================
-- SoyStories レシピ原価管理システム (Cost Management Schema)
-- ============================================================

-- 1. 材料・資材マスターテーブル
CREATE TABLE IF NOT EXISTS cost_materials (
  id                  TEXT PRIMARY KEY,
  category            TEXT NOT NULL CHECK (category IN ('ingredient', 'packaging')),
  name                TEXT NOT NULL,
  supplier            TEXT,
  package_unit_name   TEXT NOT NULL,
  package_quantity    NUMERIC NOT NULL DEFAULT 1,
  unit_type           TEXT NOT NULL CHECK (unit_type IN ('g', 'ml', 'piece')),
  package_price       NUMERIC NOT NULL DEFAULT 0,
  shipping_cost       NUMERIC NOT NULL DEFAULT 0,
  total_package_cost  NUMERIC NOT NULL DEFAULT 0,
  unit_cost           NUMERIC NOT NULL DEFAULT 0,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_materials_category ON cost_materials(category);
CREATE INDEX IF NOT EXISTS idx_cost_materials_name ON cost_materials(name);

-- 2. レシピテーブル (配合・資材・人件費・価格)
CREATE TABLE IF NOT EXISTS cost_recipes (
  id                      TEXT PRIMARY KEY,
  name                    TEXT NOT NULL,
  category                TEXT,
  description             TEXT,
  target_quantity         NUMERIC NOT NULL DEFAULT 1,
  labor_cost              NUMERIC NOT NULL DEFAULT 0,
  target_retail_price     NUMERIC NOT NULL DEFAULT 0,
  target_wholesale_price  NUMERIC NOT NULL DEFAULT 0,
  ingredients             JSONB NOT NULL DEFAULT '[]'::jsonb,
  packagings              JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_recipes_category ON cost_recipes(category);
CREATE INDEX IF NOT EXISTS idx_cost_recipes_name ON cost_recipes(name);

-- RLS (Row Level Security) 設定
ALTER TABLE cost_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_recipes ENABLE ROW LEVEL SECURITY;

-- 開発・運用用: 認証済みユーザーまたはanonユーザーに全権限を許可（社内ツール向け）
CREATE POLICY "Allow public read access on cost_materials"
  ON cost_materials FOR SELECT USING (true);

CREATE POLICY "Allow public write access on cost_materials"
  ON cost_materials FOR ALL USING (true);

CREATE POLICY "Allow public read access on cost_recipes"
  ON cost_recipes FOR SELECT USING (true);

CREATE POLICY "Allow public write access on cost_recipes"
  ON cost_recipes FOR ALL USING (true);
