/**
 * 店舗経営分析モード (STORE LAB) の初期シードデータ
 * ユーザーから提供された2026年9月の実データ（商品別売上、日別集計、会計明細）
 * および、3年半の成長鈍化・季節トレンド分析を即座に体感できるシミュレーションデータ
 */

import { ProductSalesRecord, DailySalesRecord, TransactionRecord } from '@/types/store';

// 2026年9月の実データ: 商品別売上
export const RAW_PRODUCT_SALES_2026_09: Omit<ProductSalesRecord, 'id' | 'period'>[] = [
  { product_name: 'ワッフルソフト（コーン）', category: 'ワッフルソフトクリーム', tax_type: '内税', net_sales: 271860, sales_ratio: 21.0, discount_amount: 0, quantity: 394, quantity_ratio: 16.0, return_quantity: 0, product_id: '10074' },
  { product_name: 'チョコ（ワッフルアイス）', category: 'ワッフルアイス', tax_type: '内税', net_sales: 72450, sales_ratio: 5.6, discount_amount: 0, quantity: 105, quantity_ratio: 4.3, return_quantity: 0, product_id: '10111' },
  { product_name: '濃厚ソフト（カップ）', category: '濃厚豆乳ソフト', tax_type: '内税', net_sales: 68080, sales_ratio: 5.3, discount_amount: 0, quantity: 148, quantity_ratio: 6.0, return_quantity: 0, product_id: '10003' },
  { product_name: 'ワッフルソフト（カップ）', category: 'ワッフルソフトクリーム', tax_type: '内税', net_sales: 65700, sales_ratio: 5.1, discount_amount: 0, quantity: 73, quantity_ratio: 3.0, return_quantity: 0, product_id: '10059' },
  { product_name: '黒豆(ワッフルアイス)', category: 'ワッフルアイス', tax_type: '内税', net_sales: 49680, sales_ratio: 3.8, discount_amount: 0, quantity: 72, quantity_ratio: 2.9, return_quantity: 0, product_id: '10110' },
  { product_name: 'マンゴースムージー', category: 'ドリンク', tax_type: '内税', net_sales: 46060, sales_ratio: 3.6, discount_amount: 0, quantity: 94, quantity_ratio: 3.8, return_quantity: 0, product_id: '10152' },
  { product_name: 'ストロベリー（ワッフルアイス）', category: 'ワッフルアイス', tax_type: '内税', net_sales: 39330, sales_ratio: 3.0, discount_amount: 0, quantity: 57, quantity_ratio: 2.3, return_quantity: 0, product_id: '10109' },
  { product_name: 'プレーンワッフル', category: 'ワッフル', tax_type: '内税', net_sales: 35640, sales_ratio: 2.8, discount_amount: 0, quantity: 54, quantity_ratio: 2.2, return_quantity: 0, product_id: '10058' },
  { product_name: '黒ゴマ（ワッフルアイス）', category: 'ワッフルアイス', tax_type: '内税', net_sales: 31050, sales_ratio: 2.4, discount_amount: 0, quantity: 45, quantity_ratio: 1.8, return_quantity: 0, product_id: '10112' },
  { product_name: 'ダブルチョコ（ケーキドーナツ）', category: 'ケーキドーナツ', tax_type: '内税', net_sales: 30960, sales_ratio: 2.4, discount_amount: 14328, quantity: 72, quantity_ratio: 2.9, return_quantity: 0, product_id: '10099' },
  { product_name: 'コーヒー', category: 'ドリンク', tax_type: '内税', net_sales: 28380, sales_ratio: 2.2, discount_amount: 0, quantity: 80, quantity_ratio: 3.3, return_quantity: 0, product_id: '10004' },
  { product_name: 'シナモン', category: 'SOYドーナツ', tax_type: '内税', net_sales: 28380, sales_ratio: 2.2, discount_amount: 19780, quantity: 86, quantity_ratio: 3.5, return_quantity: 0, product_id: '10016' },
  { product_name: 'きなこ', category: 'SOYドーナツ', tax_type: '内税', net_sales: 28380, sales_ratio: 2.2, discount_amount: 21500, quantity: 86, quantity_ratio: 3.5, return_quantity: 0, product_id: '10020' },
  { product_name: 'キャラメルナッツ（ワッフルホイップ）', category: 'ワッフルホイップ', tax_type: '内税', net_sales: 26400, sales_ratio: 2.0, discount_amount: 0, quantity: 40, quantity_ratio: 1.6, return_quantity: 0, product_id: '10102' },
  { product_name: 'ココアワッフル', category: 'ワッフル', tax_type: '内税', net_sales: 26220, sales_ratio: 2.0, discount_amount: 0, quantity: 38, quantity_ratio: 1.5, return_quantity: 0, product_id: '10104' },
  { product_name: 'コーヒーフロート', category: '濃厚豆乳ソフト', tax_type: '内税', net_sales: 23760, sales_ratio: 1.8, discount_amount: 0, quantity: 36, quantity_ratio: 1.5, return_quantity: 0, product_id: '10007' },
  { product_name: '濃厚ソフト（コーン）', category: '濃厚豆乳ソフト', tax_type: '内税', net_sales: 22770, sales_ratio: 1.8, discount_amount: 0, quantity: 33, quantity_ratio: 1.3, return_quantity: 0, product_id: '10002' },
  { product_name: '豆乳クリーム（どらやき）', category: 'どらやき', tax_type: '内税', net_sales: 22080, sales_ratio: 1.7, discount_amount: 10080, quantity: 48, quantity_ratio: 2.0, return_quantity: 0, product_id: '10092' },
  { product_name: 'プレーン（ケーキドーナツ）', category: 'ケーキドーナツ', tax_type: '内税', net_sales: 21500, sales_ratio: 1.7, discount_amount: 9950, quantity: 50, quantity_ratio: 2.0, return_quantity: 0, product_id: '10096' },
  { product_name: '黒蜜ソイラテ', category: 'ドリンク', tax_type: '内税', net_sales: 20610, sales_ratio: 1.6, discount_amount: 0, quantity: 53, quantity_ratio: 2.2, return_quantity: 0, product_id: '10057' },
  { product_name: 'クランベリー', category: 'SOYドーナツ', tax_type: '内税', net_sales: 20350, sales_ratio: 1.6, discount_amount: 15070, quantity: 66, quantity_ratio: 2.7, return_quantity: 0, product_id: '10015' },
  { product_name: 'アールグレイ', category: 'SOYドーナツ', tax_type: '内税', net_sales: 19800, sales_ratio: 1.5, discount_amount: 15000, quantity: 61, quantity_ratio: 2.5, return_quantity: 1, product_id: '10017' },
  { product_name: '抹茶（ケーキドーナツ）', category: 'ケーキドーナツ', tax_type: '内税', net_sales: 17200, sales_ratio: 1.3, discount_amount: 7960, quantity: 40, quantity_ratio: 1.6, return_quantity: 0, product_id: '10141' },
  { product_name: 'レモンスカッシュ', category: 'ドリンク', tax_type: '内税', net_sales: 16860, sales_ratio: 1.3, discount_amount: 0, quantity: 44, quantity_ratio: 1.8, return_quantity: 0, product_id: '10073' },
  { product_name: 'バニラココナッツ（アイス）', category: 'アイス', tax_type: '内税', net_sales: 16170, sales_ratio: 1.3, discount_amount: 6006, quantity: 33, quantity_ratio: 1.3, return_quantity: 0, product_id: '10082' },
  { product_name: '黒ゴマワッフル', category: 'ワッフル', tax_type: '内税', net_sales: 15870, sales_ratio: 1.2, discount_amount: 0, quantity: 23, quantity_ratio: 0.9, return_quantity: 0, product_id: '10105' },
  { product_name: 'プレーン', category: 'SOYドーナツ', tax_type: '内税', net_sales: 15840, sales_ratio: 1.2, discount_amount: 12000, quantity: 48, quantity_ratio: 2.0, return_quantity: 0, product_id: '10018' },
  { product_name: '黒ゴマ', category: 'SOYドーナツ', tax_type: '内税', net_sales: 15840, sales_ratio: 1.2, discount_amount: 11520, quantity: 48, quantity_ratio: 2.0, return_quantity: 0, product_id: '10019' },
  { product_name: 'つぶあんクリーム（どらやき）', category: 'どらやき', tax_type: '内税', net_sales: 15640, sales_ratio: 1.2, discount_amount: 7650, quantity: 34, quantity_ratio: 1.4, return_quantity: 0, product_id: '10091' },
  { product_name: 'ココナッツ（ケーキドーナツ）', category: 'ケーキドーナツ', tax_type: '内税', net_sales: 13760, sales_ratio: 1.1, discount_amount: 6368, quantity: 32, quantity_ratio: 1.3, return_quantity: 0, product_id: '10142' },
  { product_name: 'みたらし団子', category: 'どらやき', tax_type: '内税', net_sales: 12880, sales_ratio: 1.0, discount_amount: 0, quantity: 28, quantity_ratio: 1.1, return_quantity: 0, product_id: '10151' },
  { product_name: 'ショコラ（アイス）', category: 'アイス', tax_type: '内税', net_sales: 12740, sales_ratio: 1.0, discount_amount: 4732, quantity: 26, quantity_ratio: 1.1, return_quantity: 0, product_id: '10081' },
  { product_name: 'イチゴ（ケーキドーナツ）', category: 'ケーキドーナツ', tax_type: '内税', net_sales: 12040, sales_ratio: 0.9, discount_amount: 5572, quantity: 28, quantity_ratio: 1.1, return_quantity: 0, product_id: '10098' },
  { product_name: 'ミント（ケーキドーナツ）', category: 'ケーキドーナツ', tax_type: '内税', net_sales: 11610, sales_ratio: 0.9, discount_amount: 5373, quantity: 27, quantity_ratio: 1.1, return_quantity: 0, product_id: '10097' },
  { product_name: '抹茶（アイス）', category: 'アイス', tax_type: '内税', net_sales: 10780, sales_ratio: 0.8, discount_amount: 0, quantity: 22, quantity_ratio: 0.9, return_quantity: 0, product_id: '10085' },
  { product_name: 'ストロベリー（ワッフルホイップ）', category: 'ワッフルホイップ', tax_type: '内税', net_sales: 10560, sales_ratio: 0.8, discount_amount: 0, quantity: 16, quantity_ratio: 0.7, return_quantity: 0, product_id: '10108' },
  { product_name: 'あんこ（どらやき）', category: 'どらやき', tax_type: '内税', net_sales: 9660, sales_ratio: 0.7, discount_amount: 4725, quantity: 21, quantity_ratio: 0.9, return_quantity: 0, product_id: '10093' },
  { product_name: 'ほうじ茶（アイス）', category: 'アイス', tax_type: '内税', net_sales: 9310, sales_ratio: 0.7, discount_amount: 3458, quantity: 20, quantity_ratio: 0.8, return_quantity: 1, product_id: '10086' },
  { product_name: '抹茶ソイラテ', category: 'ドリンク', tax_type: '内税', net_sales: 9300, sales_ratio: 0.7, discount_amount: 0, quantity: 24, quantity_ratio: 1.0, return_quantity: 0, product_id: '10143' },
  { product_name: '抹茶ワッフル', category: 'ワッフル', tax_type: '内税', net_sales: 8280, sales_ratio: 0.6, discount_amount: 0, quantity: 12, quantity_ratio: 0.5, return_quantity: 0, product_id: '10103' },
  { product_name: 'カスタム商品', category: '未設定', tax_type: '内税', net_sales: 7530, sales_ratio: 0.6, discount_amount: 0, quantity: 3, quantity_ratio: 0.1, return_quantity: 0, product_id: '9999' },
  { product_name: '栗（アイス）', category: 'アイス', tax_type: '内税', net_sales: 7350, sales_ratio: 0.6, discount_amount: 2730, quantity: 15, quantity_ratio: 0.6, return_quantity: 0, product_id: '10084' },
  { product_name: 'トロピカルソーダ', category: 'ドリンク', tax_type: '内税', net_sales: 7290, sales_ratio: 0.6, discount_amount: 0, quantity: 19, quantity_ratio: 0.8, return_quantity: 0, product_id: '10145' },
  { product_name: 'ミックスベリーティー', category: 'ドリンク', tax_type: '内税', net_sales: 6780, sales_ratio: 0.5, discount_amount: 0, quantity: 18, quantity_ratio: 0.7, return_quantity: 0, product_id: '10144' },
  { product_name: 'セットドリンク', category: 'ドリンク', tax_type: '内税', net_sales: 5940, sales_ratio: 0.5, discount_amount: 0, quantity: 18, quantity_ratio: 0.7, return_quantity: 0, product_id: '10095' },
  { product_name: '黒ゴマ豆乳ラテ', category: 'ドリンク', tax_type: '内税', net_sales: 5850, sales_ratio: 0.5, discount_amount: 0, quantity: 15, quantity_ratio: 0.6, return_quantity: 0, product_id: '10053' },
  { product_name: 'ベリーミックス（アイス）', category: 'アイス', tax_type: '内税', net_sales: 5390, sales_ratio: 0.4, discount_amount: 2002, quantity: 11, quantity_ratio: 0.4, return_quantity: 0, product_id: '10080' },
  { product_name: 'りんご（アイス）', category: 'アイス', tax_type: '内税', net_sales: 3920, sales_ratio: 0.3, discount_amount: 1456, quantity: 8, quantity_ratio: 0.3, return_quantity: 0, product_id: '10083' },
  { product_name: 'ドラゴンフルーツ（アイス）', category: 'アイス', tax_type: '内税', net_sales: 2450, sales_ratio: 0.2, discount_amount: 0, quantity: 5, quantity_ratio: 0.2, return_quantity: 0, product_id: '10087' },
  { product_name: 'お持ち帰り（保冷剤）', category: 'その他', tax_type: '内税', net_sales: 2400, sales_ratio: 0.2, discount_amount: 0, quantity: 12, quantity_ratio: 0.5, return_quantity: 0, product_id: '10148' },
  { product_name: '保冷バック（保冷剤付）', category: 'その他', tax_type: '内税', net_sales: 1000, sales_ratio: 0.1, discount_amount: 100, quantity: 5, quantity_ratio: 0.2, return_quantity: 0, product_id: '10049' },
  { product_name: 'ソーダフロート', category: 'ドリンク', tax_type: '内税', net_sales: 980, sales_ratio: 0.1, discount_amount: 0, quantity: 2, quantity_ratio: 0.1, return_quantity: 0, product_id: '10153' },
  { product_name: '生豆乳ホイップクリーム', category: 'ワッフルホイップ', tax_type: '内税', net_sales: 520, sales_ratio: 0.0, discount_amount: 0, quantity: 2, quantity_ratio: 0.1, return_quantity: 0, product_id: '10063' },
  { product_name: '豆乳クリーム', category: 'どらやき', tax_type: '内税', net_sales: 460, sales_ratio: 0.0, discount_amount: 0, quantity: 1, quantity_ratio: 0.0, return_quantity: 0, product_id: '10150' },
  { product_name: '保冷剤', category: 'その他', tax_type: '内税', net_sales: 120, sales_ratio: 0.0, discount_amount: 30, quantity: 3, quantity_ratio: 0.1, return_quantity: 0, product_id: '10140' },
];

