export type Platform = 'swiggy' | 'zomato'

export interface Restaurant {
  id: string
  name: string
  email: string
  phone: string
  phone2: string | null
  pin_hash2: string | null
  city: string | null
  state: string | null
  platform_ids: Record<string, string>
  tags: string[]
  onboarding_date: string | null
  months_paid: number
  status: 'active' | 'paused' | 'expired'
  created_at?: string
  updated_at?: string
}

export interface Report {
  id: string
  restaurant_id: string
  platform: Platform
  report_no: number
  month: number
  year: number
  period_start_date: string | null
  period_end_date: string | null
  is_full_month: boolean | null
  source_folder?: string | null
  status: 'generated' | 'draft' | 'error'
  created_at?: string
  updated_at?: string
}

export interface PayoutPeriod {
  id: string
  report_id: string
  period_label: string
  sort_order: number
  net_sales: number
  customer_paid: number
  platform_fee: number
  platform_fee_pct: number
  govt_tax: number
  govt_tax_pct: number
  ads_spend: number
  ads_spend_pct: number
  net_payout: number
  net_payout_pct: number
  retained_pct: number
  complaints: number
  commissionable_value?: number | null
  base_fee?: number | null
  base_fee_pct?: number | null
  payment_fee?: number | null
  payment_fee_pct?: number | null
  platform_gst?: number | null
  tds?: number | null
  platform_take?: number | null
  platform_take_pct?: number | null
  other_deductions?: number | null
  refunds?: number | null
}

export interface PerformancePeriod {
  id: string
  report_id: string
  period_label: string
  sort_order: number
  total_orders: number
  delivered: number
  cancelled: number
  gross_subtotal: number
  discounts: number
  packaging: number
  cust_gst: number
  aov: number
}

export interface TopItem {
  id: string
  report_id: string
  period_identifier: string | null
  fortnight: number | null
  rank: number
  item_name: string
  units: number
  revenue: number | null
  revenue_percentage: number | null
}

export interface LedgerItem {
  id: string
  report_id: string
  item_name: string
  units_sold: number
  original_price: number | null
  net_per_unit: number | null
  total_net_payout: number | null
  margin_pct: number | null
  discount_pct: number | null
}

export interface Admin {
  id: string
  email: string
  name: string
  role: 'developer' | 'super_admin' | 'view_only'
  tags: string[]
  status: 'active' | 'inactive'
  created_by: string | null
  created_at: string
  last_login_at: string | null
}

export interface ActivityLogEntry {
  id: string
  admin_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  details: string | null
  ip_address: string | null
  created_at: string
}
