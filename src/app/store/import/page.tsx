'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Trash2, 
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
  Calendar,
  Layers,
  Clock,
  RotateCcw
} from 'lucide-react';
import StoreHeader from '@/components/store/StoreHeader';
import {
  detectPeriodFromFileName,
  detectCSVType,
  parseProductSalesCSV,
  parseDailySalesCSV,
  parseTransactionsCSV,
  saveProductSales,
  saveDailySales,
  saveTransactions,
  resetStoreDataToSeed
} from '@/lib/store-api';
import { StoreCSVType } from '@/types/store';

interface ParsedFilePreview {
  fileName: string;
  detectedType: StoreCSVType;
  typeLabel: string;
  detectedPeriod: string;
  recordCount: number;
  status: 'ready' | 'imported' | 'error';
  rawText: string;
  errorMessage?: string;
}

export default function StoreImportPage() {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<ParsedFilePreview[]>([]);
  const [importing, setImporting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  // ファイル名から種別ラベルを取得
  const getTypeLabel = (type: StoreCSVType) => {
    switch (type) {
      case 'product_sales':
        return '🍨 商品別売上データ';
      case 'daily_sales':
        return '📅 日別売上集計データ';
      case 'transactions':
        return '🧾 会計明細データ';
      default:
        return '❓ 不明なCSV';
    }
  };

  // ファイル読み込み処理
  const handleFiles = async (files: FileList | File[]) => {
    const newPreviews: ParsedFilePreview[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Airレジは原則Shift_JIS（CP932）で出力される。
        // まずUTF-8 (fatal: true)でデコードを試し、Shift_JIS等の不正バイトがあればcatchしてShift_JISでデコードする。
        let text = '';
        try {
          const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
          text = utf8Decoder.decode(arrayBuffer);
        } catch {
          try {
            const sjisDecoder = new TextDecoder('shift-jis');
            text = sjisDecoder.decode(arrayBuffer);
          } catch {
            const fallbackDecoder = new TextDecoder('utf-8');
            text = fallbackDecoder.decode(arrayBuffer);
          }
        }

        // 置換文字 \uFFFD が多く含まれる場合の二重安全チェック
        if (text.includes('\uFFFD')) {
          try {
            const sjisDecoder = new TextDecoder('shift-jis');
            const sjisText = sjisDecoder.decode(arrayBuffer);
            const countCurrent = (text.match(/\uFFFD/g) || []).length;
            const countSjis = (sjisText.match(/\uFFFD/g) || []).length;
            if (countSjis < countCurrent) {
              text = sjisText;
            }
          } catch {
            // ignore
          }
        }

        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length <= 1) {
          newPreviews.push({
            fileName: file.name,
            detectedType: 'unknown',
            typeLabel: '空のファイル',
            detectedPeriod: '不明',
            recordCount: 0,
            status: 'error',
            rawText: '',
            errorMessage: '有効なデータ行がありません',
          });
          continue;
        }

        // 1. ファイル名から期間（YYYY-MM）を自動判定
        const period = detectPeriodFromFileName(file.name, text);

        // 2. ファイル名＋ヘッダー行からCSV種別を自動判定（ファイル名最優先）
        const detectedType = detectCSVType(lines[0], file.name);
        const recordCount = lines.length - 1;

        newPreviews.push({
          fileName: file.name,
          detectedType,
          typeLabel: getTypeLabel(detectedType),
          detectedPeriod: period,
          recordCount,
          status: detectedType !== 'unknown' ? 'ready' : 'error',
          rawText: text,
          errorMessage: detectedType === 'unknown' ? 'Airレジの対応CSV種別を選択してください' : undefined,
        });
      } catch (err) {
        console.error(err);
        newPreviews.push({
          fileName: file.name,
          detectedType: 'unknown',
          typeLabel: '読み込み失敗',
          detectedPeriod: '不明',
          recordCount: 0,
          status: 'error',
          rawText: '',
          errorMessage: 'ファイルの読み込み中にエラーが発生しました',
        });
      }
    }

    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // 個別の期間手動修正
  const updatePeriod = (index: number, newPeriod: string) => {
    setPreviews(prev => {
      const next = [...prev];
      next[index].detectedPeriod = newPeriod;
      return next;
    });
  };

  // 個別のCSV種別手動変更（万が一の救済）
  const updateType = (index: number, newType: StoreCSVType) => {
    setPreviews(prev => {
      const next = [...prev];
      next[index].detectedType = newType;
      next[index].typeLabel = getTypeLabel(newType);
      next[index].status = newType !== 'unknown' ? 'ready' : 'error';
      next[index].errorMessage = newType === 'unknown' ? 'Airレジの対応CSV種別を選択してください' : undefined;
      return next;
    });
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 確定インポート実行
  const handleExecuteImport = async () => {
    setImporting(true);
    let count = 0;

    for (let i = 0; i < previews.length; i++) {
      const p = previews[i];
      if (p.status !== 'ready') continue;

      try {
        if (p.detectedType === 'product_sales') {
          const records = parseProductSalesCSV(p.rawText, p.detectedPeriod);
          await saveProductSales(records);
          count++;
        } else if (p.detectedType === 'daily_sales') {
          const records = parseDailySalesCSV(p.rawText, p.detectedPeriod);
          await saveDailySales(records);
          count++;
        } else if (p.detectedType === 'transactions') {
          const records = parseTransactionsCSV(p.rawText, p.detectedPeriod);
          await saveTransactions(records);
          count++;
        }

        setPreviews(prev => {
          const next = [...prev];
          next[i].status = 'imported';
          return next;
        });
      } catch (err) {
        console.error(err);
        setPreviews(prev => {
          const next = [...prev];
          next[i].status = 'error';
          next[i].errorMessage = '保存処理中にエラーが発生しました';
          return next;
        });
      }
    }

    setImporting(false);
    setSuccessCount(count);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans">
      <StoreHeader />

      <div className="max-w-5xl mx-auto px-6 pt-8 space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                  Airレジ専用インポーター
                </span>
                <span className="text-xs text-slate-400">ファイル名から期間を自動判別</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                CSVデータ インポート
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                AirレジからダウンロードしたCSVファイル（商品別売上・日別売上集計・会計明細）をここにまとめてドラッグ＆ドロップしてください。ファイル名から年月を自動認識し、データベースへ一括保存します。
              </p>
            </div>

            <Link
              href="/store"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs"
            >
              <span>ダッシュボードへ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`p-10 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            dragActive
              ? 'border-amber-500 bg-amber-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-slate-400 bg-white'
          }`}
          onClick={() => {
            const input = document.getElementById('csv-file-input') as HTMLInputElement;
            if (input) input.click();
          }}
        >
          <input
            id="csv-file-input"
            type="file"
            multiple
            accept=".csv,.txt"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center mb-3 shadow-2xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="text-sm font-bold text-slate-900 mb-1">
            ここにCSVファイルをドラッグ＆ドロップ
          </div>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            またはクリックしてファイルを選択（複数ファイルをまとめて選択・投入できます）
          </p>

          <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-400 flex-wrap justify-center">
            <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
              🍨 商品別売上CSV
            </span>
            <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
              📅 日別売上集計CSV
            </span>
            <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
              🧾 会計明細CSV
            </span>
          </div>
        </div>

        {/* Feature Highlights for User Peace of Mind */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>ファイル名から期間を自動認識</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <code>商品別売上_20260901_20260930.csv</code> や <code>2026年9月.csv</code> などのファイル名から自動で対象月（2026-09）を判別します。
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>CSV種別の完全自動仕分け</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              3種類のCSVが混ざっていても、ヘッダー行を瞬時に解析して適切なデータベースへ自動仕分けします。手動で選ぶ必要はありません。
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>文字化け（Shift_JIS）自動復元</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Airレジ特有のShift_JIS（CP932）文字コードを自動判別し、Excelで開いたときの文字化けストレスなくクリアに取り込みます。
            </p>
          </div>
        </div>

        {/* Parsed Previews List */}
        {previews.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  読み込み済みファイル ({previews.length}件)
                </span>
                <span className="text-xs text-slate-500">
                  期間が正しく自動検出されているかご確認ください
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviews([])}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
                >
                  クリア
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={importing || previews.every(p => p.status === 'imported')}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  {importing ? (
                    <span>保存中...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>データベースへ一括取り込み</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {successCount !== null && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                <span>✓ {successCount}件のファイルをデータベースへ取り込みました！</span>
                <Link
                  href="/store"
                  className="underline underline-offset-2 hover:text-emerald-950"
                >
                  ダッシュボードで分析を確認する →
                </Link>
              </div>
            )}

            <div className="space-y-2.5">
              {previews.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    item.status === 'imported'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : item.status === 'error'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-slate-50/70 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 break-all">
                        {item.fileName}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <select
                          value={item.detectedType}
                          onChange={(e) => updateType(idx, e.target.value as StoreCSVType)}
                          className="text-[11px] font-semibold bg-white border border-slate-300 rounded px-2 py-0.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
                        >
                          <option value="product_sales">🍨 商品別売上CSV</option>
                          <option value="daily_sales">📅 日別売上集計CSV</option>
                          <option value="transactions">🧾 会計明細CSV</option>
                          <option value="unknown">❓ 不明なCSV（選択してください）</option>
                        </select>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.recordCount}行
                        </span>
                        {item.errorMessage && item.status === 'error' && (
                          <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {item.errorMessage}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    {/* Auto-detected Period input for manual override */}
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] text-slate-500">対象月:</span>
                      <input
                        type="text"
                        value={item.detectedPeriod}
                        onChange={(e) => updatePeriod(idx, e.target.value)}
                        placeholder="2026-09"
                        className="w-20 font-bold font-mono text-xs text-slate-900 focus:outline-none"
                      />
                    </div>

                    {item.status === 'imported' ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 px-2.5 py-1 bg-emerald-100 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        取り込み完了
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removePreview(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="除外"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
