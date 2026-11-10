import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const limit = Math.min(Number(req.query.limit) || 100, 500)
    const offset = Number(req.query.offset) || 0

    const [logRes, reportRes, restRes] = await Promise.all([
      supabase
        .from('activity_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from('reports')
        .select('id, restaurant_id, platform, month, year, report_no, status, created_at')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('restaurants')
        .select('id, name'),
    ])

    if (logRes.error) return res.status(500).json({ error: 'Failed to fetch activity log', details: logRes.error.message })

    const restMap: Record<string, string> = {}
    for (const r of (restRes.data || [])) {
      restMap[r.id] = r.name
    }

    const reportLogs = (reportRes.data || []).map(r => ({
      id: `report-${r.id}`,
      admin_id: null,
      action: 'generate_report',
      entity_type: 'report',
      entity_id: r.id,
      details: JSON.stringify({
        restaurant_name: restMap[r.restaurant_id] || 'Unknown',
        platform: r.platform,
        month: r.month,
        year: r.year,
        report_no: r.report_no,
        status: r.status,
      }),
      ip_address: null,
      created_at: r.created_at,
    }))

    const combined = [...(logRes.data || []), ...reportLogs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)

    return res.status(200).json({ logs: combined, total: (logRes.count || 0) + reportLogs.length })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error: 'Server error', details: msg })
  }
}
