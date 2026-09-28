'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, Upload, Plus, Filter, MoreHorizontal, 
  ChevronDown, Check, X, FileUp, Mail, ExternalLink,
  ChevronLeft, ChevronRight, Trash2, ArrowUpDown
} from 'lucide-react';
import { Lead, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LeadStatus } from '@/types';
import { mockLeads } from '@/lib/mock-data';
import { scoreLeads, getScoreColor, getScoreEmoji, LeadScore } from '@/lib/lead-scoring';

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Sort state
  const [sortField, setSortField] = useState<'score' | 'created_at'>('score');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  const scoredLeads = useMemo(() => scoreLeads(mockLeads), []);

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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">リード管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            Instagramの潜在顧客をスコア別に管理・育成します。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
          >
            <Upload size={16} />
            CSVインポート
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-sm text-sm font-medium">
            <Plus size={16} />
            リード追加
          </button>
        </div>
      </div>

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
            <select className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option value="">ステータス一括更新...</option>
              {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors">
              <Mail size={14} />
              一括DM生成
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
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
                <th className="px-6 py-4 text-center">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.length > 0 ? (
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
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <MoreHorizontal size={18} />
                      </button>
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
        
        {/* Pagination Dummy */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            全 {filteredLeads.length} 件中 1-10 件を表示
          </span>
          <div className="flex gap-1">
            <button className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none">
              <ChevronLeft size={18} />
            </button>
            <button className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">CSVインポート</h3>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileUp size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  クリックしてファイルを選択
                </p>
                <p className="text-xs text-gray-500">
                  または、ここにCSVファイルをドラッグ＆ドロップ
                </p>
              </div>

              <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-2">必須カラム:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Instagram ID (instagram_username)</li>
                  <li>業種 (business_type)</li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button className="px-4 py-2 text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                インポート実行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
