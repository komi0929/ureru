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
  Building2,
  Sliders,
  Send,
  Plus
} from 'lucide-react';
import { DiscoveredLead } from '@/lib/instagram-finder';
import { getScoreColor, getScoreEmoji } from '@/lib/lead-scoring';

const POPULAR_LOCATIONS = [
  '福岡市',
  '福岡市中央区',
  '博多区',
  '北九州市',
  '久留米市',
  '熊本市',
  '東京都',
  '大阪市',
  '京都市'
];

const PRESET_KEYWORDS = [
  { label: '🌱 ヴィーガン・プラントベース', value: 'ヴィーガン' },
  { label: '🌾 グルテンフリー', value: 'グルテンフリー' },
  { label: '☕ カフェ・喫茶', value: 'カフェ' },
  { label: '🥗 オーガニック・自然派', value: 'オーガニック' },
  { label: '🍰 スイーツ・デザート', value: 'スイーツ' },
  { label: '🥖 ベーカリー・パン', value: 'ベーカリー' },
  { label: '🍨 アイス・ジェラート', value: 'アイス' },
];

export default function DiscoverPage() {
  const [location, setLocation] = useState('福岡市');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(['ヴィーガン', 'カフェ']);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiscoveredLead[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords(prev =>
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
    );
  };

  const handleSearch = async () => {
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
      if (data.leads) {
        setResults(data.leads);
        setToast(`✨ ${data.leads.length}件のカフェInstagramアカウントを発見・スコアリングしました！`);
      } else {
        setToast('アカウントが見つかりませんでした。別のキーワードをお試しください。');
      }
    } catch (e) {
      console.error(e);
      setToast('検索中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-xs font-semibold tracking-wider uppercase mb-4 text-emerald-100">
            <Sparkles className="w-3.5 h-3.5" />
            自動ターゲット抽出エンジン
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">
            店舗Instagram アカウント自動収集
          </h1>
          <p className="text-emerald-100 text-sm leading-relaxed">
            地域やコンセプト（ヴィーガン、グルテンフリー、カフェ等）を指定するだけで、実在するカフェ店舗の公式InstagramアカウントをWeb上から自動特定・スコアリングします。
          </p>
        </div>
      </div>

      {/* ── Search Control Panel ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location input */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              対象地域 / エリア
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="例: 福岡市、薬院、東京都..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-800"
              />
            </div>
            {/* Quick Location Pills */}
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

          {/* Limit and Options */}
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
              ※BAN防止のため、1回あたり10〜15件程度の収集・プレウォーム運用を推奨しています。
            </p>
          </div>
        </div>

        {/* Keywords / Concepts */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            ターゲット条件・キーワード（複数選択可）
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

        {/* Action Button */}
        <div className="pt-4 flex items-center justify-between border-t border-gray-100">
          <span className="text-xs text-gray-500">
            抽出されたアカウントは自動でAIスコアリングされ、営業キューに登録されます
          </span>
          <button
            onClick={handleSearch}
            disabled={loading || !location.trim()}
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                店舗アカウントを探索・抽出中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                カフェアカウントを自動収集する
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Results Area ── */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>探索結果</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {results.length} 件発見
              </span>
            </h2>

            {results.length > 0 && (
              <Link
                href="/sales"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:shadow-lg transition-all"
              >
                <Zap className="w-4 h-4" />
                営業モードでDM送信を始める
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
              <h3 className="text-base font-bold text-gray-800">
                Webから対象店舗の公式Instagramを特定中...
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                「{location}」のカフェ・自然派飲食店をスキャンし、最新プロフィールとスコアを計算しています
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
              <p className="text-sm font-bold text-gray-700">店舗が見つかりませんでした</p>
              <p className="text-xs text-gray-500">
                キーワードの組み合わせを変えるか、対象エリアを広げて再度お試しください。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((lead, idx) => (
                <div
                  key={lead.instagram_id || idx}
                  className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
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
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 shrink-0">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-extrabold text-amber-800">
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
                    <span className="text-gray-400 font-medium">
                      業種: {lead.business_type}
                    </span>
                    <Link
                      href="/sales"
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                    >
                      営業モードで確認
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 px-6 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 z-50 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
