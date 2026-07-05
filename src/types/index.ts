export type Platform = 'swiggy' | 'zomato'

export interface Restaurant {
  id: string
  code: string
  name: string
  location: string
  city: string
  created_at?: string
}

export interface Report {
  id: string
  restaurant_id: string
  platform: Platform
  month: number
  year: number
  date_from: string
  date_to: string
  created_at?: string
}

export interface PayoutPeriod {
  id: string
  report_id: string
  period_label: string
  sort_order: number
  customer_paid: number
  platform_fee: number
  platform_fee_pct: number
  govt_tax: number
  govt_tax_pct: number
  ads_spend: number
  ads_spend_pct: number
  net_payout: number
  net_payout_pct: number
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
  fortnight: 1 | 2
  rank: number
  item_name: string
  units: number
}

export interface LedgerItem {
  id: string
  report_id: string
  item_name: string
  units_sold: number
  net_per_unit: number
  total_net_payout: number
  margin_pct: number
}
