'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Award,
  DollarSign
} from 'lucide-react';

const funnelData = [
  { stage: '抽出', count: 120, conversion: 100 },
  { stage: 'DM送信', count: 89, conversion: 74.2 },
  { stage: '返信', count: 34, conversion: 38.2 },
  { stage: 'サンプル', count: 18, conversion: 52.9 },
  { stage: '受注', count: 8, conversion: 44.4 },
];

const templatePerformance = [
  { name: 'シンプル挨拶型', type: 'テキスト', sent: 45, reply: 12, cvr: 26.7 },
  { name: '画像付き（商品A）', type: '画像', sent: 30, reply: 15, cvr: 50.0 },
  { name: '課題解決提案型', type: 'テキスト', sent: 14, reply: 7, cvr: 50.0 },
];

const financialData = [
  { month: '4月', cost: 15000, revenue: 45000 },
  { month: '5月', cost: 18000, revenue: 52000 },
  { month: '6月', cost: 22000, revenue: 84000 },
  { month: '7月', cost: 14000, revenue: 68000 },
  { month: '8月', cost: 25000, revenue: 120000 },
  { month: '9月', cost: 20000, revenue: 145000 },
];

export default function AnalyticsPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">分析ダッシュボード</h1>
        <p className="text-gray-500 mt-1">営業活動と売上の分析</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">コンバージョンファネル</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={funnelData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-sm">
                          <p className="font-bold text-gray-900 mb-1">{data.stage}</p>
                          <p className="text-emerald-600">件数: {data.count}</p>
                          <p className="text-gray-500">移行率: {data.conversion}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#4ade80" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LTV Analysis Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">LTV / 顧客獲得コスト(CAC) 分析</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-gray-500 text-sm">平均顧客生涯価値 (LTV)</span>
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(450000)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-gray-500 text-sm">顧客獲得コスト (CAC)</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(25000)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-rose-400 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">LTV/CAC 比率</p>
              <p className="text-xl font-bold text-emerald-600">18.0x</p>
              <p className="text-xs text-gray-400 mt-1">健全な比率（3x以上）を大きく上回っています</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">DMテンプレートパフォーマンス</h2>
          </div>
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {templatePerformance.map((template, idx) => (
                <div key={idx} className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{template.name}</span>
                      {template.cvr >= 50 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Best</span>
                      )}
                    </div>
                    <span className="text-emerald-600 font-bold">{template.cvr}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>送信: {template.sent}件</span>
                    <span>返信: {template.reply}件</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${template.cvr}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cost vs Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">コスト vs 売上 推移</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={financialData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any) => [formatCurrency(value), name === 'revenue' ? '売上' : 'コスト']}
                  labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="cost" name="コスト" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="売上" stroke="#4ade80" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
