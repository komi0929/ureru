'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Rocket, 
  Calculator, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Boxes,
  HelpCircle,
  Package,
  Layers,
  Info,
  Store
} from 'lucide-react';
import TutorialModal from '@/components/cost/TutorialModal';

export default function PortalHomePage() {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white font-sans antialiased">
      
      {/* Google-like Clean Header */}
      <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            🌿
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight text-base">SoyStories</span>
            <span className="text-slate-300 font-normal">/</span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Workspace Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tutorial / Help Button */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/70 font-semibold text-xs transition-colors shadow-2xs cursor-pointer group"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>使い方ガイド</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Production v2.1</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 max-w-6xl mx-auto w-full">
        
        {/* Title & Introduction */}
        <div className="text-center max-w-2xl mb-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>SoyStories クラフトアイス統合オペレーション</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            利用するアプリケーションを選択
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-lg mx-auto">
            B2B店舗開拓を自動化する営業支援システムと、カップ・2Lバルクの製造原価と粗利を管理するレシピ原価管理システムを目的別にご利用いただけます。
          </p>
        </div>

        {/* First-time Guidance Notice */}
        <div className="w-full max-w-4xl mb-6 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-600">
              <strong className="text-slate-900">はじめてご利用の方へ：</strong>
              原価計算・レシピ確認を行う場合は右側の「COST LAB」を、新規カフェ開拓やDM営業を行う場合は左側の「URERU」をお選びください。
            </div>
          </div>
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 shrink-0 cursor-pointer"
          >
            チュートリアルを見る →
          </button>
        </div>

        {/* 3 Main Cards (Google Workspace / Stripe style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          
          {/* Card 1: 営業促進 (URERU) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
            <div>
              {/* Card Header Icon & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Rocket className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/50">
                  B2B営業促進
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors">
                営業促進 <span className="text-xs font-semibold text-slate-400 font-mono ml-1">URERU</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                見込みカフェ抽出からAIパーソナライズDM送信、無料サンプルのカンバン管理、受発注・請求書発行を自動化。
              </p>

              {/* Feature List */}
              <div className="space-y-2 mb-6 border-t border-slate-100 pt-4 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>店舗自動収集 & AI-DM生成</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>サンプル送付 5段階カンバン</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>受発注 ＆ 請求書PDF自動出力</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs group-hover:bg-emerald-600 cursor-pointer"
              >
                <span>営業促進を開く</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <Link href="/sales" className="hover:text-slate-800 transition-colors">営業モード</Link>
                <span>·</span>
                <Link href="/discover" className="hover:text-slate-800 transition-colors">店舗収集</Link>
                <span>·</span>
                <Link href="/leads" className="hover:text-slate-800 transition-colors">リード管理</Link>
              </div>
            </div>
          </div>

          {/* Card 2: レシピ原価管理 (COST LAB) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
            <div>
              {/* Card Header Icon & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Calculator className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/50">
                  製造原価管理
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-amber-700 transition-colors">
                レシピ原価管理 <span className="text-xs font-semibold text-slate-400 font-mono ml-1">COST LAB</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                原材料配合・資材・人件費から100gカップ・2Lバルクの原価を精密計算。想定卸価格を一律設定し粗利を試算。
              </p>

              {/* Feature List */}
              <div className="space-y-2 mb-6 border-t border-slate-100 pt-4 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>🍨 100gカップ ⇔ 📦 2Lバルク切替</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>米粉アイス10フレーバー本番レシピ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>原材料29種＆包装資材マスター</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <Link
                href="/cost/recipes"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs group-hover:bg-amber-600 cursor-pointer"
              >
                <span>レシピ原価管理を開く</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <Link href="/cost/recipes" className="hover:text-slate-800 transition-colors">レシピ一覧</Link>
                <span>·</span>
                <Link href="/cost/materials" className="hover:text-slate-800 transition-colors">材料マスター</Link>
                <span>·</span>
                <Link href="/cost/summary" className="hover:text-slate-800 transition-colors">原価分析</Link>
              </div>
            </div>
          </div>

          {/* Card 3: 直営店舗 経営分析 (STORE LAB) - 新設！ */}
          <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-xs hover:shadow-md hover:border-amber-400 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-400 text-slate-950 font-bold text-[9px] px-3 py-0.5 rounded-bl-lg tracking-wider">
              NEW MODE
            </div>

            <div>
              {/* Card Header Icon & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                  <Store className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                  直営店舗 経営分析
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-amber-600 transition-colors">
                店舗経営分析 <span className="text-xs font-semibold text-slate-400 font-mono ml-1">STORE LAB</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                AirレジCSVをドロップするだけで3年半の季節トレンド・商品盛衰・成長鈍化の真因（客数・買上点数・看板商品の踊り場）を科学的に特定。
              </p>

              {/* Feature List */}
              <div className="space-y-2 mb-6 border-t border-slate-100 pt-4 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>Airレジ3大CSV 自動判別インポート</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>冷菓⇔焼菓子 12ヶ月交代サイクル分析</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>成長鈍化 要因分解 ＆ 4象限診断</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <Link
                href="/store"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                <span>店舗経営分析を開く</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <Link href="/store" className="hover:text-slate-800 transition-colors">総合診断</Link>
                <span>·</span>
                <Link href="/store/seasonality" className="hover:text-slate-800 transition-colors">季節トレンド</Link>
                <span>·</span>
                <Link href="/store/import" className="hover:text-slate-800 transition-colors">CSV読込</Link>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Clean Footer */}
      <footer className="h-14 border-t border-slate-200/80 bg-white/60 px-6 sm:px-8 flex items-center justify-between text-xs text-slate-400">
        <div>
          SoyStories Management Platform &copy; {new Date().getFullYear()}
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>プラントベース クラフトアイス</span>
          <span>·</span>
          <span>B2B卸売＆原価管理基盤</span>
        </div>
      </footer>

      {/* Tutorial Modal */}
      <TutorialModal 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />
    </div>
  );
}
