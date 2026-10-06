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
  Store,
  Truck,
  ShoppingBag,
  ExternalLink,
  Share2,
  Factory,
  ShieldCheck
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
            <span>Production v2.2</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 max-w-7xl mx-auto w-full">
        
        {/* Title & Introduction */}
        <div className="text-center max-w-3xl mb-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>SoyStories クラフトアイス統合オペレーション基盤</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            利用するアプリケーションを選択
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
            受発注管理、製造・HACCP品質管理、営業促進、レシピ原価粗利、店舗経営分析の5大基幹システムをご利用いただけます。
          </p>
        </div>

        {/* New Feature Notice Banner */}
        <div className="w-full max-w-5xl mb-8 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-teal-600 text-white px-2 py-0.2 rounded-md">NEW</span>
                <strong className="text-xs font-bold text-slate-900">製造・HACCP品質管理 ＆ トレーサビリティ機能を開設しました</strong>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                仕掛品（WIP）混入ゼロ化、4大CCPデジタル検品ゲート、ロット指定FIFO出荷強制、改ざん不可監査ログに対応。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Link
              href="/manufacturing"
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-teal-700 text-white hover:bg-teal-800 transition-colors shadow-2xs"
            >
              製造管理を開く →
            </Link>
          </div>
        </div>

        {/* 5 Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          
          {/* Card 1: B2B受発注・オンライン発注 (ORDER HUB) - 新設！ */}
          <div className="bg-white rounded-2xl border-2 border-emerald-500/80 p-6 shadow-sm hover:shadow-lg hover:border-emerald-600 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ring-2 ring-emerald-500/10">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-teal-600 text-white font-bold text-[9px] px-3 py-0.5 rounded-bl-lg tracking-wider">
              NEW MODE
            </div>

            <div>
              {/* Card Header Icon & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  B2B発注・受注管理
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors">
                受発注管理 <span className="text-xs font-semibold text-slate-400 font-mono ml-1">ORDER HUB</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                取引先様向けオンライン発注URL発行、リアルタイム受注集約、ヤマト冷凍便送料自動計算、月末締め請求書を自動化。
              </p>

              {/* Feature List */}
              <div className="space-y-2 mb-6 border-t border-slate-100 pt-4 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>1L / 2L バルク（1mℓ=2円税抜）</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>ヤマト冷凍便 送料自動計算（福岡発）</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>取引先専用 発注URL発行 & 共有</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link
                href="/orders"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <span>社内受注管理を開く</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <Link 
                  href="/order" 
                  target="_blank" 
                  className="w-full text-center py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 flex items-center justify-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>お客様用 発注画面 ↗</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: 製造・HACCP品質管理 (FACTORY & TRACE) - 新設！ */}
          <div className="bg-white rounded-2xl border-2 border-teal-500/80 p-6 shadow-sm hover:shadow-lg hover:border-teal-600 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ring-2 ring-teal-500/10">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-teal-600 to-cyan-600 text-white font-bold text-[9px] px-3 py-0.5 rounded-bl-lg tracking-wider">
              NEW MODE
            </div>

            <div>
              {/* Card Header Icon & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <Factory className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md border border-teal-300">
                  製造 ＆ HACCP品質保証
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-teal-700 transition-colors">
                製造・品質管理 <span className="text-xs font-semibold text-slate-400 font-mono ml-1">FACTORY HUB</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                仕掛品（WIP）混入ゼロ、4大CCPデジタル検品ゲート、最古ロット自動推奨のFIFO強制出荷、改ざん不可監査ログ。
              </p>

              {/* Feature List */}
              <div className="space-y-2 mb-6 border-t border-slate-100 pt-4 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                  <span>仕掛品（WIP）出荷混入防止ゲート</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                  <span>HACCP準拠 4大CCPデジタル検品</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                  <span>ロット指定出荷 ＆ FIFO（先入れ先出し）強制</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link
                href="/manufacturing"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/20 active:scale-95 cursor-pointer"
              >
                <span>製造管理を開く</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="hover:text-slate-800 transition-colors">仕掛品WIP</span>
                <span>·</span>
                <span className="hover:text-slate-800 transition-colors">検品QAゲート</span>
                <span>·</span>
                <span className="hover:text-slate-800 transition-colors">トレーサビリティ</span>
              </div>
            </div>
          </div>

          {/* Card 2: 営業促進 (URERU) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
            <div>
              {/* Card Header Icon & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Rocket className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/50">
                  B2B営業促進
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-700 transition-colors">
                営業促進 <span className="text-xs font-semibold text-slate-400 font-mono ml-1">URERU</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                ヴィーガン飲食店リストを一覧表・看板で管理。DM定型文をワンクリックでコピーし、進捗をひと目で把握。
              </p>

              {/* Feature List */}
              <div className="space-y-2 mb-6 border-t border-slate-100 pt-4 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span>一覧表 ⇔ 看板 ワンタップ切替</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span>DM定型文の保存 ＆ 店名自動差し込み</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span>7段階の進捗管理・メモ・除外</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <Link
                href="/sales"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs group-hover:bg-blue-600 cursor-pointer"
              >
                <span>営業ボードを開く</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: レシピ原価管理 (COST LAB) */}
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
                  <span>100gカップ ⇔ 2Lバルク切替</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>米粉アイス10フレーバー本番レシピ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>原材料マスター（暫定フラグ機能）</span>
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

          {/* Card 4: 直営店舗 経営分析 (STORE LAB) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
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
                AirレジCSVをドロップするだけで3年半の季節トレンド・商品盛衰・成長鈍化の真因（客数・買上点数）を科学的に特定。
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
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs group-hover:bg-amber-500 group-hover:text-slate-950 cursor-pointer"
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
