import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  MOCK_REPORTS, MOCK_PAYOUT, MOCK_PERFORMANCE, MOCK_TOP_ITEMS, MOCK_LEDGER
} from '../lib/mock'
import type { Report, PayoutPeriod, PerformancePeriod, TopItem, LedgerItem } from '../types'

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL

interface ReportData {
  report: Report | null
  payout: PayoutPeriod[]
  performance: PerformancePeriod[]
  topItems: TopItem[]
  ledger: LedgerItem[]
  loading: boolean
  error: string | null
}

export function useReport(restaurantId: string, platform: 'swiggy' | 'zomato' = 'swiggy'): ReportData {
  const [data, setData] = useState<ReportData>({
    report: null, payout: [], performance: [], topItems: [], ledger: [], loading: true, error: null,
  })

  useEffect(() => {
    if (!restaurantId) return
    setData(d => ({ ...d, loading: true, error: null }))

    if (USE_MOCK) {
      setTimeout(() => {
        const report = MOCK_REPORTS.find(r => r.restaurant_id === restaurantId && r.platform === platform) || null
        if (!report) {
          setData(d => ({ ...d, loading: false, report: null, payout: [], performance: [], topItems: [], ledger: [] }))
          return
        }
        setData({
          report,
          payout: MOCK_PAYOUT.filter(p => p.report_id === report.id).sort((a, b) => a.sort_order - b.sort_order),
          performance: MOCK_PERFORMANCE.filter(p => p.report_id === report.id).sort((a, b) => a.sort_order - b.sort_order),
          topItems: MOCK_TOP_ITEMS.filter(i => i.report_id === report.id),
          ledger: MOCK_LEDGER.filter(i => i.report_id === report.id).sort((a, b) => b.units_sold - a.units_sold),
          loading: false, error: null,
        })
      }, 600)
      return
    }

    async function fetchAll() {
      try {
        const { data: reports } = await supabase
          .from('reports')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('platform', platform)
          .order('year', { ascending: false })
          .order('month', { ascending: false })
          .limit(1)
          .single()

        if (!reports) throw new Error('No report found')

        const [{ data: payout }, { data: perf }, { data: items }, { data: ledger }] = await Promise.all([
          supabase.from('payout_periods').select('*').eq('report_id', reports.id).order('sort_order'),
          supabase.from('performance_periods').select('*').eq('report_id', reports.id).order('sort_order'),
          supabase.from('top_items').select('*').eq('report_id', reports.id).order('fortnight').order('rank'),
          supabase.from('item_ledger').select('*').eq('report_id', reports.id).order('units_sold', { ascending: false }),
        ])

        setData({
          report: reports,
          payout: payout || [],
          performance: perf || [],
          topItems: items || [],
          ledger: ledger || [],
          loading: false,
          error: null,
        })
      } catch (e: unknown) {
        setData(d => ({ ...d, loading: false, error: (e as Error).message }))
      }
    }

    fetchAll()
  }, [restaurantId, platform])

  return data
}
