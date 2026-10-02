'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Truck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Trash2, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  HelpCircle, 
  Lock, 
  LogIn, 
  LogOut, 
  History, 
  ArrowRight, 
  Sparkles, 
  Boxes, 
  AlertCircle,
  Package,
  Layers,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { getRecipes, getUniformPricing } from '@/lib/cost-api';
import { Recipe } from '@/types/cost';
import { 
  B2BOrder, 
  OrderItem, 
  B2BCustomer, 
  ShippingBoxSize, 
  BulkSize, 
  ShippingPreference 
} from '@/types/order';
import { 
  YAMATO_DELIVERY_TIME_SLOTS, 
  BOX_CAPACITIES, 
  calculateRecommendedBoxSize, 
  getShippingFee, 
  getMinShippingDate, 
  createB2BOrder, 
  getB2BOrders,
  getSavedCustomerProfile, 
  saveCustomerProfile, 
  clearCustomerProfile,
  YAMATO_SHIPPING_RATES
} from '@/lib/order-api';

// 日本の全都道府県リスト
const PREFECTURES = [
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
  '東京都', '神奈川県', '埼玉県', '千葉県', '茨城県', '栃木県', '群馬県', '山梨県', '長野県', '新潟県',
  '大阪府', '京都府', '兵庫県', '滋賀県', '奈良県', '和歌山県',
  '愛知県', '静岡県', '岐阜県', '三重県', '富山県', '石川県', '福井県',
  '広島県', '岡山県', '山口県', '鳥取県', '島根県',
  '香川県', '徳島県', '愛媛県', '高知県',
  '宮城県', '福島県', '岩手県', '山形県', '秋田県', '青森県',
  '北海道'
];

