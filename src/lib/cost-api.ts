import { Material, Recipe, RecipeCostBreakdown, PackageType, PackageConfig, UniformPricingConfig } from '@/types/cost';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================
// 本番用 初期マスターデータ（原材料 29種 ＋ 資材 8種）
// ============================================================

export const INITIAL_MATERIALS: Material[] = [
  // --- 原材料 (Ingredients 29種) ---
  {
    id: 'mat-ing-soy-milk',
    category: 'ingredient',
    name: '国産無調整豆乳',
    supplier: 'マルサンアイ / オーガニック',
    package_unit_name: '1ケース (1000ml×6本)',
    package_quantity: 6000,
    unit_type: 'ml',
    package_price: 1980,
    shipping_cost: 0,
    total_package_cost: 1980,
    unit_cost: 0.33,
    notes: '大豆固形分10%以上・有機JAS',
  },
  {
    id: 'mat-ing-almond-milk',
    category: 'ingredient',
    name: '無糖アーモンドミルク',
    supplier: '筑波乳業',
    package_unit_name: '1ケース (1000ml×6本)',
    package_quantity: 6000,
    unit_type: 'ml',
    package_price: 2400,
    shipping_cost: 0,
    total_package_cost: 2400,
    unit_cost: 0.40,
    notes: 'ショコラ用・ナッツ香ばしさ',
  },
  {
    id: 'mat-ing-amazake',
    category: 'ingredient',
    name: '国産米 濃縮甘酒',
    supplier: 'マルコメ / 蔵元直送',
    package_unit_name: '1ケース (1000g×3本)',
    package_quantity: 3000,
    unit_type: 'g',
    package_price: 1800,
    shipping_cost: 0,
    total_package_cost: 1800,
    unit_cost: 0.60,
    notes: '米麹ノンアルコール・ほうじ＆抹茶ベース',
  },
  {
    id: 'mat-ing-soy-whip',
    category: 'ingredient',
    name: '植物性 豆乳ホイップ',
    supplier: 'めいらく',
    package_unit_name: '1本 (1000ml)',
    package_quantity: 1000,
    unit_type: 'ml',
    package_price: 650,
    shipping_cost: 0,
    total_package_cost: 650,
    unit_cost: 0.65,
    notes: '植物性脂肪分・ふんわり口溶け向上',
  },
  {
    id: 'mat-ing-coconut-cream',
    category: 'ingredient',
    name: 'オーガニック ココナッツクリーム',
    supplier: 'むそう商事',
    package_unit_name: '1ケース (400g×12缶)',
    package_quantity: 4800,
    unit_type: 'g',
    package_price: 4560,
    shipping_cost: 0,
    total_package_cost: 4560,
    unit_cost: 0.95,
    notes: '濃厚な植物性コク出し',
  },
  {
    id: 'mat-ing-coconut-powder',
    category: 'ingredient',
    name: '有機 ココナッツミルクパウダー',
    supplier: 'アリサン',
    package_unit_name: '1袋 (1000g)',
    package_quantity: 1000,
    unit_type: 'g',
    package_price: 2200,
    shipping_cost: 0,
    total_package_cost: 2200,
    unit_cost: 2.20,
    notes: '水分を増やさずに乳化安定',
  },
  {
    id: 'mat-ing-rice-flour',
    category: 'ingredient',
    name: '国産製菓用 超微粉米粉',
    supplier: '共立食品 / 九州産米',
    package_unit_name: '1袋 (10kg)',
    package_quantity: 10000,
    unit_type: 'g',
    package_price: 4200,
    shipping_cost: 800,
    total_package_cost: 5000,
    unit_cost: 0.50,
    notes: '糊化（α化）させてなめらかさと保型性を実現',
  },
  {
    id: 'mat-ing-rice-oil',
    category: 'ingredient',
    name: '国産米油 (こめ油)',
    supplier: '三和油脂',
    package_unit_name: '1箱 (1500g×6本)',
    package_quantity: 9000,
    unit_type: 'g',
    package_price: 6300,
    shipping_cost: 0,
    total_package_cost: 6300,
    unit_cost: 0.70,
    notes: 'クセのない良質植物油・乳化用',
  },
  {
    id: 'mat-ing-beet-syrup',
    category: 'ingredient',
    name: '北海道産 てんさいシロップ',
    supplier: 'ホクレン',
    package_unit_name: '1本 (1000g)',
    package_quantity: 1000,
    unit_type: 'g',
    package_price: 780,
    shipping_cost: 0,
    total_package_cost: 780,
    unit_cost: 0.78,
    notes: 'オリゴ糖含有・優しい甘さと氷点降下',
  },
  {
    id: 'mat-ing-kibi-sugar',
    category: 'ingredient',
    name: '奄美諸島産 きび砂糖',
    supplier: '日新製糖',
    package_unit_name: '1袋 (1000g)',
    package_quantity: 1000,
    unit_type: 'g',
    package_price: 420,
    shipping_cost: 0,
    total_package_cost: 420,
    unit_cost: 0.42,
    notes: 'ミネラル感・ほうじ＆抹茶と好相性',
  },
  {
    id: 'mat-ing-white-miso',
    category: 'ingredient',
    name: '有機 京風白みそ',
    supplier: '九重味噌',
    package_unit_name: '1袋 (1000g)',
    package_quantity: 1000,
    unit_type: 'g',
    package_price: 680,
    shipping_cost: 0,
    total_package_cost: 680,
    unit_cost: 0.68,
    notes: '自然なコクと隠し味の塩味',
  },
  {
    id: 'mat-ing-vanilla-oil',
    category: 'ingredient',
    name: '製菓用 バニラオイル',
    supplier: '富澤商店',
    package_unit_name: '1瓶 (100g)',
    package_quantity: 100,
    unit_type: 'g',
    package_price: 1200,
    shipping_cost: 0,
    total_package_cost: 1200,
    unit_cost: 12.00,
    notes: '耐熱芳香・各種アイスのベース香',
  },
  {
    id: 'mat-ing-vanilla-essence',
    category: 'ingredient',
    name: 'バニラエッセンス',
    supplier: '富澤商店',
    package_unit_name: '1瓶 (100g)',
    package_quantity: 100,
    unit_type: 'g',
    package_price: 850,
    shipping_cost: 0,
    total_package_cost: 850,
    unit_cost: 8.50,
    notes: 'バニラアイス専用',
  },
  {
    id: 'mat-ing-lemon-juice',
    category: 'ingredient',
    name: '有機 ストレートレモン果汁',
    supplier: 'テルヴィス',
    package_unit_name: '1本 (1000ml)',
    package_quantity: 1000,
    unit_type: 'ml',
    package_price: 1100,
    shipping_cost: 0,
    total_package_cost: 1100,
    unit_cost: 1.10,
    notes: 'フルーツ系酸味と変色防止',
  },
  {
    id: 'mat-ing-water',
    category: 'ingredient',
    name: '仕込み水 (高機能浄水)',
    supplier: '自社浄水システム',
    package_unit_name: '1ロット (1000g)',
    package_quantity: 1000,
    unit_type: 'g',
    package_price: 10,
    shipping_cost: 0,
    total_package_cost: 10,
    unit_cost: 0.01,
    notes: '水・α化＆配合調整用',
  },
  {
    id: 'mat-ing-earl-grey-syrup',
    category: 'ingredient',
    name: 'アールグレイシロップ',
    supplier: '特注紅茶抽出液',
    package_unit_name: '1本 (500g)',
    package_quantity: 500,
    unit_type: 'g',
    package_price: 980,
    shipping_cost: 0,
    total_package_cost: 980,
    unit_cost: 1.96,
    notes: 'ベルガモット香る濃厚紅茶シロップ (1本500g)',
  },
  {
    id: 'mat-ing-oishisugiru-apple',
    category: 'ingredient',
    name: 'おいしすぎるりんご (100%果汁ジュース)',
    supplier: '完熟ストレート果汁',
    package_unit_name: '1本 (1000ml)',
    package_quantity: 1000,
    unit_type: 'ml',
    package_price: 850,
    shipping_cost: 0,
    total_package_cost: 850,
    unit_cost: 0.85,
    notes: 'りんごアイス主原料 (1本1L)',
  },
  {
    id: 'mat-ing-oishisugiru-peach',
    category: 'ingredient',
    name: 'おいしすぎるもも (100%果汁ジュース)',
    supplier: '完熟ストレート果汁',
    package_unit_name: '1本 (1000ml)',
    package_quantity: 1000,
    unit_type: 'ml',
    package_price: 900,
    shipping_cost: 0,
    total_package_cost: 900,
    unit_cost: 0.90,
    notes: 'ももアイス主原料 (1本1L)',
  },
  {
    id: 'mat-ing-pine-juice',
    category: 'ingredient',
    name: '100%パインジュース',
    supplier: 'ストレート果汁',
    package_unit_name: '1本 (1000ml)',
    package_quantity: 1000,
    unit_type: 'ml',
    package_price: 450,
    shipping_cost: 0,
    total_package_cost: 450,
    unit_cost: 0.45,
    notes: 'ドラゴンフルーツの酸味とトロピカル感補助',
  },
  {
    id: 'mat-ing-dragon-fruit-puree',
    category: 'ingredient',
    name: '冷凍 ドラゴンフルーツピューレ (レッドピタヤ)',
    supplier: '専門商社',
    package_unit_name: '1パック (1000g)',
    package_quantity: 1000,
    unit_type: 'g',
    package_price: 1600,
    shipping_cost: 800,
    total_package_cost: 2400,
    unit_cost: 2.40,
    notes: '鮮烈なマゼンタピンク色・加熱後ブレンド',
  },
  {
    id: 'mat-ing-strawberry-puree',
    category: 'ingredient',
    name: '冷凍 ストロベリーピューレ (加糖10%)',
    supplier: 'ボワロン / ラ・フルティエール',
    package_unit_name: '1パック (1000g)',
    package_quantity: 1000,
    unit_type: 'g',
    package_price: 1400,
    shipping_cost: 800,
    total_package_cost: 2200,
    unit_cost: 2.20,
    notes: 'ミックスベリー主原料・加熱後ブレンド',
  },
  {
    id: 'mat-ing-framboise-puree',
    category: 'ingredient',
    name: '冷凍 フランボワーズピューレ (木苺)',
    supplier: 'ボワロン',
    package_unit_name: '1パック (1000g)',
    package_quantity: 1000,
    unit_type: 'g',
    package_price: 1800,
    shipping_cost: 800,
    total_package_cost: 2600,
    unit_cost: 2.60,
    notes: '華やかな酸味と香り立ち',
  },
  {
    id: 'mat-ing-mango-puree',
    category: 'ingredient',
    name: '冷凍 アップルマンゴーピューレ',
    supplier: '専門商社',
    package_unit_name: '1パック (1000g)',
    package_quantity: 1000,
    unit_type: 'g',
    package_price: 1500,
    shipping_cost: 800,
    total_package_cost: 2300,
    unit_cost: 2.30,
    notes: '完熟アップルマンゴー濃厚ピューレ',
  },
  {
    id: 'mat-ing-cocoa-powder',
    category: 'ingredient',
    name: '純ココアパウダー (無糖)',
    supplier: 'ヴァローナ / アルチェネロ',
    package_unit_name: '1袋 (1000g)',
    package_quantity: 1000,
    unit_type: 'g',
    package_price: 2400,
    shipping_cost: 0,
    total_package_cost: 2400,
    unit_cost: 2.40,
    notes: '芳醇ビターココア',
  },
  {
    id: 'mat-ing-cocoa-butter',
    category: 'ingredient',
    name: '食用 ココアバター',
    supplier: 'カカオ工房',
    package_unit_name: '1パック (500g)',
    package_quantity: 500,
    unit_type: 'g',
    package_price: 1800,
    shipping_cost: 0,
    total_package_cost: 1800,
    unit_cost: 3.60,
    notes: '口溶け温度調整・ショコラのコク',
  },
  {
    id: 'mat-ing-cacao-mass',
    category: 'ingredient',
    name: '製菓用 カカオマス (カカオ分100%)',
    supplier: '大東カカオ',
    package_unit_name: '1袋 (1000g)',
    package_quantity: 1000,
    unit_type: 'g',
    package_price: 2600,
    shipping_cost: 0,
    total_package_cost: 2600,
    unit_cost: 2.60,
    notes: '本格ショコラの濃厚感',
  },
  {
    id: 'mat-ing-hojicha-powder',
    category: 'ingredient',
    name: '京都産 ほうじ茶微粉末パウダー',
    supplier: '宇治茶舗',
    package_unit_name: '1袋 (500g)',
    package_quantity: 500,
    unit_type: 'g',
    package_price: 2500,
    shipping_cost: 0,
    total_package_cost: 2500,
    unit_cost: 5.00,
    notes: '直火焙煎の香ばしい深み',
  },
  {
    id: 'mat-ing-matcha-powder',
    category: 'ingredient',
    name: '京都宇治 有機一番摘み抹茶パウダー',
    supplier: '宇治有機茶園',
    package_unit_name: '1袋 (500g)',
    package_quantity: 500,
    unit_type: 'g',
    package_price: 4500,
    shipping_cost: 0,
    total_package_cost: 4500,
    unit_cost: 9.00,
    notes: '石臼挽き・鮮やかな緑と上品な旨味',
  },
  {
    id: 'mat-ing-chlorella-powder',
    category: 'ingredient',
    name: '製菓用 クロレラパウダー',
    supplier: 'サン・クロレラ',
    package_unit_name: '1袋 (100g)',
    package_quantity: 100,
    unit_type: 'g',
    package_price: 1200,
    shipping_cost: 0,
    total_package_cost: 1200,
    unit_cost: 12.00,
    notes: '抹茶の退色防止と美しい発色維持',
  },

  // --- 資材 (Packaging) - カップ用 (6種) ---
  {
    id: 'mat-pkg-001',
    category: 'packaging',
    name: '100g バイオプラ紙アイスカップ (SoyStories特注ロゴ)',
    supplier: '東罐興業',
    package_unit_name: '1箱 (1000個)',
    package_quantity: 1000,
    unit_type: 'piece',
    package_price: 18500,
    shipping_cost: 1200,
    total_package_cost: 19700,
    unit_cost: 19.7,
    notes: '生分解性PLAラミネート・環境配慮カップ',
  },
  {
    id: 'mat-pkg-002',
    category: 'packaging',
    name: 'トップシール用 防曇イージーピールフィルム蓋',
    supplier: '凸版印刷',
    package_unit_name: '1巻 (1500枚分)',
    package_quantity: 1500,
    unit_type: 'piece',
    package_price: 9000,
    shipping_cost: 800,
    total_package_cost: 9800,
    unit_cost: 6.533,
    notes: '鮮度保持・自動シーラー対応',
  },
  {
    id: 'mat-pkg-003',
    category: 'packaging',
    name: '100gカップ用 紙製オーバーキャップ (外蓋)',
    supplier: '東罐興業',
    package_unit_name: '1ケース (1000個)',
    package_quantity: 1000,
    unit_type: 'piece',
    package_price: 11000,
    shipping_cost: 1000,
    total_package_cost: 12000,
    unit_cost: 12.0,
    notes: 'スタッキング対応・マット質感',
  },
  {
    id: 'mat-pkg-004',
    category: 'packaging',
    name: '蓋用 フレーバー別箔押しデザインラベルシール',
    supplier: 'ラベル印刷工房',
    package_unit_name: '1ロット (2000枚)',
    package_quantity: 2000,
    unit_type: 'piece',
    package_price: 16000,
    shipping_cost: 600,
    total_package_cost: 16600,
    unit_cost: 8.3,
    notes: '金箔押し加工・和紙調耐水タック紙',
  },
  {
    id: 'mat-pkg-005',
    category: 'packaging',
    name: '底面 一括表示ラベルシール (法定栄養成分・アレルゲン)',
    supplier: 'ラベル印刷工房',
    package_unit_name: '1ロット (2000枚)',
    package_quantity: 2000,
    unit_type: 'piece',
    package_price: 6400,
    shipping_cost: 600,
    total_package_cost: 7000,
    unit_cost: 3.5,
    notes: 'ユポ合成耐水紙・バーコード印刷',
  },
  {
    id: 'mat-pkg-006',
    category: 'packaging',
    name: '白樺製 個包装アイススプーン (FSC認証)',
    supplier: '木工パッケージ',
    package_unit_name: '1袋 (1000本)',
    package_quantity: 1000,
    unit_type: 'piece',
    package_price: 4200,
    shipping_cost: 800,
    total_package_cost: 5000,
    unit_cost: 5.0,
    notes: '無漂白天然木・紙個包装',
  },

  // --- 資材 (Packaging) - 業務用2Lバルク用 (2種 新規追加) ---
  {
    id: 'mat-pkg-bulk-001',
    category: 'packaging',
    name: '業務用 2L角型バルク容器 (PP製本体＋密封フタ)',
    supplier: 'リスパック / 業務用包装容器',
    package_unit_name: '1ケース (100組)',
    package_quantity: 100,
    unit_type: 'piece',
    package_price: 18000,
    shipping_cost: 0,
    total_package_cost: 18000,
    unit_cost: 180.0,
    notes: '冷凍耐性角型ディッシャー用コンテナ (2,000ml)',
  },
  {
    id: 'mat-pkg-bulk-002',
    category: 'packaging',
    name: '業務用 バルク容器用 一括表示ラベルシール',
    supplier: 'ラベル印刷工房',
    package_unit_name: '1ロット (1000枚)',
    package_quantity: 1000,
    unit_type: 'piece',
    package_price: 6000,
    shipping_cost: 0,
    total_package_cost: 6000,
    unit_cost: 6.0,
    notes: '冷凍用強粘着ユポ紙・業務用表示',
  },
];

