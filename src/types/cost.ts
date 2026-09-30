// ============================================================
// レシピ原価管理 型定義
// ============================================================

export type MaterialCategory = 'ingredient' | 'packaging';
export type UnitType = 'g' | 'ml' | 'piece';

/**
 * 材料・資材マスター
 */
export interface Material {
  id: string;
  category: MaterialCategory; // 'ingredient' (材料) | 'packaging' (資材)
  name: string;               // 品名（例: 有機無調整豆乳、120mlカップ）
  supplier?: string;          // 仕入れ先（例: マルサンアイ、東罐興業）
  package_unit_name: string;  // 仕入れ単位名（例: 1袋、1缶、1箱、1ケース）
  package_quantity: number;   // 内容量・入数（例: 1000g, 1000ml, 500個）
  unit_type: UnitType;        // 単位種別 ('g' | 'ml' | 'piece')
  package_price: number;      // 1個単価（仕入れ単価・税込）
  shipping_cost: number;      // 送料（税込）
  total_package_cost: number; // 送料込み税込総額 = package_price + shipping_cost
  unit_cost: number;          // 1gあたり（または1ml、1個あたり）の送料込み税込単価
  notes?: string;             // 備考・規格情報
  created_at?: string;
  updated_at?: string;
}

/**
 * レシピに含まれる材料配合
 */
export interface RecipeIngredient {
  id: string;
  material_id: string;
  amount: number;       // 使用量（gまたはml）
  unit: 'g' | 'ml';     // 単位
}

/**
 * レシピに含まれる資材配合（1製品あたり何個使うか）
 */
export interface RecipePackaging {
  id: string;
  material_id: string;
  quantity_per_unit: number; // 1製品あたりの使用個数（例: 1個、1枚）
}

/**
 * レシピ情報
 */
export interface Recipe {
  id: string;
  name: string;               // レシピ・商品名
  category?: string;          // カテゴリ（例: クラフトアイス、ソルベ、限定品）
  description?: string;       // 商品説明・特徴
  target_quantity: number;    // 仕上がり総定数（1バッチの製造個数、例: 60個）
  labor_cost: number;         // 1仕込みあたりの人件費（直接入力、例: 3,000円）
  target_retail_price: number;    // 想定小売価格（税込、例: 480円）
  target_wholesale_price: number; // 想定卸価格（税込、例: 320円）
  ingredients: RecipeIngredient[];// 材料配合リスト
  packagings: RecipePackaging[];  // 資材配合リスト
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 原価計算結果詳細
 */
export interface RecipeCostBreakdown {
  recipe: Recipe;
  // 材料費
  ingredient_items: Array<{
    material: Material;
    amount: number;
    unit: 'g' | 'ml';
    cost: number;
    cost_per_unit: number; // 1個あたり材料費への寄与
    ratio_in_ingredients: number; // 材料費内比率(%)
  }>;
  total_ingredient_cost: number;  // 1仕込み材料費合計
  unit_ingredient_cost: number;   // 1個あたり材料費

  // 資材費
  packaging_items: Array<{
    material: Material;
    quantity_per_unit: number;
    unit_cost: number;
    cost_per_unit: number;        // 1個あたり資材費
    total_cost: number;           // 1仕込み資材費合計
  }>;
  unit_packaging_cost: number;    // 1個あたり資材費合計
  total_packaging_cost: number;   // 1仕込み資材費合計

  // 人件費
  total_labor_cost: number;       // 1仕込み人件費
  unit_labor_cost: number;        // 1個あたり人件費

  // 製造原価合計
  total_manufacturing_cost: number; // 1仕込み総製造原価 (材料 + 資材 + 人件費)
  unit_manufacturing_cost: number;  // 1個あたり製造原価

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
