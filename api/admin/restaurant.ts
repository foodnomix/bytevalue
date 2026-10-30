import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    if (req.method === 'PUT') {
      const { id, name, email, phone, phone2, city, state, status } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Restaurant ID is required' })

      const { data, error } = await supabase
        .from('restaurants')
        .update({ name, email, phone, phone2: phone2 || null, city: city || null, state: state || null, status })
        .eq('id', id)
        .select()
        .single()

      if (error) return res.status(500).json({ error: 'Failed to update', details: error.message })
      return res.status(200).json({ restaurant: data })
    }

    if (req.method === 'DELETE') {
      const id = req.query.id as string
      if (!id) return res.status(400).json({ error: 'Restaurant ID is required' })

      const { error } = await supabase.from('restaurants').delete().eq('id', id)
      if (error) return res.status(500).json({ error: 'Failed to delete', details: error.message })
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error: 'Server error', details: msg })
  }
}
