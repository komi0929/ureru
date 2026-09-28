'use client';

import React from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  FileText, 
  RotateCcw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { mockOrders } from '@/lib/mock-data';

export default function OrdersPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'completed': return '完了';
      case 'pending': return '保留中';
      case 'processing': return '処理中';
      case 'cancelled': return 'キャンセル';
      default: return status;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">受発注管理</h1>
          <p className="text-gray-500 mt-1">注文と請求書の管理を行います</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span>エクスポート</span>
          </button>
          <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 flex items-center gap-2 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>新規発注</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">今月の受注数</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">45件</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-emerald-500 font-medium">12%</span>
            <span className="text-gray-500 ml-2">前月比</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">今月の売上</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(1250000)}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-emerald-500 font-medium">8%</span>
            <span className="text-gray-500 ml-2">前月比</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">未入金請求書</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">3件</h3>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-rose-600">
            <span>{formatCurrency(340000)}の未回収</span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-gray-900">最近の注文</h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="注文を検索..." 
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64"
              />
            </div>
            <button className="px-3 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm">絞り込み</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-6 text-sm font-medium text-gray-500">注文番号</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-500">顧客名</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-500">ステータス</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-500">合計金額</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-500">注文日</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-500">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockOrders && mockOrders.length > 0 ? (
                mockOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{order.lead_id}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{formatCurrency(order.total_amount)}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('ja-JP')}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="詳細">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-blue-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="請求書生成">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors" title="リピート発注">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">注文データがありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
