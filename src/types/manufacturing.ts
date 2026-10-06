export type LotStatus = 'WIP' | 'QA_Passed' | 'Quarantined';

export interface QAChecklist {
  seal_verified: boolean;      // 内蓋（トップシール）物理的密閉・剥がれ・異物混入なし
  label_verified: boolean;     // 外観・法定表示（大豆アレルゲン等）確認
  lot_print_verified: boolean; // ロット番号・賞味期限印字の鮮明度確認
  temp_ccp_verified: boolean;  // HACCP重要管理点（CCP）-18℃以下急速凍結確認
  notes?: string;
}

export interface ManufacturingProduct {
  id: string;
  name: string;
  flavor: string;
  category: string;
  sku: string;
  shelf_life_days: number;
  unit: string;
}

export interface ManufacturingLot {
  lot_id: string;
  product_id: string;
  product_name: string;
  flavor: string;
  manufactured_date: string;
  expiration_date: string;
  operator_name: string;
  planned_quantity: number;
  actual_quantity: number;
  current_quantity: number;
  status: LotStatus;
  qa_inspector?: string;
  qa_inspected_at?: string;
  qa_checklist?: QAChecklist;
  quarantine_reason?: string;
  notes?: string;
  created_at: string;
}

export type InventoryTransactionType = 
  | 'MANUFACTURE_WIP'
  | 'QA_PASS_INITIAL'
  | 'SHIPMENT'
  | 'INVENTORY_ADJUSTMENT'
  | 'QUARANTINE_SCRAP'
  | 'RETURN';

export interface InventoryTransaction {
  id: string;
  lot_id: string;
  product_id: string;
  product_name: string;
  transaction_type: InventoryTransactionType;
  quantity_change: number;
  quantity_after: number;
  operator_name: string;
  reason: string;
  notes?: string;
  created_at: string;
}

export interface ShipmentItem {
  id: string;
  shipment_id: string;
  lot_id: string;
  product_id: string;
  product_name: string;
  flavor: string;
  quantity: number;
  is_fifo_violation: boolean;
  fifo_override_reason?: string;
}

export interface Shipment {
  id: string;
  destination_name: string;
  destination_address?: string;
  customer_id?: string;
  order_id?: string;
  shipment_date: string;
  delivery_date?: string;
  carrier: string;
  tracking_number?: string;
  status: 'draft' | 'shipped' | 'delivered' | 'cancelled';
  created_by: string;
  items: ShipmentItem[];
  notes?: string;
  created_at: string;
}
