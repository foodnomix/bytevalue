import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Platform } from '../types'

interface ReportSummary {
  id: string
  platform: Platform
  month: number
  year: number
  period_type: string
  status: string
}

export function useReportList(restaurantId: string) {
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) return
    setLoading(true)

    supabase
      .from('reports')
      .select('id, platform, month, year, period_type, status')
      .eq('restaurant_id', restaurantId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .then(({ data }) => {
        setReports(data || [])
        setLoading(false)
      })
  }, [restaurantId])

  return { reports, loading }
}
