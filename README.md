# SoyStories 統合プラットフォーム (営業促進 URERU ＆ レシピ原価管理 COST LAB)

🌿 **SoyStories** のB2B営業支援・受発注管理と、クラフトアイスの製造原価・価格戦略を支えるオールインワン業務基盤

## 🎯 概要

TOPポータルより以下の2つの専用システムを目的に応じて並列で利用できます。

1. **営業促進 (URERU):** Instagram見込み客収集、AIパーソナライズDM送信、サンプル送付カンバン、受発注管理、請求書発行。
2. **レシピ原価管理 (COST LAB):** 材料・資材マスター、1g単価・送料込税込自動計算、レシピ配合（g/ml）・総定数管理、直接入力の人件費から1個あたりの製造原価を精密算出、卸・小売の粗利シミュレーション。

## 🛠 技術スタック

- **フロントエンド:** Next.js 16 (App Router) + React + Tailwind CSS
- **バックエンド / DB:** Supabase (PostgreSQL, Auth, Storage)
- **AI連携:** Google Gemini API
- **チャート:** Recharts
- **デプロイ:** Vercel

## 🚀 セットアップ

```bash
# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.local.example .env.local
# .env.local を編集して Supabase と Gemini の認証情報を設定

# 開発サーバーの起動
npm run dev
```

## 📁 プロジェクト構成

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # ダッシュボード
│   ├── leads/              # リード管理
│   ├── dm/                 # AI DM生成
│   ├── samples/            # サンプル管理（カンバン）
│   ├── orders/             # 受発注管理
│   ├── analytics/          # 営業分析
│   ├── settings/           # 設定
│   └── api/                # API Routes
│       ├── dm/generate/    # AI DM生成
│       ├── dm/pacing/      # BAN回避ペーシング
│       ├── leads/import/   # CSVインポート
│       └── invoices/       # 請求書PDF生成
├── components/             # 共有コンポーネント
├── lib/                    # ユーティリティ
│   ├── supabase.ts         # Supabaseクライアント
│   ├── api.ts              # CRUD操作
│   └── mock-data.ts        # モックデータ
└── types/                  # 型定義
```

## 🔑 主要機能

### 1. リード管理
- CSVインポート（Apify等のスクレイピングデータ対応）
- 8段階のステータス管理
- フィルタリング・検索・一括操作

### 2. AI DM生成
- Google Gemini APIによるパーソナライズDM自動生成
- A/Bテスト用テンプレート管理
- ワンクリックコピー＆ステータス自動更新
- **BAN回避設計:** セミオート送信、ペーシング制御、文面多様性

### 3. サンプル管理（カンバン）
- 5段階のドラッグ＆ドロップカンバンボード
- 追跡番号管理
- フィードバック回収

### 4. 受発注管理
- 発注フォーム
- 注文履歴・リピート発注
- 請求書PDF自動生成

### 5. 営業分析
- セールスファネル可視化
- DM テンプレートCVR比較
- コスト vs 売上推移
- LTV / CAC分析

## 📊 DBスキーマ

`supabase/schema.sql` を Supabase の SQL Editor で実行してテーブルを作成します。

## 🔒 Instagram BAN回避戦略

1. **送信は手動** - AI生成後、クリップボードにコピーして手動送信
2. **ペーシング制御** - 1時間5件/24時間25件の上限管理
3. **文面多様性** - テンプレートローテーションで同一文面を防止
4. **最適タイミング** - 平日10-11時、14-16時を推奨

## 📝 ライセンス

Private - SoyStories内部利用
