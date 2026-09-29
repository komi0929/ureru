#!/usr/bin/env pwsh
<#
.SYNOPSIS
  SoyStories CRM — LP連携セットアップ＆デプロイ 完全自動化スクリプト

.DESCRIPTION
  このスクリプト1つで以下を順番に実行します：
  1. Vercelログイン
  2. Supabase service role keyの設定＆DB接続テスト
  3. 環境変数のVercelへの登録
  4. Vercelにプロダクションデプロイ
  5. GASへの追記コードの表示

.USAGE
  .\deploy-lp-integration.ps1
#>

$ErrorActionPreference = "Stop"
$ProjectDir = $PSScriptRoot
Set-Location $ProjectDir

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SoyStories CRM — LP連携セットアップ                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# Step 0: 前提チェック
# ============================================================
Write-Host "📋 Step 0: 前提チェック..." -ForegroundColor Yellow

# Vercel CLI
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "  ⚠️  Vercel CLIが見つかりません。インストール中..." -ForegroundColor Yellow
    npm install -g vercel
}
Write-Host "  ✅ Vercel CLI: $(vercel --version 2>$null)" -ForegroundColor Green

# ============================================================
# Step 1: Vercelログイン
# ============================================================
Write-Host ""
Write-Host "📋 Step 1: Vercelログイン..." -ForegroundColor Yellow

$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ブラウザが開きます。Vercelにログインしてください。" -ForegroundColor Cyan
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Vercelログインに失敗しました" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✅ Vercelにログイン済み: $whoami" -ForegroundColor Green
}

# ============================================================
# Step 2: Supabase Service Role Key の設定
# ============================================================
Write-Host ""
Write-Host "📋 Step 2: Supabase Service Role Key の設定..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  以下のURLにアクセスして service_role キーをコピーしてください:" -ForegroundColor Cyan
Write-Host "  https://supabase.com/dashboard/project/bnvudcxlvldrpilhcirr/settings/api" -ForegroundColor White
Write-Host ""

$envContent = Get-Content ".env.local" -Raw
$hasServiceKey = $envContent -match "^SUPABASE_SERVICE_ROLE_KEY=(?!your)" -and $envContent -notmatch "^# SUPABASE_SERVICE_ROLE_KEY="

if ($hasServiceKey) {
    Write-Host "  ✅ Service Role Keyは既に .env.local に設定済みです" -ForegroundColor Green
} else {
    $serviceRoleKey = Read-Host "  service_role キーを貼り付けてください（スキップする場合はEnter）"
    
    if ($serviceRoleKey) {
        # .env.local に追記/更新
        $envContent = $envContent -replace "# SUPABASE_SERVICE_ROLE_KEY=.*", "SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey"
        if ($envContent -notmatch "SUPABASE_SERVICE_ROLE_KEY=") {
            $envContent += "`nSUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey`n"
        }
        Set-Content ".env.local" -Value $envContent -NoNewline
        Write-Host "  ✅ .env.local にサービスロールキーを設定しました" -ForegroundColor Green
        
        # DB接続テスト
        Write-Host "  🔍 DB接続テスト中..." -ForegroundColor Yellow
        node -e "
            const { createClient } = require('@supabase/supabase-js');
            const db = createClient('https://bnvudcxlvldrpilhcirr.supabase.co', '$serviceRoleKey', { auth: { persistSession: false } });
            db.from('leads').select('id').limit(1).then(({data, error}) => {
                if (error) { console.log('DB接続失敗: ' + error.message); process.exit(1); }
                console.log('DB接続成功！leads: ' + (data ? data.length : 0) + ' 件取得');
            });
        " 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ DB接続テスト成功" -ForegroundColor Green
        }
    } else {
        Write-Host "  ⚠️  スキップしました。Webhook用RLSポリシーの手動追加が必要です" -ForegroundColor Yellow
    }
}

# ============================================================
# Step 3: Supabase SQL マイグレーション（手動案内）
# ============================================================
Write-Host ""
Write-Host "📋 Step 3: Supabase SQLマイグレーション" -ForegroundColor Yellow
Write-Host ""
Write-Host "  以下のSQLを Supabase Dashboard > SQL Editor で実行してください:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ALTER TYPE lead_status ADD VALUE IF NOT EXISTS" -ForegroundColor White
Write-Host "    'sample_requested' AFTER 'replied';" -ForegroundColor White
Write-Host ""
Write-Host "  ※ service_role key を設定済みの場合、RLSポリシー追加は不要です" -ForegroundColor Gray
Write-Host ""
Read-Host "  実行したらEnterを押してください（後で実行する場合もEnter）"

# ============================================================
# Step 4: Vercelプロジェクトリンク＆環境変数設定
# ============================================================
Write-Host ""
Write-Host "📋 Step 4: Vercelプロジェクト設定..." -ForegroundColor Yellow

# プロジェクトリンク確認
if (-not (Test-Path ".vercel/project.json")) {
    Write-Host "  Vercelプロジェクトをリンクします..." -ForegroundColor Cyan
    vercel link
}

# 環境変数設定
Write-Host "  環境変数を設定中..." -ForegroundColor Yellow

# .env.local から値を読み取り
$envVars = @{}
Get-Content ".env.local" | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.+)$") {
        $envVars[$Matches[1].Trim()] = $Matches[2].Trim()
    }
}

$requiredVars = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "WEBHOOK_SECRET_SOYSTORIES"
)

# SUPABASE_SERVICE_ROLE_KEY があれば追加
if ($envVars.ContainsKey("SUPABASE_SERVICE_ROLE_KEY") -and $envVars["SUPABASE_SERVICE_ROLE_KEY"] -ne "your-service-role-key-here") {
    $requiredVars += "SUPABASE_SERVICE_ROLE_KEY"
}

foreach ($varName in $requiredVars) {
    $value = $envVars[$varName]
    if ($value) {
        Write-Host "  → $varName を設定中..." -ForegroundColor Gray
        # echo で値をパイプしてインタラクティブ入力を回避
        echo "$value" | vercel env add $varName production --force 2>$null
    }
}
Write-Host "  ✅ 環境変数の設定完了" -ForegroundColor Green

# ============================================================
# Step 5: デプロイ
# ============================================================
Write-Host ""
Write-Host "📋 Step 5: Vercelにデプロイ..." -ForegroundColor Yellow
Write-Host ""

vercel --prod
$deployExitCode = $LASTEXITCODE

if ($deployExitCode -eq 0) {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  🎉 デプロイ成功！                                   ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  デプロイに問題がありました（上のログを確認）" -ForegroundColor Yellow
}

# ============================================================
# Step 6: GAS追記の案内
# ============================================================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📝 最後の手順: GASへのコード追記                     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. 以下のURLでGASプロジェクトを開く:" -ForegroundColor White
Write-Host "     https://script.google.com/u/0/home/projects/1g9g8cM66ynDHRi74YIRdqM3vQWPDa0hZnH90sBypRSmREwEiPEuTcnrw/edit" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. gas-webhook-patch.js の内容をコピー＆ペースト" -ForegroundColor White
Write-Host ""
Write-Host "  3. doPost(e) 関数内に forwardToCRM(data); を1行追記" -ForegroundColor White
Write-Host ""
Write-Host "  4. CRM_WEBHOOK_URL をVercelのデプロイURLに書き換え" -ForegroundColor White
Write-Host ""
Write-Host "  5. GASを保存 → デプロイ → 新しいデプロイ" -ForegroundColor White
Write-Host ""
Write-Host "  完了！🎉" -ForegroundColor Green
Write-Host ""
