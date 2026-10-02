// ============================================================
// レシピ原価管理 型定義 (カップ & 2Lバルク対応)
// ============================================================

export type MaterialCategory = 'ingredient' | 'packaging';
export type UnitType = 'g' | 'ml' | 'piece';
export type PackageType = 'cup' | 'bulk'; // 'cup' (個食カップ) | 'bulk' (業務用バルク)

/**
 * 材料・資材マスター
 */
export interface Material {
  id: string;
  category: MaterialCategory; // 'ingredient' (材料) | 'packaging' (資材)
  name: string;               // 品名（例: 国産無調整豆乳、100gカップ、2Lバルク容器）
  supplier?: string;          // 仕入れ先
  package_unit_name: string;  // 仕入れ単位名（例: 1袋、1缶、1箱、1ケース）
  package_quantity: number;   // 内容量・入数（例: 1000g, 1000ml, 500個）
  unit_type: UnitType;        // 単位種別 ('g' | 'ml' | 'piece')
  package_price: number;      // 1個単価（仕入れ単価・税込）
  shipping_cost: number;      // 送料（税込）
  total_package_cost: number; // 送料込み税込総額 = package_price + shipping_cost
  unit_cost: number;          // 1gあたり（または1ml、1個あたり）の送料込み税込単価
  notes?: string;             // 備考・規格情報
  is_provisional?: boolean;   // 暫定・未確定情報フラグ
  provisional_notes?: string; // 暫定理由・未確定メモ（例: 見積もり待ち、概算仮単価等）
  created_at?: string;
  updated_at?: string;
}

/**
 * レシピに含まれる材料配合 (共通)
 */
export interface RecipeIngredient {
  id: string;
  material_id: string;
  amount: number;       // 使用量（gまたはml）
  unit: 'g' | 'ml';     // 単位
}

/**
 * 資材配合（1製品あたり何個使うか）
 */
export interface RecipePackaging {
  id: string;
  material_id: string;
  quantity_per_unit: number; // 1製品あたりの使用個数（例: 1個、1枚）
}

/**
 * 形態別（カップ / バルク）製造設定
 */
export interface PackageConfig {
  package_type: PackageType;      // 'cup' | 'bulk'
  unit_name: string;              // 表示単位名 ('個' | '本 (2L)')
  target_quantity: number;        // 仕上がり総定数 (カップ: 65個 / バルク: 3本)
  labor_cost: number;             // 1仕込み人件費 (カップ: 3,000円 / バルク: 3,600円)
  target_wholesale_price: number; // 想定卸売価格 (税込)
  target_retail_price: number;    // 想定小売価格 (税込)
  packagings: RecipePackaging[];  // 使用資材リスト
}

/**
 * レシピ情報 (カップ＆バルク両対応)
 */
export interface Recipe {
  id: string;
  name: string;                   // レシピ・フレーバー名
  category?: string;              // カテゴリ（例: 米粉アイス）
  description?: string;           // 商品説明・特徴
  ingredients: RecipeIngredient[];// 材料配合リスト（カップ・バルク共通）
  
  // 形態別設定
  cup_config: PackageConfig;
  bulk_config: PackageConfig;

  // 互換用フラットプロパティ (カップ準拠)
  target_quantity?: number;
  labor_cost?: number;
  target_retail_price?: number;
  target_wholesale_price?: number;
  packagings?: RecipePackaging[];

  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 原価計算結果詳細
 */
export interface RecipeCostBreakdown {
  recipe: Recipe;
  package_type: PackageType;
  unit_name: string;              // '個' または '本 (2L)'
  target_quantity: number;

  // 材料費
  ingredient_items: Array<{
    material: Material;
    amount: number;
    unit: 'g' | 'ml';
    cost: number;
    cost_per_unit: number;        // 1個/1本あたり材料費
    ratio_in_ingredients: number; // 材料費内比率(%)
  }>;
  total_ingredient_cost: number;  // 1仕込み材料費合計
  unit_ingredient_cost: number;   // 1個/1本あたり材料費
  total_ingredient_weight?: number; // 1仕込み材料総重量 (gまたはml)

  // 資材費
  packaging_items: Array<{
    material: Material;
    quantity_per_unit: number;
    unit_cost: number;
    cost_per_unit: number;        // 1個/1本あたり資材費
    total_cost: number;           // 1仕込み資材費合計
  }>;
  unit_packaging_cost: number;    // 1個/1本あたり資材費合計
  total_packaging_cost: number;   // 1仕込み資材費合計

  // 人件費
  total_labor_cost: number;       // 1仕込み人件費
  unit_labor_cost: number;        // 1個/1本あたり人件費

  // 製造原価合計
  total_manufacturing_cost: number; // 1仕込み総製造原価 (材料 + 資材 + 人件費)
  unit_manufacturing_cost: number;  // 1個/1本あたり製造原価

  // 各要素の構成比率 (%)
  ingredient_ratio: number;
  packaging_ratio: number;
  labor_ratio: number;

  // 価格・粗利シミュレーション
  wholesale: {
    price: number;
    cost_ratio: number;           // 原価率 (%)
    gross_margin: number;         // 粗利額 (円)
    margin_ratio: number;         // 粗利率 (%)
  };
  retail: {
    price: number;
    cost_ratio: number;           // 原価率 (%)
    gross_margin: number;         // 粗利額 (円)
    margin_ratio: number;         // 粗利率 (%)
  };
}

/**
 * 一律販売価格設定 (カップ & バルク共通)
 */
export interface UniformPricingConfig {
  cup_wholesale_price: number;   // カップ想定卸売価格 (一律)
  bulk_wholesale_price: number;  // バルク想定卸売価格 (一律)
  cup_retail_price: number;      // カップ想定小売価格 (一律)
  bulk_retail_price: number;     // バルク想定小売価格 (一律)
}