// 2026年9月の実データ: 日別売上集計
export const RAW_DAILY_SALES_2026_09 = [
  { date: '2026-09-01', sales: 26660, order_count: 24, order_avg: 1110, customer_count: 24, customer_avg: 1110, item_count: 56, cash_total: 8900, cashless_total: 17760, sales_10pct: 16478, sales_8pct: 10182 },
  { date: '2026-09-02', sales: 22860, order_count: 29, order_avg: 788, customer_count: 29, customer_avg: 788, item_count: 43, cash_total: 9340, cashless_total: 13520, sales_10pct: 17993, sales_8pct: 4867 },
  { date: '2026-09-03', sales: 37940, order_count: 33, order_avg: 1149, customer_count: 33, customer_avg: 1149, item_count: 77, cash_total: 18650, cashless_total: 19290, sales_10pct: 21647, sales_8pct: 16293 },
  { date: '2026-09-04', sales: 41220, order_count: 31, order_avg: 1329, customer_count: 31, customer_avg: 1329, item_count: 76, cash_total: 26530, cashless_total: 14690, sales_10pct: 23456, sales_8pct: 17764 },
  { date: '2026-09-05', sales: 65880, order_count: 59, order_avg: 1116, customer_count: 59, customer_avg: 1116, item_count: 125, cash_total: 29640, cashless_total: 36240, sales_10pct: 49650, sales_8pct: 16230 },
  { date: '2026-09-06', sales: 48220, order_count: 42, order_avg: 1148, customer_count: 42, customer_avg: 1148, item_count: 91, cash_total: 14900, cashless_total: 33320, sales_10pct: 32501, sales_8pct: 15719 },
  { date: '2026-09-07', sales: 35100, order_count: 35, order_avg: 1002, customer_count: 35, customer_avg: 1002, item_count: 64, cash_total: 12490, cashless_total: 22610, sales_10pct: 22123, sales_8pct: 12977 },
  { date: '2026-09-08', sales: 33082, order_count: 31, order_avg: 1067, customer_count: 31, customer_avg: 1067, item_count: 68, cash_total: 19830, cashless_total: 13252, sales_10pct: 18190, sales_8pct: 14892 },
  { date: '2026-09-09', sales: 21350, order_count: 20, order_avg: 1067, customer_count: 20, customer_avg: 1067, item_count: 44, cash_total: 9720, cashless_total: 11630, sales_10pct: 10426, sales_8pct: 10924 },
  { date: '2026-09-10', sales: 31900, order_count: 33, order_avg: 966, customer_count: 33, customer_avg: 966, item_count: 58, cash_total: 11890, cashless_total: 20010, sales_10pct: 24986, sales_8pct: 6914 },
  { date: '2026-09-11', sales: 43700, order_count: 38, order_avg: 1150, customer_count: 38, customer_avg: 1150, item_count: 88, cash_total: 17750, cashless_total: 25950, sales_10pct: 24857, sales_8pct: 18843 },
  { date: '2026-09-12', sales: 46600, order_count: 44, order_avg: 1059, customer_count: 44, customer_avg: 1059, item_count: 92, cash_total: 17040, cashless_total: 29560, sales_10pct: 32260, sales_8pct: 14340 },
  { date: '2026-09-13', sales: 35720, order_count: 28, order_avg: 1275, customer_count: 28, customer_avg: 1275, item_count: 68, cash_total: 18430, cashless_total: 17290, sales_10pct: 25216, sales_8pct: 10504 },
  { date: '2026-09-14', sales: 27240, order_count: 26, order_avg: 1047, customer_count: 26, customer_avg: 1047, item_count: 52, cash_total: 15980, cashless_total: 11260, sales_10pct: 18210, sales_8pct: 9030 },
  { date: '2026-09-15', sales: 41455, order_count: 33, order_avg: 1256, customer_count: 33, customer_avg: 1256, item_count: 70, cash_total: 18270, cashless_total: 23185, sales_10pct: 25425, sales_8pct: 16030 },
  { date: '2026-09-16', sales: 41080, order_count: 38, order_avg: 1081, customer_count: 38, customer_avg: 1081, item_count: 79, cash_total: 14770, cashless_total: 26310, sales_10pct: 26523, sales_8pct: 14557 },
  { date: '2026-09-17', sales: 35770, order_count: 25, order_avg: 1430, customer_count: 25, customer_avg: 1430, item_count: 70, cash_total: 14370, cashless_total: 21400, sales_10pct: 18250, sales_8pct: 17520 },
  { date: '2026-09-18', sales: 25752, order_count: 24, order_avg: 1073, customer_count: 24, customer_avg: 1073, item_count: 50, cash_total: 7870, cashless_total: 17882, sales_10pct: 16912, sales_8pct: 8840 },
  { date: '2026-09-19', sales: 67530, order_count: 54, order_avg: 1250, customer_count: 54, customer_avg: 1250, item_count: 127, cash_total: 27520, cashless_total: 40010, sales_10pct: 47186, sales_8pct: 20344 },
  { date: '2026-09-20', sales: 56640, order_count: 54, order_avg: 1048, customer_count: 54, customer_avg: 1048, item_count: 102, cash_total: 26150, cashless_total: 30490, sales_10pct: 43750, sales_8pct: 12890 },
  { date: '2026-09-21', sales: 75690, order_count: 58, order_avg: 1305, customer_count: 58, customer_avg: 1305, item_count: 145, cash_total: 20220, cashless_total: 55470, sales_10pct: 52504, sales_8pct: 23186 },
  { date: '2026-09-22', sales: 65430, order_count: 52, order_avg: 1258, customer_count: 52, customer_avg: 1258, item_count: 124, cash_total: 28850, cashless_total: 36580, sales_10pct: 45443, sales_8pct: 19987 },
  { date: '2026-09-23', sales: 65140, order_count: 54, order_avg: 1206, customer_count: 54, customer_avg: 1206, item_count: 121, cash_total: 25610, cashless_total: 39530, sales_10pct: 48583, sales_8pct: 16557 },
  { date: '2026-09-24', sales: 45540, order_count: 46, order_avg: 990, customer_count: 46, customer_avg: 990, item_count: 94, cash_total: 11510, cashless_total: 34030, sales_10pct: 28130, sales_8pct: 17410 },
  { date: '2026-09-25', sales: 25920, order_count: 25, order_avg: 1036, customer_count: 25, customer_avg: 1036, item_count: 48, cash_total: 11670, cashless_total: 14250, sales_10pct: 19024, sales_8pct: 6896 },
  { date: '2026-09-26', sales: 55400, order_count: 45, order_avg: 1231, customer_count: 45, customer_avg: 1231, item_count: 108, cash_total: 18810, cashless_total: 36590, sales_10pct: 37092, sales_8pct: 18308 },
  { date: '2026-09-27', sales: 54830, order_count: 43, order_avg: 1275, customer_count: 43, customer_avg: 1275, item_count: 106, cash_total: 31990, cashless_total: 22840, sales_10pct: 31630, sales_8pct: 23200 },
  { date: '2026-09-28', sales: 24130, order_count: 25, order_avg: 965, customer_count: 25, customer_avg: 965, item_count: 44, cash_total: 9510, cashless_total: 14620, sales_10pct: 18060, sales_8pct: 6070 },
  { date: '2026-09-29', sales: 45390, order_count: 41, order_avg: 1107, customer_count: 41, customer_avg: 1107, item_count: 85, cash_total: 18000, cashless_total: 27390, sales_10pct: 29524, sales_8pct: 15866 },
  { date: '2026-09-30', sales: 41822, order_count: 30, order_avg: 1394, customer_count: 30, customer_avg: 1394, item_count: 82, cash_total: 17832, cashless_total: 23990, sales_10pct: 26164, sales_8pct: 15658 },
];

