'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  MapPin,
  Tag,
  CheckCircle2,
  ExternalLink,
  Flame,
  ArrowRight,
  RefreshCw,
  Zap,
  Sliders,
  Copy,
  ChevronDown,
  Building2,
  Check
} from 'lucide-react';
import { DiscoveredLead } from '@/lib/instagram-finder';
import { generateDM, getTemplates } from '@/lib/dm-templates';
import { Lead } from '@/types';

// 🎯 ワンタップで即時全国リスト生成できる高勝率ターゲットパック
const SMART_PACKS = [
  {
    id: 'ramen',
    category: 'ramen' as const,
    title: '全国ヴィーガンラーメン攻略パック',
    badge: '🔥 一番おすすめ！',
    badgeColor: 'bg-rose-500 text-white',
    icon: '🍜',
    desc: '厨房でのスイーツ自作が不可 × ラーメン後の口直し × 訪日外国人の客単価UP（+500円）に直結する最高相性ターゲット。',
    location: '全国',
    keywords: ['ヴィーガンラーメン', 'ベジラーメン', 'プラントベースラーメン'],
    reasons: ['厨房でデザート自作不可（100%外注）', 'インバウンド欧米客の客単価アップ', '熱々ラーメン後の口直し需要'],
  },
  {
    id: 'curry',
    category: 'curry' as const,
    title: '全国スパイスカレー・ヴィーガンカレー',
    badge: '🌶️ 親和性抜群',
    badgeColor: 'bg-amber-500 text-white',
    icon: '🍛',
    desc: '刺激的な辛味のあとに求める「クールダウン豆乳アイス」。エシカルカルチャーやクラフト感への理解が深いオーナー層。',
    location: '全国',
    keywords: ['スパイスカレー', 'ヴィーガンカレー'],
    reasons: ['スパイス後のクールダウン需要', 'クラフトアイスへの理解が深い', '自作リソースがなく仕入れ歓迎'],
  },
  {
    id: 'hotel',
    category: 'hotel' as const,
    title: 'インバウンド特化ホテル・高級ラウンジ',
    badge: '💎 最高単価＆即決',
    badgeColor: 'bg-blue-600 text-white',
    icon: '🏨',
    desc: '外国人宿泊客から毎日のようにヴィーガン・アレルギー対応を求められるが、厨房で少量作るのが困難な宿泊施設。',
    location: '全国',
    keywords: ['ホテル', 'ホテルラウンジ', 'ヴィーガン対応'],
    reasons: ['外国人宿泊客からのヴィーガン要望多', '個包装冷凍ストックでロスなし', '卸価格が通りやすく客単価が高い'],
  },
  {
    id: 'burger',
    category: 'burger' as const,
    title: 'ヴィーガンバーガー＆ダイナー',
    badge: '🍔 セット化◎',
    badgeColor: 'bg-emerald-600 text-white',
    icon: '🍔',
    desc: 'バーガー＋ポテト＋クラフトアイスの定番セット化。メイン特化のためスイーツは外注仕入れのニーズが極めて高い。',
    location: '全国',
    keywords: ['ヴィーガンバーガー', 'プラントベースダイナー'],
    reasons: ['バーガー×アイスの黄金組み合わせ', 'メイン特化でスイーツ外注必須', '健康志向の若年層・インバウンド集中'],
  },
  {
    id: 'cafe',
    category: 'cafe' as const,
    title: 'オーガニック＆ヴィーガンカフェ',
    badge: '☕ 定番',
    badgeColor: 'bg-teal-600 text-white',
    icon: '☕',
    desc: '植物性・グルテンフリーのメニューを展開するこだわりカフェ。アレルギー対応や新メニューとしての導入に。',
    location: '全国',
    keywords: ['ヴィーガン', 'カフェ', 'グルテンフリー'],
    reasons: ['ブランドの世界観と完全一致', '常設スイーツメニューとしての導入', '福岡・東京等を中心とした実店舗'],
  },
];

const POPULAR_LOCATIONS = [
  '全国',
  '全国主要都市',
  '東京都',
  '大阪市',
  '京都市',
  '福岡市',
  '名古屋市',
  '札幌市',
  '沖縄県'
];

