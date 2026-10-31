import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Platform } from '../types'

interface PlatformDates {
  id: string
  platform: Platform
  period_start_date: string | null
  period_end_date: string | null
  is_full_month: boolean | null
}

export interface ReportGroup {
  report_no: number
  platforms: PlatformDates[]
  created_at: string | null
}

export function useReportList(restaurantId: string) {
  const [reports, setReports] = useState<ReportGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) return
    setLoading(true)

    supabase
      .from('reports')
      .select('id, report_no, platform, period_start_date, period_end_date, is_full_month, created_at')
      .eq('restaurant_id', restaurantId)
      .order('report_no', { ascending: false })
      .order('platform')
      .then(({ data }) => {
        const grouped = new Map<number, ReportGroup>()
        for (const row of data || []) {
          const existing = grouped.get(row.report_no)
          const platEntry: PlatformDates = {
            id: row.id,
            platform: row.platform,
            period_start_date: row.period_start_date,
            period_end_date: row.period_end_date,
            is_full_month: row.is_full_month,
          }
          if (existing) {
            existing.platforms.push(platEntry)
          } else {
            grouped.set(row.report_no, {
              report_no: row.report_no,
              platforms: [platEntry],
              created_at: row.created_at,
            })
          }
        }
        setReports(Array.from(grouped.values()))
        setLoading(false)
      })
  }, [restaurantId])

  return { reports, loading }
}