// 共通資材構成 (カップ用: 1個あたり約55円)
export const COMMON_CUP_PACKAGINGS = [
  { id: 'pkg-c1', material_id: 'mat-pkg-001', quantity_per_unit: 1 },
  { id: 'pkg-c2', material_id: 'mat-pkg-002', quantity_per_unit: 1 },
  { id: 'pkg-c3', material_id: 'mat-pkg-003', quantity_per_unit: 1 },
  { id: 'pkg-c4', material_id: 'mat-pkg-004', quantity_per_unit: 1 },
  { id: 'pkg-c5', material_id: 'mat-pkg-005', quantity_per_unit: 1 },
  { id: 'pkg-c6', material_id: 'mat-pkg-006', quantity_per_unit: 1 },
];

// 共通資材構成 (2Lバルク用: 1本あたり186円)
export const COMMON_BULK_PACKAGINGS = [
  { id: 'pkg-b1', material_id: 'mat-pkg-bulk-001', quantity_per_unit: 1 },
  { id: 'pkg-b2', material_id: 'mat-pkg-bulk-002', quantity_per_unit: 1 },
];

// ヘルパー: デフォルト形態別設定を生成（一律販売価格基準）
function createDefaultConfigs(cupWholesale = 340, cupRetail = 520, bulkWholesale = 4320, bulkRetail = 6000) {
  return {
    cup_config: {
      package_type: 'cup' as PackageType,
      unit_name: '個',
      target_quantity: 65,
      labor_cost: 3000,
      target_wholesale_price: cupWholesale,
      target_retail_price: cupRetail,
      packagings: [...COMMON_CUP_PACKAGINGS],
    },
    bulk_config: {
      package_type: 'bulk' as PackageType,
      unit_name: '本 (2L)',
      target_quantity: 3,
      labor_cost: 3600,
      target_wholesale_price: bulkWholesale,
      target_retail_price: bulkRetail,
      packagings: [...COMMON_BULK_PACKAGINGS],
    },
  };
}

