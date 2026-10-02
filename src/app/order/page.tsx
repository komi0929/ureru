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
  Mail, 
  Phone, 
  History, 
  RotateCcw, 
  ArrowDown, 
  X, 
  AlertCircle,
  Package,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { getRecipes } from '@/lib/cost-api';
import { Recipe } from '@/types/cost';
import { 
  B2BOrder, 
  OrderItem, 
  B2BCustomer, 
  ShippingBoxSize, 
  BulkSize 
} from '@/types/order';
import { 
  YAMATO_DELIVERY_TIME_SLOTS, 
  calculateRecommendedBoxSize, 
  calculateShippingBreakdown,
  BULK_PRICING,
  getEstimatedShippingDate,
  getMinDeliveryDate,
  searchAddressByZip,
  createB2BOrder, 
  getB2BOrders,
  getSavedCustomerProfile, 
  clearCustomerProfile,
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

  const [isSearchingZip, setIsSearchingZip] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'order' | 'history'>('order');
  const [orderHistory, setOrderHistory] = useState<B2BOrder[]>([]);

  // 配送日程（出荷予定日：3営業日以内に出荷、お届け希望日：ヤマト地域別リードタイム後）
  const estimatedShippingDate = useMemo(() => getEstimatedShippingDate(), []);
  const minDeliveryDate = useMemo(() => getMinDeliveryDate(customer.prefecture), [customer.prefecture]);
  const [deliveryTimingMode, setDeliveryTimingMode] = useState<'asap' | 'date'>('asap');
  const [preferredDeliveryDate, setPreferredDeliveryDate] = useState<string>('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>(YAMATO_DELIVERY_TIME_SLOTS[0]);

  // 発注確認モーダル・送信状態
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submittedOrder, setSubmittedOrder] = useState<B2BOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初期ロード
  useEffect(() => {
    async function init() {
      try {
        const [rList, allOrders] = await Promise.all([getRecipes(), getB2BOrders()]);
        setRecipes(rList);

        // URLパラメータから店舗名プレフィルがあるかチェック
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const storeParam = params.get('store');
          if (storeParam) {
            setCustomer(prev => ({ ...prev, store_name: storeParam }));
          }
        }

        // 保存されたログイン顧客プロファイルを読み込み
        const savedProfile = getSavedCustomerProfile();
        if (savedProfile) {
          setCustomer(savedProfile);
          setIsLoggedIn(true);

          // 保存された店舗/メールの履歴を取得
          const filtered = allOrders.filter(o => 
            (savedProfile.email && o.customer.email.toLowerCase() === savedProfile.email.toLowerCase()) ||
            (savedProfile.store_name && o.customer.store_name === savedProfile.store_name)
          );
          setOrderHistory(filtered.length > 0 ? filtered : allOrders.slice(0, 5));
        } else {
          setOrderHistory(allOrders.slice(0, 5));
        }
      } catch (e) {
        console.error('Failed to init order page', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // 注文履歴を再取得
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

  // カート計算
  const cartItems: OrderItem[] = useMemo(() => {
    return Object.entries(cart).map(([key, item]) => {
      const pricing = BULK_PRICING[item.size];
      const unitPrice = pricing.priceInclTax;
      const volumeLiters = item.size === '2L' ? 2 * item.quantity : 1 * item.quantity;
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

  const totalBottles = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalLiters = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total_volume_liters, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cartItems]);

  const productSubtotalExclTax = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (BULK_PRICING[item.size].priceExclTax * item.quantity), 0);
  }, [cartItems]);

  const productTax8 = subtotal - productSubtotalExclTax;

  // 自動判定された箱サイズ
  const autoBoxConfig = useMemo(() => {
    return calculateRecommendedBoxSize(totalLiters);
  }, [totalLiters]);

  const appliedBoxSize: ShippingBoxSize = autoBoxConfig.boxSize;
  const appliedBoxCount = autoBoxConfig.boxCount;

  // ヤマトクール便送料および内訳の自動計算
  const shippingBreakdown = useMemo(() => {
    if (cartItems.length === 0) return null;
    return calculateShippingBreakdown(customer.prefecture, appliedBoxSize, appliedBoxCount);
  }, [customer.prefecture, appliedBoxSize, appliedBoxCount, cartItems]);

  const shippingFee = shippingBreakdown ? shippingBreakdown.total_shipping_fee : 0;
  const grandTotal = subtotal + shippingFee;

  // ログアウト
  const handleLogout = () => {
    clearCustomerProfile();
    setIsLoggedIn(false);
    setCustomer(prev => ({ 
      ...prev, 
      store_name: '',
      contact_name: '',
      email: '',
      phone: '',
      postal_code: '',
      address_line: '',
      notes: '',
      is_member: false 
    }));
  };

  // 郵便番号入力時の住所自動補完
  const handleZipCodeChange = async (val: string) => {
    setCustomer(prev => ({ ...prev, postal_code: val }));
    const clean = val.replace(/[^0-9]/g, '');
    if (clean.length === 7) {
      setIsSearchingZip(true);
      const res = await searchAddressByZip(clean);
      if (res) {
        setCustomer(prev => ({
          ...prev,
          prefecture: res.prefecture,
          city: res.address,
        }));
      }
      setIsSearchingZip(false);
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
    // スムーズスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 発注内容の確認画面を開く（入力バリデーション）
  const handleProceedToConfirmation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const errors: string[] = [];

    if (cartItems.length === 0) {
      errors.push('発注商品を選択してください（数量を追加してください）。');
    }
    if (!customer.store_name.trim()) {
      errors.push('「店舗名 / 貴社名」を入力してください。');
    }
    if (!customer.contact_name.trim()) {
      errors.push('「ご担当者様名」を入力してください。');
    }
    if (!customer.email.trim()) {
      errors.push('「メールアドレス」を入力してください。');
    }
    if (!customer.phone.trim()) {
      errors.push('「お電話番号」を入力してください。');
    }
    if (!customer.address_line.trim()) {
      errors.push('「番地・建物名」を入力してください。');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      document.getElementById('order-customer-form')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setValidationErrors([]);
    setIsConfirmModalOpen(true);
  };

  // 確定送信の実行
  const handleExecuteSubmit = async () => {
    setIsSubmitting(true);
    try {
      const actualDeliveryDate = deliveryTimingMode === 'asap' 
        ? minDeliveryDate 
        : (preferredDeliveryDate || minDeliveryDate);

      const orderData = {
        customer,
        items: cartItems,
        total_volume_liters: totalLiters,
        subtotal,
        shipping: {
          box_size: appliedBoxSize,
          box_count: appliedBoxCount,
          shipping_fee: shippingFee,
          breakdown: shippingBreakdown || undefined,
          estimated_shipping_date: estimatedShippingDate, // 3営業日以内に出荷
          preferred_delivery_date: actualDeliveryDate,     // お届け希望日
          delivery_time_slot: deliveryTimeSlot,
        },
        grand_total: grandTotal,
        payment_method: 'invoice' as const,
      };

      const newOrder = await createB2BOrder(orderData);
      setSubmittedOrder(newOrder);
      setCart({});
      setIsConfirmModalOpen(false);
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

  // 直近の過去注文
  const lastOrder = orderHistory.length > 0 ? orderHistory[0] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-slate-500 text-xs font-semibold flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin"></div>
          発注ポータルを読み込み中...
        </div>
      </div>
    );
  }

  // ── 注文完了画面（Receipt View） ──
  if (submittedOrder) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 font-sans">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
              ご注文受付完了
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              発注を受け付けました
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              注文番号: <strong className="text-slate-900 text-sm">{submittedOrder.order_number}</strong>
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="text-slate-500">店舗名 / 貴社名</span>
              <strong className="text-slate-900">{submittedOrder.customer.store_name}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="text-slate-500">ご担当者様</span>
              <span className="text-slate-900">{submittedOrder.customer.contact_name} 様</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="text-slate-500">出荷予定</span>
              <span className="font-semibold text-slate-900">{submittedOrder.shipping.estimated_shipping_date}（3営業日以内に福岡より出荷）</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="text-slate-500">お届け希望日時</span>
              <span className="font-bold text-emerald-800">
                {submittedOrder.shipping.preferred_delivery_date || '最短配達'}（{submittedOrder.shipping.delivery_time_slot}）
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="text-slate-500">発送便種</span>
              <span className="text-slate-800">
                ヤマト冷凍クール便（{submittedOrder.shipping.box_size}サイズ × {submittedOrder.shipping.box_count}箱 / 計{submittedOrder.total_volume_liters}ℓ）
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="text-slate-500">クール便送料 (税込)</span>
              <span className="font-mono font-semibold text-slate-900">
                ¥{submittedOrder.shipping.shipping_fee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-extrabold text-slate-900">
              <span>ご請求総額 (税込)</span>
              <span className="font-mono text-base text-emerald-700">¥{submittedOrder.grand_total.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>お支払いとお届けについて</span>
            </div>
            <p>
              ・決済は【月末締め・翌月末払いの請求書払い（銀行振込）】となります。
            </p>
            <p>
              ・出荷完了後、ヤマト運輸のお問い合わせ伝票番号をご登録のメールアドレスへお知らせいたします。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={() => {
                setSubmittedOrder(null);
                setActiveTab('history');
              }}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
            >
              発注履歴を確認する
            </button>
            <button
              onClick={() => {
                setSubmittedOrder(null);
                setActiveTab('order');
              }}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md text-center cursor-pointer"
            >
              続けて発注を行う
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 px-4 sm:px-6 lg:px-8 font-sans pb-32">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* ── B2B Minimal Header ── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                SoyStories B2B
              </span>
              <span className="text-xs text-slate-500 font-medium">業務用クラフトアイス発注ポータル</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              仕入れ発注シート
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                3営業日以内に福岡より発送（ヤマト冷凍便）
              </span>
              <span className="text-slate-300">|</span>
              <span>月末締め請求書払い</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-slate-700">1L: ¥2,000+税 / 2L: ¥4,000+税</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {isLoggedIn ? (
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-right">
                <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  ログイン中
                </div>
                <div className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                  {customer.store_name || customer.contact_name}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors mt-0.5 cursor-pointer block text-right w-full"
                >
                  登録解除
                </button>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                都度購入・ゲスト発注可
              </div>
            )}
          </div>
        </div>

        {/* ── ナビゲーションタブ ── */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className={`pb-2.5 px-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'order'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            商品を発注する
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            過去の発注履歴 ({orderHistory.length})
          </button>
        </div>

        {/* ── TAB 1: 発注画面 ── */}
        {activeTab === 'order' && (
          <div className="space-y-5">

            {/* ── 前回発注のワンタップ反映ショートカット ── */}
            {lastOrder && (
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                    <span>前回の発注内容をそのまま反映</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/90 font-mono">
                    {lastOrder.items.map(i => `${i.recipe_name.replace(/^米粉アイス\s*[【\[]?/, '').replace(/[】\]]$/, '')} (${i.size}×${i.quantity})`).join(', ')} （計{lastOrder.total_volume_liters}ℓ / ¥{lastOrder.grand_total.toLocaleString()}）
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRepeatOrder(lastOrder)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer text-center"
                >
                  前回の注文を反映
                </button>
              </div>
            )}

            {/* ── 商品発注リスト（プロ向け高密度リスト） ── */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>フレーバー一覧</span>
                    <span className="text-xs text-slate-400 font-normal">（全10フレーバー）</span>
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  ※1本単位で発注可能
                </span>
              </div>

              {/* フレーバー行リスト */}
              <div className="divide-y divide-slate-100">
                {recipes.map(recipe => {
                  const qty1L = cart[`${recipe.id}_1L`]?.quantity || 0;
                  const qty2L = cart[`${recipe.id}_2L`]?.quantity || 0;
                  const isSelected = qty1L > 0 || qty2L > 0;
                  const cleanName = recipe.name.replace(/^米粉アイス\s*[【\[]?/, '').replace(/[】\]]$/, '');

                  return (
                    <div 
                      key={recipe.id}
                      className={`py-3 first:pt-1 last:pb-1 transition-colors rounded-xl px-2 sm:px-3 ${
                        isSelected ? 'bg-emerald-50/25' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        
                        {/* 左: 品名 */}
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-slate-900">
                            {cleanName}
                          </h3>
                          {isSelected && (
                            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.2 rounded-full">
                              計 {qty2L * 2 + qty1L}ℓ 選択中
                            </span>
                          )}
                        </div>

                        {/* 右: 2L と 1L の数量操作エリア */}
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-4 shrink-0">
                          
                          {/* 2L コントローラー */}
                          <div className={`flex items-center justify-between sm:justify-start gap-2 px-2.5 py-1.5 rounded-xl border transition-all ${
                            qty2L > 0 ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <div className="pr-1">
                              <span className="font-bold text-xs text-slate-900 block leading-tight">2L バルク</span>
                              <span className="text-[10px] font-mono text-emerald-700 font-bold block leading-tight">¥4,000 <span className="text-[9px] text-slate-400 font-normal">(税込¥4,320)</span></span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(recipe, '2L', -1)}
                                disabled={qty2L === 0}
                                aria-label={`${cleanName} 2Lを1本減らす`}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center font-mono font-extrabold text-xs text-slate-900">
                                {qty2L}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(recipe, '2L', 1)}
                                aria-label={`${cleanName} 2Lを1本増やす`}
                                className="w-8 h-8 rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* 1L コントローラー */}
                          <div className={`flex items-center justify-between sm:justify-start gap-2 px-2.5 py-1.5 rounded-xl border transition-all ${
                            qty1L > 0 ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <div className="pr-1">
                              <span className="font-bold text-xs text-slate-900 block leading-tight">1L バルク</span>
                              <span className="text-[10px] font-mono text-emerald-700 font-bold block leading-tight">¥2,000 <span className="text-[9px] text-slate-400 font-normal">(税込¥2,160)</span></span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(recipe, '1L', -1)}
                                disabled={qty1L === 0}
                                aria-label={`${cleanName} 1Lを1本減らす`}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center font-mono font-extrabold text-xs text-slate-900">
                                {qty1L}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(recipe, '1L', 1)}
                                aria-label={`${cleanName} 1Lを1本増やす`}
                                className="w-8 h-8 rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 配送設定（お届け希望日・時間帯） ── */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Truck className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  配送設定（ヤマト運輸 冷凍クール便）
                </h3>
              </div>

              {/* 発送目安案内 */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>発送予定：ご注文確定より 3営業日以内に福岡より出荷</span>
                </div>
                <div className="text-[11px] text-blue-800 font-mono">
                  （最短出荷予定: <strong>{estimatedShippingDate}</strong> 頃）
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* お届け希望日 */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    お届け希望日（店舗到着日）*
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryTimingMode('asap')}
                      className={`py-2 px-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        deliveryTimingMode === 'asap'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      最短でお届け
                      <span className={`block text-[10px] font-normal font-mono ${deliveryTimingMode === 'asap' ? 'text-slate-300' : 'text-slate-400'}`}>
                        ({minDeliveryDate}着 目安)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryTimingMode('date');
                        if (!preferredDeliveryDate) {
                          setPreferredDeliveryDate(minDeliveryDate);
                        }
                      }}
                      className={`py-2 px-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        deliveryTimingMode === 'date'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      日付を指定する
                      <span className={`block text-[10px] font-normal ${deliveryTimingMode === 'date' ? 'text-slate-300' : 'text-slate-400'}`}>
                        カレンダー指定
                      </span>
                    </button>
                  </div>

                  {deliveryTimingMode === 'date' && (
                    <div className="pt-1">
                      <input
                        type="date"
                        required
                        min={minDeliveryDate}
                        value={preferredDeliveryDate || minDeliveryDate}
                        onChange={(e) => setPreferredDeliveryDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        ※{customer.prefecture}への最短指定可能日は {minDeliveryDate} 以降です。
                      </span>
                    </div>
                  )}
                </div>

                {/* 配達希望時間帯 */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    配達希望時間帯（ヤマト公式）*
                  </label>
                  <select
                    value={deliveryTimeSlot}
                    onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {YAMATO_DELIVERY_TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 block">
                    ※仕込み時間やアイドルタイムに合わせてご指定いただけます。
                  </span>
                </div>
              </div>

              {/* 梱包サイズ（自動最適化） */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                  梱包便種:
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  ヤマト冷凍便 {appliedBoxSize}サイズ ({appliedBoxCount}箱 / 合計{totalLiters}ℓ) 自動最適化
                </span>
              </div>
            </div>

            {/* ── お届け先・ご請求先情報 ── */}
            <div id="order-customer-form" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4 scroll-mt-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-700" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    お届け先・ご請求先情報
                  </h3>
                </div>
                {isLoggedIn && (
                  <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                    ✓ 会員情報反映中
                  </span>
                )}
              </div>

              {/* エラーメッセージ表示 */}
              {validationErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>入力内容をご確認ください</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">店舗名 / 貴社名 *</label>
                  <input
                    type="text"
                    required
                    placeholder="例: カフェ・グリーン 福岡店"
                    value={customer.store_name}
                    onChange={(e) => setCustomer({ ...customer, store_name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-sm sm:text-xs"
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
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-sm sm:text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">メールアドレス（請求書・追跡番号送付先）*</label>
                  <input
                    type="email"
                    required
                    inputMode="email"
                    placeholder="example@cafe.jp"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono text-sm sm:text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">お電話番号 *</label>
                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    placeholder="092-123-4567"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono text-sm sm:text-xs"
                  />
                </div>

                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">郵便番号 (7桁) *</label>
                      {isSearchingZip && (
                        <span className="text-[10px] text-emerald-600 font-semibold animate-pulse">
                          住所検索中...
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      placeholder="8100041"
                      value={customer.postal_code}
                      onChange={(e) => handleZipCodeChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono text-sm sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">都道府県（送料連動）*</label>
                    <select
                      value={customer.prefecture}
                      onChange={(e) => setCustomer({ ...customer, prefecture: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none cursor-pointer font-bold text-slate-800 text-sm sm:text-xs"
                    >
                      {PREFECTURES.map(pref => (
                        <option key={pref} value={pref}>{pref}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">市区町村・町名 *</label>
                    <input
                      type="text"
                      required
                      placeholder="福岡市中央区大名"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-sm sm:text-xs"
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
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-sm sm:text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">配送時メモ (任意)</label>
                  <input
                    type="text"
                    placeholder="例: 店舗裏口へ搬入希望、不在時ご連絡ください 等"
                    value={customer.notes || ''}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 店舗情報保持チェック */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customer.is_member}
                    onChange={(e) => setCustomer({ ...customer, is_member: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    この店舗情報を保存し、次回から自動入力する
                  </span>
                </label>
              </div>
            </div>

            {/* ── 発注サマリー ＆ 確認へ進むボタン ── */}
            <div id="order-summary-box" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 scroll-mt-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  発注サマリー
                </h3>
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  合計 {totalBottles}本 ({totalLiters}ℓ)
                </span>
              </div>

              {/* カートアイテム一覧 */}
              {cartItems.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  上のフレーバー一覧から数量を選択してください
                </div>
              ) : (
                <div className="space-y-2 divide-y divide-slate-100 text-xs">
                  {cartItems.map(item => (
                    <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900">
                          {item.recipe_name.replace(/^米粉アイス\s*[【\[]?/, '').replace(/[】\]]$/, '')}
                        </span>
                        <span className="text-slate-500 font-mono ml-2">
                          [{item.size} × {item.quantity}本]
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">
                          ¥{item.subtotal.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = { ...cart };
                            delete copy[item.id];
                            setCart(copy);
                          }}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 金額内訳 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>商品小計 (税込8%・全{totalBottles}本)</span>
                  <span className="font-mono font-bold text-slate-800">¥{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>冷凍クール便送料 (税込10% / {customer.prefecture})</span>
                  <span className="font-mono font-bold text-slate-800">
                    {cartItems.length > 0 ? `¥${shippingFee.toLocaleString()}` : '¥0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>ご請求総額 (税込)</span>
                  <span className="font-mono text-base text-emerald-700">¥{grandTotal.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-slate-400 text-right pt-0.5">
                  ※月末締め・翌月末払いの請求書発行（銀行振込）
                </div>
              </div>

              {/* 確認へ進むボタン */}
              <button
                type="button"
                onClick={() => handleProceedToConfirmation()}
                disabled={cartItems.length === 0}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>注文内容の最終確認へ進む</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ── TAB 2: 発注履歴画面 ── */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">過去の発注履歴</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  過去のご注文内容を確認し、ワンタップで同じ内容を再発注できます。
                </p>
              </div>
              <button
                type="button"
                onClick={loadHistory}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                更新
              </button>
            </div>

            {orderHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <History className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs">発注履歴がまだありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderHistory.map(order => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {order.order_number}
                        </span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          order.status === 'shipped' || order.status === 'ready'
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
                        {new Date(order.created_at).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">品名・数量</span>
                        <span className="font-semibold text-slate-800">
                          {order.items.map(i => `${i.recipe_name.replace(/^米粉アイス\s*[【\[]?/, '').replace(/[】\]]$/, '')} (${i.size}×${i.quantity})`).join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">お届け希望 / 出荷予定</span>
                        <span className="font-bold text-emerald-800">
                          {order.shipping.preferred_delivery_date || '最短配達'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          出荷予定: {order.shipping.estimated_shipping_date}
                        </span>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-[10px] text-slate-400 block">請求総額 (税込)</span>
                        <span className="font-mono font-bold text-base text-emerald-700">
                          ¥{order.grand_total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <div className="text-[11px] text-slate-500">
                        {order.shipping.tracking_number ? (
                          <span className="text-emerald-700 font-mono font-semibold">
                            伝票番号: {order.shipping.tracking_number}
                          </span>
                        ) : (
                          <span>※発送後にヤマト伝票番号が表示されます</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRepeatOrder(order)}
                        className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <RotateCcw className="w-3 h-3" />
                        この内容で再発注
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── スマホ専用: 下部追従フローティングバー (Bottom Sticky Bar) ── */}
      {activeTab === 'order' && cartItems.length > 0 && !isConfirmModalOpen && (
        <aside aria-label="注文内容の小計" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-4 py-3 pb-safe">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div 
              onClick={() => {
                document.getElementById('order-summary-box')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                  計 {totalBottles}本 ({totalLiters}ℓ)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {appliedBoxSize}サイズ
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-slate-900 font-mono tracking-tight">
                  ¥{grandTotal.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  (税込・送料込)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleProceedToConfirmation()}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>確認へ進む</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* ── 発注内容 最終確認モーダル (B2Bフールプルーフ安心設計) ── */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  発注内容の最終確認
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  以下の内容で発注を確定します。間違いがないかご確認ください。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* 発注品目一覧 */}
              <div>
                <span className="font-bold text-slate-800 block mb-1.5">
                  発注品目 ({cartItems.length}種 / 計 {totalBottles}本 {totalLiters}ℓ)
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  {cartItems.map(item => (
                    <div key={item.id} className="p-2.5 sm:p-3 flex justify-between items-center bg-white">
                      <div>
                        <span className="font-extrabold text-slate-900">
                          {item.recipe_name.replace(/^米粉アイス\s*[【\[]?/, '').replace(/[】\]]$/, '')}
                        </span>
                        <span className="text-slate-500 ml-2 font-mono">
                          [{item.size} × {item.quantity}本]
                        </span>
                      </div>
                      <div className="font-mono font-bold text-slate-900">
                        ¥{item.subtotal.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 配送設定 */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 space-y-1.5 text-blue-950">
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>ヤマト運輸 冷凍クール便</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div>出荷予定: <strong>{estimatedShippingDate}</strong>（3営業日以内）</div>
                  <div>お届け希望: <strong className="text-blue-900">{deliveryTimingMode === 'asap' ? `最短 (${minDeliveryDate}着 目安)` : `${preferredDeliveryDate}着`}</strong></div>
                  <div className="col-span-2">時間帯指定: <strong>{deliveryTimeSlot}</strong></div>
                </div>
              </div>

              {/* お届け先店舗 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 text-slate-700">
                <div className="font-bold text-slate-900 text-xs">{customer.store_name}</div>
                <div className="text-[11px] text-slate-600">{customer.contact_name} 様（TEL: {customer.phone}）</div>
                <div className="text-[11px] text-slate-500">〒{customer.postal_code} {customer.prefecture}{customer.city}{customer.address_line}</div>
                {customer.notes && (
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 mt-1">
                    備考: {customer.notes}
                  </div>
                )}
              </div>

              {/* 金額・支払い */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>商品小計 (税込8%)</span>
                  <span className="font-mono font-bold">¥{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>冷凍クール便送料 (税込10% / {appliedBoxSize}サイズ)</span>
                  <span className="font-mono font-bold">¥{shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>ご請求総額 (税込)</span>
                  <span className="font-mono text-base text-emerald-700">¥{grandTotal.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-slate-400 text-right pt-0.5">
                  ※月末締め・翌月末払いの請求書払い（銀行振込）
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                戻って修正する
              </button>
              <button
                type="button"
                onClick={handleExecuteSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>発注を送信中...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>この内容で発注を確定する</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
