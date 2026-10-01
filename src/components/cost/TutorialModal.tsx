'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Layers, 
  Boxes, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  Sparkles,
  Package,
  TrendingUp,
  Lightbulb
} from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    stepNumber: 1,
    badge: '基本操作',
    title: 'カップ ⇔ 2L業務用バルクのワンクリック切り替え',
    description: 'アイスには「個食カップ（100g）」と「業務用2L角型バルク」の2つの形態があります。原材料の配合は共通のまま、人件費・資材費・仕上がり本数を自動再計算します。',
    icon: Package,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    highlight: '画面上部の [🍨 個食カップ] / [📦 業務用2Lバルク] スイッチで、1秒で全10フレーバーの原価・粗利が切り替わります。',
    tips: [
      'カップ：65個 (100g/個)/仕込み、人件費3,000円、専用資材6点',
      'バルク：3本(6L)/仕込み、人件費3,600円、角型2L容器+一括表示ラベル',
    ]
  },
  {
    stepNumber: 2,
    badge: '原価シミュレーション',
    title: '卸売価格と粗利率のリアルタイム試算',
    description: '想定卸価格を直接入力するだけで、全10フレーバー共通の一律卸価格と連動した粗利益（円）と粗利率（%）がその場でシミュレーションできます。',
    icon: TrendingUp,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    highlight: '飲食店やカフェへの卸商談時に、いくらで卸せば目標粗利率（例: 40%以上）を確保できるかが即座にわかります。',
    tips: [
      '卸原価率の安全目安：30〜45%',
      '画面上部またはカード内で金額を入力すると、全レシピに一律反映されます。',
    ]
  },
  {
    stepNumber: 3,
    badge: 'レシピ管理',
    title: '詳細配合（g）と人件費・資材のカスタマイズ',
    description: 'レシピカード右上の「編集」から、豆乳・米粉・シロップ・ピューレなどのg単位の配合変更や、仕込みごとの人件費・仕上がり本数をいつでも微調整できます。',
    icon: Calculator,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    highlight: '配合は1回入力するだけで、カップ設定とバルク設定の両方に自動で連動適用されます。',
    tips: [
      '新しい季節限定フレーバーを追加するときは「レシピ新規登録」から',
      '既存レシピをベースにしたいときは「複製」ボタンが便利です',
    ]
  },
  {
    stepNumber: 4,
    badge: 'マスター管理',
    title: '材料・資材マスターの一括単価反映',
    description: '原材料29種および包装資材（カップ、フタ、2L容器等）の仕入れ価格はマスターで一元管理。仕入れ値が変わったときはマスターを1箇所更新するだけで、全レシピに自動反映されます。',
    icon: Boxes,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    highlight: '材料費の高騰や資材仕入れルート変更があっても、過去の計算を手作業で修正する必要はありません。',
    tips: [
      '左メニューの「材料・資材マスター」からいつでも単価編集可能',
      '1g単位・1個単位の正確なコストが自動算出されます',
    ]
  }
];

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const IconComponent = step.icon;
  const isLast = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">チュートリアルガイド</div>
              <h2 className="text-sm font-bold text-slate-900">COST LAB の使い方（4ステップ）</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar & Indicators */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2">
            <span>ステップ {currentStep + 1} / {tutorialSteps.length}</span>
            <span className="text-amber-700 font-semibold">{step.badge}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 h-1.5">
            {tutorialSteps.map((_, i) => (
              <div
                key={i}
                className={`h-full rounded-full transition-all duration-300 ${
                  i <= currentStep ? 'bg-amber-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-4 flex-1">
          {/* Main Title & Icon */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${step.color}`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Key Point Box */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 font-medium leading-relaxed">
                {step.highlight}
              </div>
            </div>
          </div>

          {/* Tips List */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              覚えておくと便利なポイント
            </div>
            {step.tips.map((tip, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentStep === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>前へ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
            >
              スキップ
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>{isLast ? 'さっそく使ってみる' : '次へ進む'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
