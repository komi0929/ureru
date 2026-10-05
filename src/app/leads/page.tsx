'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Filter, MoreHorizontal, 
  ChevronDown, Check, X, Mail, ExternalLink,
  Trash2, RotateCcw, Copy, CheckCheck, EyeOff,
  Sparkles, Building2, MapPin, Tag, Utensils, Send, ArrowRight
} from 'lucide-react';
import { Lead, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LeadStatus } from '@/types';
import { mockLeads } from '@/lib/mock-data';

// 業種・ジャンル定義
const GENRE_TABS = [
  { key: 'all', label: 'すべて', icon: '🌟' },
  { key: 'ラーメン', label: 'ラーメン', icon: '🍜' },
  { key: 'バーガー', label: 'バーガー', icon: '🍔' },
  { key: 'カフェ', label: 'カフェ', icon: '☕' },
  { key: 'カレー', label: 'カレー', icon: '🍛' },
  { key: 'レストラン', label: 'レストラン', icon: '🍽️' },
  { key: 'ホテル', label: 'ホテル', icon: '🏨' },
] as const;

// 都道府県リスト
const PREFECTURE_OPTIONS = [
  'すべての地域',
  '福岡県',
  '東京都',
  '大阪府',
  '京都府',
  '沖縄県',
  '北海道',
  '神奈川県',
  '愛知県',
  '広島県',
  '大分県',
];

