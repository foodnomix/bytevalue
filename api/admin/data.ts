import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const [{ data: restaurants, error: rErr }, { data: reports, error: repErr }] = await Promise.all([
      supabase.from('restaurants').select('*').order('name'),
      supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(50),
    ])

    if (rErr || repErr) {
      return res.status(500).json({
        error: 'Failed to fetch data',
        details: rErr?.message || repErr?.message,
      })
    }

    return res.status(200).json({
      restaurants: restaurants || [],
      reports: reports || [],
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error: 'Server error', details: msg })
  }
}
