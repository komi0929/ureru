'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  History, 
  RotateCcw, 
  X, 
  AlertCircle,
  Package,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Filter
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
  BOX_CAPACITIES,
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
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [activeTab, setActiveTab] = useState<'order' | 'history'>('order');
  const [orderHistory, setOrderHistory] = useState<B2BOrder[]>([]);

  // フレーバー絞り込みフィルター
  const [flavorFilter, setFlavorFilter] = useState<'all' | 'classic' | 'fruit' | 'selected'>('all');

  // 発送箱サイズ選択（自動判定 または 60, 80, 100, 120手動指定）
  const [selectedBoxSize, setSelectedBoxSize] = useState<'auto' | ShippingBoxSize>('auto');

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

        // URLパラメータからの店舗名プレフィル
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const storeParam = params.get('store');
          if (storeParam) {
            setCustomer(prev => ({ ...prev, store_name: storeParam }));
          }
        }

        // 保存された顧客プロファイル読み込み
        const savedProfile = getSavedCustomerProfile();
        if (savedProfile && savedProfile.store_name) {
          setCustomer(savedProfile);
          setIsLoggedIn(true);
          setIsEditingAddress(false);

          const filtered = allOrders.filter(o => 
            (savedProfile.email && o.customer.email.toLowerCase() === savedProfile.email.toLowerCase()) ||
            (savedProfile.store_name && o.customer.store_name === savedProfile.store_name)
          );
          setOrderHistory(filtered.length > 0 ? filtered : allOrders.slice(0, 5));
        } else {
          setIsEditingAddress(true);
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

  // カート操作（加算・減算）
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

  // カート操作（直接数値入力）
  const setCartQuantity = (recipe: Recipe, size: BulkSize, quantity: number) => {
    const key = `${recipe.id}_${size}`;
    const validQty = Math.max(0, Math.min(99, Math.floor(quantity || 0)));
    setCart(prev => {
      if (validQty === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return {
        ...prev,
        [key]: { recipe, size, quantity: validQty }
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

  // 箱サイズの決定（自動判定または手動指定）
  const boxConfig = useMemo(() => {
    const auto = calculateRecommendedBoxSize(totalLiters);
    if (selectedBoxSize === 'auto') {
      return {
        boxSize: auto.boxSize,
        boxCount: auto.boxCount,
        isManual: false,
        isOverCapacity: false,
        requestedSize: null as ShippingBoxSize | null,
      };
    }
    const cap = BOX_CAPACITIES[selectedBoxSize];
    if (cap && totalLiters > cap.maxLiters) {
      // 手動指定サイズを超過している場合は自動推奨サイズへフォールバック
      return {
        boxSize: auto.boxSize,
        boxCount: auto.boxCount,
        isManual: true,
        isOverCapacity: true,
        requestedSize: selectedBoxSize,
      };
    }
    return {
      boxSize: selectedBoxSize,
      boxCount: 1,
      isManual: true,
      isOverCapacity: false,
      requestedSize: selectedBoxSize,
    };
  }, [totalLiters, selectedBoxSize]);

  const appliedBoxSize: ShippingBoxSize = boxConfig.boxSize;
  const appliedBoxCount = boxConfig.boxCount;

  // 箱の積載効率インジケーター（実務的な送料アドバイス）
  const boxCapacityInfo = useMemo(() => {
    if (totalLiters === 0) return null;
    const cap = BOX_CAPACITIES[appliedBoxSize];
    if (!cap) return null;
    const maxCapacity = cap.maxLiters * appliedBoxCount;
    const remaining = Math.max(0, maxCapacity - totalLiters);
    return {
      boxSize: appliedBoxSize,
      boxCount: appliedBoxCount,
      maxLiters: maxCapacity,
      maxWeightKg: cap.maxWeightKg * appliedBoxCount,
      currentLiters: totalLiters,
      remainingLiters: remaining,
      isFull: remaining === 0,
      isOverCapacity: boxConfig.isOverCapacity,
      requestedSize: boxConfig.requestedSize,
    };
  }, [totalLiters, appliedBoxSize, appliedBoxCount, boxConfig]);

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
    setIsEditingAddress(true);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 発注内容の確認画面を開く（入力バリデーション）
  const handleProceedToConfirmation = () => {
    const errors: string[] = [];

    if (cartItems.length === 0) {
      errors.push('発注商品を選択してください（数量を1本以上追加してください）。');
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
      setIsEditingAddress(true);
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
          estimated_shipping_date: estimatedShippingDate,
          preferred_delivery_date: actualDeliveryDate,
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

  // フレーバー分類とフィルタリング
  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => {
      const cleanName = r.name.replace(/^米粉アイス\s*[【\[]?/, '').replace(/[】\]]$/, '');
      const isFruit = ['りんご', 'もも', 'マンゴー', 'ミックスベリー', 'ドラゴンフルーツ'].some(k => cleanName.includes(k));
      const isSelected = (cart[`${r.id}_1L`]?.quantity || 0) > 0 || (cart[`${r.id}_2L`]?.quantity || 0) > 0;

      if (flavorFilter === 'selected') return isSelected;
      if (flavorFilter === 'fruit') return isFruit;
      if (flavorFilter === 'classic') return !isFruit;
      return true;
    });
  }, [recipes, flavorFilter, cart]);

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
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 font-sans">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ご注文受付完了
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              発注を受け付けました
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              注文番号: <strong className="text-slate-900 text-sm">{submittedOrder.order_number}</strong>
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-2 text-xs">
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
              <span className="font-semibold text-slate-900">{submittedOrder.shipping.estimated_shipping_date}（3営業日以内出荷）</span>
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
              ・福岡より出荷完了後、ヤマト運輸のお問い合わせ伝票番号をご登録のメールアドレスへお知らせいたします。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
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
    <div className="min-h-screen bg-slate-50/70 py-5 px-3 sm:px-6 lg:px-8 font-sans pb-32">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* ── B2B Minimal Header ── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                SoyStories B2B
              </span>
              <span className="text-xs text-slate-500 font-medium">業務用クラフトアイス発注</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              仕入れ発注シート
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 pt-0.5">
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
            className={`pb-2 px-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
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
            className={`pb-2 px-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
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
          <div className="space-y-4">

            {/* ── 前回発注のワンタップ反映ショートカット ── */}
            {lastOrder && (
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>フレーバー選択</span>
                  <span className="text-xs text-slate-400 font-normal">（全10フレーバー / 1本単位）</span>
                </h2>

                {/* 絞り込みタブ */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  <button
                    type="button"
                    onClick={() => setFlavorFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      flavorFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    すべて (10)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlavorFilter('classic')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      flavorFilter === 'classic' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    定番・お茶 (5)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlavorFilter('fruit')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      flavorFilter === 'fruit' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    フルーツ (5)
                  </button>
                  {totalBottles > 0 && (
                    <button
                      type="button"
                      onClick={() => setFlavorFilter('selected')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        flavorFilter === 'selected' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      選択中のみ ({cartItems.length})
                    </button>
                  )}
                </div>
              </div>

              {/* フレーバー行リスト（フル幅スタック形式：文字の改行崩れゼロ） */}
              <div className="space-y-2.5">
                {filteredRecipes.map(recipe => {
                  const qty1L = cart[`${recipe.id}_1L`]?.quantity || 0;
                  const qty2L = cart[`${recipe.id}_2L`]?.quantity || 0;
                  const isSelected = qty1L > 0 || qty2L > 0;
                  const cleanName = recipe.name.replace(/^米粉アイス\s*[【\[]?/, '').replace(/[】\]]$/, '');

                  return (
                    <div 
                      key={recipe.id}
                      className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                        isSelected 
                          ? 'bg-emerald-50/30 border-emerald-500 ring-1 ring-emerald-500/20 shadow-2xs' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="font-extrabold text-sm text-slate-900">
                          {cleanName}
                        </h3>
                        {isSelected && (
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                            計 {qty2L * 2 + qty1L}ℓ 選択中
                          </span>
                        )}
                      </div>

                      {/* 2L と 1L をフル幅1行ずつ配置（スマホでも文字が崩れず押しやすい） */}
                      <div className="mt-2 space-y-1.5">
                        
                        {/* 2L 行 */}
                        <div className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                          qty2L > 0 ? 'bg-emerald-50/80 border-emerald-400' : 'bg-slate-50 border-slate-200/80'
                        }`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-xs text-slate-900 whitespace-nowrap shrink-0">2L バルク</span>
                            <span className="font-mono text-xs font-bold text-emerald-800 whitespace-nowrap">¥4,000</span>
                            <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap">(税込¥4,320)</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(recipe, '2L', -1)}
                              disabled={qty2L === 0}
                              aria-label={`${cleanName} 2Lを1本減らす`}
                              className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max="99"
                              inputMode="numeric"
                              value={qty2L === 0 ? '' : qty2L}
                              placeholder="0"
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setCartQuantity(recipe, '2L', isNaN(val) ? 0 : val);
                              }}
                              onFocus={(e) => e.target.select()}
                              aria-label={`${cleanName} 2Lの数量`}
                              className="w-11 h-9 text-center font-mono font-extrabold text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(recipe, '2L', 1)}
                              aria-label={`${cleanName} 2Lを1本増やす`}
                              className="w-9 h-9 rounded-xl bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* 1L 行 */}
                        <div className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                          qty1L > 0 ? 'bg-emerald-50/80 border-emerald-400' : 'bg-slate-50 border-slate-200/80'
                        }`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-xs text-slate-900 whitespace-nowrap shrink-0">1L バルク</span>
                            <span className="font-mono text-xs font-bold text-emerald-800 whitespace-nowrap">¥2,000</span>
                            <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap">(税込¥2,160)</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(recipe, '1L', -1)}
                              disabled={qty1L === 0}
                              aria-label={`${cleanName} 1Lを1本減らす`}
                              className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max="99"
                              inputMode="numeric"
                              value={qty1L === 0 ? '' : qty1L}
                              placeholder="0"
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setCartQuantity(recipe, '1L', isNaN(val) ? 0 : val);
                              }}
                              onFocus={(e) => e.target.select()}
                              aria-label={`${cleanName} 1Lの数量`}
                              className="w-11 h-9 text-center font-mono font-extrabold text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(recipe, '1L', 1)}
                              aria-label={`${cleanName} 1Lを1本増やす`}
                              className="w-9 h-9 rounded-xl bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95 cursor-pointer"
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
            </div>

            {/* ── 配送設定（お届け希望日・時間帯） ── */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    配送設定（ヤマト運輸 冷凍クール便）
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  出荷予定: {estimatedShippingDate}（3営業日以内）
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
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
            </div>

            {/* ── お届け先・ご請求先情報 ── */}
            <div id="order-customer-form" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3.5 scroll-mt-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-700" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    お届け先・ご請求先情報
                  </h3>
                </div>
                {isLoggedIn && !isEditingAddress && (
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(true)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    変更する
                  </button>
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

              {/* 登録済み顧客向けスマート表示カード（毎回8個の空欄を見せない） */}
              {isLoggedIn && !isEditingAddress ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{customer.store_name}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                        登録情報反映中
                      </span>
                    </div>
                    <div className="text-slate-600">
                      ご担当: <strong>{customer.contact_name}</strong> 様 ｜ TEL: <span className="font-mono">{customer.phone}</span>
                    </div>
                    <div className="text-slate-500 font-mono">
                      〒{customer.postal_code} {customer.prefecture}{customer.city}{customer.address_line}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(true)}
                    className="text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-center shrink-0 cursor-pointer shadow-2xs"
                  >
                    お届け先を変更
                  </button>
                </div>
              ) : (
                /* フル入力フォーム (新規または編集時) */
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      <label className="block font-bold text-slate-700 mb-1">メールアドレス（請求書・伝票番号送付先）*</label>
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
                              検索中...
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

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
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

                    {isLoggedIn && isEditingAddress && (
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                      >
                        完了
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── 発注サマリー ＆ 箱容量インジケーター ── */}
            <div id="order-summary-box" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3.5 scroll-mt-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  発注サマリー
                </h3>
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  合計 {totalBottles}本 ({totalLiters}ℓ)
                </span>
              </div>

              {/* ── 発送箱サイズ選択（60 / 80 / 100 / 120 / 自動判定） ── */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    <span>発送箱サイズ指定（ヤマト冷凍クール便）</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ※1ℓ=1kg計算（箱上限を超えた場合は自動で上位サイズへ切替）
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1 sm:gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedBoxSize('auto')}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedBoxSize === 'auto'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-extrabold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                    }`}
                  >
                    <div className="text-[11px] sm:text-xs">自動判定</div>
                    <div className={`text-[9px] sm:text-[10px] ${selectedBoxSize === 'auto' ? 'text-emerald-300 font-mono' : 'text-slate-400'}`}>
                      推奨
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBoxSize('60')}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedBoxSize === '60'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-extrabold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                    }`}
                  >
                    <div className="text-[11px] sm:text-xs font-mono">60サイズ</div>
                    <div className={`text-[9px] sm:text-[10px] ${selectedBoxSize === '60' ? 'text-slate-300 font-mono' : 'text-slate-400'}`}>
                      〜2ℓ
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBoxSize('80')}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedBoxSize === '80'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-extrabold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                    }`}
                  >
                    <div className="text-[11px] sm:text-xs font-mono">80サイズ</div>
                    <div className={`text-[9px] sm:text-[10px] ${selectedBoxSize === '80' ? 'text-slate-300 font-mono' : 'text-slate-400'}`}>
                      〜4ℓ
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBoxSize('100')}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedBoxSize === '100'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-extrabold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                    }`}
                  >
                    <div className="text-[11px] sm:text-xs font-mono">100サイズ</div>
                    <div className={`text-[9px] sm:text-[10px] ${selectedBoxSize === '100' ? 'text-slate-300 font-mono' : 'text-slate-400'}`}>
                      〜8ℓ
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBoxSize('120')}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedBoxSize === '120'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-extrabold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                    }`}
                  >
                    <div className="text-[11px] sm:text-xs font-mono">120サイズ</div>
                    <div className={`text-[9px] sm:text-[10px] ${selectedBoxSize === '120' ? 'text-slate-300 font-mono' : 'text-slate-400'}`}>
                      〜12ℓ
                    </div>
                  </button>
                </div>
              </div>

              {/* 実務的なヤマト箱容量インジケーター（飲食店の送料効率を最適化） */}
              {boxCapacityInfo && (
                <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  boxCapacityInfo.isOverCapacity
                    ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                    : boxCapacityInfo.isFull 
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
                      : 'bg-amber-50/70 border-amber-200 text-amber-950'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Package className="w-4 h-4 text-slate-700 shrink-0" />
                      <span>
                        適用箱: ヤマト冷凍 {boxCapacityInfo.boxSize}サイズ 
                        {boxCapacityInfo.boxCount > 1 ? ` (${boxCapacityInfo.boxCount}箱)` : ''}
                        （現在 {boxCapacityInfo.currentLiters}ℓ / 箱上限 {boxCapacityInfo.maxLiters}ℓ・{boxCapacityInfo.maxWeightKg}kg）
                      </span>
                    </div>
                    <span className="font-semibold text-[11px] shrink-0">
                      {boxCapacityInfo.isOverCapacity ? (
                        <span className="text-rose-700 font-bold">
                          ※ご指定の{boxCapacityInfo.requestedSize}サイズ上限を超えたため、{boxCapacityInfo.boxSize}サイズへ自動切替しました
                        </span>
                      ) : boxCapacityInfo.isFull ? (
                        <span className="text-emerald-700 font-bold">✓ 満杯（送料効率最大）</span>
                      ) : (
                        <span className="text-amber-800">
                          あと {boxCapacityInfo.remainingLiters}ℓ 同一送料で同梱可能
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

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
                        <span className="font-extrabold text-slate-900">
                          {item.recipe_name.replace(/^米粉アイス\s*[【\[]?/, '').replace(/[】\]]$/, '')}
                        </span>
                        <span className="text-slate-500 font-mono ml-2 font-medium">
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
                onClick={handleProceedToConfirmation}
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
                        <span className="text-[10px] text-slate-400 block font-mono">
                          出荷: {order.shipping.estimated_shipping_date} ({order.shipping.delivery_time_slot})
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
              onClick={handleProceedToConfirmation}
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  発注内容の最終確認
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  以下の内容で注文を確定します。ご確認ください。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* 品目一覧 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800">
                    発注品目 ({cartItems.length}種)
                  </span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                    合計 {totalBottles}本 ({totalLiters}ℓ)
                  </span>
                </div>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  {cartItems.map(item => (
                    <div key={item.id} className="p-3 flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-slate-900">
                          {item.recipe_name.replace(/^米粉アイス\s*[【\[]?/, '').replace(/[】\]]$/, '')}
                        </span>
                        <span className="text-slate-500 ml-2 font-mono font-semibold">
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

              {/* 配送設定（縦並びで文字崩れゼロ） */}
              <div className="bg-blue-50/70 border border-blue-200/90 rounded-xl p-3.5 space-y-1.5 text-blue-950">
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>ヤマト運輸 冷凍クール便（福岡発）</span>
                </div>
                <div className="space-y-1.5 text-xs pt-1.5 border-t border-blue-200/60">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">出荷予定：</span>
                    <strong className="font-mono">{estimatedShippingDate}（3営業日以内に出荷）</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">お届け希望日：</span>
                    <strong className="font-mono text-blue-950">
                      {deliveryTimingMode === 'asap' ? `${minDeliveryDate}（最短配達）` : `${preferredDeliveryDate}（着日指定）`}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">配達時間帯：</span>
                    <strong>{deliveryTimeSlot}</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-blue-800">
                    <span>梱包サイズ：</span>
                    <span className="font-mono">{appliedBoxSize}サイズ × {appliedBoxCount}箱</span>
                  </div>
                </div>
              </div>

              {/* お届け先店舗 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 text-slate-700">
                <div className="font-bold text-slate-900 text-xs">{customer.store_name}</div>
                <div className="text-[11px] text-slate-600">{customer.contact_name} 様 ｜ TEL: <span className="font-mono">{customer.phone}</span></div>
                <div className="text-[11px] text-slate-500 font-mono">〒{customer.postal_code} {customer.prefecture}{customer.city}{customer.address_line}</div>
                {customer.notes && (
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/70 mt-1">
                    備考: {customer.notes}
                  </div>
                )}
              </div>

              {/* 金額内訳 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>商品小計 (税込8%・全{totalBottles}本)</span>
                  <span className="font-mono font-bold text-slate-800">¥{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>冷凍クール便送料 (税込10% / {appliedBoxSize}サイズ)</span>
                  <span className="font-mono font-bold text-slate-800">¥{shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>ご請求総額 (税込)</span>
                  <span className="font-mono text-base text-emerald-700">¥{grandTotal.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-slate-400 text-right pt-0.5">
                  ※お支払いは月末締め・翌月末払いの請求書払い（銀行振込）となります
                </div>
              </div>
            </div>

            {/* Footer Buttons (縦並びフル幅：ボタン文字崩れゼロ) */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 space-y-2">
              <button
                type="button"
                onClick={handleExecuteSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>発注を送信中...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>この内容で発注を確定する（¥{grandTotal.toLocaleString()} 税込）</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-full py-2.5 text-slate-500 hover:text-slate-800 font-bold text-xs transition-colors text-center cursor-pointer"
              >
                戻って修正する
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
