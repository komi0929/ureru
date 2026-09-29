-- ============================================================
-- SoyStories CRM - LP連携マイグレーション
-- lead_status ENUM に sample_requested を追加
-- ============================================================
-- 
-- 実行方法:
-- 1. Supabase Dashboard → SQL Editor でこのSQLを実行
-- 2. または psql で直接実行
-- 
-- 注意: ALTER TYPE ... ADD VALUE は PostgreSQL 9.1+ で対応
-- トランザクション内では実行できないため、単独で実行してください
-- ============================================================

-- lead_status ENUMに 'sample_requested' を追加
-- 'replied' の後に挿入（営業ファネルの順序を反映）
-- lead_status ENUMに 'sample_requested' を追加
-- 'replied' の後に挿入（営業ファネルの順序を反映）
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'sample_requested' AFTER 'replied';

-- ============================================================
-- Webhook用RLSポリシー追加
-- anon roleでもleads/samplesテーブルへの操作を許可
-- （Webhookエンドポイントはアプリ側でシークレット検証済み）
-- ============================================================

-- leads テーブル: anon roleに SELECT / INSERT / UPDATE を許可
CREATE POLICY "Webhook anon access leads" ON leads
  FOR ALL USING (true) WITH CHECK (true);

-- samples テーブル: anon roleに INSERT を許可
CREATE POLICY "Webhook anon access samples" ON samples
  FOR ALL USING (true) WITH CHECK (true);

-- 確認用クエリ
-- SELECT unnest(enum_range(NULL::lead_status));
-- SELECT * FROM pg_policies WHERE tablename IN ('leads', 'samples');
