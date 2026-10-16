import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as bcrypt from 'bcryptjs'
import { adminClient } from '../_supabase'
import { signRestaurantToken } from '../_jwt'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { identifier, pin } = req.body || {}
  if (!identifier || !pin) {
    return res.status(400).json({ error: 'Email/phone and PIN are required' })
  }

  const trimmed = identifier.trim().toLowerCase()
  const pinStr = String(pin).trim()

  if (!/^\d{6}$/.test(pinStr)) {
    return res.status(400).json({ error: 'PIN must be 6 digits' })
  }

  try {
    const supabase = adminClient()

    const isEmail = trimmed.includes('@')
    const column = isEmail ? 'email' : 'phone'

    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('id, name, email, phone, pin_hash, status')
      .ilike(column, trimmed)
      .single()

    if (error || !restaurant) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (restaurant.status !== 'active') {
      return res.status(403).json({ error: `Account is ${restaurant.status}` })
    }

    const pinValid = await bcrypt.compare(pinStr, restaurant.pin_hash)
    if (!pinValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = signRestaurantToken(restaurant.id)

    return res.status(200).json({
      token,
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
