'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Copy,
  Check,
  Plus,
  ChevronRight,
  ExternalLink,
  Clock,
  Send,
  Zap,
  SkipForward,
  Heart,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  AtSign,
  Sparkles,
  Edit3,
  Save,
  RotateCcw,
  X,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mockLeads } from '@/lib/mock-data';
import { Lead } from '@/types';
import { scoreLead, getScoreColor, getScoreEmoji } from '@/lib/lead-scoring';

export const DEFAULT_DM_TEMPLATE = `{{name}}こんにちは！突然のご連絡失礼いたします✨
福岡でプラントベース（乳・卵不使用）のクラフトアイスを製造しているSoyStoriesと申します🌿

貴店のこだわりメニューに合う無料サンプルをお届けしたいのですが、お試しいただけないでしょうか？🍨
https://www.soystories.cafe/`;

// 定型文に変数を差し込む関数
function formatDM(template: string, lead?: { display_name?: string | null; name?: string | null }): string {
  if (!lead) return '';
  const storeName = lead.display_name || lead.name || '';
  const nameLine = storeName && !storeName.startsWith('@') ? `${storeName}様\n` : '';
  
  if (template.includes('{{name}}')) {
    return template.replace(/\{\{name\}\}/g, nameLine);
  }
  return `${nameLine}${template}`;
}

// ============================================================
// 営業モード - Instagram DMの実戦フロー
// ============================================================

type PrewarmStage = 'none' | 'day1' | 'day2' | 'day3';

interface QueueLead extends Lead {
  score: number;
  prewarm: PrewarmStage;
}

