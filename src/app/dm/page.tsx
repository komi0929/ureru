'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Copy, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  MessageSquare,
  User,
  Info,
  Check,
  Star,
  Award
} from 'lucide-react';
import { mockLeads } from '@/lib/mock-data';
import { Lead } from '@/types';
import { getTemplates, generateDM, DmTemplateConfig } from '@/lib/dm-templates';
import { scoreLeads, getScoreColor, getScoreEmoji, LeadScore } from '@/lib/lead-scoring';

interface PacingStats {
  sent_last_hour: number;
  sent_last_24h: number;
  status: 'OK' | 'WARNING' | 'STOP';
  max_per_hour: number;
  max_per_24h: number;
}

export default function DMGenerationPage() {
  // Data
  const [templates, setTemplates] = useState<DmTemplateConfig[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  const [leads, setLeads] = useState<(Lead & { scoreData: LeadScore })[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [pacingStats, setPacingStats] = useState<PacingStats>({
    sent_last_hour: 0,
    sent_last_24h: 0,
    status: 'OK',
    max_per_hour: 5,
    max_per_24h: 25,
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Load templates
    const tmpls = getTemplates();
    setTemplates(tmpls);
    if (tmpls.length > 0) {
      setSelectedTemplateId(tmpls[0].id);
    }

    // Load and score leads
    const eligibleLeads = mockLeads.filter(l => l.status === 'new' || l.status === 'dm_drafted');
    const scoredEligibleLeads = scoreLeads(eligibleLeads);
    setLeads(scoredEligibleLeads);
    if (scoredEligibleLeads.length > 0) {
      setSelectedLeadId(scoredEligibleLeads[0].id);
    }

    fetchPacingStats();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchPacingStats = async () => {
    try {
      const res = await fetch('/api/dm/pacing');
      if (res.ok) {
        const data = await res.json();
        setPacingStats({
          sent_last_hour: data.sent_last_hour,
          sent_last_24h: data.sent_last_24h,
          status: data.status,
          max_per_hour: data.max_per_hour,
          max_per_24h: data.max_per_24h,
        });
      }
    } catch (err) {
      console.error('Failed to fetch pacing stats', err);
    }
  };

  const selectedTemplate = useMemo(() => templates.find(t => t.id === selectedTemplateId), [templates, selectedTemplateId]);
  const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId), [leads, selectedLeadId]);

  const handleGenerate = () => {
    if (!selectedTemplate || !selectedLead) return;
    
    setGeneratedText(null);
    setIsCopied(false);

    try {
      const text = generateDM(selectedTemplate, selectedLead);
      setGeneratedText(text);
    } catch (err) {
      console.error(err);
      setToast({ message: 'DMの生成に失敗しました', type: 'error' });
    }
  };

  const handleCopy = async () => {
    if (!generatedText) return;
    try {
      await navigator.clipboard.writeText(generatedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      try {
        await fetch('/api/dm/pacing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_id: selectedLead?.id,
            message_id: ''
          })
        });
        fetchPacingStats();
      } catch(err) {
        console.error('Failed to update pacing', err);
      }

      setLeads(prev => prev.map(l => l.id === selectedLeadId ? { ...l, status: 'dm_sent' } : l));
      setToast({ message: 'コピーしました！', type: 'success' });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setToast({ message: 'コピーに失敗しました', type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'WARNING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'STOP': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return <CheckCircle2 className="w-5 h-5" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5" />;
      case 'STOP': return <XCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 relative">
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel - Template Management */}
        <div className="w-1/3 min-w-[320px] max-w-[400px] border-r border-gray-100 bg-white flex flex-col shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] z-10">
          <div className="p-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              テンプレート選択
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {templates.map(template => {
              const isSelected = selectedTemplateId === template.id;
              
              return (
                <div 
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`
                    p-4 rounded-2xl cursor-pointer transition-all border relative
                    ${isSelected 
                      ? 'border-emerald-300 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-300' 
                      : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold ${isSelected ? 'text-emerald-800' : 'text-gray-800'} mr-2`}>
                      {template.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      {template.category === 'initial_contact' ? '初回コンタクト' : template.category === 'follow_up' ? 'フォローアップ' : template.category === 'sample_offer' ? 'サンプル提案' : '一般'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {template.template?.substring(0, 50)}...
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Generation Area */}
        <div className="flex-1 flex flex-col bg-gray-50/50 overflow-y-auto">
          <div className="p-8 max-w-4xl mx-auto w-full flex-1 flex flex-col">
            
            {/* Header / Lead Selection */}
            <div className="mb-6 flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-gray-800">DM 生成ワークスペース</h1>
              <p className="text-sm text-gray-500">リードのスコアに基づいて最適なアプローチを行いましょう</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">送信先リードを選択</label>
              <div className="relative">
                <select 
                  value={selectedLeadId || ''} 
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-800 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm appearance-none cursor-pointer"
                >
                  <option value="" disabled>リードを選択...</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {getScoreEmoji(lead.scoreData.total)} {lead.name} ({lead.instagram_id}) - スコア: {lead.scoreData.total}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lead Info Card */}
            {selectedLead && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
                <div className="flex gap-5 items-start">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <User className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{selectedLead.name}</h3>
                      <span className="text-sm text-gray-500">{selectedLead.instagram_id}</span>
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                        {selectedLead.business_type}
                      </span>
                      <div className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${getScoreColor(selectedLead.scoreData.total)}`}>
                        {getScoreEmoji(selectedLead.scoreData.total)} スコア: {selectedLead.scoreData.total}
                      </div>
                    内</div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {selectedLead.profile_text || 'プロフィール文なし'}
                    </p>

                    {/* Score Breakdown */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                        <Award className="w-4 h-4 text-emerald-500" />
                        スコア内訳
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedLead.scoreData.breakdown.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-700 shadow-sm">
                            <span className="text-emerald-500 font-bold">+{item.score}</span>
                            <span className="text-gray-600">{item.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-center mb-8">
              <button 
                onClick={handleGenerate}
                disabled={!selectedLead || !selectedTemplate}
                className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 text-lg font-bold text-white bg-emerald-500 rounded-full overflow-hidden shadow-[0_8px_16px_-4px_rgba(52,211,153,0.4)] hover:bg-emerald-400 hover:shadow-[0_12px_20px_-4px_rgba(52,211,153,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>DMを生成</span>
              </button>
            </div>

            {/* Generated Output */}
            {generatedText && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out bg-white rounded-3xl p-6 shadow-md border border-emerald-100 relative mb-8">
                <div className="absolute top-0 right-8 transform -translate-y-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 生成完了
                  </span>
                </div>
                
                <div className="bg-emerald-50/30 rounded-2xl p-6 mb-6 whitespace-pre-wrap text-gray-800 leading-relaxed text-[15px] border border-emerald-50">
                  {generatedText}
                </div>
                
                <div className="flex justify-between items-center border-t border-gray-100 pt-5">
                  <div className="text-sm font-medium text-gray-400">
                    文字数: {generatedText.length}文字
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={handleGenerate}
                      className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      再生成
                    </button>
                    <button 
                      onClick={handleCopy}
                      className={`
                        flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-200 shadow-sm
                        ${isCopied 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-gray-800 text-white hover:bg-gray-700 hover:shadow-md'
                        }
                      `}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          コピーしました
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          コピーして送信済みにする
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Bottom Pacing Status Bar */}
      <div className={`border-t flex items-center justify-between px-6 py-3 ${getStatusColor(pacingStats.status)} z-20 bg-white/90 backdrop-blur`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold">
            {getStatusIcon(pacingStats.status)}
            <span>送信ペース状態: {pacingStats.status === 'OK' ? '正常' : pacingStats.status === 'WARNING' ? '警告' : '停止'}</span>
          </div>
          <div className="h-4 w-px bg-current opacity-20"></div>
          <div className="flex gap-6 text-sm font-medium opacity-90">
            <span>過去1時間: {pacingStats.sent_last_hour}件 (上限{pacingStats.max_per_hour}件)</span>
            <span>過去24時間: {pacingStats.sent_last_24h}件 (上限{pacingStats.max_per_24h}件)</span>
          </div>
        </div>
        <div className="text-xs opacity-75 font-medium">
          ※制限を超えるとアカウント凍結のリスクが高まります
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-20 right-6 px-6 py-3 rounded-full shadow-xl flex items-center gap-2 transition-all z-50 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
