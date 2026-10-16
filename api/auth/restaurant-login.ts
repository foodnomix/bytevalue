import type { VercelRequest, VercelResponse } from '@vercel/node'
import { adminClient } from '../_supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { identifier } = req.body || {}
  if (!identifier) {
    return res.status(400).json({ error: 'Phone number is required' })
  }

  const trimmed = identifier.trim()

  try {
    const supabase = adminClient()

    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('id, name, email, phone, status')
      .eq('phone', trimmed)
      .single()

    if (error || !restaurant) {
      return res.status(401).json({ error: 'No restaurant found with this phone number' })
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
  } catch (err) {
    console.error('Restaurant login error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