export default function SalesModePage() {
  // ── State ──
  const [queue, setQueue] = useState<QueueLead[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generatedDM, setGeneratedDM] = useState('');
  const [copied, setCopied] = useState(false);
  const [todaySent, setTodaySent] = useState(0);
  const [maxDaily, setMaxDaily] = useState(25);

  // Quick add
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickInstagramId, setQuickInstagramId] = useState('');
  const [quickStoreName, setQuickStoreName] = useState('');
  const [quickBusinessType, setQuickBusinessType] = useState('カフェ');
  const [quickProfileText, setQuickProfileText] = useState('');

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Template editing
  const [dmTemplate, setDmTemplate] = useState<string>(DEFAULT_DM_TEMPLATE);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [templateDraft, setTemplateDraft] = useState<string>(DEFAULT_DM_TEMPLATE);

  // ── Load ──
  useEffect(() => {
    loadQueue();
    // LocalStorageから定型文を読み込み
    try {
      const saved = localStorage.getItem('soystories_fixed_dm_template');
      if (saved) {
        setDmTemplate(saved);
        setTemplateDraft(saved);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Set fixed DM when current lead or template changes
  useEffect(() => {
    const lead = queue[currentIndex];
    if (lead) {
      setGeneratedDM(formatDM(dmTemplate, lead));
      setCopied(false);
    }
  }, [currentIndex, queue, dmTemplate]);

  const handleSaveTemplate = () => {
    setDmTemplate(templateDraft);
    try {
      localStorage.setItem('soystories_fixed_dm_template', templateDraft);
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    setShowEditTemplateModal(false);
    setToast('💾 定型文を保存しました！すべてのリードに反映されます');
  };

  const handleResetTemplate = () => {
    setTemplateDraft(DEFAULT_DM_TEMPLATE);
    setDmTemplate(DEFAULT_DM_TEMPLATE);
    try {
      localStorage.removeItem('soystories_fixed_dm_template');
    } catch (e) {
      console.warn('LocalStorage remove error:', e);
    }
    setShowEditTemplateModal(false);
    setToast('🔄 初期定型文に戻しました');
  };

  const loadQueue = async () => {
    let leads: Lead[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('leads')
          .select('*')
          .in('status', ['new', 'dm_drafted', 'prewarm'])
          .order('created_at', { ascending: false });
        if (data) leads = data as Lead[];
      } catch (e) { console.warn(e); }
    }
    if (leads.length === 0) {
      leads = mockLeads.filter(l => l.status === 'new' || l.status === 'dm_drafted');
    }

    const scored: QueueLead[] = leads.map(l => ({
      ...l,
      score: scoreLead(l).total,
      prewarm: ((l as any).prewarm_stage as PrewarmStage) || 'none',
    })).sort((a, b) => b.score - a.score);

    setQueue(scored);
    setCurrentIndex(0);
  };

  // ── Actions ──
  const currentLead = queue[currentIndex];
  const remaining = maxDaily - todaySent;

  const handleCopyAndSend = useCallback(async () => {
    if (!generatedDM || !currentLead) return;

    // Copy to clipboard
    await navigator.clipboard.writeText(generatedDM);
    setCopied(true);
    setToast('📋 コピーしました！Instagramに切り替えて貼り付けてください');

    // Update status
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('leads').update({ status: 'dm_sent' }).eq('id', currentLead.id);
      } catch (e) { console.warn(e); }
    }

    setTodaySent(prev => prev + 1);

    // Auto-advance after 1.5s
    setTimeout(() => {
      setCopied(false);
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 1500);
  }, [generatedDM, currentLead, currentIndex, queue.length]);

  const handleSkip = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrewarmAdvance = async () => {
    if (!currentLead) return;
    const nextStage: Record<PrewarmStage, PrewarmStage> = {
      'none': 'day1',
      'day1': 'day2',
      'day2': 'day3',
      'day3': 'day3',
    };
    const next = nextStage[currentLead.prewarm];
    const labels: Record<PrewarmStage, string> = {
      'none': '',
      'day1': '👍 いいね完了！明日コメントしましょう',
      'day2': '💬 コメント完了！明日DMを送りましょう',
      'day3': '✅ プレウォーム完了！DMを送れます',
    };

    setQueue(prev => prev.map((l, i) => i === currentIndex ? { ...l, prewarm: next } : l));
    if (labels[next]) setToast(labels[next]);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('leads').update({ prewarm_stage: next }).eq('id', currentLead.id);
      } catch (e) { console.warn(e); }
    }
  };

  const handleQuickAdd = async () => {
    if (!quickInstagramId.trim()) return;

    const id = quickInstagramId.startsWith('@') ? quickInstagramId : `@${quickInstagramId}`;
    const newLead: Partial<Lead> = {
      instagram_id: id,
      display_name: quickStoreName || id.replace('@', ''),
      business_type: quickBusinessType,
      profile_text: quickProfileText,
      status: 'new' as any,
    };

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('leads').insert([newLead]).select().single();
        if (data) {
          const scored: QueueLead = {
            ...(data as Lead),
            score: scoreLead(data as Lead).total,
            prewarm: 'none',
          };
          setQueue(prev => [scored, ...prev]);
          setCurrentIndex(0);
        }
      } catch (e) { console.warn(e); }
    } else {
      const fakeId = `lead-${Date.now()}`;
      const fakeLead: QueueLead = {
        ...newLead,
        id: fakeId,
        instagram_id: id,
        name: quickStoreName || null,
        display_name: quickStoreName || id.replace('@', ''),
        business_type: quickBusinessType,
        profile_text: quickProfileText || null,
        status: 'new' as any,
        followers_count: null,
        website_url: null,
        tags: [],
        notes: null,
        created_at: new Date().toISOString(),
        score: 30,
        prewarm: 'none',
      } as QueueLead;
      setQueue(prev => [fakeLead, ...prev]);
      setCurrentIndex(0);
    }

    setQuickInstagramId('');
    setQuickStoreName('');
    setQuickProfileText('');
    setShowQuickAdd(false);
    setToast('✅ リードを追加しました');
  };

  // ── Keyboard Shortcut ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'c' || e.key === 'C') { e.preventDefault(); handleCopyAndSend(); }
      if (e.key === 's' || e.key === 'S') { e.preventDefault(); handleSkip(); }
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); setShowQuickAdd(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleCopyAndSend]);

  // ── Pacing bar color ──
  const pacingPct = (todaySent / maxDaily) * 100;
  const pacingColor = pacingPct >= 90 ? 'bg-red-500' : pacingPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

  const prewarmLabel: Record<PrewarmStage, { text: string; color: string; icon: React.ReactNode }> = {
    'none': { text: '未開始', color: 'bg-gray-100 text-gray-500', icon: <Clock className="w-3.5 h-3.5" /> },
    'day1': { text: 'Day1 いいね済', color: 'bg-blue-100 text-blue-600', icon: <Heart className="w-3.5 h-3.5" /> },
    'day2': { text: 'Day2 コメント済', color: 'bg-purple-100 text-purple-600', icon: <MessageCircle className="w-3.5 h-3.5" /> },
    'day3': { text: 'Day3 DM可能', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            営業モード
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Instagramタブと行き来しながら、最速でDM営業を回すモード
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/discover"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            AIで店舗を自動収集
          </Link>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            クイック追加 <kbd className="ml-1 text-xs bg-emerald-700 px-1 rounded">N</kbd>
          </button>
        </div>
      </div>

      {/* ── Pacing Bar ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            本日の送信: <span className="text-lg font-bold">{todaySent}</span> / {maxDaily}件
          </span>
          <span className="text-sm text-gray-500">
            残り <span className={`font-bold ${remaining <= 5 ? 'text-red-500' : 'text-emerald-600'}`}>{remaining}</span> 件送信可能
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full transition-all duration-500 ${pacingColor}`} style={{ width: `${Math.min(pacingPct, 100)}%` }} />
        </div>
        {remaining <= 5 && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            上限に近づいています。BAN回避のため今日はここまでにしましょう。
          </p>
        )}
      </div>

      {/* ── Main Card: Current Lead ── */}
      {currentLead ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Lead info header */}
          <div className="p-6 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center text-white">
                  <AtSign className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-800">
                      {currentLead.display_name || currentLead.name || currentLead.instagram_id}
                    </h2>
                    <a
                      href={`https://www.instagram.com/${currentLead.instagram_id.replace('@', '')}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 transition"
                      title="Instagramを開く"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-sm text-gray-500">{currentLead.instagram_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Score */}
                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(currentLead.score)}`}>
                  {getScoreEmoji(currentLead.score)} {currentLead.score}点
                </span>
                {/* Business type */}
                <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                  {currentLead.business_type || '未分類'}
                </span>
                {/* Prewarm */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${prewarmLabel[currentLead.prewarm].color}`}>
                  {prewarmLabel[currentLead.prewarm].icon}
                  {prewarmLabel[currentLead.prewarm].text}
                </span>
              </div>
            </div>

            {/* Profile text */}
            {currentLead.profile_text && (
              <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
                {currentLead.profile_text}
              </p>
            )}

            {/* Prewarm action */}
            {currentLead.prewarm !== 'day3' && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handlePrewarmAdvance}
                  className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                >
                  {currentLead.prewarm === 'none' && '👍 いいね完了にする'}
                  {currentLead.prewarm === 'day1' && '💬 コメント完了にする'}
                  {currentLead.prewarm === 'day2' && '✅ プレウォーム完了'}
                </button>
                <span className="text-xs text-gray-400">
                  {currentLead.prewarm === 'none' && '→ まず投稿にいいねしましょう'}
                  {currentLead.prewarm === 'day1' && '→ 次は投稿にコメントしましょう'}
                  {currentLead.prewarm === 'day2' && '→ 明日DMを送りましょう'}
                </span>
              </div>
            )}
          </div>

          {/* Fixed DM Text */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                送信DM（固定定型文）
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-medium">{generatedDM.length}文字</span>
                <button
                  type="button"
                  onClick={() => {
                    setTemplateDraft(dmTemplate);
                    setShowEditTemplateModal(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  定型文を編集・保存
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-5 shadow-inner">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                {generatedDM}
              </pre>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleCopyAndSend}
              disabled={copied}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-bold transition ${
                copied
                  ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-6 h-6" />
                  コピー済み！Instagramへ →
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  コピー＆送信済みにする
                  <kbd className="ml-2 text-sm bg-emerald-600 px-1.5 py-0.5 rounded">C</kbd>
                </>
              )}
            </button>

            <button
              onClick={handleSkip}
              className="px-6 py-4 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              <SkipForward className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">スキップ</span>
              <kbd className="ml-1 text-xs bg-gray-200 px-1 rounded">S</kbd>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-400">キューが空です</h2>
          <p className="text-sm text-gray-400 mt-2">「クイック追加」でリードを追加してください</p>
        </div>
      )}

      {/* ── Queue preview ── */}
      {queue.length > 1 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            次のターゲット（{queue.length - currentIndex - 1}件）
          </h3>
          <div className="space-y-2">
            {queue.slice(currentIndex + 1, currentIndex + 4).map((lead, i) => (
              <button
                key={lead.id}
                onClick={() => setCurrentIndex(currentIndex + 1 + i)}
                className="w-full flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 hover:bg-gray-50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {lead.display_name || lead.name || lead.instagram_id}
                  </span>
                  <span className="text-xs text-gray-400">{lead.instagram_id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${prewarmLabel[lead.prewarm].color}`}>
                    {prewarmLabel[lead.prewarm].text}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getScoreColor(lead.score)}`}>
                    {getScoreEmoji(lead.score)} {lead.score}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Keyboard shortcuts help ── */}
      <div className="mt-8 text-center text-xs text-gray-400 flex items-center justify-center gap-6">
        <span><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">C</kbd> コピー＆送信済み</span>
        <span><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">S</kbd> スキップ</span>
        <span><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">N</kbd> クイック追加</span>
      </div>

      {/* ── Quick Add Modal ── */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowQuickAdd(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              クイック追加
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Instagram ID <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={quickInstagramId}
                  onChange={e => setQuickInstagramId(e.target.value)}
                  placeholder="@cafe_name"
                  className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">店名</label>
                <input
                  type="text"
                  value={quickStoreName}
                  onChange={e => setQuickStoreName(e.target.value)}
                  placeholder="カフェ木漏れ日"
                  className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">業種</label>
                <select
                  value={quickBusinessType}
                  onChange={e => setQuickBusinessType(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
                >
                  {['カフェ', 'レストラン', 'ベーカリー', 'ホテル', 'デリ', 'バー', 'その他'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">プロフィール（任意）</label>
                <textarea
                  value={quickProfileText}
                  onChange={e => setQuickProfileText(e.target.value)}
                  placeholder="Instagramのプロフィールをコピペ"
                  rows={2}
                  className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleQuickAdd}
                disabled={!quickInstagramId.trim()}
                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                追加してDM準備
              </button>
              <button
                onClick={() => setShowQuickAdd(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Template Modal ── */}
      {showEditTemplateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowEditTemplateModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 sm:p-8 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    固定DM定型文の編集・保存
                  </h3>
                  <p className="text-xs text-gray-400">
                    ここで保存した文章が、今後すべての見込み客への送信DMとして自動適用されます
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditTemplateModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">DM本文テンプレート:</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[11px]">
                  変数: {'{{name}}'} = 〇〇様
                </span>
              </div>
              <textarea
                value={templateDraft}
                onChange={e => setTemplateDraft(e.target.value)}
                rows={8}
                className="w-full p-4 border border-gray-200 rounded-2xl text-sm leading-relaxed text-gray-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-sans"
                placeholder="DMの定型文を入力してください..."
              />
              <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                <span>文字数: {templateDraft.length}文字</span>
                <span>※Instagramで最も読まれやすい150〜200文字以内を推奨</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleResetTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                初期文面に戻す
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditTemplateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  保存して全リードに適用
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm z-50 animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
    </div>
  );
}
