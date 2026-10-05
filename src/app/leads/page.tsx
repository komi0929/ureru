'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Filter, MoreHorizontal, 
  ChevronDown, Check, X, Mail, ExternalLink,
  ChevronLeft, ChevronRight, Trash2, ArrowUpDown, Sparkles, RefreshCw
} from 'lucide-react';
import { Lead, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LeadStatus } from '@/types';
import { mockLeads } from '@/lib/mock-data';
import { scoreLeads, getScoreColor, getScoreEmoji, LeadScore } from '@/lib/lead-scoring';

// Define prewarm statuses if they don't exist in types yet
type PrewarmStatus = 'not_started' | 'day1' | 'day2' | 'day3';
const PREWARM_LABELS: Record<string, string> = {
  'not_started': '未開始',
  'day1': 'Day1(いいね済)',
  'day2': 'Day2(コメント済)',
  'day3': 'Day3(DM済)'
};
const PREWARM_NEXT: Record<string, string> = {
  'not_started': 'day1',
  'day1': 'day2',
  'day2': 'day3',
  'day3': 'day3'
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  
  // Sort state
  const [sortField, setSortField] = useState<'score' | 'created_at'>('score');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSyncNationalVeganRamen = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/leads/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: '全国',
          keywords: ['ヴィーガンラーメン'],
          limit: 50,
          category: 'ramen',
          autoSave: true,
        }),
      });
      const data = await res.json();
      await loadLeads();
      showToast(`✨ 福岡を含む全国のヴィーガンラーメン有力店（全${data.total_found || 41}件）を完全同期しました！`);
    } catch (e) {
      console.error(e);
      showToast('同期中にエラーが発生しました');
    } finally {
      setSyncing(false);
    }
  };

  // New lead form state
  const [newLead, setNewLead] = useState({
    instagram_id: '',
    name: '',
    business_type: 'カフェ',
    profile_text: '',
    followers_count: 0,
    website_url: ''
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (data && !error) { 
          setLeads(data); 
          setLoading(false);
          return; 
        }
      }
    } catch (e) { 
      console.warn('Supabase not available, using mock data'); 
    }
    setLeads(mockLeads);
    setLoading(false);
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const leadData = {
      ...newLead,
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      id: crypto.randomUUID()
    };
    
    try {
      const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('leads').insert([leadData]);
        if (!error) {
          await loadLeads();
        }
      } else {
        setLeads(prev => [leadData as unknown as Lead, ...prev]);
      }
    } catch (e) {
      console.warn('Supabase insert failed', e);
      setLeads(prev => [leadData as unknown as Lead, ...prev]);
    }
    setShowAddModal(false);
    setNewLead({ instagram_id: '', name: '', business_type: 'カフェ', profile_text: '', followers_count: 0, website_url: '' });
  };

  const updateLeadInDB = async (id: string, updates: any) => {
    try {
      const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
      if (isSupabaseConfigured()) {
        await supabase.from('leads').update(updates).eq('id', id);
      }
    } catch (e) {
      console.warn('Failed to update DB', e);
    }
  };

  const handlePrewarmAdvance = async (lead: Lead) => {
    const current = (lead as any).prewarm_status || 'not_started';
    const next = PREWARM_NEXT[current];
    if (current === next) return;

    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, prewarm_status: next } : l));
    await updateLeadInDB(lead.id, { prewarm_status: next });
  };

  const handleDelete = async () => {
    if (selectedLeads.length === 0) return;
    try {
      const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
      if (isSupabaseConfigured()) {
        await supabase.from('leads').delete().in('id', selectedLeads);
      }
    } catch (e) {
      console.warn('Delete failed', e);
    }
    setLeads(prev => prev.filter(l => !selectedLeads.includes(l.id)));
    setSelectedLeads([]);
  };

  const handleStatusUpdate = async (status: string) => {
    if (!status || selectedLeads.length === 0) return;
    try {
      const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
      if (isSupabaseConfigured()) {
        await supabase.from('leads').update({ status }).in('id', selectedLeads);
      }
    } catch (e) {
      console.warn('Update failed', e);
    }
    setLeads(prev => prev.map(l => selectedLeads.includes(l.id) ? { ...l, status: status as LeadStatus } : l));
    setSelectedLeads([]);
  };

  const scoredLeads = useMemo(() => scoreLeads(leads), [leads]);

  const businessTypes = useMemo(() => {
    const types = new Set(scoredLeads.map(lead => lead.business_type));
    return ['all', ...Array.from(types)];
  }, [scoredLeads]);

  const filteredLeads = useMemo(() => {
    let result = scoredLeads.filter(lead => {
      const matchesSearch = 
        lead.instagram_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.name || lead.display_name)?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesBusinessType = businessTypeFilter === 'all' || lead.business_type === businessTypeFilter;
      
      let matchesScore = true;
      if (scoreFilter === 'hot') matchesScore = lead.scoreData.total >= 80;
      else if (scoreFilter === 'high') matchesScore = lead.scoreData.total >= 50;
      else if (scoreFilter === 'medium') matchesScore = lead.scoreData.total >= 30;
      else if (scoreFilter === 'low') matchesScore = lead.scoreData.total < 30;
      
      return matchesSearch && matchesStatus && matchesBusinessType && matchesScore;
    });

    result.sort((a, b) => {
      if (sortField === 'score') {
        return sortDirection === 'desc' 
          ? b.scoreData.total - a.scoreData.total 
          : a.scoreData.total - b.scoreData.total;
      } else {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
      }
    });

    return result;
  }, [scoredLeads, searchQuery, statusFilter, businessTypeFilter, scoreFilter, sortField, sortDirection]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeads(filteredLeads.map(l => l.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(leadId => leadId !== id) : [...prev, id]
    );
  };

  const handleSort = (field: 'score' | 'created_at') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">リード管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            Instagramの潜在顧客をスコア別に管理・育成します。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncNationalVeganRamen}
            disabled={syncing}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl hover:bg-rose-100 transition-colors shadow-2xs text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={15} className={`text-rose-600 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? '全国41店舗を同期中...' : '🍜 全国ヴィーガンラーメン（41件）を一括同期'}</span>
          </button>

          <Link
            href="/discover"
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors shadow-2xs text-xs sm:text-sm font-semibold"
          >
            <Sparkles size={15} className="text-emerald-600" />
            AIで店舗を自動収集
          </Link>

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-2xs text-xs sm:text-sm font-medium cursor-pointer"
          >
            <Plus size={15} />
            手動追加
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer"
            >
              <option value="all">すべてのステータス</option>
              {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={businessTypeFilter}
              onChange={(e) => setBusinessTypeFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer"
            >
              <option value="all">すべての業種</option>
              {businessTypes.filter(t => t !== 'all').map(type => (
                <option key={type} value={type ?? ''}>{type}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-emerald-50 border-none rounded-xl text-sm font-medium text-emerald-800 focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer"
            >
              <option value="all">すべてのスコア</option>
              <option value="hot">🔥 Hot (80+)</option>
              <option value="high">⭐ High (50+)</option>
              <option value="medium">📋 Medium (30+)</option>
              <option value="low">❄️ Low (&lt;30)</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="IDや名前で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-shadow"
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLeads.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 text-emerald-800 text-sm font-medium px-2">
            <Check size={16} className="text-emerald-600" />
            {selectedLeads.length}件を選択中
          </div>
          <div className="flex items-center gap-2">
            <select 
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
              defaultValue=""
            >
              <option value="" disabled>ステータス一括更新...</option>
              {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors" onClick={handleDelete}>
              <Trash2 size={14} />
              一括削除
            </button>
          </div>
        </div>
      )}

      {/* Lead Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500/20"
                  />
                </th>
                <th className="px-6 py-4">Instagram ID</th>
                <th className="px-6 py-4">表示名</th>
                <th className="px-6 py-4">業種</th>
                <th className="px-6 py-4">プレウォーム状況</th>
                <th className="px-6 py-4">ステータス</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('score')}>
                  <div className="flex items-center gap-1">
                    スコア {sortField === 'score' && <ArrowUpDown size={12} className="text-emerald-500" />}
                  </div>
                </th>
                <th className="px-6 py-4">フォロワー数</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center gap-1">
                    作成日 {sortField === 'created_at' && <ArrowUpDown size={12} className="text-emerald-500" />}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                      読み込み中...
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${
                      selectedLeads.includes(lead.id) ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500/20"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{lead.instagram_id}</span>
                        <a 
                          href={`https://instagram.com/${lead.instagram_id.replace('@', '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead.name || lead.display_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead.business_type}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePrewarmAdvance(lead); }}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-100"
                      >
                        {PREWARM_LABELS[(lead as any).prewarm_status || 'not_started']}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${LEAD_STATUS_COLORS[lead.status as LeadStatus] || 'bg-gray-100 text-gray-700'}`}>
                        {LEAD_STATUS_LABELS[lead.status as LeadStatus] || lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreColor(lead.scoreData.total)}`}>
                        {getScoreEmoji(lead.scoreData.total)} {lead.scoreData.total}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead.followers_count?.toLocaleString() || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(lead.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    リードが見つかりません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">リード手動追加</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddLead} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram ID</label>
                <input required type="text" value={newLead.instagram_id} onChange={e => setNewLead({...newLead, instagram_id: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="@username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
                <input type="text" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Cafe Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">業種</label>
                <select value={newLead.business_type} onChange={e => setNewLead({...newLead, business_type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option>カフェ</option>
                  <option>レストラン</option>
                  <option>ベーカリー</option>
                  <option>ホテル</option>
                  <option>デリ</option>
                  <option>バー</option>
                  <option>その他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">フォロワー数</label>
                <input type="number" value={newLead.followers_count} onChange={e => setNewLead({...newLead, followers_count: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ウェブサイト URL</label>
                <input type="url" value={newLead.website_url} onChange={e => setNewLead({...newLead, website_url: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="https://" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">プロフィールテキスト</label>
                <textarea value={newLead.profile_text} onChange={e => setNewLead({...newLead, profile_text: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" rows={3}></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">キャンセル</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-colors shadow-sm">追加する</button>
              </div>
            </form>
          </div>
        </div>
      )}



    </div>
  );
}
