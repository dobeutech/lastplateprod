export interface WasteLog {
  id: string;
  location_id: string;
  logged_by: string;
  timestamp: string;
  waste_category: string;
  food_item: string;
  quantity: number;
  unit: string;
  estimated_cost: number | null;
  photo_url: string | null;
  root_cause: string | null;
  notes: string | null;
  created_at: string;
}

export interface Location {
  id: string;
  restaurant_id: string;
  location_name: string;
  address: string | null;
  manager_contact: Record<string, unknown> | null;
  monthly_target_waste_percentage: number | null;
  created_at: string;
  updated_at: string;
}

export interface WasteCategory {
  id: string;
  name: string;
  description: string | null;
  color_code: string | null;
  created_at: string;
}

export interface User {
  id: string;
  role: 'operator' | 'manager' | 'admin';
  location_id: string | null;
  restaurant_id: string | null;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface ESGReport {
  id: string;
  restaurant_id: string;
  report_period: string;
  total_waste_reduction_percentage: number | null;
  carbon_impact_kg: number | null;
  report_data: Record<string, unknown> | null;
  generated_at: string;
}

export interface Benchmark {
  id: string;
  location_id: string;
  period_start: string;
  period_end: string;
  total_waste_lbs: number | null;
  total_waste_cost: number | null;
  waste_percentage_of_sales: number | null;
  top_wasted_items: Record<string, unknown> | null;
  created_at: string;
}

export const WASTE_CATEGORIES = [
  'Prep Waste',
  'Spoilage',
  'Plate Waste',
  'Other'
] as const;

export const ROOT_CAUSES = [
  'Over-ordering',
  'Poor storage',
  'Over-portioning',
  'Quality issues',
  'Customer returns',
  'Preparation errors',
  'Equipment failure',
  'Staff training',
  'Other'
] as const;

export const UNITS = [
  'lbs',
  'kg',
  'items',
  'oz',
  'g'
] as const;

export type WasteCategoryType = typeof WASTE_CATEGORIES[number];
export type RootCauseType = typeof ROOT_CAUSES[number];
export type UnitType = typeof UNITS[number];
