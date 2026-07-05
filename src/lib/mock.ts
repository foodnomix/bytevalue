import type { Restaurant, Report, PayoutPeriod, PerformancePeriod, TopItem, LedgerItem } from '../types'

export const MOCK_RESTAURANTS: Restaurant[] = [
  { id: '1', code: 'MIL1980HYD', name: "1980s Military Hotel", location: 'Gachibowli', city: 'Hyderabad' },
  { id: '2', code: 'SPICEGDN01', name: "Spice Garden", location: 'Banjara Hills', city: 'Hyderabad' },
  { id: '3', code: 'BIRYHOUSE1', name: "Biryani House", location: 'Madhapur', city: 'Hyderabad' },
]

export const MOCK_REPORTS: Report[] = [
  { id: 'r1', restaurant_id: '1', platform: 'swiggy', month: 5, year: 2026, date_from: '2026-05-01', date_to: '2026-05-31' },
]

export const MOCK_PAYOUT: PayoutPeriod[] = [
  { id: 'pp0', report_id: 'r1', period_label: 'Overall', sort_order: 0, customer_paid: 567558, platform_fee: 179126, platform_fee_pct: 31.6, govt_tax: 27467, govt_tax_pct: 4.8, ads_spend: 31197, ads_spend_pct: 5.5, net_payout: 325940, net_payout_pct: 57.4 },
  { id: 'pp1', report_id: 'r1', period_label: '01 May – 09 May', sort_order: 1, customer_paid: 156192, platform_fee: 49137, platform_fee_pct: 31.5, govt_tax: 7568, govt_tax_pct: 4.8, ads_spend: 8754, ads_spend_pct: 5.6, net_payout: 89300, net_payout_pct: 57.2 },
  { id: 'pp2', report_id: 'r1', period_label: '10 May – 16 May', sort_order: 2, customer_paid: 124476, platform_fee: 40217, platform_fee_pct: 32.3, govt_tax: 6046, govt_tax_pct: 4.9, ads_spend: 5507, ads_spend_pct: 4.4, net_payout: 72105, net_payout_pct: 57.9 },
  { id: 'pp3', report_id: 'r1', period_label: '17 May – 23 May', sort_order: 3, customer_paid: 128539, platform_fee: 39739, platform_fee_pct: 30.9, govt_tax: 6161, govt_tax_pct: 4.8, ads_spend: 5404, ads_spend_pct: 4.2, net_payout: 75443, net_payout_pct: 58.7 },
  { id: 'pp4', report_id: 'r1', period_label: '24 May – 31 May', sort_order: 4, customer_paid: 158351, platform_fee: 50033, platform_fee_pct: 31.6, govt_tax: 7691, govt_tax_pct: 4.9, ads_spend: 11532, ads_spend_pct: 7.3, net_payout: 89093, net_payout_pct: 56.3 },
]

export const MOCK_PERFORMANCE: PerformancePeriod[] = [
  { id: 'perf0', report_id: 'r1', period_label: 'Overall', sort_order: 0, total_orders: 544, delivered: 533, cancelled: 11, gross_subtotal: 535103, discounts: 20, packaging: 5475, cust_gst: 27000, aov: 1064.84 },
  { id: 'perf1', report_id: 'r1', period_label: '01 May – 09 May', sort_order: 1, total_orders: 149, delivered: 146, cancelled: 3, gross_subtotal: 147284, discounts: 0, packaging: 1500, cust_gst: 7408, aov: 1069.81 },
  { id: 'perf2', report_id: 'r1', period_label: '10 May – 16 May', sort_order: 2, total_orders: 118, delivered: 114, cancelled: 4, gross_subtotal: 117378, discounts: 0, packaging: 1170, cust_gst: 5928, aov: 1091.90 },
  { id: 'perf3', report_id: 'r1', period_label: '17 May – 23 May', sort_order: 3, total_orders: 121, delivered: 117, cancelled: 4, gross_subtotal: 121232, discounts: 20, packaging: 1205, cust_gst: 6122, aov: 1098.62 },
  { id: 'perf4', report_id: 'r1', period_label: '24 May – 31 May', sort_order: 4, total_orders: 156, delivered: 156, cancelled: 0, gross_subtotal: 149209, discounts: 0, packaging: 1600, cust_gst: 7542, aov: 1015.07 },
]

