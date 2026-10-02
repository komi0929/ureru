'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  AlertCircle,
  Truck,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Calendar,
  Clock,
  Boxes,
  Building2,
  CheckCircle2,
  X,
  Package,
  Eye,
  Edit2
} from 'lucide-react';
import { B2BOrder, OrderStatus, ShippingBoxSize, ShippingBreakdown } from '@/types/order';
import { 
  getB2BOrders, 
  updateB2BOrderStatus, 
  YAMATO_CONTRACT_BASE_RATES, 
  YAMATO_COOL_SURCHARGE, 
  PACKAGING_HANDLING_FEE,
  calculateShippingBreakdown 
} from '@/lib/order-api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<B2BOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 特約運賃マスターモーダル
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);

  // URL共有モーダル
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [customStoreName, setCustomStoreName] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // 注文詳細モーダル
  const [selectedOrder, setSelectedOrder] = useState<B2BOrder | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // トースト
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const data = await getB2BOrders();
    setOrders(data);
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateB2BOrderStatus(orderId, newStatus);
    await loadOrders();
    showToast('ステータスを更新しました');
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleSaveTrackingNumber = async (orderId: string) => {
    await updateB2BOrderStatus(orderId, 'shipped', trackingNumberInput.trim());
    await loadOrders();
    showToast('ヤマトお問い合わせ伝票番号を登録し、発送済みに更新しました！');
    setSelectedOrder(null);
  };

  // 統計集計
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.grand_total : 0), 0);
    const totalVolume = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_volume_liters : 0), 0);
    const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    return {
      orderCount: orders.length,
      totalRevenue,
      totalVolume,
      pendingCount,
    };
  }, [orders]);

  // フィルタリング
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = o.order_number.toLowerCase().includes(q);
        const matchStore = o.customer.store_name.toLowerCase().includes(q);
        const matchName = o.customer.contact_name.toLowerCase().includes(q);
        const matchItem = o.items.some(i => i.recipe_name.toLowerCase().includes(q));
        return matchNum || matchStore || matchName || matchItem;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // 発注URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.soystories.cafe';
  const generalOrderUrl = `${baseUrl}/order`;
  const customOrderUrl = customStoreName.trim() 
    ? `${baseUrl}/order?store=${encodeURIComponent(customStoreName.trim())}` 
    : generalOrderUrl;

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    showToast('クリップボードにコピーしました！');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const lineTemplate = `【SoyStories】業務用クラフトアイス オンライン発注のご案内

いつもお世話になっております。SoyStoriesです。
当店の業務用大豆クラフトアイス（1L / 2L バルク）のオンライン発注ポータルを開設いたしました。

以下のURLより、24時間いつでも簡単に発注いただけます。
👉 ${customOrderUrl}

・ヤマト運輸 冷凍クール便にて最短3営業日でお店へ直送
・月末締めの一括請求書払い（銀行振込）

ご不明な点はお気軽にご連絡ください！`;

  const emailTemplate = `件名: 【SoyStories】業務用クラフトアイス オンライン発注システムのご案内

${customStoreName || 'お取引先様'}
ご担当者様

いつも大変お世話になっております。
SoyStories（ソイストーリーズ）でございます。

この度、お取引先様専用のオンライン発注ポータルを開設いたしました。
以下のURLより、24時間いつでもご希望のフレーバー・容量（1L / 2L）をご発注いただけます。

■ オンライン発注ポータルURL
${customOrderUrl}

■ 配送・決済条件
・配送方法: ヤマト運輸 クール宅急便（冷凍）
・発送目安: ご発注より最短3営業日以降に福岡より発送（配送日時・時間帯指定可能）
・お支払い: 月末締め・翌月末払いの請求書払い（銀行振込）

店舗様での食後デザートやメニュー展開に、ぜひご活用いただけますと幸いです。
今後とも何卒よろしくお願い申し上げます。`;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans pb-24">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              受発注・出荷オペレーション
            </span>
            <span className="text-xs text-slate-400">オンラインポータル連動</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            B2B 受注・発注管理
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            お客様からのWEB発注をリアルタイムに集約。ヤマト冷凍クール便のサイズ・伝票番号管理と請求書発行をワンストップで実行します。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* ヤマト特約運賃表確認ボタン */}
          <button
            onClick={() => setIsRatesModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
          >
            <Truck className="w-4 h-4 text-blue-600" />
            <span>ヤマト特約運賃・送料マスター</span>
          </button>

          {/* お客様用発注URL発行ボタン */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-emerald-100" />
            <span>発注URLを発行・共有</span>
          </button>

          <Link
            href="/order"
            target="_blank"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
            title="お客様向け発注ポータルを別タブで開く"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>発注画面を確認</span>
          </Link>
        </div>
      </div>

      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">受注総件数</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{stats.orderCount} 件</div>
          <div className="text-[11px] text-slate-500 mt-1">オンラインWEB発注累計</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">受注金額合計 (税込)</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">¥{stats.totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">月末締め請求書発行対象</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">総出荷容量 (バルク)</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{stats.totalVolume} ℓ</div>
          <div className="text-[11px] text-slate-500 mt-1">1Lおよび2Lバルクの合算</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">製造・出荷手配中</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">{stats.pendingCount} 件</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">ヤマト集荷待ち・準備中</div>
        </div>
      </div>

      {/* ── Orders Table Container ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden space-y-4">
        
        {/* Table Controls (Search & Filter) */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'pending', 'processing', 'ready', 'shipped'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'すべて' :
                 st === 'pending' ? '新規受付' :
                 st === 'processing' ? '製造中' :
                 st === 'ready' ? '発送準備完了' : '発送済み'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="注文番号、店舗名、品名で検索..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4">注文番号 / 日時</th>
                <th className="py-3 px-4">発注店舗 / 担当者様</th>
                <th className="py-3 px-4">発注商品内訳 (容量)</th>
                <th className="py-3 px-4">ヤマト配送設定 / 伝票番号</th>
                <th className="py-3 px-4 text-right">請求金額 (税込)</th>
                <th className="py-3 px-4 text-center">ステータス</th>
                <th className="py-3 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    受注データを読み込み中...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto opacity-30" />
                    <p>該当する受注データがありません</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 注文番号 */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">
                          {order.order_number}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {new Date(order.created_at).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* 店舗情報 */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {order.customer.store_name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {order.customer.contact_name} 様 ({order.customer.phone})
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {order.customer.prefecture}{order.customer.city}
                        </div>
                      </td>

                      {/* 商品内訳 */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {order.items.map(item => (
                            <div key={item.id} className="text-slate-800">
                              <span className="font-medium">{item.recipe_name}</span>
                              <span className="font-mono text-[11px] text-emerald-700 ml-1.5">
                                [{item.size} × {item.quantity}本]
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1 font-semibold">
                          総容量: {order.total_volume_liters}ℓ
                        </div>
                      </td>

                      {/* ヤマト配送 */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{order.shipping.box_size}サイズ (クール冷凍)</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          発送予定: {order.shipping.estimated_shipping_date}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          時間指定: {order.shipping.delivery_time_slot}
                        </div>
                        {order.shipping.tracking_number ? (
                          <div className="text-[11px] font-mono text-emerald-700 font-bold mt-1">
                            伝票: {order.shipping.tracking_number}
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-700 font-semibold mt-1">
                            ※伝票番号 未登録
                          </div>
                        )}
                      </td>

                      {/* 請求金額 */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono">
                        <div className="font-bold text-sm text-slate-900">
                          ¥{order.grand_total.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          (送料 ¥{order.shipping.shipping_fee.toLocaleString()}込)
                        </div>
                      </td>

                      {/* ステータス */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer ${
                            order.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            order.status === 'processing' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            order.status === 'ready' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                            order.status === 'shipped' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="pending">新規受付</option>
                          <option value="processing">製造中</option>
                          <option value="ready">発送準備完了</option>
                          <option value="shipped">発送済み</option>
                          <option value="cancelled">キャンセル</option>
                        </select>
                      </td>

                      {/* アクション */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setTrackingNumberInput(order.shipping.tracking_number || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                            title="詳細確認・伝票番号入力"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            詳細
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── お客様向け発注URL発行・共有モーダル ── */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  お客様用オンライン発注URLの発行・共有
                </h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
              {/* URL発行ブロック */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">
                  発注ポータルURL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={customOrderUrl}
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800"
                  />
                  <button
                    onClick={() => handleCopyText(customOrderUrl, 'url')}
                    className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95"
                  >
                    {copiedType === 'url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>URLコピー</span>
                  </button>
                </div>
              </div>

              {/* 店舗名プリセット入力 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] block">
                  💡 特定の取引先様専用URLにする場合（店舗名を自動セット）
                </label>
                <input
                  type="text"
                  placeholder="例: Rota Cafe 福岡店"
                  value={customStoreName}
                  onChange={(e) => setCustomStoreName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* テンプレート 1: LINE / DM 用 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">📱 LINE・Instagram DM用ご案内文</span>
                  <button
                    onClick={() => handleCopyText(lineTemplate, 'line')}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedType === 'line' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    文面をコピー
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={6}
                  value={lineTemplate}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-sans resize-none"
                />
              </div>

              {/* テンプレート 2: メール送信用 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">✉️ メール送信用ご案内文</span>
                  <button
                    onClick={() => handleCopyText(emailTemplate, 'email')}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedType === 'email' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    文面をコピー
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={6}
                  value={emailTemplate}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-sans resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 注文詳細 ＆ ヤマト伝票番号登録モーダル ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  受注詳細: {selectedOrder.order_number}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(selectedOrder.created_at).toLocaleString('ja-JP')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
              
              {/* 顧客・お届け先 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">お届け先情報</span>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>店舗名: <strong className="text-slate-900">{selectedOrder.customer.store_name}</strong></div>
                  <div>担当者: <strong className="text-slate-900">{selectedOrder.customer.contact_name} 様</strong></div>
                  <div>TEL: <span className="font-mono text-slate-900">{selectedOrder.customer.phone}</span></div>
                  <div>Email: <span className="font-mono text-slate-900">{selectedOrder.customer.email}</span></div>
                  <div className="col-span-2">
                    ご住所: 〒{selectedOrder.customer.postal_code} {selectedOrder.customer.prefecture}{selectedOrder.customer.city}{selectedOrder.customer.address_line}
                  </div>
                  {selectedOrder.customer.notes && (
                    <div className="col-span-2 text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                      備考: {selectedOrder.customer.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* 明細 */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block text-xs">発注明細一覧</span>
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="p-3 flex justify-between items-center bg-white">
                      <div>
                        <div className="font-bold text-slate-900">{item.recipe_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.size} × {item.quantity}本 ({item.total_volume_liters}ℓ)
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-900">
                        ¥{item.subtotal.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-slate-50 flex justify-between items-center font-bold text-slate-900">
                    <span>商品合計 (税込)</span>
                    <span className="font-mono">¥{selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  {(() => {
                    const breakdown = selectedOrder.shipping.breakdown || calculateShippingBreakdown(
                      selectedOrder.customer.prefecture,
                      selectedOrder.shipping.box_size,
                      selectedOrder.shipping.box_count
                    );
                    return (
                      <div className="p-3 bg-slate-50 space-y-1 text-slate-600">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800">
                            送料 (ヤマト冷凍 {selectedOrder.shipping.box_size}サイズ × {selectedOrder.shipping.box_count}箱)
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            ¥{selectedOrder.shipping.shipping_fee.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex flex-wrap gap-x-3 gap-y-0.5 pt-1 border-t border-slate-200/60">
                          <span>特約運賃: ¥{breakdown.base_rate}</span>
                          <span>クール代: ¥{breakdown.cool_fee}</span>
                          <span className="text-emerald-700 font-semibold">資材代・発送代: ¥{breakdown.handling_fee}</span>
                          <span>消費税(10%): ¥{breakdown.unit_tax}</span>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="p-3 bg-emerald-50 flex justify-between items-center font-extrabold text-sm text-emerald-950">
                    <span>ご請求総額 (税込)</span>
                    <span className="font-mono text-base text-emerald-800">¥{selectedOrder.grand_total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* ヤマト配送情報 ＆ 伝票番号入力 */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                <span className="font-bold text-blue-950 block text-xs flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  ヤマト運輸 出荷手配 ＆ 伝票番号登録
                </span>
                
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>発送予定日: <strong className="font-mono">{selectedOrder.shipping.estimated_shipping_date}</strong></div>
                  <div>時間指定: <strong>{selectedOrder.shipping.delivery_time_slot}</strong></div>
                </div>

                <div className="pt-2 border-t border-blue-200/80 space-y-1.5">
                  <label className="font-bold text-blue-950 text-[11px] block">
                    ヤマトお問い合わせ送り状番号
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="例: 1234-5678-9012"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveTrackingNumber(selectedOrder.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-sm"
                    >
                      伝票番号を登録して発送済みにする
                    </button>
                  </div>
                  <p className="text-[10px] text-blue-800/80">
                    ※登録するとステータスが「発送済み」に更新され、お客様の履歴画面にも反映されます。
                  </p>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                決済方法: 月末締め請求書払い
              </span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ヤマト特約運賃＆送料マスター表モーダル ── */}
      {isRatesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    ヤマト運輸 運送契約条件 ＆ 送料自動計算マスター（福岡発）
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    2026年09月17日契約締結（福岡早良営業所）/ 資材代・発送代金 ¥200加算反映済
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsRatesModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs overflow-y-auto flex-1">
              
              {/* 計算ルールのハイライト */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl">
                  <div className="font-bold text-blue-900">① 特約基本運賃（税抜）</div>
                  <div className="text-[11px] text-blue-700 mt-1">
                    契約書記載の12地域別・4サイズ別特別取り決め運賃（福岡早良営業所発）
                  </div>
                </div>
                <div className="p-3.5 bg-cyan-50/70 border border-cyan-200 rounded-2xl">
                  <div className="font-bold text-cyan-900">② クール冷凍付加料（税抜）</div>
                  <div className="text-[11px] text-cyan-700 mt-1 font-mono">
                    60: ¥250 / 80: ¥300<br />100: ¥400 / 120: ¥650
                  </div>
                </div>
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <div className="font-bold text-emerald-900">③ 資材・発送代金（税抜）</div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    保冷箱・蓄冷剤・緩衝材・出荷作業料として<strong className="text-emerald-800">各箱 +¥200</strong>加算
                  </div>
                </div>
              </div>

              {/* サイズ別積載仕様（重量リミット） */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  📦 発送箱サイズと積載容量・重量制限（1L = 1kg計算）
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 text-xs">60サイズ</div>
                    <div className="text-emerald-700 font-semibold mt-0.5">最大 2ℓ まで</div>
                    <div className="text-slate-400 text-[10px]">重量上限: 2kg以内</div>
                    <div className="text-slate-500 text-[10px] mt-1">2L×1 または 1L×2</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 text-xs">80サイズ</div>
                    <div className="text-emerald-700 font-semibold mt-0.5">最大 4ℓ まで</div>
                    <div className="text-slate-400 text-[10px]">重量上限: 5kg以内</div>
                    <div className="text-slate-500 text-[10px] mt-1">2L×2 または 1L×4</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 text-xs">100サイズ</div>
                    <div className="text-emerald-700 font-semibold mt-0.5">最大 8ℓ まで</div>
                    <div className="text-slate-400 text-[10px]">重量上限: 10kg以内</div>
                    <div className="text-slate-500 text-[10px] mt-1">2L×4 または 1L×8 (約9kg)</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 text-xs">120サイズ</div>
                    <div className="text-emerald-700 font-semibold mt-0.5">最大 12ℓ まで</div>
                    <div className="text-slate-400 text-[10px]">重量上限: 15kg以内 (最大)</div>
                    <div className="text-slate-500 text-[10px] mt-1">2L×6 または 1L×12 (約14kg)</div>
                  </div>
                </div>
              </div>

              {/* 運賃・請求送料一覧テーブル */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">地域別 請求送料一覧（特約運賃 + クール + 資材代200円 税込）</span>
                  <span className="text-[11px] text-slate-400">※（ ）内は契約書特約基本運賃（税抜）</span>
                </div>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 font-bold">地域</th>
                        <th className="py-2.5 px-3">対象都道府県</th>
                        <th className="py-2.5 px-3 text-right">60サイズ</th>
                        <th className="py-2.5 px-3 text-right">80サイズ</th>
                        <th className="py-2.5 px-3 text-right">100サイズ</th>
                        <th className="py-2.5 px-3 text-right">120サイズ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {YAMATO_CONTRACT_BASE_RATES.map(item => {
                        const fee60 = Math.floor((item.rates['60'] + 250 + 200) * 1.10);
                        const fee80 = Math.floor((item.rates['80'] + 300 + 200) * 1.10);
                        const fee100 = Math.floor((item.rates['100'] + 400 + 200) * 1.10);
                        const fee120 = Math.floor((item.rates['120'] + 650 + 200) * 1.10);

                        return (
                          <tr key={item.region} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900 font-sans whitespace-nowrap">
                              {item.region}
                            </td>
                            <td className="py-2 px-3 text-slate-500 font-sans text-[10px] max-w-xs truncate">
                              {item.prefectures.join('、')}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span className="font-bold text-slate-900">¥{fee60.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400 block font-normal">(¥{item.rates['60']})</span>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span className="font-bold text-slate-900">¥{fee80.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400 block font-normal">(¥{item.rates['80']})</span>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span className="font-bold text-slate-900">¥{fee100.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400 block font-normal">(¥{item.rates['100']})</span>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span className="font-bold text-slate-900">¥{fee120.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400 block font-normal">(¥{item.rates['120']})</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setIsRatesModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 px-6 py-3.5 rounded-2xl bg-slate-900/95 backdrop-blur text-white text-xs font-bold shadow-2xl flex items-center gap-2.5 z-50 animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
}
