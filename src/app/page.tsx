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
  Info
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

        {/* 2 Main Cards (Clean & Refined like Google Workspace / Stripe) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl">
          
          {/* Card 1: 営業促進 (URERU) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
            <div>
              {/* Card Header Icon & Badge */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Rocket className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200/50">
                  営業促進ツール
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                営業促進 <span className="text-sm font-semibold text-slate-400 font-mono ml-1">URERU</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Instagramからの見込み店舗抽出から、AIによるパーソナライズDM送信、無料サンプルのカンバン配送管理、受発注・請求書発行までをワンストップで支援。
              </p>

              {/* Feature List */}
              <div className="space-y-2.5 mb-8 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>店舗自動収集 & AIパーソナライズDM生成</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>サンプル送付 5段階ドラッグ＆ドロップ カンバン</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>受発注履歴管理 ＆ 請求書PDF自動出力</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs group-hover:bg-emerald-600 cursor-pointer"
              >
                <span>営業促進ツールを開く</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>クイックアクセス:</span>
                <div className="flex items-center gap-2 font-medium">
                  <Link href="/sales" className="hover:text-slate-800 transition-colors">営業モード</Link>
                  <span>·</span>
                  <Link href="/discover" className="hover:text-slate-800 transition-colors">店舗収集</Link>
                  <span>·</span>
                  <Link href="/leads" className="hover:text-slate-800 transition-colors">リード管理</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: レシピ原価管理 (COST LAB) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
            <div>
              {/* Card Header Icon & Badge */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Calculator className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200/50">
                  レシピ原価管理
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                レシピ原価管理 <span className="text-sm font-semibold text-slate-400 font-mono ml-1">COST LAB</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                原材料（g / ml）配合、専用資材代、仕込み人件費から1個・1本あたりの製造原価を精密計算。想定卸売価格・小売価格における粗利マージンをリアルタイムシミュレーション。
              </p>

              {/* Feature List */}
              <div className="space-y-2.5 mb-8 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span className="text-slate-900">🍨 個食カップ (120ml) ⇔ 📦 2Lバルクの即座切替</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>米粉アイス本番10フレーバーの実レシピ・手書き修正反映</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>原材料29種＆包装資材マスター（税込1g・1個単価自動算出）</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <Link
                href="/cost/recipes"
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs group-hover:bg-amber-600 cursor-pointer"
              >
                <span>レシピ原価管理を開く</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>クイックアクセス:</span>
                <div className="flex items-center gap-2 font-medium">
                  <Link href="/cost/recipes" className="hover:text-slate-800 transition-colors">レシピ一覧</Link>
                  <span>·</span>
                  <Link href="/cost/materials" className="hover:text-slate-800 transition-colors">材料マスター</Link>
                  <span>·</span>
                  <Link href="/cost/summary" className="hover:text-slate-800 transition-colors">原価分析</Link>
                </div>
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
