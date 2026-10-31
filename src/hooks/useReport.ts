import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Report, PayoutPeriod, PerformancePeriod, TopItem, LedgerItem } from '../types'

interface PlatformData {
  report: Report
  payout: PayoutPeriod[]
  performance: PerformancePeriod[]
  topItems: TopItem[]
  ledger: LedgerItem[]
}

interface ReportData {
  platforms: Record<string, PlatformData>
  loading: boolean
  error: string | null
}

export function useReport(
  restaurantId: string,
  reportNo?: number,
): ReportData {
  const [data, setData] = useState<ReportData>({
    platforms: {}, loading: true, error: null,
  })

  useEffect(() => {
    if (!restaurantId) return
    setData(d => ({ ...d, loading: true, error: null }))

    async function fetchAll() {
      try {
        let query = supabase
          .from('reports')
          .select('*')
          .eq('restaurant_id', restaurantId)

        if (reportNo !== undefined) {
          query = query.eq('report_no', reportNo)
        } else {
          query = query.order('report_no', { ascending: false }).limit(2)
        }

        const { data: reports, error } = await query

        if (error || !reports || reports.length === 0) {
          setData({ platforms: {}, loading: false, error: null })
          return
        }

        const targetNo = reportNo ?? reports[0].report_no
        const matched = reports.filter((r: Report) => r.report_no === targetNo)

        const platforms: Record<string, PlatformData> = {}

        await Promise.all(matched.map(async (report: Report) => {
          const [{ data: payout }, { data: perf }, { data: items }, { data: ledger }] = await Promise.all([
            supabase.from('payout_periods').select('*').eq('report_id', report.id).order('sort_order'),
            supabase.from('performance_periods').select('*').eq('report_id', report.id).order('sort_order'),
            supabase.from('top_items').select('*').eq('report_id', report.id).order('rank'),
            supabase.from('item_ledger').select('*').eq('report_id', report.id).order('units_sold', { ascending: false }),
          ])

          platforms[report.platform] = {
            report,
            payout: payout || [],
            performance: perf || [],
            topItems: items || [],
            ledger: ledger || [],
          }
        }))

        setData({ platforms, loading: false, error: null })
      } catch (e: unknown) {
        setData(d => ({ ...d, loading: false, error: (e as Error).message }))
      }
    }

    fetchAll()
  }, [restaurantId, reportNo])

  return data
}
