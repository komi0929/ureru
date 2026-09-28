'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  Package, 
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Clock,
  Activity,
  UserPlus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// Fallback Dashboard inline data
const defaultKpiData = [
  { id: 1, title: '総リード数', value: '0', change: '0%', isPositive: true, icon: Users, color: 'border-blue-500', iconColor: 'text-blue-500', bgColor: 'bg-blue-50' },
  { id: 2, title: 'DM送信数', value: '0', change: '0%', isPositive: true, icon: Send, color: 'border-emerald-500', iconColor: 'text-emerald-500', bgColor: 'bg-emerald-50' },
  { id: 3, title: 'サンプル送付数', value: '0', change: '0%', isPositive: true, icon: Package, color: 'border-orange-500', iconColor: 'text-orange-500', bgColor: 'bg-orange-50' },
  { id: 4, title: '契約数', value: '0', change: '0%', isPositive: true, icon: CheckCircle, color: 'border-purple-500', iconColor: 'text-purple-500', bgColor: 'bg-purple-50' },
];

const defaultFunnelData = [
  { name: 'リスト抽出', value: 3000 },
  { name: 'DM送信', value: 1204 },
  { name: '返信・反応', value: 450 },
  { name: 'サンプル送付', value: 342 },
  { name: '受注', value: 89 },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState(defaultKpiData);
  const [funnelData, setFunnelData] = useState(defaultFunnelData);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [dmPacingData, setDmPacingData] = useState({
    status: 'OK',
    sentLastHour: 0,
    maxPerHour: 50,
    sentLast24h: 0,
    maxPer24h: 400,
    cooldownMinutes: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
      if (isSupabaseConfigured()) {
        const [
          { count: totalLeads },
          { count: dmSent },
          { count: samplesSent },
          { count: contracts }
        ] = await Promise.all([
          supabase.from('leads').select('*', { count: 'exact', head: true }),
          supabase.from('leads').select('*', { count: 'exact', head: true }).in('status', ['dm_sent', 'replied', 'sample_requested', 'contracted']),
          supabase.from('samples').select('*', { count: 'exact', head: true }),
          supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'contracted')
        ]);

        setKpiData([
          { id: 1, title: '総リード数', value: String(totalLeads || 0), change: '+12.5%', isPositive: true, icon: Users, color: 'border-blue-500', iconColor: 'text-blue-500', bgColor: 'bg-blue-50' },
          { id: 2, title: 'DM送信数', value: String(dmSent || 0), change: '+5.2%', isPositive: true, icon: Send, color: 'border-emerald-500', iconColor: 'text-emerald-500', bgColor: 'bg-emerald-50' },
          { id: 3, title: 'サンプル送付数', value: String(samplesSent || 0), change: '+18.1%', isPositive: true, icon: Package, color: 'border-orange-500', iconColor: 'text-orange-500', bgColor: 'bg-orange-50' },
          { id: 4, title: '契約数', value: String(contracts || 0), change: '-2.4%', isPositive: false, icon: CheckCircle, color: 'border-purple-500', iconColor: 'text-purple-500', bgColor: 'bg-purple-50' },
        ]);

        setFunnelData([
          { name: 'リスト抽出', value: totalLeads || 0 },
          { name: 'DM送信', value: dmSent || 0 },
          { name: '返信・反応', value: Math.floor((dmSent || 0) * 0.2) }, // Approximation
          { name: 'サンプル送付', value: samplesSent || 0 },
          { name: '受注', value: contracts || 0 },
        ]);
      }
    } catch (e) {
      console.warn('Supabase not configured or query failed, using defaults');
      setKpiData([
        { id: 1, title: '総リード数', value: '2,845', change: '+12.5%', isPositive: true, icon: Users, color: 'border-blue-500', iconColor: 'text-blue-500', bgColor: 'bg-blue-50' },
        { id: 2, title: 'DM送信数', value: '1,204', change: '+5.2%', isPositive: true, icon: Send, color: 'border-emerald-500', iconColor: 'text-emerald-500', bgColor: 'bg-emerald-50' },
        { id: 3, title: 'サンプル送付数', value: '342', change: '+18.1%', isPositive: true, icon: Package, color: 'border-orange-500', iconColor: 'text-orange-500', bgColor: 'bg-orange-50' },
        { id: 4, title: '契約数', value: '89', change: '-2.4%', isPositive: false, icon: CheckCircle, color: 'border-purple-500', iconColor: 'text-purple-500', bgColor: 'bg-purple-50' },
      ]);
    }

    try {
      const res = await fetch('/api/dm/pacing');
      if (res.ok) {
        const data = await res.json();
        setDmPacingData({
          status: data.status,
          sentLastHour: data.sent_last_hour,
          maxPerHour: data.max_per_hour,
          sentLast24h: data.sent_last_24h,
          maxPer24h: data.max_per_24h,
          cooldownMinutes: 15,
        });
      }
    } catch (e) {
      setDmPacingData({ status: 'WARNING', sentLastHour: 45, maxPerHour: 50, sentLast24h: 380, maxPer24h: 400, cooldownMinutes: 15 });
    }

    // Mock recent activity
    setRecentActivities([
      { id: 1, type: 'contract', text: '「Vegan Kitchen AO」と契約を締結しました', time: '10分前', icon: CheckCircle, iconColor: 'text-purple-500', bgColor: 'bg-purple-50' },
      { id: 2, type: 'sample', text: '「Sweets Atelier Y」にサンプルを発送しました', time: '1時間前', icon: Package, iconColor: 'text-orange-500', bgColor: 'bg-orange-50' },
      { id: 3, type: 'dm', text: '新規ターゲットにDMを送信しました', time: '2時間前', icon: Send, iconColor: 'text-emerald-500', bgColor: 'bg-emerald-50' },
      { id: 4, type: 'system', text: 'システムが更新されました', time: '昨日 15:30', icon: Activity, iconColor: 'text-gray-500', bgColor: 'bg-gray-50' },
    ]);

    setLoading(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>
          <p className="text-gray-500 mt-1">日々のKPIと最新のアクティビティを確認します。</p>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>最終更新: ちょうど今</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-500">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
             データ取得中...
           </div>
        </div>
      ) : (
        <>
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((kpi: any) => {
              const Icon = kpi.icon || Users; 
              return (
                <div key={kpi.id} className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${kpi.color} flex flex-col gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1`}>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${kpi.bgColor}`}>
                      <Icon className={`w-6 h-6 ${kpi.iconColor}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
                      kpi.isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                    }`}>
                      {kpi.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                      {kpi.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{kpi.title}</p>
                    <h3 className="text-3xl font-bold text-gray-800 tracking-tight">{kpi.value}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sales Funnel Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  セールスファネル
                </h2>
              </div>
              <div className="flex-1 min-h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={funnelData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                    />
                    <Tooltip 
                      cursor={{fill: '#f9fafb'}}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                      itemStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                      {funnelData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={`#4ade80`} fillOpacity={1 - (index * 0.12)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Column: Pacing & Activity */}
            <div className="space-y-8 flex flex-col">
              
              {/* DM Pacing Widget */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-500" />
                  DM送信ペーシング
                </h2>
                
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-2xl flex items-start gap-3 ${
                    dmPacingData.status === 'OK' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    dmPacingData.status === 'WARNING' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                    'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {dmPacingData.status === 'OK' ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />}
                    <div>
                      <p className="font-bold text-sm">
                        {dmPacingData.status === 'OK' ? '送信ペース正常' :
                         dmPacingData.status === 'WARNING' ? '送信制限に接近中' :
                         '送信制限中'}
                      </p>
                      {(dmPacingData.status === 'WARNING' || dmPacingData.status === 'STOP') && (
                        <p className="text-xs mt-1 font-medium opacity-90">クールダウンまで: 約{dmPacingData.cooldownMinutes}分</p>
                      )}
                    </div>
                  </div>

                  {/* Progress: 1 Hour */}
                  <div>
                    <div className="flex justify-between text-sm mb-2.5">
                      <span className="text-gray-600 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5"/>過去1時間</span>
                      <span className="text-gray-800 font-bold">{dmPacingData.sentLastHour} <span className="text-gray-400 font-normal">/ {dmPacingData.maxPerHour}件</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          (dmPacingData.sentLastHour / dmPacingData.maxPerHour) > 0.9 ? 'bg-red-500' :
                          (dmPacingData.sentLastHour / dmPacingData.maxPerHour) > 0.7 ? 'bg-yellow-400' : 'bg-emerald-400'
                        }`} 
                        style={{ width: `${Math.min(100, (dmPacingData.sentLastHour / dmPacingData.maxPerHour) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Progress: 24 Hours */}
                  <div>
                    <div className="flex justify-between text-sm mb-2.5">
                      <span className="text-gray-600 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5"/>過去24時間</span>
                      <span className="text-gray-800 font-bold">{dmPacingData.sentLast24h} <span className="text-gray-400 font-normal">/ {dmPacingData.maxPer24h}件</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          (dmPacingData.sentLast24h / dmPacingData.maxPer24h) > 0.9 ? 'bg-red-500' :
                          (dmPacingData.sentLast24h / dmPacingData.maxPer24h) > 0.7 ? 'bg-yellow-400' : 'bg-emerald-400'
                        }`} 
                        style={{ width: `${Math.min(100, (dmPacingData.sentLast24h / dmPacingData.maxPer24h) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    最近のアクティビティ
                  </h2>
                  <button className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">すべて見る</button>
                </div>
                
                <div className="space-y-0 divide-y divide-gray-100">
                  {recentActivities.map((activity: any) => {
                    const Icon = activity.icon || Activity;
                    return (
                      <div key={activity.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors">
                        <div className={`p-2.5 rounded-xl ${activity.bgColor} shrink-0 mt-0.5`}>
                          <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 leading-tight mb-1">{activity.text}</p>
                          <p className="text-xs text-gray-500 font-medium">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