const STORAGE_KEY_EXCLUDED = 'soystories_excluded_restaurant_ids_v1';
const STORAGE_KEY_STATUSES = 'soystories_restaurant_statuses_v1';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [customStatuses, setCustomStatuses] = useState<Record<string, LeadStatus>>({});

  // フィルター・表示状態
  const [activeTab, setActiveTab] = useState<'active' | 'excluded'>('active');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('すべての地域');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // トースト＆コピー通知
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recentlyExcludedLead, setRecentlyExcludedLead] = useState<Lead | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 手動追加モーダル
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({
    instagram_id: '',
    name: '',
    genre: 'ラーメン',
    area: '',
    prefecture: '福岡県',
    profile_text: '',
    features: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 初回データ読み込み & localStorage同期
  useEffect(() => {
    try {
      const savedExcluded = localStorage.getItem(STORAGE_KEY_EXCLUDED);
      if (savedExcluded) {
        setExcludedIds(JSON.parse(savedExcluded));
      }
      const savedStatuses = localStorage.getItem(STORAGE_KEY_STATUSES);
      if (savedStatuses) {
        setCustomStatuses(JSON.parse(savedStatuses));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    loadInitialLeads();
  }, []);

  const loadInitialLeads = async () => {
    setLoading(true);
    let combinedLeads = [...mockLeads]; // 101店舗の本物マスター（全ジャンル網羅）

    try {
      const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error && data.length > 0) {
          const dbLeadsMap = new Map<string, Lead>();
          const customDbLeads: Lead[] = [];

          data.forEach((item: Lead) => {
            if (item.instagram_id) {
              dbLeadsMap.set(item.instagram_id.toLowerCase(), item);
            }
          });

          // マスター店舗にDB側の更新情報（ステータス等）をマージ
          combinedLeads = mockLeads.map(masterLead => {
            const dbMatch = dbLeadsMap.get(masterLead.instagram_id.toLowerCase());
            if (dbMatch) {
              return {
                ...masterLead,
                status: dbMatch.status || masterLead.status,
                notes: dbMatch.notes || masterLead.notes,
              };
            }
            return masterLead;
          });

          // DBにのみ存在する手動追加店舗があればそれも含める
          const masterIgIds = new Set(mockLeads.map(m => m.instagram_id.toLowerCase()));
          data.forEach((item: Lead) => {
            if (item.instagram_id && !masterIgIds.has(item.instagram_id.toLowerCase())) {
              customDbLeads.push(item);
            }
          });

          combinedLeads = [...customDbLeads, ...combinedLeads];
        }
      }
    } catch (e) {
      console.warn('Supabase not available, using master list');
    }

    setLeads(combinedLeads);
    setLoading(false);
  };

  // 除外IDの保存
  const saveExcludedIds = (newIds: string[]) => {
    setExcludedIds(newIds);
    try {
      localStorage.setItem(STORAGE_KEY_EXCLUDED, JSON.stringify(newIds));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  // ステータスの保存
  const saveStatus = (id: string, status: LeadStatus) => {
    const updated = { ...customStatuses, [id]: status };
    setCustomStatuses(updated);
    try {
      localStorage.setItem(STORAGE_KEY_STATUSES, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  // 単一店舗の除外
  const handleExcludeLead = (lead: Lead) => {
    if (excludedIds.includes(lead.id)) return;
    const next = [...excludedIds, lead.id];
    saveExcludedIds(next);
    setSelectedLeads(prev => prev.filter(id => id !== lead.id));
    setRecentlyExcludedLead(lead);
    showToast(`🚫「${lead.name || lead.display_name}」を除外リストに移動しました`);
  };

  // 除外の取り消し（元に戻す）
  const handleUndoExclude = () => {
    if (!recentlyExcludedLead) return;
    const next = excludedIds.filter(id => id !== recentlyExcludedLead.id);
    saveExcludedIds(next);
    setRecentlyExcludedLead(null);
    showToast(`↩「${recentlyExcludedLead.name || recentlyExcludedLead.display_name}」を復元しました`);
  };

  // 除外済み店舗の復元
  const handleRestoreLead = (lead: Lead) => {
    const next = excludedIds.filter(id => id !== lead.id);
    saveExcludedIds(next);
    showToast(`↩「${lead.name || lead.display_name}」を営業対象リストに復元しました`);
  };

  // 一括除外
  const handleBulkExclude = () => {
    if (selectedLeads.length === 0) return;
    const next = Array.from(new Set([...excludedIds, ...selectedLeads]));
    saveExcludedIds(next);
    const count = selectedLeads.length;
    setSelectedLeads([]);
    showToast(`🚫 選択した ${count} 件を除外リストに移動しました`);
  };

  // 除外済みの全件復元
  const handleRestoreAll = () => {
    if (excludedIds.length === 0) return;
    saveExcludedIds([]);
    showToast(`✨ 除外リストの全件を復元しました`);
  };

  // DM文面の生成とワンタップコピー
  const handleCopyDM = async (lead: Lead) => {
    const storeName = lead.name || lead.display_name || '店舗';
    const message = `${storeName}様
はじめまして！突然のご連絡失礼いたします。
福岡で植物性（乳・卵不使用）のクラフト大豆アイスクリームを製造しているSoyStories（ソイストーリーズ）と申します🍨

貴店のInstagramを拝見し、ヴィーガン・プラントベースへの素晴らしいこだわりに強く共感し、ご連絡いたしました。

現在、こだわりの飲食店様向けに【無料お試しサンプル（店舗様宛）】をクール便にてお届けしております。
貴店のデザートメニューや食後のヴィーガンスイーツとしてお役に立てれば幸いです。

もしご興味がございましたら、ぜひ簡単なご返信をいただけますと幸いです✨
公式ブランドサイト: https://www.soystories.cafe/`;

    try {
      await navigator.clipboard.writeText(message);
      setCopiedId(lead.id);
      showToast(`📋「${storeName}」様宛てのDM文面をコピーしました！`);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (e) {
      console.error(e);
      showToast('コピーに失敗しました');
    }
  };

  // 手動店舗追加
  const handleAddCustomLead = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newLead.instagram_id.startsWith('@') ? newLead.instagram_id : `@${newLead.instagram_id}`;
    const newEntry: Lead = {
      id: `custom-${Date.now()}`,
      instagram_id: cleanId,
      instagram_url: `https://www.instagram.com/${cleanId.replace('@', '')}`,
      name: newLead.name,
      display_name: newLead.name,
      business_type: newLead.genre,
      genre: newLead.genre,
      area: newLead.area || newLead.prefecture,
      prefecture: newLead.prefecture,
      profile_text: newLead.profile_text,
      features: newLead.features ? newLead.features.split(',').map(s => s.trim()) : [],
      status: 'new',
      notes: `${newLead.genre}（${newLead.area}）`,
      tags: [newLead.prefecture, newLead.genre],
      created_at: new Date().toISOString(),
    };

    setLeads(prev => [newEntry, ...prev]);
    setShowAddModal(false);
    setNewLead({
      instagram_id: '',
      name: '',
      genre: 'ラーメン',
      area: '',
      prefecture: '福岡県',
      profile_text: '',
      features: '',
    });
    showToast(`🎉「${newEntry.name}」を営業対象リストに追加しました`);
  };

  // ステータス更新（単一）
  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    saveStatus(id, newStatus);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  // 現在のリード一覧（カスタムステータス反映済み）
  const processedLeads = useMemo(() => {
    return leads.map(lead => {
      const currentStatus = customStatuses[lead.id] || lead.status;
      const genre = lead.genre || lead.business_type || 'ラーメン';
      const prefecture = lead.prefecture || (lead.tags?.find(t => t.endsWith('県') || t.endsWith('都') || t.endsWith('府')) || 'その他');
      return {
        ...lead,
        status: currentStatus,
        genre,
        prefecture,
      };
    });
  }, [leads, customStatuses]);

  // 各ジャンルごとの有効件数カウント
  const genreCounts = useMemo(() => {
    const activeOnly = processedLeads.filter(l => !excludedIds.includes(l.id));
    const counts: Record<string, number> = { all: activeOnly.length };
    GENRE_TABS.forEach(tab => {
      if (tab.key !== 'all') {
        counts[tab.key] = activeOnly.filter(l => l.genre === tab.key).length;
      }
    });
    return counts;
  }, [processedLeads, excludedIds]);

  // 表示対象リードのフィルタリング
  const displayedLeads = useMemo(() => {
    // 1. 除外タブか営業対象タブか
    let result = processedLeads.filter(l => {
      const isExcluded = excludedIds.includes(l.id);
      return activeTab === 'excluded' ? isExcluded : !isExcluded;
    });

    // 2. ジャンル絞り込み
    if (selectedGenre !== 'all') {
      result = result.filter(l => l.genre === selectedGenre);
    }

    // 3. 都道府県絞り込み
    if (selectedPrefecture !== 'すべての地域') {
      result = result.filter(l => l.prefecture === selectedPrefecture);
    }

    // 4. ステータス絞り込み
    if (statusFilter !== 'all') {
      result = result.filter(l => l.status === statusFilter);
    }

    // 5. 検索クエリ
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => {
        return (
          l.name?.toLowerCase().includes(q) ||
          l.display_name?.toLowerCase().includes(q) ||
          l.instagram_id.toLowerCase().includes(q) ||
          l.area?.toLowerCase().includes(q) ||
          l.prefecture?.toLowerCase().includes(q) ||
          l.profile_text?.toLowerCase().includes(q) ||
          l.features?.some(f => f.toLowerCase().includes(q))
        );
      });
    }

    return result;
  }, [processedLeads, excludedIds, activeTab, selectedGenre, selectedPrefecture, statusFilter, searchQuery]);

  // 選択チェックボックス制御
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeads(displayedLeads.map(l => l.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* ── 最上部ヘッダー ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌱</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                全国ヴィーガン飲食店 営業リスト
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                全国の実在する厳選ヴィーガン店舗（全{leads.length}店舗）をジャンル別に一覧化。不要な店舗はワンタップで除外できます。
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/sales"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-sm transition-all transform active:scale-95"
          >
            <Send size={16} />
            <span>営業DMモードを開始</span>
            <ArrowRight size={14} className="opacity-70" />
          </Link>

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-2xl font-semibold text-sm transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>店舗を追加</span>
          </button>
        </div>
      </div>

      {/* ── メインタブ切替（営業対象 vs 除外済み） ── */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('active'); setSelectedLeads([]); }}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🎯 営業対象リスト</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {leads.length - excludedIds.length}件
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('excluded'); setSelectedLeads([]); }}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'excluded'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <EyeOff size={15} />
            <span>🚫 除外中リスト</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'excluded' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {excludedIds.length}件
            </span>
          </button>
        </div>

        {activeTab === 'excluded' && excludedIds.length > 0 && (
          <button
            onClick={handleRestoreAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            すべての除外を解除して元に戻す
          </button>
        )}
      </div>

      {/* ── ジャンルフィルタータブ ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {GENRE_TABS.map(tab => {
          const isSelected = selectedGenre === tab.key;
          const count = activeTab === 'active' ? (genreCounts[tab.key] ?? 0) : undefined;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedGenre(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {count !== undefined && (
                <span className={`px-2 py-0.2 rounded-full text-xs ${
                  isSelected ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 絞り込み ＆ 検索バー ── */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 都道府県セレクター */}
          <div className="relative">
            <select
              value={selectedPrefecture}
              onChange={(e) => setSelectedPrefecture(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-700 outline-none hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {PREFECTURE_OPTIONS.map(pref => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* ステータスセレクター */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-700 outline-none hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <option value="all">すべてのステータス</option>
              {Object.entries(LEAD_STATUS_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {(selectedGenre !== 'all' || selectedPrefecture !== 'すべての地域' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedGenre('all');
                setSelectedPrefecture('すべての地域');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline px-2 py-1"
            >
              条件をリセット
            </button>
          )}
        </div>

        {/* 検索入力ボックス */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="店名、@ID、エリア、特徴で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-shadow"
          />
        </div>
      </div>

      {/* ── 一括操作バー（チェック時） ── */}
      {selectedLeads.length > 0 && activeTab === 'active' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-emerald-900 text-sm font-bold px-2">
            <Check size={16} className="text-emerald-600" />
            {selectedLeads.length}件を選択中
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkExclude}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 size={14} />
              選択した{selectedLeads.length}件を除外する
            </button>
          </div>
        </div>
      )}

      {/* ── トースト通知 ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 text-sm font-medium flex items-center gap-3 animate-in slide-in-from-bottom">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          {recentlyExcludedLead && (
            <button
              onClick={handleUndoExclude}
              className="ml-2 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              元に戻す
            </button>
          )}
        </div>
      )}

      {/* ── メイン一覧テーブル ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3.5 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={displayedLeads.length > 0 && selectedLeads.length === displayedLeads.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/20 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3.5 min-w-[200px]">店舗名・Instagram</th>
                <th className="px-4 py-3.5 w-28">ジャンル</th>
                <th className="px-4 py-3.5 w-32">地域・エリア</th>
                <th className="px-5 py-3.5 min-w-[260px]">特徴・メニュー</th>
                <th className="px-4 py-3.5 w-32">ステータス</th>
                <th className="px-5 py-3.5 w-44 text-right">営業アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2 font-medium">
                      <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                      店舗データを読み込み中...
                    </div>
                  </td>
                </tr>
              ) : displayedLeads.length > 0 ? (
                displayedLeads.map((lead) => {
                  const isExcluded = excludedIds.includes(lead.id);
                  const isCopied = copiedId === lead.id;
                  const isChecked = selectedLeads.includes(lead.id);

                  // ジャンルごとのカラー＆絵文字
                  let genreBadge = { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '🌱' };
                  if (lead.genre === 'ラーメン') genreBadge = { bg: 'bg-amber-50', text: 'text-amber-800', icon: '🍜' };
                  else if (lead.genre === 'バーガー') genreBadge = { bg: 'bg-orange-50', text: 'text-orange-800', icon: '🍔' };
                  else if (lead.genre === 'カフェ') genreBadge = { bg: 'bg-teal-50', text: 'text-teal-800', icon: '☕' };
                  else if (lead.genre === 'カレー') genreBadge = { bg: 'bg-yellow-50', text: 'text-yellow-800', icon: '🍛' };
                  else if (lead.genre === 'レストラン') genreBadge = { bg: 'bg-purple-50', text: 'text-purple-800', icon: '🍽️' };
                  else if (lead.genre === 'ホテル') genreBadge = { bg: 'bg-blue-50', text: 'text-blue-800', icon: '🏨' };

                  return (
                    <tr 
                      key={lead.id} 
                      className={`hover:bg-gray-50/70 transition-colors ${
                        isChecked ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      {/* チェックボックス */}
                      <td className="px-5 py-4 text-center">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(lead.id)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/20 cursor-pointer"
                        />
                      </td>

                      {/* 店舗名 ＆ Instagram ID */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-gray-900 leading-snug">
                            {lead.name || lead.display_name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-semibold text-gray-500">
                              {lead.instagram_id}
                            </span>
                            <a 
                              href={lead.instagram_url || `https://instagram.com/${lead.instagram_id.replace('@', '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              title="Instagramを開く"
                              className="text-gray-400 hover:text-emerald-600 transition-colors inline-flex p-0.5"
                            >
                              <ExternalLink size={13} />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* ジャンル */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${genreBadge.bg} ${genreBadge.text}`}>
                          <span>{genreBadge.icon}</span>
                          <span>{lead.genre}</span>
                        </span>
                      </td>

                      {/* エリア */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-xs text-gray-700 font-semibold">
                          <MapPin size={13} className="text-gray-400 shrink-0" />
                          <span>{lead.area || lead.prefecture}</span>
                        </div>
                      </td>

                      {/* 特徴・メニュー */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {lead.features && lead.features.length > 0 ? (
                            lead.features.map((feat, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-lg text-[11px] font-medium"
                              >
                                {feat}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500 line-clamp-2">
                              {lead.profile_text}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ステータス */}
                      <td className="px-4 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className={`appearance-none px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer border-none outline-none ${
                            LEAD_STATUS_COLORS[lead.status as LeadStatus] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {Object.entries(LEAD_STATUS_LABELS).map(([k, label]) => (
                            <option key={k} value={k}>{label}</option>
                          ))}
                        </select>
                      </td>

                      {/* アクションボタン */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* DMコピーボタン */}
                          <button
                            onClick={() => handleCopyDM(lead)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                              isCopied 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700'
                            }`}
                            title="この店舗用のDM文面をクリップボードにコピー"
                          >
                            {isCopied ? <CheckCheck size={14} /> : <Copy size={14} />}
                            <span>{isCopied ? 'コピー完了' : 'DMコピー'}</span>
                          </button>

                          {/* 除外 or 復元ボタン */}
                          {!isExcluded ? (
                            <button
                              onClick={() => handleExcludeLead(lead)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="この店舗を営業対象から除外"
                            >
                              <X size={14} />
                              <span>除外</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestoreLead(lead)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                              title="営業対象リストに復元"
                            >
                              <RotateCcw size={14} />
                              <span>復元</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                    <p className="font-semibold text-gray-700">条件に一致する店舗が見つかりませんでした。</p>
                    <p className="text-xs text-gray-400 mt-1">検索キーワードや絞り込み条件を変更してみてください。</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* フッターカウンター */}
        <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>表示中: {displayedLeads.length} 店舗</span>
          <span>SoyStories 全国ヴィーガン営業データベース</span>
        </div>
      </div>

      {/* ── 手動店舗追加モーダル ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">店舗を手動で追加する</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-400 hover:text-gray-700 p-1 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddCustomLead} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">店舗名 *</label>
                <input 
                  required 
                  type="text" 
                  value={newLead.name} 
                  onChange={e => setNewLead({ ...newLead, name: e.target.value })} 
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  placeholder="例: Vegan Cafe & Diner Fukuoka" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Instagram ID *</label>
                <input 
                  required 
                  type="text" 
                  value={newLead.instagram_id} 
                  onChange={e => setNewLead({ ...newLead, instagram_id: e.target.value })} 
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  placeholder="@vegancafe_fukuoka" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ジャンル *</label>
                  <select 
                    value={newLead.genre} 
                    onChange={e => setNewLead({ ...newLead, genre: e.target.value })} 
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="ラーメン">🍜 ラーメン</option>
                    <option value="バーガー">🍔 バーガー</option>
                    <option value="カフェ">☕ カフェ</option>
                    <option value="カレー">🍛 カレー</option>
                    <option value="レストラン">🍽️ レストラン</option>
                    <option value="ホテル">🏨 ホテル</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">都道府県 *</label>
                  <select 
                    value={newLead.prefecture} 
                    onChange={e => setNewLead({ ...newLead, prefecture: e.target.value })} 
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {PREFECTURE_OPTIONS.filter(p => p !== 'すべての地域').map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">地域・市区町村（任意）</label>
                <input 
                  type="text" 
                  value={newLead.area} 
                  onChange={e => setNewLead({ ...newLead, area: e.target.value })} 
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  placeholder="例: 福岡市中央区大名" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">特徴タグ（カンマ区切りで複数指定）</label>
                <input 
                  type="text" 
                  value={newLead.features} 
                  onChange={e => setNewLead({ ...newLead, features: e.target.value })} 
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  placeholder="例: グルテンフリー対応, 有機栽培野菜, デザート人気" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">紹介文・メモ</label>
                <textarea 
                  value={newLead.profile_text} 
                  onChange={e => setNewLead({ ...newLead, profile_text: e.target.value })} 
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  rows={2} 
                  placeholder="店舗の雰囲気やメニューなど"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  キャンセル
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  リストに追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
