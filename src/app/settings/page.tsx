'use client';

import React, { useState } from 'react';
import { 
  User, 
  Database, 
  Sparkles, 
  Clock, 
  Package, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';

export default function SettingsPage() {
  // Account Settings
  const [username, setUsername] = useState('SoyStories Admin');
  const [email, setEmail] = useState('admin@soystories.com');

  // Supabase Settings
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [dbStatus, setDbStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // AI Settings
  const [geminiKey, setGeminiKey] = useState('');
  const [aiStatus, setAiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // DM Pacing Settings
  const [hourlyLimit, setHourlyLimit] = useState(5);
  const [dailyLimit, setDailyLimit] = useState(25);
  const [selectedHours, setSelectedHours] = useState<number[]>([10, 11, 14, 15, 16]);
  const [selectedDays, setSelectedDays] = useState<string[]>(['月', '火', '水', '木', '金']);

  // Products
  const [products, setProducts] = useState([
    { id: 1, name: 'ソイプロテイン', flavor: 'プレーン', price: 3500, minLot: 10, active: true },
    { id: 2, name: 'ソイプロテイン', flavor: 'ココア', price: 3800, minLot: 10, active: true },
    { id: 3, name: 'ソイプロテイン', flavor: '抹茶', price: 3800, minLot: 10, active: false },
  ]);

  const daysOfWeek = ['月', '火', '水', '木', '金', '土', '日'];
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

  const handleSaveAccount = () => {
    // Save logic here
    alert('アカウント設定を保存しました。');
  };

  const testSupabaseConnection = () => {
    setDbStatus('testing');
    setTimeout(() => setDbStatus('success'), 1500);
  };

  const testGeminiConnection = () => {
    setAiStatus('testing');
    setTimeout(() => setAiStatus('success'), 1500);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleHour = (hour: number) => {
    setSelectedHours(prev => 
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  const addProduct = () => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    setProducts([...products, { id: newId, name: '新規商品', flavor: '', price: 0, minLot: 1, active: true }]);
  };

  const removeProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = (id: number, field: string, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">設定</h1>
          <p className="text-gray-500 mt-2">システム全体の設定を管理します</p>
        </div>

        {/* Account Settings */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <User size={20} />
            </div>
            <h2 className="text-lg font-medium">アカウント設定</h2>
          </div>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ユーザー名</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="pt-2">
              <button 
                onClick={handleSaveAccount}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium text-sm"
              >
                <Save size={16} />
                保存
              </button>
            </div>
          </div>
        </section>

        {/* Supabase Settings */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Database size={20} />
            </div>
            <h2 className="text-lg font-medium">Supabase接続設定</h2>
          </div>
          
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supabase URL</label>
              <input 
                type="text" 
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                placeholder="https://xxxx.supabase.co"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anon Key</label>
              <input 
                type="password" 
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="pt-2 flex items-center gap-4">
              <button 
                onClick={testSupabaseConnection}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium text-sm"
              >
                接続テスト
              </button>
              {dbStatus === 'testing' && <span className="text-sm text-gray-500 flex items-center gap-2"><Clock size={16} className="animate-spin" /> テスト中...</span>}
              {dbStatus === 'success' && <span className="text-sm text-green-600 flex items-center gap-2"><CheckCircle size={16} /> 接続成功</span>}
              {dbStatus === 'error' && <span className="text-sm text-red-500 flex items-center gap-2"><AlertCircle size={16} /> 接続失敗</span>}
            </div>
          </div>
        </section>

        {/* AI Settings */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Sparkles size={20} />
            </div>
            <h2 className="text-lg font-medium">AI設定 (Gemini API)</h2>
          </div>
          
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input 
                type="password" 
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="pt-2 flex items-center gap-4">
              <button 
                onClick={testGeminiConnection}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium text-sm"
              >
                テスト生成
              </button>
              {aiStatus === 'testing' && <span className="text-sm text-gray-500 flex items-center gap-2"><Clock size={16} className="animate-spin" /> 生成中...</span>}
              {aiStatus === 'success' && <span className="text-sm text-green-600 flex items-center gap-2"><CheckCircle size={16} /> 正常に動作しています</span>}
              {aiStatus === 'error' && <span className="text-sm text-red-500 flex items-center gap-2"><AlertCircle size={16} /> エラーが発生しました</span>}
            </div>
          </div>
        </section>

        {/* DM Pacing Settings */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Clock size={20} />
            </div>
            <h2 className="text-lg font-medium">DMペーシング設定</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">1時間あたりの上限</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={hourlyLimit}
                    onChange={e => setHourlyLimit(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                  <span className="absolute right-4 top-2 text-gray-400">件</span>
                </div>
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">24時間あたりの上限</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={dailyLimit}
                    onChange={e => setDailyLimit(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                  <span className="absolute right-4 top-2 text-gray-400">件</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">推奨送信曜日</label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      selectedDays.includes(day) 
                        ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">推奨送信時間帯</label>
              <div className="grid grid-cols-8 gap-2 max-w-2xl">
                {hoursOfDay.map(hour => (
                  <button
                    key={hour}
                    onClick={() => toggleHour(hour)}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedHours.includes(hour) 
                        ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {hour}:00
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Product Master */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <Package size={20} />
              </div>
              <h2 className="text-lg font-medium">商品マスタ管理</h2>
            </div>
            <button 
              onClick={addProduct}
              className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl transition-colors font-medium text-sm w-fit"
            >
              <Plus size={16} />
              商品追加
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-xl">商品名</th>
                  <th className="px-4 py-3 font-medium">フレーバー</th>
                  <th className="px-4 py-3 font-medium">単価 (円)</th>
                  <th className="px-4 py-3 font-medium">最小ロット</th>
                  <th className="px-4 py-3 font-medium">有効</th>
                  <th className="px-4 py-3 font-medium rounded-tr-xl"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        value={product.name}
                        onChange={e => updateProduct(product.id, 'name', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border-b border-transparent focus:border-teal-300 outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        value={product.flavor}
                        onChange={e => updateProduct(product.id, 'flavor', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border-b border-transparent focus:border-teal-300 outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" 
                        value={product.price}
                        onChange={e => updateProduct(product.id, 'price', parseInt(e.target.value) || 0)}
                        className="w-24 px-2 py-1 bg-transparent border-b border-transparent focus:border-teal-300 outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" 
                        value={product.minLot}
                        onChange={e => updateProduct(product.id, 'minLot', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 bg-transparent border-b border-transparent focus:border-teal-300 outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={product.active}
                          onChange={e => updateProduct(product.id, 'active', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => removeProduct(product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