// ============================================================
// 本番用 レシピ10種データ (カップ & バルク両対応・一律価格標準)
// ============================================================

export const INITIAL_RECIPES: Recipe[] = [
  // 1. アールグレイ
  {
    id: 'recipe-earl-grey',
    name: '米粉アイス【アールグレイ】',
    category: '米粉アイス',
    description: 'ベルガモット香るアールグレイシロップと米粉のなめらかな口当たり。白みそが深みをプラス。',
    ...createDefaultConfigs(),
    ingredients: [
      { id: 'rg-1', material_id: 'mat-ing-earl-grey-syrup', amount: 1500, unit: 'g' },
      { id: 'rg-2', material_id: 'mat-ing-soy-milk', amount: 3500, unit: 'ml' },
      { id: 'rg-3', material_id: 'mat-ing-beet-syrup', amount: 650, unit: 'g' },
      { id: 'rg-4', material_id: 'mat-ing-white-miso', amount: 200, unit: 'g' },
      { id: 'rg-5', material_id: 'mat-ing-vanilla-oil', amount: 9, unit: 'g' },
      { id: 'rg-6', material_id: 'mat-ing-rice-flour', amount: 200, unit: 'g' },
      { id: 'rg-7', material_id: 'mat-ing-rice-oil', amount: 430, unit: 'g' },
    ],
    notes: '豆乳1本と米粉でα化、冷やして残りの液体と米油を合わせてブレンダー',
  },

  // 2. りんご
  {
    id: 'recipe-apple',
    name: '米粉アイス【りんご】',
    category: '米粉アイス',
    description: '100%果汁「おいしすぎるりんご」を贅沢に使用した爽やかな米粉ソルベアイス。',
    ...createDefaultConfigs(),
    ingredients: [
      { id: 'ra-1', material_id: 'mat-ing-oishisugiru-apple', amount: 4000, unit: 'ml' },
      { id: 'ra-2', material_id: 'mat-ing-beet-syrup', amount: 1650, unit: 'g' },
      { id: 'ra-3', material_id: 'mat-ing-coconut-cream', amount: 500, unit: 'g' },
      { id: 'ra-4', material_id: 'mat-ing-lemon-juice', amount: 280, unit: 'ml' },
      { id: 'ra-5', material_id: 'mat-ing-vanilla-oil', amount: 11, unit: 'g' },
      { id: 'ra-6', material_id: 'mat-ing-rice-flour', amount: 167, unit: 'g' },
    ],
    notes: 'ジュース1本と米粉でα化、シロップ投入',
  },

  // 3. バニラ
  {
    id: 'recipe-vanilla',
    name: '米粉アイス【バニラ】',
    category: '米粉アイス',
    description: '有機豆乳と豆乳ホイップ、ココナッツパウダーでコクを極めたシグネチャーバニラ。',
    ...createDefaultConfigs(),
    ingredients: [
      { id: 'rv-1', material_id: 'mat-ing-soy-milk', amount: 4000, unit: 'ml' },
      { id: 'rv-2', material_id: 'mat-ing-beet-syrup', amount: 1100, unit: 'g' },
      { id: 'rv-3', material_id: 'mat-ing-soy-whip', amount: 800, unit: 'ml' },
      { id: 'rv-4', material_id: 'mat-ing-coconut-powder', amount: 200, unit: 'g' },
      { id: 'rv-5', material_id: 'mat-ing-white-miso', amount: 200, unit: 'g' },
      { id: 'rv-6', material_id: 'mat-ing-vanilla-essence', amount: 90, unit: 'g' },
      { id: 'rv-7', material_id: 'mat-ing-rice-flour', amount: 230, unit: 'g' },
    ],
    notes: '豆乳1Lと米粉でα化',
  },

  // 4. ショコラ
  {
    id: 'recipe-chocolat',
    name: '米粉アイス【ショコラ】',
    category: '米粉アイス',
    description: 'アーモンドミルクベースにカカオマス、ココアバター、ココアパウダーをブレンドした濃厚ショコラ。',
    ...createDefaultConfigs(),
    ingredients: [
      { id: 'rc-1', material_id: 'mat-ing-almond-milk', amount: 3500, unit: 'ml' },
      { id: 'rc-2', material_id: 'mat-ing-beet-syrup', amount: 1680, unit: 'g' },
      { id: 'rc-3', material_id: 'mat-ing-coconut-cream', amount: 690, unit: 'g' },
      { id: 'rc-4', material_id: 'mat-ing-white-miso', amount: 110, unit: 'g' },
      { id: 'rc-5', material_id: 'mat-ing-vanilla-oil', amount: 46, unit: 'g' },
      { id: 'rc-6', material_id: 'mat-ing-rice-flour', amount: 230, unit: 'g' },
      { id: 'rc-7', material_id: 'mat-ing-cocoa-powder', amount: 230, unit: 'g' },
      { id: 'rc-8', material_id: 'mat-ing-cocoa-butter', amount: 50, unit: 'g' },
      { id: 'rc-9', material_id: 'mat-ing-cacao-mass', amount: 180, unit: 'g' },
    ],
    notes: 'アーモンドミルク1Lと米粉でα化。液をパストライザーに入れたあと★材料(ココア,バター,カカオマス)を入れる',
  },

  // 5. ドラゴンフルーツ
  {
    id: 'recipe-dragon-fruit',
    name: '米粉アイス【ドラゴンフルーツ】',
    category: '米粉アイス',
    description: '鮮烈なマゼンタピンクが映えるドラゴンフルーツピューレとパインジュースのトロピカルアイス。',
    ...createDefaultConfigs(),
    ingredients: [
      { id: 'rd-1', material_id: 'mat-ing-pine-juice', amount: 673, unit: 'ml' },
      { id: 'rd-2', material_id: 'mat-ing-coconut-cream', amount: 561, unit: 'g' },
      { id: 'rd-3', material_id: 'mat-ing-coconut-powder', amount: 112, unit: 'g' },
      { id: 'rd-4', material_id: 'mat-ing-beet-syrup', amount: 1347, unit: 'g' },
      { id: 'rd-5', material_id: 'mat-ing-vanilla-oil', amount: 22, unit: 'g' },
      { id: 'rd-6', material_id: 'mat-ing-water', amount: 1122, unit: 'g' },
      { id: 'rd-7', material_id: 'mat-ing-rice-flour', amount: 157, unit: 'g' },
      { id: 'rd-8', material_id: 'mat-ing-rice-oil', amount: 673, unit: 'g' },
      { id: 'rd-9', material_id: 'mat-ing-dragon-fruit-puree', amount: 1571, unit: 'g' },
      { id: 'rd-10', material_id: 'mat-ing-lemon-juice', amount: 360, unit: 'ml' },
    ],
    notes: '水と米粉でα化。米油は最後にブレンダー。ドラゴンフルーツピューレとレモン果汁(2回目)はパストライザー加熱後に投入',
  },

  // 6. ほうじ
  {
    id: 'recipe-hoji',
    name: '米粉アイス【ほうじ】',
    category: '米粉アイス',
    description: '香ばしい京都産ほうじ茶パウダーに濃縮甘酒ときび砂糖、白みそを合わせた和の絶品クラフト。',
    ...createDefaultConfigs(),
    ingredients: [
      { id: 'rh-1', material_id: 'mat-ing-soy-milk', amount: 2000, unit: 'ml' },
      { id: 'rh-2', material_id: 'mat-ing-amazake', amount: 2000, unit: 'g' },
      { id: 'rh-3', material_id: 'mat-ing-kibi-sugar', amount: 1000, unit: 'g' },
      { id: 'rh-4', material_id: 'mat-ing-soy-whip', amount: 400, unit: 'ml' },
      { id: 'rh-5', material_id: 'mat-ing-white-miso', amount: 100, unit: 'g' },
      { id: 'rh-6', material_id: 'mat-ing-vanilla-oil', amount: 20, unit: 'g' },
      { id: 'rh-7', material_id: 'mat-ing-rice-flour', amount: 100, unit: 'g' },
      { id: 'rh-8', material_id: 'mat-ing-hojicha-powder', amount: 160, unit: 'g' },
      { id: 'rh-9', material_id: 'mat-ing-rice-oil', amount: 620, unit: 'g' },
    ],
    notes: '甘酒1本に米粉でα化。68℃低温殺菌。のりと液を合わせる時にほうじ茶パウダーと米油もブレンダー',
  },

  // 7. ミックスベリー
  {
    id: 'recipe-mix-berry',
    name: '米粉アイス【ミックスベリー】',
    category: '米粉アイス',
    description: 'ストロベリーとフランボワーズ（木苺）のダブルベリーピューレが織りなす甘酸っぱい濃厚アイス。',
    ...createDefaultConfigs(),
    ingredients: [
      { id: 'rm-1', material_id: 'mat-ing-framboise-puree', amount: 300, unit: 'g' },
      { id: 'rm-2', material_id: 'mat-ing-beet-syrup', amount: 1950, unit: 'g' },
      { id: 'rm-3', material_id: 'mat-ing-coconut-cream', amount: 350, unit: 'g' },
      { id: 'rm-4', material_id: 'mat-ing-lemon-juice', amount: 320, unit: 'ml' },
      { id: 'rm-5', material_id: 'mat-ing-vanilla-oil', amount: 22, unit: 'g' },
      { id: 'rm-6', material_id: 'mat-ing-water', amount: 2180, unit: 'g' },
      { id: 'rm-7', material_id: 'mat-ing-rice-flour', amount: 150, unit: 'g' },
      { id: 'rm-8', material_id: 'mat-ing-rice-oil', amount: 430, unit: 'g' },
      { id: 'rm-9', material_id: 'mat-ing-strawberry-puree', amount: 1090, unit: 'g' },
    ],
    notes: '水1Lと米粉でα化。米油は最後にブレンダー。ストロベリーピューレとレモン果汁(2回目)はパストライザー加熱後に投入',
  },

  // 8. 抹茶
  {
    id: 'recipe-matcha',
    name: '米粉アイス【抹茶】',
    category: '米粉アイス',
    description: '京都宇治の石臼挽き有機抹茶にクロレラを合わせ、美しい緑と上品なほろ苦さを引き出した逸品。',
    ...createDefaultConfigs(),
    ingredients: [
      { id: 'rmt-1', material_id: 'mat-ing-soy-milk', amount: 2000, unit: 'ml' },
      { id: 'rmt-2', material_id: 'mat-ing-amazake', amount: 2000, unit: 'g' },
      { id: 'rmt-3', material_id: 'mat-ing-kibi-sugar', amount: 1000, unit: 'g' },
      { id: 'rmt-4', material_id: 'mat-ing-soy-whip', amount: 400, unit: 'ml' },
      { id: 'rmt-5', material_id: 'mat-ing-white-miso', amount: 100, unit: 'g' },
      { id: 'rmt-6', material_id: 'mat-ing-vanilla-oil', amount: 20, unit: 'g' },
      { id: 'rmt-7', material_id: 'mat-ing-rice-flour', amount: 100, unit: 'g' },
      { id: 'rmt-8', material_id: 'mat-ing-matcha-powder', amount: 140, unit: 'g' },
      { id: 'rmt-9', material_id: 'mat-ing-chlorella-powder', amount: 20, unit: 'g' },
      { id: 'rmt-10', material_id: 'mat-ing-rice-oil', amount: 620, unit: 'g' },
    ],
    notes: '甘酒1本に米粉でα化。68℃低温殺菌。のりと液を合わせる時に抹茶、クロレラ、米油もブレンダー',
  },

  // 9. もも
  {
    id: 'recipe-peach',
    name: '米粉アイス【もも】',
    category: '米粉アイス',
    description: '100%果汁「おいしすぎるもも」を使用した、みずみずしい桃のアロマ広がる極上フルーティーアイス。',
    ...createDefaultConfigs(),
    ingredients: [
      { id: 'rp-1', material_id: 'mat-ing-oishisugiru-peach', amount: 4000, unit: 'ml' },
      { id: 'rp-2', material_id: 'mat-ing-beet-syrup', amount: 1650, unit: 'g' },
      { id: 'rp-3', material_id: 'mat-ing-coconut-cream', amount: 500, unit: 'g' },
      { id: 'rp-4', material_id: 'mat-ing-lemon-juice', amount: 280, unit: 'ml' },
      { id: 'rp-5', material_id: 'mat-ing-vanilla-oil', amount: 11, unit: 'g' },
      { id: 'rp-6', material_id: 'mat-ing-rice-flour', amount: 167, unit: 'g' },
    ],
    notes: 'ジュース1本と米粉でα化、シロップ投入',
  },

  // 10. マンゴー
  {
    id: 'recipe-mango',
    name: '米粉アイス【マンゴー】',
    category: '米粉アイス',
    description: '濃厚なアップルマンゴーピューレにココナッツとレモンの酸味を加えた、リッチでコク深いマンゴーアイス。',
    ...createDefaultConfigs(),
    ingredients: [
      { id: 'rmg-1', material_id: 'mat-ing-mango-puree', amount: 3000, unit: 'g' },
      { id: 'rmg-2', material_id: 'mat-ing-water', amount: 1000, unit: 'g' },
      { id: 'rmg-3', material_id: 'mat-ing-beet-syrup', amount: 1720, unit: 'g' },
      { id: 'rmg-4', material_id: 'mat-ing-coconut-cream', amount: 660, unit: 'g' },
      { id: 'rmg-5', material_id: 'mat-ing-lemon-juice', amount: 310, unit: 'ml' },
      { id: 'rmg-6', material_id: 'mat-ing-vanilla-oil', amount: 11, unit: 'g' },
      { id: 'rmg-7', material_id: 'mat-ing-rice-flour', amount: 330, unit: 'g' },
    ],
    notes: '水と米粉でα化。マンゴーピューレ3000gと合わせブレンド',
  },
];