export const MOCK_TOP_ITEMS: TopItem[] = [
  { id: 't1', report_id: 'r1', fortnight: 1, rank: 1, item_name: 'Chicken Fry Piece Biryani Regular', units: 51 },
  { id: 't2', report_id: 'r1', fortnight: 1, rank: 2, item_name: '1980S Chitti Muthyalu Special Chicken Pulao', units: 39 },
  { id: 't3', report_id: 'r1', fortnight: 1, rank: 3, item_name: '1980S Chitti Muthyalu Special Mutton Pulao Regular', units: 39 },
  { id: 't4', report_id: 'r1', fortnight: 1, rank: 4, item_name: 'Chicken Fry', units: 30 },
  { id: 't5', report_id: 'r1', fortnight: 1, rank: 5, item_name: 'Special Chicken Biryani Regular', units: 21 },
  { id: 't6', report_id: 'r1', fortnight: 2, rank: 1, item_name: '1980S Chitti Muthyalu Special Chicken Pulao', units: 50 },
  { id: 't7', report_id: 'r1', fortnight: 2, rank: 2, item_name: '1980S Chitti Muthyalu Special Mutton Pulao Regular', units: 46 },
  { id: 't8', report_id: 'r1', fortnight: 2, rank: 3, item_name: 'Chicken Fry Piece Biryani Regular', units: 33 },
  { id: 't9', report_id: 'r1', fortnight: 2, rank: 4, item_name: 'Benguluru Chicken 65', units: 28 },
  { id: 't10', report_id: 'r1', fortnight: 2, rank: 5, item_name: '1980Ss Special Crispy Chicken', units: 23 },
]