/**
 * 過去3年半（2023年4月〜2026年9月 = 42ヶ月）の月次トレンドシードを生成
 * 店舗ビジネス特有のリアリティを再現:
 * 1. 強い季節性 (7〜8月の夏に冷菓がピーク、11〜2月の冬は売上が落ち着きドーナツ・焼菓子比率が上昇)
 * 2. 成長フェーズ:
 *    - 2023年: オープン初年、順調に拡大 (年商約1,200万円)
 *    - 2024年: 急成長期、メディア・SNSでバズ (年商約1,600万円、月商150〜180万)
 *    - 2025年: 成長鈍化期 (客数は維持しているが、客単価・買上点数が下落)
 *    - 2026年: 直近 (前年割れ〜横ばい。特に看板ワッフルソフトの出数がやや頭打ち、併せ買いの低下)
 */
export function generateMultiYearProductSales(): ProductSalesRecord[] {
  const records: ProductSalesRecord[] = [];
  
  // 期間リスト: 2023-04 〜 2026-09
  const years = [2023, 2024, 2025, 2026];
  
  years.forEach(year => {
    const startMonth = year === 2023 ? 4 : 1;
    const endMonth = year === 2026 ? 9 : 12;

    for (let m = startMonth; m <= endMonth; m++) {
      const period = `${year}-${String(m).padStart(2, '0')}`;
      
      // 季節要因倍率 (7〜8月夏ピーク、12〜2月冬ボトム)
      let seasonalFactor = 1.0;
      if (m === 7 || m === 8) seasonalFactor = 1.45; // 夏本番
      else if (m === 6 || m === 9) seasonalFactor = 1.2; // 初夏・初秋
      else if (m === 4 || m === 5 || m === 10) seasonalFactor = 1.0; // 春・秋
      else seasonalFactor = 0.75; // 冬

      // 年次成長倍率 (2024年をピークとし、2025年後半から鈍化)
      let yearFactor = 1.0;
      if (year === 2023) yearFactor = 0.82;
      else if (year === 2024) yearFactor = 1.18; // バズ・急成長
      else if (year === 2025) yearFactor = 1.10; // 伸び悩み始め
      else if (year === 2026) yearFactor = 1.00; // 直近（基準）

      RAW_PRODUCT_SALES_2026_09.forEach((raw, idx) => {
        // カテゴリーごとの季節反転:
        // 冷菓は夏に超跳ねる、ドーナツ・焼菓子・温かいラテは冬にシェアが伸びる
        let catFactor = 1.0;
        const isCold = raw.category.includes('ソフト') || raw.category.includes('アイス') || raw.product_name.includes('スムージー');
        const isWarmOrBaked = raw.category.includes('ドーナツ') || raw.category.includes('ワッフル') || raw.category.includes('どらやき') || raw.product_name.includes('コーヒー');

        if (isCold) {
          catFactor = seasonalFactor;
        } else if (isWarmOrBaked) {
          // 冬に冷菓が落ちる分、焼菓子は冬でも底堅い（夏の0.9倍、冬は1.1倍）
          catFactor = seasonalFactor > 1.2 ? 0.9 : 1.15;
        }

        // 商品ごとのトレンド変化（ワッフルソフトは2024年ピークで2025〜2026年に微減、マンゴースムージーは夏限定）
        let productDrift = 1.0;
        if (raw.product_name.includes('ワッフルソフト')) {
          if (year === 2024) productDrift = 1.25; // かつての大爆発
          else if (year === 2026) productDrift = 1.0; // 飽き・鈍化
        }
        if (raw.product_name.includes('マンゴー') && (m < 5 || m > 9)) {
          // 冬場はスムージーは出ない
          productDrift = 0.1;
        }

        const calculatedNetSales = Math.round(raw.net_sales * yearFactor * catFactor * productDrift * (0.95 + Math.random() * 0.1));
        const calculatedQty = Math.max(1, Math.round(raw.quantity * yearFactor * catFactor * productDrift * (0.95 + Math.random() * 0.1)));

        records.push({
          id: `ps-${period}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          period,
          product_name: raw.product_name,
          category: raw.category,
          tax_type: raw.tax_type,
          net_sales: calculatedNetSales,
          sales_ratio: raw.sales_ratio,
          discount_amount: raw.discount_amount,
          quantity: calculatedQty,
          quantity_ratio: raw.quantity_ratio,
          return_quantity: raw.return_quantity,
          product_id: raw.product_id,
        });
      });
    }
  });

  return records;
}

/**
 * 過去3年半の月別サマリーテーブル（日別集計から月次にロールアップした集計）
 */
export function generateMultiYearDailySales(): DailySalesRecord[] {
  const records: DailySalesRecord[] = [];
  const years = [2023, 2024, 2025, 2026];

  years.forEach(year => {
    const startMonth = year === 2023 ? 4 : 1;
    const endMonth = year === 2026 ? 9 : 12;

    for (let m = startMonth; m <= endMonth; m++) {
      const period = `${year}-${String(m).padStart(2, '0')}`;
      const daysInMonth = new Date(year, m, 0).getDate();

      let seasonalFactor = 1.0;
      if (m === 7 || m === 8) seasonalFactor = 1.45;
      else if (m === 6 || m === 9) seasonalFactor = 1.2;
      else if (m === 4 || m === 5 || m === 10) seasonalFactor = 1.0;
      else seasonalFactor = 0.75;

      let yearFactor = 1.0;
      if (year === 2023) yearFactor = 0.82;
      else if (year === 2024) yearFactor = 1.18;
      else if (year === 2025) yearFactor = 1.10;
      else if (year === 2026) yearFactor = 1.00;

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${period}-${String(d).padStart(2, '0')}`;
        const dt = new Date(year, m - 1, d);
        const dayOfWeekIdx = dt.getDay();
        const daysMap = ['日', '月', '火', '水', '木', '金', '土'];
        const day_of_week = daysMap[dayOfWeekIdx];
        const is_weekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 6;

        // 土日は平日の約1.7〜2.0倍
        const weekendFactor = is_weekend ? 1.85 : 1.0;

        // ベース日商: 約35,000円
        const baseDailySales = 35000 * weekendFactor * seasonalFactor * yearFactor * (0.88 + Math.random() * 0.24);
        const sales = Math.round(baseDailySales);
        
        // 客単価: 2024年は1,250円あったが、2026年は1,120円に低下（鈍化要因）
        const baseAvgSpend = (year === 2024 ? 1250 : year === 2025 ? 1180 : 1120) * (is_weekend ? 1.1 : 0.95);
        const customer_avg = Math.round(baseAvgSpend);
        const order_count = Math.max(5, Math.round(sales / customer_avg));
        const customer_count = order_count;
        const order_avg = customer_avg;

        // 買上点数: 2024年は2.4点だったが、直近は2.0点に減少
        const baseItemsPerOrder = (year === 2024 ? 2.4 : year === 2025 ? 2.15 : 2.02);
        const item_count = Math.round(order_count * baseItemsPerOrder);
        const items_per_order = Number((item_count / order_count).toFixed(2));

        const cashRatio = 0.35;
        const cash_total = Math.round(sales * cashRatio);
        const cashless_total = sales - cash_total;

        // イートイン 10% vs テイクアウト 8%
        const eatInRatio = is_weekend ? 0.65 : 0.55;
        const sales_10pct = Math.round(sales * eatInRatio);
        const sales_8pct = sales - sales_10pct;

        records.push({
          id: `ds-${dateStr}`,
          date: dateStr,
          period,
          day_of_week,
          is_weekend,
          sales,
          order_count,
          order_avg,
          customer_count,
          customer_avg,
          item_count,
          items_per_order,
          cash_total,
          cashless_total,
          sales_10pct,
          sales_8pct,
          refund_10pct: 0,
          refund_8pct: 0,
        });
      }
    }
  });

  return records;
}