// ============================================================
// 一律販売価格設定 (カップ & バルク共通)
// ============================================================
export const DEFAULT_UNIFORM_PRICING: UniformPricingConfig = {
  cup_wholesale_price: 340,
  bulk_wholesale_price: 4320,
  cup_retail_price: 520,
  bulk_retail_price: 6000,
};

const STORAGE_KEY_UNIFORM_PRICING = 'soystories_uniform_pricing_v1';

export async function getUniformPricing(): Promise<UniformPricingConfig> {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_UNIFORM_PRICING);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.cup_wholesale_price === 'number') {
          return { ...DEFAULT_UNIFORM_PRICING, ...parsed };
        }
      } catch {
        // fallback
      }
    }
  }
  return { ...DEFAULT_UNIFORM_PRICING };
}

export async function saveUniformPricing(pricing: UniformPricingConfig): Promise<UniformPricingConfig> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_UNIFORM_PRICING, JSON.stringify(pricing));
  }
  const currentRecipes = await getRecipes();
  const updatedRecipes = currentRecipes.map(r => ({
    ...r,
    target_wholesale_price: pricing.cup_wholesale_price,
    target_retail_price: pricing.cup_retail_price,
    cup_config: {
      ...(r.cup_config || {}),
      package_type: 'cup' as const,
      unit_name: '個',
      target_quantity: r.cup_config?.target_quantity || r.target_quantity || 65,
      labor_cost: r.cup_config?.labor_cost ?? r.labor_cost ?? 3000,
      packagings: r.cup_config?.packagings || r.packagings || [...COMMON_CUP_PACKAGINGS],
      target_wholesale_price: pricing.cup_wholesale_price,
      target_retail_price: pricing.cup_retail_price,
    },
    bulk_config: {
      ...(r.bulk_config || {}),
      package_type: 'bulk' as const,
      unit_name: '本 (2L)',
      target_quantity: r.bulk_config?.target_quantity || 3,
      labor_cost: r.bulk_config?.labor_cost ?? 3600,
      packagings: r.bulk_config?.packagings || [...COMMON_BULK_PACKAGINGS],
      target_wholesale_price: pricing.bulk_wholesale_price,
      target_retail_price: pricing.bulk_retail_price,
    },
  }));
  inMemoryRecipes = updatedRecipes;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(updatedRecipes));
  }
  return pricing;
}

