import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { identifier } = req.body || {}
  if (!identifier) {
    return res.status(400).json({ error: 'Phone or email is required' })
  }

  const trimmed = identifier.trim()

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const url = process.env.SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, key)

    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, email, phone, phone2, status')
      .or(`phone.eq.${trimmed},phone2.eq.${trimmed},email.ilike.${trimmed}`)

    if (error) {
      return res.status(500).json({ error: 'DB query error', details: error.message })
    }

    const restaurant = restaurants?.[0]
    if (!restaurant) {
      return res.status(401).json({ error: 'No restaurant found with this phone number or email' })
    }

    if (restaurant.status !== 'active') {
      return res.status(403).json({ error: `Account is ${restaurant.status}` })
    }

    return res.status(200).json({
      token: 'phone-auth',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone,
      },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error: 'Server error', details: msg })
  }
}