export default function CustomerOrderPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // カートアイテム: { [recipeId_size]: { recipe, size, quantity } }
  const [cart, setCart] = useState<Record<string, { recipe: Recipe; size: BulkSize; quantity: number }>>({});

  // 選択中の配送箱サイズ（手動上書き用。nullの場合は自動計算）
  const [manualBoxSize, setManualBoxSize] = useState<ShippingBoxSize | null>(null);

  // 顧客情報
  const [customer, setCustomer] = useState<B2BCustomer>({
    store_name: '',
    contact_name: '',
    email: '',
    phone: '',
    postal_code: '',
    prefecture: '福岡県',
    city: '',
    address_line: '',
    notes: '',
    is_member: true,
  });

  // ログイン状態
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'order' | 'history'>('order');
  const [orderHistory, setOrderHistory] = useState<B2BOrder[]>([]);

  // 配送日時
  const minShippingDate = useMemo(() => getMinShippingDate(), []);
  const [shippingDate, setShippingDate] = useState<string>(minShippingDate);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>(YAMATO_DELIVERY_TIME_SLOTS[0]);

  // 発注完了状態
  const [submittedOrder, setSubmittedOrder] = useState<B2BOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初期ロード
  useEffect(() => {
    async function init() {
      const [rList, pPricing] = await Promise.all([getRecipes(), getUniformPricing()]);
      setRecipes(rList);

      // 保存されたログイン顧客プロファイルを読み込み
      const savedProfile = getSavedCustomerProfile();
      if (savedProfile) {
        setCustomer(savedProfile);
        setIsLoggedIn(true);
      }

      setLoading(false);
    }
    init();
  }, []);

  // 注文履歴を読み込み
  const loadHistory = async () => {
    const all = await getB2BOrders();
    if (customer.email || customer.store_name) {
      const filtered = all.filter(o => 
        (customer.email && o.customer.email.toLowerCase() === customer.email.toLowerCase()) ||
        (customer.store_name && o.customer.store_name === customer.store_name)
      );
      setOrderHistory(filtered.length > 0 ? filtered : all.slice(0, 5));
    } else {
      setOrderHistory(all.slice(0, 5));
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  // カート操作
  const updateCartQuantity = (recipe: Recipe, size: BulkSize, delta: number) => {
    const key = `${recipe.id}_${size}`;
    setCart(prev => {
      const current = prev[key]?.quantity || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return {
        ...prev,
        [key]: { recipe, size, quantity: next }
      };
    });
  };

  // カートアイテム一覧と計算
  const cartItems: OrderItem[] = useMemo(() => {
    return Object.entries(cart).map(([key, item]) => {
      const is2L = item.size === '2L';
      // 2L標準卸価格: 4,320円、1L標準卸価格: 2,380円 (税込)
      const unitPrice = is2L ? 4320 : 2380;
      const volumeLiters = is2L ? 2 * item.quantity : 1 * item.quantity;
      return {
        id: key,
        recipe_id: item.recipe.id,
        recipe_name: item.recipe.name,
        size: item.size,
        unit_price: unitPrice,
        quantity: item.quantity,
        total_volume_liters: volumeLiters,
        subtotal: unitPrice * item.quantity,
      };
    });
  }, [cart]);

  // 総リットル数
  const totalLiters = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total_volume_liters, 0);
  }, [cartItems]);

  // 商品合計金額 (税込)
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cartItems]);

  // 自動判定された箱サイズ
  const autoBoxConfig = useMemo(() => {
    return calculateRecommendedBoxSize(totalLiters);
  }, [totalLiters]);

  // 適用される箱サイズ
  const appliedBoxSize: ShippingBoxSize = manualBoxSize || autoBoxConfig.boxSize;
  const appliedBoxCount = autoBoxConfig.boxCount;

  // ヤマトクール便送料の自動計算
  const shippingFee = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return getShippingFee(customer.prefecture, appliedBoxSize, appliedBoxCount);
  }, [customer.prefecture, appliedBoxSize, appliedBoxCount, cartItems]);

  // 総合計金額
  const grandTotal = subtotal + shippingFee;

  // ログイン / ログアウト
  const handleLogout = () => {
    clearCustomerProfile();
    setIsLoggedIn(false);
    setCustomer(prev => ({ ...prev, is_member: false }));
  };

  // 注文実行
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('商品を選択してください');
      return;
    }
    if (!customer.store_name.trim() || !customer.contact_name.trim() || !customer.phone.trim() || !customer.email.trim() || !customer.address_line.trim()) {
      alert('お届け先とご連絡先情報をすべて入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer,
        items: cartItems,
        total_volume_liters: totalLiters,
        subtotal,
        shipping: {
          box_size: appliedBoxSize,
          box_count: appliedBoxCount,
          shipping_fee: shippingFee,
          estimated_shipping_date: shippingDate,
          preferred_delivery_date: shippingDate,
          delivery_time_slot: deliveryTimeSlot,
        },
        grand_total: grandTotal,
        payment_method: 'invoice' as const,
      };

      const newOrder = await createB2BOrder(orderData);
      setSubmittedOrder(newOrder);
      setCart({});
      if (customer.is_member) {
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error(err);
      alert('注文処理中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 注文履歴からの再発注
  const handleRepeatOrder = (order: B2BOrder) => {
    const newCart: Record<string, { recipe: Recipe; size: BulkSize; quantity: number }> = {};
    order.items.forEach(item => {
      const matched = recipes.find(r => r.id === item.recipe_id);
      if (matched) {
        newCart[`${matched.id}_${item.size}`] = {
          recipe: matched,
          size: item.size,
          quantity: item.quantity,
        };
      }
    });
    setCart(newCart);
    setActiveTab('order');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-slate-400 text-xs font-medium flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin"></div>
          発注ポータルを読み込み中...
        </div>
      </div>
    );
  }

  // ── 発注完了画面 ──
  if (submittedOrder) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 font-sans">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ご注文を承りました
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              発注が正常に完了いたしました
            </h1>
            <p className="text-xs text-slate-500">
              ご注文番号: <strong className="font-mono text-slate-800 text-sm">{submittedOrder.order_number}</strong>
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="text-slate-500">発注店舗 / 貴社名</span>
              <strong className="text-slate-900">{submittedOrder.customer.store_name}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="text-slate-500">ご担当者様</span>
              <span className="text-slate-800">{submittedOrder.customer.contact_name} 様</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="text-slate-500">発送予定日（最短3営業日後）</span>
              <span className="font-semibold text-slate-900">{submittedOrder.shipping.estimated_shipping_date}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="text-slate-500">ヤマト配送時間帯指定</span>
              <span className="text-slate-800">{submittedOrder.shipping.delivery_time_slot}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="text-slate-500">発送サイズ / 便種</span>
              <span className="text-slate-800">
                ヤマト冷凍クール便 {submittedOrder.shipping.box_size}サイズ ({submittedOrder.total_volume_liters}ℓ)
              </span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-bold text-slate-900">
              <span>ご請求総額 (税込・送料込)</span>
              <span className="font-mono text-base text-emerald-700">¥{submittedOrder.grand_total.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1 leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              お支払いとお届けについて
            </div>
            <p>
              ・決済は【月末締め・翌月末払いの請求書発行】となります。当月末にまとめて請求書PDFをお送りいたします。
            </p>
            <p>
              ・発送完了後、ヤマト運輸の送り状番号（追跡番号）をご登録のメールアドレスへお知らせいたします。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                setSubmittedOrder(null);
                setActiveTab('history');
              }}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center"
            >
              発注履歴を確認する
            </button>
            <button
              onClick={() => {
                setSubmittedOrder(null);
                setActiveTab('order');
              }}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md text-center"
            >
              続けて別の発注を行う
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Top Header ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                SoyStories B2B 卸売専用
              </span>
              <span className="text-xs text-slate-400 font-medium">オンライン受発注ポータル</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              業務用バルクアイス オンライン発注
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              100%植物性・グルテンフリーの米粉クラフトアイス（1L / 2L業務用バルク容器）。ヤマト運輸冷凍クール便にて、最短3営業日でお店へ直送いたします。
            </p>
          </div>

          {/* User Profile / Status */}
          <div className="relative z-10 flex items-center gap-3">
            {isLoggedIn ? (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-right">
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  ログイン中
                </div>
                <div className="text-xs font-bold text-slate-900 mt-0.5 truncate max-w-[200px]">
                  {customer.store_name || customer.contact_name}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold mt-1 inline-flex items-center gap-0.5"
                >
                  <LogOut className="w-3 h-3" />
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 text-xs text-amber-900 max-w-xs">
                <div className="font-bold flex items-center gap-1 text-amber-950">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  都度購入・ゲスト発注可能
                </div>
                <div className="text-[11px] text-amber-800/80 mt-0.5">
                  事前の会員登録なしでも、お届け先入力のみですぐにご注文いただけます。
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('order')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'order'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            アイスを発注する
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4 text-slate-400" />
            過去の発注履歴
          </button>
        </div>

        {/* ── TAB 1: 発注画面 ── */}
        {activeTab === 'order' && (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* 左側: 商品選択（2カラム） */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-emerald-600" />
                    フレーバーと容量の選択
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    お好みのフレーバーと容量（1L または 2L）を選んで数量を追加してください。
                  </p>
                </div>
                <div className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  全10種 クラフトフレーバー
                </div>
              </div>

              {/* フレーバー一覧 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipes.map(recipe => {
                  const qty1L = cart[`${recipe.id}_1L`]?.quantity || 0;
                  const qty2L = cart[`${recipe.id}_2L`]?.quantity || 0;
                  const isSelected = qty1L > 0 || qty2L > 0;

                  return (
                    <div
                      key={recipe.id}
                      className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-2xs ${
                        isSelected 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/15 bg-emerald-50/10' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-slate-900">
                            {recipe.name}
                          </h3>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                            プラントベース
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {recipe.description || '有機素材にこだわった濃厚ヴィーガンアイス。'}
                        </p>
                      </div>

                      {/* 1L / 2L 数量コントローラー */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                        
                        {/* 2L 業務用バルク */}
                        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900">📦 2L バルク容器</span>
                              <span className="text-[10px] font-mono text-slate-500">（約20ディッシャー）</span>
                            </div>
                            <div className="text-xs font-bold text-emerald-700 font-mono mt-0.5">
                              ¥4,320 <span className="text-[10px] font-normal text-slate-400">税込</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(recipe, '2L', -1)}
                              disabled={qty2L === 0}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-xs text-slate-900">
                              {qty2L}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(recipe, '2L', 1)}
                              className="w-7 h-7 rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* 1L バルク */}
                        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900">🍨 1L コンパクト</span>
                              <span className="text-[10px] font-mono text-slate-500">（約10ディッシャー）</span>
                            </div>
                            <div className="text-xs font-bold text-emerald-700 font-mono mt-0.5">
                              ¥2,380 <span className="text-[10px] font-normal text-slate-400">税込</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(recipe, '1L', -1)}
                              disabled={qty1L === 0}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-xs text-slate-900">
                              {qty1L}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(recipe, '1L', 1)}
                              className="w-7 h-7 rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── 配送設定・ヤマト指定 ── */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    ヤマト運輸 クール冷凍便・配送希望設定
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* 最短発送日 */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      発送予定日（最短 3営業日以降）*
                    </label>
                    <input
                      type="date"
                      required
                      min={minShippingDate}
                      value={shippingDate}
                      onChange={(e) => setShippingDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                    <p className="text-[11px] text-slate-400">
                      ※土日祝を除く3営業日以降に福岡より発送いたします。
                    </p>
                  </div>

                  {/* ヤマト配達時間帯指定 */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      配達希望時間帯（ヤマト公式）*
                    </label>
                    <select
                      value={deliveryTimeSlot}
                      onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                    >
                      {YAMATO_DELIVERY_TIME_SLOTS.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400">
                      ※仕込み・仕入れ時間に合わせてご指定いただけます。
                    </p>
                  </div>
                </div>

                {/* 発送箱サイズ選択（自動計算＆手動選択） */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-amber-600" />
                      梱包・発送サイズ（容量に合わせて自動最適化）
                    </span>
                    {manualBoxSize && (
                      <button
                        type="button"
                        onClick={() => setManualBoxSize(null)}
                        className="text-[11px] text-emerald-700 hover:underline font-semibold"
                      >
                        自動判定に戻す
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(['60', '80', '100', '120'] as ShippingBoxSize[]).map(sizeKey => {
                      const isSelected = appliedBoxSize === sizeKey;
                      const cap = BOX_CAPACITIES[sizeKey];
                      const isAuto = autoBoxConfig.boxSize === sizeKey && !manualBoxSize;

                      return (
                        <button
                          key={sizeKey}
                          type="button"
                          onClick={() => setManualBoxSize(sizeKey)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-xs">{sizeKey}サイズ</span>
                            {isAuto && (
                              <span className="text-[9px] font-bold bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full">
                                最適
                              </span>
                            )}
                          </div>
                          <div className={`text-[10px] font-mono ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                            {cap.maxLiters}ℓまで
                          </div>
                          <div className={`text-[9px] mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            重さ上限: {cap.maxWeightKg}kg
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── お客様情報入力 ── */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-slate-700" />
                    <h3 className="font-bold text-sm text-slate-900">
                      お届け先・ご請求先情報
                    </h3>
                  </div>
                  {isLoggedIn && (
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                      ✓ 会員情報反映中
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">店舗名 / 貴社名 *</label>
                    <input
                      type="text"
                      required
                      placeholder="例: カフェ・グリーン 福岡店"
                      value={customer.store_name}
                      onChange={(e) => setCustomer({ ...customer, store_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ご担当者様名 *</label>
                    <input
                      type="text"
                      required
                      placeholder="例: 山田 太郎"
                      value={customer.contact_name}
                      onChange={(e) => setCustomer({ ...customer, contact_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">メールアドレス（請求書・追跡番号送付先）*</label>
                    <input
                      type="email"
                      required
                      placeholder="example@cafe.jp"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">お電話番号 *</label>
                    <input
                      type="tel"
                      required
                      placeholder="092-123-4567"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">郵便番号 *</label>
                      <input
                        type="text"
                        required
                        placeholder="810-0041"
                        value={customer.postal_code}
                        onChange={(e) => setCustomer({ ...customer, postal_code: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">都道府県（送料自動連動）*</label>
                      <select
                        value={customer.prefecture}
                        onChange={(e) => setCustomer({ ...customer, prefecture: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold text-slate-800 cursor-pointer"
                      >
                        {PREFECTURES.map(pref => (
                          <option key={pref} value={pref}>{pref}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">市区町村 *</label>
                      <input
                        type="text"
                        required
                        placeholder="福岡市中央区大名"
                        value={customer.city}
                        onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">番地・建物名・階数 *</label>
                    <input
                      type="text"
                      required
                      placeholder="1-2-3 メゾン大名 1F"
                      value={customer.address_line}
                      onChange={(e) => setCustomer({ ...customer, address_line: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">配送時メモ・備考 (任意)</label>
                    <input
                      type="text"
                      placeholder="例: 店舗裏口へ搬入希望、不在時はお電話ください 等"
                      value={customer.notes || ''}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                </div>

                {/* ログイン・アカウント保持チェック */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customer.is_member}
                      onChange={(e) => setCustomer({ ...customer, is_member: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      この店舗情報を保持し、次回から自動入力する（会員ログイン状態を保持）
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 右側: 発注サマリー・カート・送信ボタン（固定追従） */}
            <div className="lg:col-span-1 space-y-5 sticky top-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    発注内容サマリー
                  </h3>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                    合計 {totalLiters}ℓ
                  </span>
                </div>

                {/* カートアイテム一覧 */}
                {cartItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <Boxes className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs">左のフレーバー一覧から<br />本数を追加してください</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100 text-xs">
                    {cartItems.map(item => (
                      <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900">{item.recipe_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {item.size} × {item.quantity}本 ({item.total_volume_liters}ℓ)
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-slate-900">
                            ¥{item.subtotal.toLocaleString()}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = { ...cart };
                              delete copy[item.id];
                              setCart(copy);
                            }}
                            className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 発送サイズ・送料表示 */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-500" />
                      発送サイズ:
                    </span>
                    <strong className="font-mono text-slate-900">
                      {appliedBoxSize}サイズ ({appliedBoxCount}箱)
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>お届け先エリア:</span>
                    <span className="font-semibold text-slate-800">{customer.prefecture}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200/60">
                    <span>冷凍クール便送料 (税込):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {cartItems.length > 0 ? `¥${shippingFee.toLocaleString()}` : '¥0'}
                    </span>
                  </div>
                </div>

                {/* 金額合計 */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>商品小計 (税込)</span>
                    <span className="font-mono font-bold text-slate-800">¥{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>送料合計 (税込)</span>
                    <span className="font-mono font-bold text-slate-800">¥{shippingFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                    <span>ご請求総額</span>
                    <span className="font-mono text-lg text-emerald-700">¥{grandTotal.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">
                    ※月末締めの請求書払い（銀行振込）
                  </p>
                </div>

                {/* 送信ボタン */}
                <button
                  type="submit"
                  disabled={cartItems.length === 0 || isSubmitting}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      発注を送信中...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      この内容で発注を確定する
                    </>
                  )}
                </button>

                <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                  ご注文後、すぐに登録メールアドレスへ受付確認メールをお送りいたします。
                </div>
              </div>
            </div>

          </form>
        )}

        {/* ── TAB 2: 発注履歴画面 ── */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">過去の発注履歴</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  過去のご注文内容の確認や、同じ内容での再発注（リピート発注）がワンタップで行えます。
                </p>
              </div>
              <button
                onClick={loadHistory}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                再読み込み
              </button>
            </div>

            {orderHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <History className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-xs">発注履歴がまだありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderHistory.map(order => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/70 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {order.order_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'completed' || order.status === 'shipped'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status === 'pending' ? '新規受付' :
                           order.status === 'processing' ? '製造中' :
                           order.status === 'ready' ? '発送準備完了' :
                           order.status === 'shipped' ? '発送済み' : '完了'}
                        </span>
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        発注日時: {new Date(order.created_at).toLocaleString('ja-JP')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block">発注品目</span>
                        <span className="font-semibold text-slate-800">
                          {order.items.map(i => `${i.recipe_name} (${i.size}×${i.quantity})`).join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">総容量 / 発送サイズ</span>
                        <span className="font-mono text-slate-800 font-medium">
                          {order.total_volume_liters}ℓ ({order.shipping.box_size}サイズ)
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">発送予定 / 希望時間帯</span>
                        <span className="text-slate-800">
                          {order.shipping.estimated_shipping_date} ({order.shipping.delivery_time_slot})
                        </span>
                      </div>
                      <div className="text-right sm:text-left md:text-right">
                        <span className="text-[11px] text-slate-400 block">請求総額 (税込)</span>
                        <span className="font-mono font-bold text-base text-emerald-700">
                          ¥{order.grand_total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <div className="text-slate-500 text-[11px]">
                        {order.shipping.tracking_number ? (
                          <span className="text-emerald-700 font-mono font-semibold">
                            ヤマト伝票番号: {order.shipping.tracking_number}
                          </span>
                        ) : (
                          <span>※発送後にヤマトお問い合わせ伝票番号が表示されます</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRepeatOrder(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <RotateCcw className="w-3 h-3" />
                        この内容で再発注する
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
