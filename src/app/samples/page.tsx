'use client';

import React, { useState, useEffect } from 'react';
import { 
  mockSamples, 
  mockLeads, 
  mockProducts 
} from '@/lib/mock-data';
import { Sample, SampleStatus } from '@/types';
import { 
  Plus, 
  GripVertical, 
  Truck, 
  Star, 
  Calendar, 
  MessageSquare, 
  ChevronRight,
  Package
} from 'lucide-react';

// Map statuses to labels and colors based on requested design
const COLUMNS: { id: SampleStatus, label: string, color: string, bg: string, border: string }[] = [
  { id: 'requested', label: 'サンプル依頼受付', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'packing', label: '梱包中', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { id: 'shipped', label: '発送済', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'delivered', label: '到着確認', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  { id: 'feedback', label: 'フィードバック回収', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' }
];

export default function SampleKanbanPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with mock data
    setSamples(mockSamples as unknown as Sample[]);
  }, []);

  const getLead = (leadId: string) => mockLeads.find(l => l.id === leadId);
  
  const getProductNames = (items: any[]) => {
    return items.map(item => {
      const prod = mockProducts.find(p => p.id === item.product_id);
      return prod ? `${prod.flavor} x${item.quantity}` : `不明 x${item.quantity}`;
    }).join(', ');
  };

  const handleDragStart = (e: React.DragEvent, sampleId: string) => {
    setDraggedItem(sampleId);
    e.dataTransfer.setData('sampleId', sampleId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Slight delay to allow drag image to generate before changing opacity
    setTimeout(() => {
      const el = document.getElementById(`card-${sampleId}`);
      if (el) el.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, sampleId: string) => {
    setDraggedItem(null);
    const el = document.getElementById(`card-${sampleId}`);
    if (el) el.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: SampleStatus) => {
    e.preventDefault();
    const sampleId = e.dataTransfer.getData('sampleId');
    if (sampleId) {
      setSamples(prev => 
        prev.map(s => s.id === sampleId ? { ...s, status } : s)
      );
    }
    setDraggedItem(null);
  };

  const renderStars = (score: number | null | undefined) => {
    if (!score) return null;
    return (
      <div className="flex items-center gap-0.5 mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            fill={i < score ? 'currentColor' : 'none'} 
            className={i < score ? 'text-yellow-400' : 'text-gray-200'} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">サンプル管理</h1>
          <p className="text-sm text-gray-500 mt-1">サンプルの発送状況とフィードバックを管理します</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-500/20 font-medium">
          <Plus size={18} strokeWidth={2.5} />
          新規サンプル
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 items-start">
        {COLUMNS.map(col => {
          const columnSamples = samples.filter(s => s.status === col.id);
          
          return (
            <div 
              key={col.id}
              className="flex-shrink-0 w-[300px] flex flex-col rounded-2xl bg-gray-50/80 border border-gray-100 shadow-sm max-h-full"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className={`p-4 border-b flex items-center justify-between rounded-t-2xl ${col.bg} ${col.border}`}>
                <h2 className={`font-bold text-sm ${col.color}`}>{col.label}</h2>
                <span className="bg-white text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {columnSamples.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-3 min-h-[150px]">
                {columnSamples.map(sample => {
                  const lead = getLead(sample.lead_id);
                  // Handle potential mock data field differences
                  const feedbackScore = (sample as any).feedback_score || sample.feedback_rating;
                  const feedbackNotes = (sample as any).feedback_notes || sample.feedback;
                  
                  return (
                    <div 
                      key={sample.id}
                      id={`card-${sample.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, sample.id)}
                      onDragEnd={(e) => handleDragEnd(e, sample.id)}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-grab hover:border-emerald-200 hover:shadow-md transition-all active:cursor-grabbing group relative"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {lead?.name || 'Unknown Lead'}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {lead?.instagram_id}
                          </p>
                        </div>
                        <GripVertical size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-4" />
                      </div>

                      <div className="text-sm text-gray-600 space-y-3">
                        <div className="flex items-start gap-2 bg-gray-50/50 p-2 rounded-lg border border-gray-50">
                          <Package size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs leading-relaxed line-clamp-2">
                            {getProductNames(sample.items)}
                          </p>
                        </div>
                        
                        {(sample.status === 'shipped' || sample.status === 'delivered' || sample.status === 'feedback') && sample.tracking_number && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-50">
                            <Truck size={14} className="flex-shrink-0" />
                            <span className="font-mono tracking-wider">{sample.tracking_number}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-end pt-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <Calendar size={13} />
                            <span>
                              {new Date(sample.requested_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          
                          {sample.status === 'feedback' && renderStars(feedbackScore)}
                          
                          {sample.status !== 'feedback' && (
                            <button className="text-emerald-500 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors">
                              <ChevronRight size={16} />
                            </button>
                          )}
                        </div>
                        
                        {sample.status === 'feedback' && feedbackNotes && (
                           <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2 text-xs text-gray-600 bg-emerald-50/30 p-2 rounded-lg">
                             <MessageSquare size={14} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                             <p className="line-clamp-2 italic leading-relaxed">{feedbackNotes}</p>
                           </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Empty state placeholder for drop area */}
                {columnSamples.length === 0 && (
                  <div className="h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-400 font-medium">ドロップして移動</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
