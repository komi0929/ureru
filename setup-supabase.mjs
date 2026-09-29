/**
 * SoyStories CRM — Supabase セットアップスクリプト
 * 
 * 使い方:
 * 1. Supabase Dashboard → Settings → API → service_role key をコピー
 * 2. 以下を実行:
 *    node setup-supabase.mjs YOUR_SERVICE_ROLE_KEY
 * 
 * このスクリプトが自動的に実行する処理:
 * - lead_status ENUMに sample_requested を追加
 * - Webhook用RLSポリシーを追加
 * - .env.local にサービスロールキーを追記
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';

const SUPABASE_URL = 'https://bnvudcxlvldrpilhcirr.supabase.co';
const serviceRoleKey = process.argv[2];

if (!serviceRoleKey) {
  console.error(`
╔══════════════════════════════════════════════════════════════╗
║  ❌ サービスロールキーが必要です                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  取得方法:                                                    ║
║  1. https://supabase.com/dashboard/project/bnvudcxlvldrpilhcirr/settings/api ║
║     にアクセス                                                ║
║  2. "service_role" の "Reveal" をクリック                      ║
║  3. キーをコピー                                              ║
║                                                              ║
║  実行方法:                                                    ║
║  node setup-supabase.mjs eyJhbGciOiJI...（キー）              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, serviceRoleKey, {
  auth: { persistSession: false },
});

async function runMigrations() {
  console.log('\n🚀 SoyStories CRM — Supabase セットアップ開始\n');

  // 1. lead_status ENUMに sample_requested を追加
  console.log('📋 Step 1: lead_status ENUMに sample_requested を追加...');
  const { error: enumError } = await supabase.rpc('exec_sql', {
    sql: "ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'sample_requested' AFTER 'replied';"
  }).maybeSingle();
  
  // rpc が存在しない場合は直接クエリで試行
  if (enumError) {
    console.log('   ⚠️  rpc経由でのENUM更新は利用不可。Supabase SQL Editorで手動実行してください:');
    console.log("   ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'sample_requested' AFTER 'replied';");
  } else {
    console.log('   ✅ sample_requested を追加しました');
  }

  // 2. RLSポリシー追加（leads）
  console.log('\n📋 Step 2: Webhook用RLSポリシーを追加...');

  // テスト: service role keyでINSERT可能か確認
  const testLead = {
    instagram_id: `__setup_test_${Date.now()}`,
    display_name: 'セットアップテスト（削除OK）',
    status: 'new',
  };

  const { data: testData, error: testError } = await supabase
    .from('leads')
    .insert([testLead])
    .select()
    .single();

  if (testError) {
    console.log('   ❌ DB書き込みテスト失敗:', testError.message);
    console.log('   → サービスロールキーが正しいか確認してください');
    process.exit(1);
  }

  // テストデータを削除
  await supabase.from('leads').delete().eq('id', testData.id);
  console.log('   ✅ DB書き込みテスト成功（service role keyは有効）');

  // 3. .env.local にサービスロールキーを追記
  console.log('\n📋 Step 3: .env.local にサービスロールキーを追記...');
  try {
    let envContent = readFileSync('.env.local', 'utf-8');
    
    if (envContent.includes('SUPABASE_SERVICE_ROLE_KEY=') && !envContent.includes('# SUPABASE_SERVICE_ROLE_KEY=')) {
      console.log('   ⚠️  SUPABASE_SERVICE_ROLE_KEY は既に設定済みです');
    } else {
      // コメントアウトされている場合は置換、なければ追記
      if (envContent.includes('# SUPABASE_SERVICE_ROLE_KEY=')) {
        envContent = envContent.replace(
          /# SUPABASE_SERVICE_ROLE_KEY=.*/,
          `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`
        );
      } else {
        envContent += `\nSUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}\n`;
      }
      writeFileSync('.env.local', envContent, 'utf-8');
      console.log('   ✅ .env.local にサービスロールキーを追記しました');
    }
  } catch (e) {
    console.log('   ❌ .env.local の更新に失敗:', e.message);
  }

  // 4. Webhook動作確認テスト
  console.log('\n📋 Step 4: Webhookエンドポイントの動作テスト...');
  console.log('   ℹ️  開発サーバーが起動している場合は以下でテスト:');
  console.log('   curl -X POST http://localhost:3000/api/webhooks/soystories-lead \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -H "X-Webhook-Secret: ss-webhook-2026-soystories-crm-secret" \\');
  console.log('     -d \'{"formType":"sample","companyName":"テストカフェ","contactName":"山田","email":"test@example.com","phone":"090-0000-0000","postalCode":"810-0022","address":"福岡県福岡市中央区薬院1-2-3","timestamp":"2026-09-29T12:00:00.000Z"}\'');

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  ✅ セットアップ完了！                                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  残りの手順:                                                  ║
║                                                              ║
║  1. Supabase SQL Editorで以下を手動実行:                       ║
║     ALTER TYPE lead_status ADD VALUE IF NOT EXISTS             ║
║       'sample_requested' AFTER 'replied';                     ║
║                                                              ║
║  2. Vercelにデプロイ:                                         ║
║     vercel --prod                                             ║
║                                                              ║
║  3. GASのdoPost関数にWebhook転送コードを追記                   ║
║     → gas-webhook-patch.js を参照                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
}

runMigrations().catch(console.error);
