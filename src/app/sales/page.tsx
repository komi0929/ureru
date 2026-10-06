'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Search, Table2, Columns3, FileText, Copy, Check, ExternalLink,
  EyeOff, RotateCcw, X, Save,
} from 'lucide-react';
import { Lead } from '@/types';
import { mockLeads } from '@/lib/mock-data';

// ============================================================
// 営業ボード（リスト一覧・進捗管理・DM定型文を1画面に集約）
// ※ リスト抽出はシステム外（担当AIとの対話）で行い、ここには表示しない
// ============================================================

// ── 進捗ステージ（7段階にシンプル化） ──
type Stage = 'new' | 'dm_sent' | 'replied' | 'sample' | 'negotiating' | 'won' | 'lost';

const STAGES: { key: Stage; label: string; dot: string; chip: string }[] = [
  { key: 'new',         label: '未着手',     dot: 'bg-slate-300',   chip: 'bg-slate-100 text-slate-700' },
  { key: 'dm_sent',     label: 'DM送信済',   dot: 'bg-sky-400',     chip: 'bg-sky-50 text-sky-800' },
  { key: 'replied',     label: '返信あり',   dot: 'bg-violet-400',  chip: 'bg-violet-50 text-violet-800' },
  { key: 'sample',      label: 'サンプル',   dot: 'bg-amber-400',   chip: 'bg-amber-50 text-amber-800' },
  { key: 'negotiating', label: '商談中',     dot: 'bg-orange-400',  chip: 'bg-orange-50 text-orange-800' },
  { key: 'won',         label: '成約',       dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-800' },
  { key: 'lost',        label: '見送り',     dot: 'bg-rose-300',    chip: 'bg-rose-50 text-rose-700' },
];
const STAGE_MAP = Object.fromEntries(STAGES.map(s => [s.key, s])) as Record<Stage, typeof STAGES[number]>;

// 旧ステータス → 新ステージへの変換（過去データとの互換）
function normalizeStage(status?: string | null): Stage {
  switch (status) {
    case 'contacted':
    case 'dm_drafted':
    case 'dm_sent':
      return 'dm_sent';
    case 'replied':
      return 'replied';
    case 'sample_requested':
    case 'sample_shipped':
    case 'sample_sent':
    case 'sample':
      return 'sample';
    case 'negotiating':
      return 'negotiating';
    case 'contracted':
    case 'won':
      return 'won';
    case 'lost':
      return 'lost';
    default:
      return 'new';
  }
}

// ── localStorage キー（既存キーを継続利用） ──
const KEY_EXCLUDED = 'soystories_excluded_restaurant_ids_v1';
const KEY_STATUSES = 'soystories_restaurant_statuses_v1';
const KEY_TEMPLATE = 'soystories_fixed_dm_template';
const KEY_NOTES = 'soystories_lead_memos_v1';
const KEY_VIEW = 'soystories_sales_view_v1';

const DEFAULT_TEMPLATE = `{{店名}}様

突然のご連絡失礼いたします。
福岡でプラントベース（乳・卵不使用）のクラフトアイスを製造しているSoyStoriesと申します🌿

貴店のメニューに合うデザートとして、無料サンプルをお届けできればと思いご連絡しました。
ご興味があれば、お気軽にご返信いただけますと幸いです🍨

https://www.soystories.cafe/`;

function buildDM(template: string, lead: Lead): string {
  const name = (lead.display_name || lead.name || '').trim();
  let text = template.replace(/\{\{店名\}\}/g, name);
  // 旧形式 {{name}}（「店名様＋改行」に展開）にも対応
  text = text.replace(/\{\{name\}\}/g, name ? `${name}様\n` : '');
  return text;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export default function SalesBoardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [stages, setStages] = useState<Record<string, string>>({});
  const [memos, setMemos] = useState<Record<string, string>>({});
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [view, setView] = useState<'table' | 'kanban'>('table');

  // フィルター
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');
  const [prefecture, setPrefecture] = useState('all');
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all');
  const [showExcluded, setShowExcluded] = useState(false);

  // UI
  const [toast, setToast] = useState<{ msg: string; leadId?: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState('');
  const [showTemplate, setShowTemplate] = useState(false);
  const [templateDraft, setTemplateDraft] = useState(DEFAULT_TEMPLATE);
  const [dragId, setDragId] = useState<string | null>(null);

  // ── 読み込み ──
  useEffect(() => {
    setExcludedIds(readJSON<string[]>(KEY_EXCLUDED, []));
    setStages(readJSON<Record<string, string>>(KEY_STATUSES, {}));
    setMemos(readJSON<Record<string, string>>(KEY_NOTES, {}));
    try {
      const t = localStorage.getItem(KEY_TEMPLATE);
      if (t) { setTemplate(t); setTemplateDraft(t); }
      const v = localStorage.getItem(KEY_VIEW);
      if (v === 'table' || v === 'kanban') setView(v);
    } catch { /* noop */ }

    (async () => {
      let combined = [...mockLeads];
      try {
        const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
        if (isSupabaseConfigured()) {
          const { data } = await supabase.from('leads').select('*');
          if (data && data.length > 0) {
            const masterIds = new Set(mockLeads.map(m => m.instagram_id.toLowerCase()));
            const extra = (data as Lead[]).filter(d => d.instagram_id && !masterIds.has(d.instagram_id.toLowerCase()));
            combined = [...extra, ...combined];
          }
        }
      } catch { /* マスターのみで動作 */ }
      setLeads(combined.map(l => ({ ...l, name: l.name || l.display_name || l.instagram_id })));
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const stageOf = useCallback(
    (lead: Lead): Stage => normalizeStage(stages[lead.id] ?? lead.status),
    [stages],
  );

  // ── 更新系 ──
  const setStage = (id: string, stage: Stage) => {
    const next = { ...stages, [id]: stage };
    setStages(next);
    writeJSON(KEY_STATUSES, next);
  };

  const toggleExclude = (lead: Lead) => {
    const isEx = excludedIds.includes(lead.id);
    const next = isEx ? excludedIds.filter(i => i !== lead.id) : [...excludedIds, lead.id];
    setExcludedIds(next);
    writeJSON(KEY_EXCLUDED, next);
    setToast({ msg: isEx ? `「${lead.name}」を戻しました` : `「${lead.name}」を除外しました` });
  };

  const saveMemo = (id: string) => {
    const next = { ...memos, [id]: memoDraft.trim() };
    if (!memoDraft.trim()) delete next[id];
    setMemos(next);
    writeJSON(KEY_NOTES, next);
    setEditingMemoId(null);
  };

  const copyDM = async (lead: Lead) => {
    try {
      await navigator.clipboard.writeText(buildDM(template, lead));
      setCopiedId(lead.id);
      setTimeout(() => setCopiedId(null), 1500);
      setToast(
        stageOf(lead) === 'new'
          ? { msg: `DM文をコピーしました（${lead.name}）`, leadId: lead.id }
          : { msg: `DM文をコピーしました（${lead.name}）` },
      );
    } catch {
      setToast({ msg: 'コピーに失敗しました' });
    }
  };

  const saveTemplate = () => {
    setTemplate(templateDraft);
    writeJSON(KEY_TEMPLATE, templateDraft);
    setShowTemplate(false);
    setToast({ msg: 'DM定型文を保存しました' });
  };

  const changeView = (v: 'table' | 'kanban') => {
    setView(v);
    writeJSON(KEY_VIEW, v);
  };

  // ── 集計・絞り込み ──
  const activeLeads = useMemo(() => leads.filter(l => !excludedIds.includes(l.id)), [leads, excludedIds]);

  const genres = useMemo(
    () => Array.from(new Set(leads.map(l => l.genre || l.business_type).filter(Boolean))) as string[],
    [leads],
  );
  const prefectures = useMemo(() => {
    const count: Record<string, number> = {};
    leads.forEach(l => { if (l.prefecture) count[l.prefecture] = (count[l.prefecture] || 0) + 1; });
    return Object.entries(count).sort((a, b) => b[1] - a[1]).map(([p]) => p);
  }, [leads]);

  const stageCounts = useMemo(() => {
    const c = Object.fromEntries(STAGES.map(s => [s.key, 0])) as Record<Stage, number>;
    activeLeads.forEach(l => { c[stageOf(l)]++; });
    return c;
  }, [activeLeads, stageOf]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (showExcluded ? leads.filter(l => excludedIds.includes(l.id)) : activeLeads).filter(l => {
      if (genre !== 'all' && (l.genre || l.business_type) !== genre) return false;
      if (prefecture !== 'all' && l.prefecture !== prefecture) return false;
      if (!showExcluded && view === 'table' && stageFilter !== 'all' && stageOf(l) !== stageFilter) return false;
      if (q) {
        const hay = `${l.name} ${l.instagram_id} ${l.area ?? ''} ${memos[l.id] ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, activeLeads, excludedIds, showExcluded, genre, prefecture, stageFilter, query, view, stageOf, memos]);

  const total = activeLeads.length;
  const touched = total - stageCounts.new;

  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3">
          <span>{toast.msg}</span>
          {toast.leadId && (
            <button
              onClick={() => { setStage(toast.leadId!, 'dm_sent'); setToast({ msg: '「DM送信済」に移動しました' }); }}
              className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg font-bold cursor-pointer"
            >
              DM送信済にする
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center" title="TOPへ">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-base font-bold leading-tight">営業ボード</h1>
              <p className="text-[11px] text-slate-500">ヴィーガン飲食店 {total}件 ・ 着手済み {touched}件</p>
            </div>
          </div>
          <button
            onClick={() => { setTemplateDraft(template); setShowTemplate(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            DM定型文
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* 進捗サマリー（クリックで絞り込み） */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 mb-3">
            {STAGES.map(s => stageCounts[s.key] > 0 && (
              <div key={s.key} className={s.dot} style={{ width: `${(stageCounts[s.key] / Math.max(total, 1)) * 100}%` }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setStageFilter('all'); setShowExcluded(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${stageFilter === 'all' && !showExcluded ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              すべて {total}
            </button>
            {STAGES.map(s => (
              <button
                key={s.key}
                onClick={() => { setStageFilter(s.key); setShowExcluded(false); changeView('table'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${stageFilter === s.key && !showExcluded ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                {s.label} {stageCounts[s.key]}
              </button>
            ))}
          </div>
        </div>

        {/* ツールバー */}
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="店名・Instagram ID・エリア・メモで検索"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-slate-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={genre} onChange={e => setGenre(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm">
              <option value="all">全ジャンル</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={prefecture} onChange={e => setPrefecture(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm">
              <option value="all">全地域</option>
              {prefectures.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button
              onClick={() => setShowExcluded(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm cursor-pointer ${showExcluded ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              除外済み {excludedIds.length}
            </button>
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => changeView('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${view === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
              >
                <Table2 className="w-3.5 h-3.5" />一覧表
              </button>
              <button
                onClick={() => changeView('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${view === 'kanban' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
              >
                <Columns3 className="w-3.5 h-3.5" />看板
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">{filtered.length}件を表示中</p>

        {/* ===================== 一覧表 ===================== */}
        {(view === 'table' || showExcluded) && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-auto max-h-[70vh]">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr className="text-left text-[11px] text-slate-500 border-b border-slate-200">
                    <th className="px-4 py-2.5 font-semibold">店名</th>
                    <th className="px-3 py-2.5 font-semibold">ジャンル</th>
                    <th className="px-3 py-2.5 font-semibold">地域</th>
                    <th className="px-3 py-2.5 font-semibold w-36">ステータス</th>
                    <th className="px-3 py-2.5 font-semibold">メモ</th>
                    <th className="px-3 py-2.5 font-semibold text-right w-48">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(lead => {
                    const st = stageOf(lead);
                    const isEx = excludedIds.includes(lead.id);
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/60 align-top">
                        <td className="px-4 py-2.5">
                          <div className="font-semibold text-slate-900">{lead.name}</div>
                          {lead.instagram_url && (
                            <a href={lead.instagram_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
                              {lead.instagram_id}<ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{lead.genre || lead.business_type}</td>
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                          {lead.prefecture}
                          {lead.area && <div className="text-[11px] text-slate-400">{lead.area}</div>}
                        </td>
                        <td className="px-3 py-2.5">
                          <select
                            value={st}
                            disabled={isEx}
                            onChange={e => setStage(lead.id, e.target.value as Stage)}
                            className={`w-full px-2 py-1 rounded-md text-xs font-semibold border-0 cursor-pointer ${STAGE_MAP[st].chip}`}
                          >
                            {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2.5 min-w-[200px]">
                          {editingMemoId === lead.id ? (
                            <div className="flex gap-1">
                              <input
                                autoFocus
                                value={memoDraft}
                                onChange={e => setMemoDraft(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') saveMemo(lead.id); if (e.key === 'Escape') setEditingMemoId(null); }}
                                onBlur={() => saveMemo(lead.id)}
                                className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded-md focus:outline-none"
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingMemoId(lead.id); setMemoDraft(memos[lead.id] || ''); }}
                              className="text-left text-xs w-full text-slate-600 hover:bg-slate-100 rounded px-1.5 py-1 cursor-text"
                            >
                              {memos[lead.id] || <span className="text-slate-300">メモを追加</span>}
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex justify-end gap-1.5">
                            {!isEx && (
                              <button
                                onClick={() => copyDM(lead)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                              >
                                {copiedId === lead.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                DMコピー
                              </button>
                            )}
                            <button
                              onClick={() => toggleExclude(lead)}
                              title={isEx ? '戻す' : '除外'}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-slate-900 text-xs cursor-pointer"
                            >
                              {isEx ? <><RotateCcw className="w-3.5 h-3.5" />戻す</> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">該当する店舗はありません</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== 看板 ===================== */}
        {view === 'kanban' && !showExcluded && (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STAGES.map(s => {
              const items = filtered.filter(l => stageOf(l) === s.key);
              return (
                <div
                  key={s.key}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => { if (dragId) setStage(dragId, s.key); setDragId(null); }}
                  className="w-64 shrink-0 bg-slate-100/70 rounded-2xl p-2 flex flex-col max-h-[72vh]"
                >
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />{s.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">{items.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 px-0.5 pb-1">
                    {items.map(lead => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => setDragId(lead.id)}
                        onDragEnd={() => setDragId(null)}
                        className={`bg-white rounded-xl border border-slate-200 p-3 shadow-2xs cursor-grab active:cursor-grabbing ${dragId === lead.id ? 'opacity-50' : ''}`}
                      >
                        <div className="text-sm font-semibold text-slate-900 leading-snug">{lead.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {lead.genre || lead.business_type} ・ {lead.prefecture}
                        </div>
                        {memos[lead.id] && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 rounded-md px-2 py-1 mt-2 line-clamp-2">{memos[lead.id]}</div>
                        )}
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <button
                            onClick={() => copyDM(lead)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 text-white text-[11px] font-semibold cursor-pointer"
                          >
                            {copiedId === lead.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}DM
                          </button>
                          {lead.instagram_url && (
                            <a href={lead.instagram_url} target="_blank" rel="noopener noreferrer" className="p-1 rounded-md border border-slate-200 text-slate-500 hover:text-slate-900">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {/* スマホ向け：ドラッグできない端末でも移動可能 */}
                          <select
                            value={s.key}
                            onChange={e => setStage(lead.id, e.target.value as Stage)}
                            className="ml-auto text-[11px] bg-slate-50 border border-slate-200 rounded-md px-1 py-0.5 cursor-pointer"
                          >
                            {STAGES.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="text-center text-[11px] text-slate-400 py-6 border-2 border-dashed border-slate-200 rounded-xl">ここにドラッグ</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ===================== DM定型文 ===================== */}
      {showTemplate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowTemplate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold">DM定型文</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  <code className="bg-slate-100 px-1 rounded">{'{{店名}}'}</code> と書いた箇所に各店舗名が自動で入ります
                </p>
              </div>
              <button onClick={() => setShowTemplate(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 p-5">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 mb-1.5">本文</div>
                <textarea
                  value={templateDraft}
                  onChange={e => setTemplateDraft(e.target.value)}
                  rows={14}
                  className="w-full text-sm leading-relaxed p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 resize-y"
                />
                <div className="text-[11px] text-slate-400 mt-1">{templateDraft.length}文字</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                  プレビュー（{activeLeads[0]?.name ?? '店舗名'}）
                </div>
                <div className="text-sm leading-relaxed p-3 rounded-xl bg-slate-50 border border-slate-100 whitespace-pre-wrap min-h-[300px]">
                  {activeLeads[0] ? buildDM(templateDraft, activeLeads[0]) : templateDraft}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <button
                onClick={() => setTemplateDraft(DEFAULT_TEMPLATE)}
                className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                初期の文章に戻す
              </button>
              <button
                onClick={saveTemplate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
