import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Report, PayoutPeriod, PerformancePeriod, TopItem, LedgerItem } from '../types'

interface ReportData {
  report: Report | null
  payout: PayoutPeriod[]
  performance: PerformancePeriod[]
  topItems: TopItem[]
  ledger: LedgerItem[]
  loading: boolean
  error: string | null
}

export function useReport(
  restaurantId: string,
  platform: string,
  month?: number,
  year?: number,
): ReportData {
  const [data, setData] = useState<ReportData>({
    report: null, payout: [], performance: [], topItems: [], ledger: [], loading: true, error: null,
  })

  useEffect(() => {
    if (!restaurantId || !platform) return
    setData(d => ({ ...d, loading: true, error: null }))

    async function fetchAll() {
      try {
        let query = supabase
          .from('reports')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('platform', platform)

        if (month && year) {
          query = query.eq('month', month).eq('year', year)
        } else {
          query = query.order('year', { ascending: false }).order('month', { ascending: false })
        }

        const { data: report, error } = await query.limit(1).single()

        if (error || !report) {
          setData(d => ({ ...d, loading: false, report: null, payout: [], performance: [], topItems: [], ledger: [] }))
          return
        }

        const [{ data: payout }, { data: perf }, { data: items }, { data: ledger }] = await Promise.all([
          supabase.from('payout_periods').select('*').eq('report_id', report.id).order('sort_order'),
          supabase.from('performance_periods').select('*').eq('report_id', report.id).order('sort_order'),
          supabase.from('top_items').select('*').eq('report_id', report.id).order('fortnight').order('rank'),
          supabase.from('item_ledger').select('*').eq('report_id', report.id).order('units_sold', { ascending: false }),
        ])

        setData({
          report,
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
  }, [restaurantId, platform, month, year])

  return data
}
