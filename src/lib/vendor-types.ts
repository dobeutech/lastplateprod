// Vendor and Inventory Management Types

export interface Vendor {
  id: string;
  name: string;
  vendor_type: string;
  contact_info: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  } | null;
  payment_terms: string | null;
  delivery_schedule: Record<string, unknown> | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  vendor_id: string;
  location_id: string;
  order_date: string;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  status: 'pending' | 'approved' | 'received' | 'cancelled';
  total_amount: number | null;
  invoice_number: string | null;
  created_by: string;
  received_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  inventory_item_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  total_price: number | null;
  received_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  restaurant_id: string;
  item_name: string;
  category: string;
  unit_of_measure: string;
  par_level: number | null;
  reorder_point: number | null;
  storage_location: string | null;
  sku: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  location_id: string;
  inventory_item_id: string;
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'waste';
  quantity: number;
  unit_cost: number | null;
  transaction_date: string;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface CommunityPricing {
  id: string;
  inventory_item_name: string;
  item_category: string;
  vendor_name: string | null;
  unit_price: number;
  unit_of_measure: string;
  quantity: number;
  purchase_date: string;
  region: string;
  restaurant_segment: string;
  submitted_at: string;
}

export interface PriceAlert {
  id: string;
  location_id: string;
  inventory_item_id: string;
  vendor_id: string;
  previous_price: number;
  new_price: number;
  variance_percentage: number | null;
  alert_sent_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface AlertPreference {
  id: string;
  user_id: string;
  alert_type: string;
  sms_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  phone_number: string | null;
  threshold_values: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DataImport {
  id: string;
  location_id: string | null;
  import_type: string;
  source_system: string | null;
  data_type: string;
  file_name: string | null;
  rows_imported: number;
  rows_failed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_log: Record<string, unknown> | null;
  imported_by: string;
  imported_at: string;
  completed_at: string | null;
}

// View types
export interface VendorPerformance {
  vendor_id: string;
  vendor_name: string;
  vendor_type: string;
  location_id: string;
  location_name: string;
  total_orders: number;
  total_spend: number;
  avg_order_value: number;
  on_time_deliveries: number;
  completed_deliveries: number;
  on_time_percentage: number;
  last_order_date: string;
  days_since_last_order: number;
}

export interface InventoryLevel {
  inventory_item_id: string;
  restaurant_id: string;
  item_name: string;
  category: string;
  unit_of_measure: string;
  par_level: number | null;
  reorder_point: number | null;
  storage_location: string | null;
  current_quantity: number;
  quantity_needed: number | null;
  stock_status: 'OK' | 'Low' | 'Critical' | 'Out of Stock';
  last_transaction_date: string | null;
}

export interface OrderVsSoldAnalysis {
  inventory_item_id: string;
  item_name: string;
  category: string;
  unit_of_measure: string;
  location_id: string;
  location_name: string;
  week: string;
  quantity_purchased: number;
  quantity_sold: number;
  variance: number;
  variance_percentage: number;
  order_status: 'efficient' | 'minor_waste' | 'significant_waste';
}

export interface SpendByDayOfWeek {
  location_id: string;
  location_name: string;
  restaurant_id: string;
  day_of_week_num: number;
  day_of_week_name: string;
  month: string;
  order_count: number;
  total_spend: number;
  avg_order_value: number;
  spend_stddev: number;
}

export interface CommunityPricingBenchmark {
  inventory_item_name: string;
  item_category: string;
  region: string;
  restaurant_segment: string;
  unit_of_measure: string;
  month: string;
  sample_size: number;
  price_p25: number;
  median_price: number;
  avg_price: number;
  price_p75: number;
  min_price: number;
  max_price: number;
  price_stddev: number;
}