export const MOCK_LEDGER: LedgerItem[] = [
  { id: 'l1', report_id: 'r1', item_name: '1980S Chitti Muthyalu Special Chicken Pulao', units_sold: 89, net_per_unit: 511.76, total_net_payout: 45546.51, margin_pct: 67 },
  { id: 'l2', report_id: 'r1', item_name: '1980S Chitti Muthyalu Special Mutton Pulao Regular', units_sold: 85, net_per_unit: 599.43, total_net_payout: 50951.28, margin_pct: 67 },
  { id: 'l3', report_id: 'r1', item_name: 'Chicken Fry Piece Biryani Regular', units_sold: 84, net_per_unit: 458.27, total_net_payout: 38494.57, margin_pct: 57 },
  { id: 'l4', report_id: 'r1', item_name: 'Chicken Fry', units_sold: 45, net_per_unit: 405.22, total_net_payout: 18234.71, margin_pct: 68 },
  { id: 'l5', report_id: 'r1', item_name: 'Benguluru Chicken 65', units_sold: 44, net_per_unit: 371.86, total_net_payout: 16361.78, margin_pct: 68 },
  { id: 'l6', report_id: 'r1', item_name: 'Chitti Prawn Roast', units_sold: 36, net_per_unit: 424.59, total_net_payout: 15285.32, margin_pct: 68 },
  { id: 'l7', report_id: 'r1', item_name: 'Special Chicken Biryani Regular', units_sold: 35, net_per_unit: 435.30, total_net_payout: 15235.49, margin_pct: 57 },
  { id: 'l8', report_id: 'r1', item_name: '1980Ss Special Crispy Chicken', units_sold: 35, net_per_unit: 367.77, total_net_payout: 12871.80, margin_pct: 66 },
  { id: 'l9', report_id: 'r1', item_name: 'Mutton Ghee Roast', units_sold: 32, net_per_unit: 444.09, total_net_payout: 14210.77, margin_pct: 67 },
  { id: 'l10', report_id: 'r1', item_name: 'Chicken Curry', units_sold: 30, net_per_unit: 370.94, total_net_payout: 11128.18, margin_pct: 68 },
  { id: 'l11', report_id: 'r1', item_name: 'Pepper Chicken Leg Pieces', units_sold: 28, net_per_unit: 376.19, total_net_payout: 10533.22, margin_pct: 67 },
  { id: 'l12', report_id: 'r1', item_name: 'Ragi Mudde', units_sold: 27, net_per_unit: 113.39, total_net_payout: 3061.51, margin_pct: 67 },
  { id: 'l13', report_id: 'r1', item_name: 'Gutti Vankaya Pulao', units_sold: 22, net_per_unit: 341.13, total_net_payout: 7504.91, margin_pct: 67 },
  { id: 'l14', report_id: 'r1', item_name: 'Karivepaku Chicken Liver Fry', units_sold: 16, net_per_unit: 262.69, total_net_payout: 4202.99, margin_pct: 63 },
  { id: 'l15', report_id: 'r1', item_name: 'Mixed Nonveg Biryani Regular Pack', units_sold: 14, net_per_unit: 526.48, total_net_payout: 7370.78, margin_pct: 58 },
  { id: 'l16', report_id: 'r1', item_name: 'Mushroom Pulao', units_sold: 14, net_per_unit: 340.71, total_net_payout: 4769.89, margin_pct: 53 },
  { id: 'l17', report_id: 'r1', item_name: 'Mutton Fry Piece Biryani Regular', units_sold: 13, net_per_unit: 604.74, total_net_payout: 7861.68, margin_pct: 67 },
  { id: 'l18', report_id: 'r1', item_name: 'Kamsu Pitta Roast (Quail)', units_sold: 13, net_per_unit: 376.54, total_net_payout: 4894.98, margin_pct: 67 },
  { id: 'l19', report_id: 'r1', item_name: 'Chicken Mogalai Biryani', units_sold: 13, net_per_unit: 369.02, total_net_payout: 4797.25, margin_pct: 58 },
  { id: 'l20', report_id: 'r1', item_name: 'Pepper Chicken (Bone Less)', units_sold: 12, net_per_unit: 372.59, total_net_payout: 4471.06, margin_pct: 68 },
  { id: 'l21', report_id: 'r1', item_name: 'Kunda Junnu', units_sold: 12, net_per_unit: 105.83, total_net_payout: 1269.91, margin_pct: 67 },
  { id: 'l22', report_id: 'r1', item_name: 'White Rice', units_sold: 12, net_per_unit: 92.78, total_net_payout: 1113.36, margin_pct: 62 },
  { id: 'l23', report_id: 'r1', item_name: 'Chicken Kaju Pakodi', units_sold: 11, net_per_unit: 377.03, total_net_payout: 4147.34, margin_pct: 67 },
  { id: 'l24', report_id: 'r1', item_name: 'Mutton Fry', units_sold: 10, net_per_unit: 446.17, total_net_payout: 4461.75, margin_pct: 68 },
  { id: 'l25', report_id: 'r1', item_name: 'Ghee Kaju Pulao Paneer Masala', units_sold: 10, net_per_unit: 401.32, total_net_payout: 4013.18, margin_pct: 68 },
  { id: 'l26', report_id: 'r1', item_name: 'Mutton Curry', units_sold: 9, net_per_unit: 441.80, total_net_payout: 3976.21, margin_pct: 67 },
  { id: 'l27', report_id: 'r1', item_name: 'Sambar Rice', units_sold: 9, net_per_unit: 203.49, total_net_payout: 1831.42, margin_pct: 67 },
  { id: 'l28', report_id: 'r1', item_name: 'Chicken Popcorn', units_sold: 8, net_per_unit: 276.14, total_net_payout: 2209.16, margin_pct: 60 },
  { id: 'l29', report_id: 'r1', item_name: 'Prawn Fry Biryani Regular', units_sold: 7, net_per_unit: 613.54, total_net_payout: 4294.75, margin_pct: 68 },
  { id: 'l30', report_id: 'r1', item_name: 'Chicken Fried Rice', units_sold: 7, net_per_unit: 376.40, total_net_payout: 2634.77, margin_pct: 59 },
]