// ============================================================
// ローカルストレージ キー (v4: カップ100g基準 & バルク両対応)
// ============================================================
const STORAGE_KEY_MATERIALS = 'soystories_cost_materials_v4';
const STORAGE_KEY_RECIPES = 'soystories_cost_recipes_v4';

// メモリキャッシュ
let inMemoryMaterials: Material[] = [...INITIAL_MATERIALS];
let inMemoryRecipes: Recipe[] = [...INITIAL_RECIPES];

/**
 * 原価計算ロジック（カップ / バルク両対応・一律販売価格対応）
 */
export function calculateRecipeCost(
  recipe: Recipe,
  materials: Material[],
  packageType: PackageType = 'cup',
  uniformWholesalePrice?: number,
  uniformRetailPrice?: number
): RecipeCostBreakdown {
  const materialMap = new Map<string, Material>(materials.map(m => [m.id, m]));

  // 現在のパッケージ設定（cup または bulk）を取得
  const config: PackageConfig = packageType === 'bulk'
    ? (recipe.bulk_config || {
        package_type: 'bulk',
        unit_name: '本 (2L)',
        target_quantity: 3,
        labor_cost: 3600,
        target_wholesale_price: 4320,
        target_retail_price: 6000,
        packagings: [...COMMON_BULK_PACKAGINGS],
      })
    : (recipe.cup_config || {
        package_type: 'cup',
        unit_name: '個',
        target_quantity: recipe.target_quantity || 65,
        labor_cost: recipe.labor_cost ?? 3000,
        target_wholesale_price: recipe.target_wholesale_price ?? 340,
        target_retail_price: recipe.target_retail_price ?? 520,
        packagings: recipe.packagings || [...COMMON_CUP_PACKAGINGS],
      });

  const targetQty = config.target_quantity > 0 ? config.target_quantity : 1;

  // 1. 材料費の計算（原材料は共通）
  let totalIngredientCost = 0;
  let totalIngredientWeight = 0;
  const ingredientItems = recipe.ingredients.map(item => {
    const material = materialMap.get(item.material_id);
    const unitCost = material ? material.unit_cost : 0;
    const cost = item.amount * unitCost;
    totalIngredientCost += cost;
    totalIngredientWeight += Number(item.amount) || 0;

    return {
      material: material || {
        id: item.material_id,
        category: 'ingredient' as const,
        name: '未登録材料',
        package_unit_name: '1式',
        package_quantity: 1,
        unit_type: item.unit,
        package_price: 0,
        shipping_cost: 0,
        total_package_cost: 0,
        unit_cost: 0,
      },
      amount: item.amount,
      unit: item.unit,
      cost,
      cost_per_unit: cost / targetQty,
      ratio_in_ingredients: 0,
    };
  });

  ingredientItems.forEach(item => {
    item.ratio_in_ingredients = totalIngredientCost > 0 ? (item.cost / totalIngredientCost) * 100 : 0;
  });

  const unitIngredientCost = totalIngredientCost / targetQty;

  // 2. 資材費の計算（カップ用資材 or バルク用資材）
  let unitPackagingCost = 0;
  const packagingItems = (config.packagings || []).map(item => {
    const material = materialMap.get(item.material_id);
    const unitCost = material ? material.unit_cost : 0;
    const costPerUnit = item.quantity_per_unit * unitCost;
    const totalCost = costPerUnit * targetQty;
    unitPackagingCost += costPerUnit;

    return {
      material: material || {
        id: item.material_id,
        category: 'packaging' as const,
        name: '未登録資材',
        package_unit_name: '1個',
        package_quantity: 1,
        unit_type: 'piece' as const,
        package_price: 0,
        shipping_cost: 0,
        total_package_cost: 0,
        unit_cost: 0,
      },
      quantity_per_unit: item.quantity_per_unit,
      unit_cost: unitCost,
      cost_per_unit: costPerUnit,
      total_cost: totalCost,
    };
  });

  const totalPackagingCost = unitPackagingCost * targetQty;

  // 3. 人件費（直接入力）
  const totalLaborCost = config.labor_cost || 0;
  const unitLaborCost = totalLaborCost / targetQty;

  // 4. 製造原価合計
  const totalManufacturingCost = totalIngredientCost + totalPackagingCost + totalLaborCost;
  const unitManufacturingCost = unitIngredientCost + unitPackagingCost + unitLaborCost;

  // 5. 構成比率
  const ingredientRatio = totalManufacturingCost > 0 ? (totalIngredientCost / totalManufacturingCost) * 100 : 0;
  const packagingRatio = totalManufacturingCost > 0 ? (totalPackagingCost / totalManufacturingCost) * 100 : 0;
  const laborRatio = totalManufacturingCost > 0 ? (totalLaborCost / totalManufacturingCost) * 100 : 0;

  // 6. 卸・小売シミュレーション
  const wholesalePrice = uniformWholesalePrice !== undefined
    ? uniformWholesalePrice
    : (config.target_wholesale_price || 0);
  const wholesaleCostRatio = wholesalePrice > 0 ? (unitManufacturingCost / wholesalePrice) * 100 : 0;
  const wholesaleGrossMargin = wholesalePrice - unitManufacturingCost;
  const wholesaleMarginRatio = wholesalePrice > 0 ? (wholesaleGrossMargin / wholesalePrice) * 100 : 0;

  const retailPrice = uniformRetailPrice !== undefined
    ? uniformRetailPrice
    : (config.target_retail_price || 0);
  const retailCostRatio = retailPrice > 0 ? (unitManufacturingCost / retailPrice) * 100 : 0;
  const retailGrossMargin = retailPrice - unitManufacturingCost;
  const retailMarginRatio = retailPrice > 0 ? (retailGrossMargin / retailPrice) * 100 : 0;

  return {
    recipe,
    package_type: packageType,
    unit_name: config.unit_name || (packageType === 'bulk' ? '本 (2L)' : '個'),
    target_quantity: targetQty,
    ingredient_items: ingredientItems,
    total_ingredient_cost: totalIngredientCost,
    unit_ingredient_cost: unitIngredientCost,
    total_ingredient_weight: totalIngredientWeight,
    packaging_items: packagingItems,
    unit_packaging_cost: unitPackagingCost,
    total_packaging_cost: totalPackagingCost,
    total_labor_cost: totalLaborCost,
    unit_labor_cost: unitLaborCost,
    total_manufacturing_cost: totalManufacturingCost,
    unit_manufacturing_cost: unitManufacturingCost,
    ingredient_ratio: ingredientRatio,
    packaging_ratio: packagingRatio,
    labor_ratio: laborRatio,
    wholesale: {
      price: wholesalePrice,
      cost_ratio: wholesaleCostRatio,
      gross_margin: wholesaleGrossMargin,
      margin_ratio: wholesaleMarginRatio,
    },
    retail: {
      price: retailPrice,
      cost_ratio: retailCostRatio,
      gross_margin: retailGrossMargin,
      margin_ratio: retailMarginRatio,
    },
  };
}