const PRESET_KEYWORDS = [
  { label: '🍜 ヴィーガンラーメン', value: 'ヴィーガンラーメン' },
  { label: '🍛 スパイスカレー', value: 'スパイスカレー' },
  { label: '🏨 ホテル・ラウンジ', value: 'ホテル' },
  { label: '🍔 ヴィーガンバーガー', value: 'ヴィーガンバーガー' },
  { label: '🌱 ヴィーガン・プラントベース', value: 'ヴィーガン' },
  { label: '🌾 グルテンフリー', value: 'グルテンフリー' },
  { label: '☕ カフェ・喫茶', value: 'カフェ' },
  { label: '🍨 アイス・ジェラート', value: 'アイス' },
];

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<'smart' | 'custom'>('smart');
  const [location, setLocation] = useState('全国');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(['ヴィーガンラーメン']);
  const [limit, setLimit] = useState(15);
  const [loading, setLoading] = useState(false);
  const [activePackId, setActivePackId] = useState<string | null>(null);
  const [results, setResults] = useState<DiscoveredLead[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // 🚀 ワンタップでスマートパックを実行（極限まで簡単）
  const handleSmartPackSearch = async (pack: typeof SMART_PACKS[0]) => {
    setActivePackId(pack.id);
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/leads/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: pack.location,
          keywords: pack.keywords,
          limit: 15,
          category: pack.category,
          autoSave: true,
        }),
      });

      const data = await res.json();
      if (data.leads && data.leads.length > 0) {
        setResults(data.leads);
        showToast(`✨「${pack.title}」で ${data.leads.length} 件の有力店舗を発見＆リードDBに自動保存しました！`);
      } else {
        showToast('アカウントが見つかりませんでした。別のパックをお試しください。');
      }
    } catch (e) {
      console.error(e);
      showToast('リスト生成中にエラーが発生しました');
    } finally {
      setLoading(false);
      setActivePackId(null);
    }
  };

  // カスタム検索の実行
  const handleCustomSearch = async () => {
    if (!location.trim()) return;
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/leads/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          keywords: selectedKeywords,
          limit,
          autoSave: true,
        }),
      });

      const data = await res.json();
      if (data.leads && data.leads.length > 0) {
        setResults(data.leads);
        showToast(`✨ ${data.leads.length}件の店舗アカウントを発見＆リードDBに保存しました！`);
      } else {
        showToast('アカウントが見つかりませんでした。別のキーワードをお試しください。');
      }
    } catch (e) {
      console.error(e);
      showToast('検索中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords(prev =>
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
    );
  };

  // DM文面のワンクリックコピー
  const handleCopyDM = (lead: DiscoveredLead) => {
    const templates = getTemplates();
    const primaryTemplate = templates[0]; // 初期A（熱意・メリット訴求型）
    const dmText = generateDM(primaryTemplate, lead as Lead);
    navigator.clipboard.writeText(dmText);
    setCopiedId(lead.instagram_id || '');
    showToast(`📋 ${lead.display_name} 宛ての最適化DM文面をコピーしました！`);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-xs font-semibold tracking-wider uppercase mb-4 text-emerald-100">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            超簡単・高勝率 営業リスト生成エンジン
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            ワンタップで全国の狙い撃ちリストを生成
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            「ヴィーガンラーメン」「スパイスカレー」など、クラフトアイスの需要が最も高い高確度ターゲットをボタン1つで全国から自動収集。そのまま最適化されたDMで営業を開始できます。
          </p>
        </div>
      </div>

      {/* ── Mode Tabs ── */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setActiveTab('smart')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'smart'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          ⚡ ワンタップ・即戦力パック（おすすめ）
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'custom'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sliders className="w-4 h-4 text-gray-400" />
          🛠 詳細カスタム検索
        </button>
      </div>

      {/* ── Tab 1: Smart Packs (One-Click Simplicity) ── */}
      {activeTab === 'smart' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              狙いたいターゲットを選択してください（クリックするだけで全国から即座にリストアップ＆保存されます）
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SMART_PACKS.map(pack => {
              const isThisLoading = loading && activePackId === pack.id;
              const isRamen = pack.id === 'ramen';

              return (
                <div
                  key={pack.id}
                  className={`relative rounded-3xl p-6 border transition-all flex flex-col justify-between bg-white shadow-sm hover:shadow-md ${
                    isRamen
                      ? 'border-rose-200 ring-2 ring-rose-500/20 bg-gradient-to-b from-rose-50/30 to-white'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-3xl">{pack.icon}</span>
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${pack.badgeColor}`}>
                        {pack.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 leading-snug">
                        {pack.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        {pack.desc}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      {pack.reasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleSmartPackSearch(pack)}
                      disabled={loading}
                      className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isRamen
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      }`}
                    >
                      {isThisLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          全国の店舗をスキャン中...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          このターゲットで全国リストを即時生成
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab 2: Custom Search ── */}
      {activeTab === 'custom' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                対象エリア（「全国」指定も可能）
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="例: 全国、東京都、大阪市、福岡市..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-gray-800"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {POPULAR_LOCATIONS.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                      location === loc
                        ? 'bg-emerald-500 text-white font-bold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Limit */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                取得件数上限
              </label>
              <div className="flex gap-3">
                {[5, 10, 15, 20].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setLimit(cnt)}
                    className={`flex-1 py-3 rounded-2xl border text-sm font-bold transition-all ${
                      limit === cnt
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cnt}件
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                ※BAN防止のため、1回あたり15件前後の段階的アプローチを推奨しています。
              </p>
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              ターゲット条件（複数選択可）
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_KEYWORDS.map(item => {
                const isSelected = selectedKeywords.includes(item.value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => toggleKeyword(item.value)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs text-gray-500">
              抽出された店舗は自動で業種・高スコア判定され、Supabaseに保存されます
            </span>
            <button
              onClick={handleCustomSearch}
              disabled={loading || !location.trim()}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  探索・抽出中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  条件を指定して収集する
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Results Area ── */}
      {hasSearched && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>探索結果</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {results.length} 件発見（DB保存完了）
              </span>
            </h2>

            {results.length > 0 && (
              <div className="flex items-center gap-3">
                <Link
                  href="/leads"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all"
                >
                  <Building2 className="w-3.5 h-3.5 text-gray-500" />
                  リード一覧で確認
                </Link>
                <Link
                  href="/sales"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:shadow-lg transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  営業モードでDM送信を始める
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
              <h3 className="text-base font-bold text-gray-800">
                全国の有力店舗公式Instagramを探索＆スコアリング中...
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                店舗の最新プロフィールからスイーツ外注需要やヴィーガン適合度を解析しています
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
              <p className="text-sm font-bold text-gray-700">店舗が見つかりませんでした</p>
              <p className="text-xs text-gray-500">
                スマートパックの別の業種を選択してお試しください。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((lead, idx) => {
                const isCopied = copiedId === lead.instagram_id;
                const isHot = lead.score >= 70;

                return (
                  <div
                    key={lead.instagram_id || idx}
                    className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-gray-900 line-clamp-1">
                              {lead.display_name || lead.name}
                            </span>
                          </div>
                          <a
                            href={lead.instagram_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 mt-0.5"
                          >
                            {lead.instagram_id}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {/* Score Badge */}
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border shrink-0 ${
                            isHot
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}
                        >
                          <Flame className={`w-4 h-4 ${isHot ? 'text-rose-500' : 'text-amber-500'}`} />
                          <span className="text-xs font-extrabold">
                            {lead.score}点
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed bg-gray-50 p-3 rounded-2xl">
                        {lead.profile_text}
                      </p>

                      {/* Breakdown Reasons */}
                      {lead.scoreReasons && lead.scoreReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {lead.scoreReasons.slice(0, 3).map((reason, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium"
                            >
                              ✓ {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-bold flex items-center gap-1">
                        業種: <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">{lead.business_type}</span>
                      </span>

                      {/* Quick Copy DM Button */}
                      <button
                        onClick={() => handleCopyDM(lead)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                          isCopied
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-700 bg-white'
                        }`}
                        title="この店舗専用に最適化されたDM文面をコピー"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            コピー完了！
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600" />
                            専用DMをコピー
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 px-6 py-3.5 rounded-2xl bg-gray-900/95 backdrop-blur text-white text-xs font-bold shadow-2xl flex items-center gap-2.5 z-50 animate-fade-in border border-gray-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