// ============================================================
// 材料・資材マスター CRUD
// ============================================================

export async function getMaterials(): Promise<Material[]> {
  if (typeof window !== 'undefined') {
    let saved = localStorage.getItem(STORAGE_KEY_MATERIALS);
    if (!saved) {
      const oldV3 = localStorage.getItem('soystories_cost_materials_v3');
      if (oldV3) {
        try {
          const parsed = JSON.parse(oldV3);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const migrated = parsed.map((m: Material) => ({
              ...m,
              name: m.name.replace(/120ml/g, '100g'),
            }));
            localStorage.setItem(STORAGE_KEY_MATERIALS, JSON.stringify(migrated));
            saved = JSON.stringify(migrated);
          }
        } catch {
          // ignore
        }
      }
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryMaterials = parsed;
          return inMemoryMaterials;
        }
      } catch (e) {
        console.error('Failed to parse materials from localStorage', e);
      }
    }
  }

  // Supabase連携
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('cost_materials').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        inMemoryMaterials = data as Material[];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_MATERIALS, JSON.stringify(inMemoryMaterials));
        }
        return inMemoryMaterials;
      }
    } catch {
      // fallback
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MATERIALS, JSON.stringify(inMemoryMaterials));
  }
  return inMemoryMaterials;
}

export async function saveMaterial(material: Omit<Material, 'id' | 'total_package_cost' | 'unit_cost'> & { id?: string }): Promise<Material> {
  const totalCost = Number(material.package_price || 0) + Number(material.shipping_cost || 0);
  const qty = Number(material.package_quantity || 1) > 0 ? Number(material.package_quantity) : 1;
  const unitCost = Number((totalCost / qty).toFixed(4));

  const newOrUpdated: Material = {
    ...material,
    id: material.id || `mat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    package_price: Number(material.package_price),
    shipping_cost: Number(material.shipping_cost),
    package_quantity: qty,
    total_package_cost: totalCost,
    unit_cost: unitCost,
    updated_at: new Date().toISOString(),
  };

  const current = await getMaterials();
  const index = current.findIndex(m => m.id === newOrUpdated.id);
  let updatedList: Material[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = newOrUpdated;
  } else {
    newOrUpdated.created_at = new Date().toISOString();
    updatedList = [newOrUpdated, ...current];
  }

  inMemoryMaterials = updatedList;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MATERIALS, JSON.stringify(updatedList));
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('cost_materials').upsert([newOrUpdated]);
    } catch (e) {
      console.warn('Supabase material upsert error:', e);
    }
  }

  return newOrUpdated;
}

export async function deleteMaterial(id: string): Promise<boolean> {
  const current = await getMaterials();
  const updatedList = current.filter(m => m.id !== id);
  inMemoryMaterials = updatedList;

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MATERIALS, JSON.stringify(updatedList));
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('cost_materials').delete().eq('id', id);
    } catch {
      // ignore
    }
  }

  return true;
}

// ============================================================
// レシピ CRUD
// ============================================================

export async function getRecipes(): Promise<Recipe[]> {
  if (typeof window !== 'undefined') {
    let saved = localStorage.getItem(STORAGE_KEY_RECIPES);
    if (!saved) {
      const oldV3 = localStorage.getItem('soystories_cost_recipes_v3');
      if (oldV3) {
        try {
          const parsed = JSON.parse(oldV3);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(parsed));
            saved = JSON.stringify(parsed);
          }
        } catch {
          // ignore
        }
      }
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryRecipes = parsed;
          return inMemoryRecipes;
        }
      } catch (e) {
        console.error('Failed to parse recipes from localStorage', e);
      }
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('cost_recipes').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        inMemoryRecipes = data as Recipe[];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(inMemoryRecipes));
        }
        return inMemoryRecipes;
      }
    } catch {
      // fallback
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(inMemoryRecipes));
  }
  return inMemoryRecipes;
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const recipes = await getRecipes();
  return recipes.find(r => r.id === id) || null;
}

export async function saveRecipe(recipe: Partial<Recipe> & { name: string }): Promise<Recipe> {
  // Ensure cup_config and bulk_config exist
  const defaultCup = {
    package_type: 'cup' as PackageType,
    unit_name: '個',
    target_quantity: Number(recipe.cup_config?.target_quantity || recipe.target_quantity || 65),
    labor_cost: Number(recipe.cup_config?.labor_cost ?? recipe.labor_cost ?? 3000),
    target_wholesale_price: Number(recipe.cup_config?.target_wholesale_price ?? recipe.target_wholesale_price ?? 340),
    target_retail_price: Number(recipe.cup_config?.target_retail_price ?? recipe.target_retail_price ?? 520),
    packagings: recipe.cup_config?.packagings || recipe.packagings || [...COMMON_CUP_PACKAGINGS],
  };

  const defaultBulk = {
    package_type: 'bulk' as PackageType,
    unit_name: '本 (2L)',
    target_quantity: Number(recipe.bulk_config?.target_quantity || 3),
    labor_cost: Number(recipe.bulk_config?.labor_cost ?? 3600),
    target_wholesale_price: Number(recipe.bulk_config?.target_wholesale_price ?? 4320),
    target_retail_price: Number(recipe.bulk_config?.target_retail_price ?? 6000),
    packagings: recipe.bulk_config?.packagings || [...COMMON_BULK_PACKAGINGS],
  };

  const newOrUpdated: Recipe = {
    id: recipe.id || `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: recipe.name,
    category: recipe.category || '米粉アイス',
    description: recipe.description || '',
    ingredients: recipe.ingredients || [],
    cup_config: defaultCup,
    bulk_config: defaultBulk,
    // Flatten for backward compatibility
    target_quantity: defaultCup.target_quantity,
    labor_cost: defaultCup.labor_cost,
    target_wholesale_price: defaultCup.target_wholesale_price,
    target_retail_price: defaultCup.target_retail_price,
    packagings: defaultCup.packagings,
    notes: recipe.notes || '',
    updated_at: new Date().toISOString(),
  };

  const current = await getRecipes();
  const index = current.findIndex(r => r.id === newOrUpdated.id);
  let updatedList: Recipe[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = newOrUpdated;
  } else {
    newOrUpdated.created_at = new Date().toISOString();
    updatedList = [newOrUpdated, ...current];
  }

  inMemoryRecipes = updatedList;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(updatedList));
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('cost_recipes').upsert([newOrUpdated]);
    } catch (e) {
      console.warn('Supabase recipe upsert error:', e);
    }
  }

  return newOrUpdated;
}

export async function deleteRecipe(id: string): Promise<boolean> {
  const current = await getRecipes();
  const updatedList = current.filter(r => r.id !== id);
  inMemoryRecipes = updatedList;

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(updatedList));
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('cost_recipes').delete().eq('id', id);
    } catch {
      // ignore
    }
  }

  return true;
}

/**
 * リセット関数
 */
export async function resetToDefaultPreset(): Promise<void> {
  inMemoryMaterials = [...INITIAL_MATERIALS];
  inMemoryRecipes = [...INITIAL_RECIPES];
  if (typeof window !== 'undefined') {
    ['v1', 'v2', 'v3'].forEach(v => {
      localStorage.removeItem(`soystories_cost_materials_${v}`);
      localStorage.removeItem(`soystories_cost_recipes_${v}`);
    });
    localStorage.removeItem(STORAGE_KEY_UNIFORM_PRICING);
    localStorage.setItem(STORAGE_KEY_MATERIALS, JSON.stringify(INITIAL_MATERIALS));
    localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(INITIAL_RECIPES));
  }
}
