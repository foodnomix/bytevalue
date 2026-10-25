import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as bcrypt from 'bcryptjs'
import { adminClient } from '../_supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { identifier, pin } = req.body || {}
  if (!identifier || !pin) {
    return res.status(400).json({ error: 'Phone/email and PIN are required' })
  }

  const trimmed = identifier.trim()

  try {
    const supabase = adminClient()

    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, email, phone, phone2, pin_hash, status')
      .or(`phone.eq.${trimmed},phone2.eq.${trimmed},email.ilike.${trimmed}`)

    if (error) {
      console.error('DB query error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }

    const restaurant = restaurants?.[0]
    if (!restaurant) {
      return res.status(401).json({ error: 'No restaurant found with this phone number or email' })
    }

    if (restaurant.status !== 'active') {
      return res.status(403).json({ error: `Account is ${restaurant.status}` })
    }

    if (!restaurant.pin_hash) {
      return res.status(401).json({ error: 'PIN not set. Contact support.' })
    }

    const pinValid = await bcrypt.compare(pin, restaurant.pin_hash)
    if (!pinValid) {
      return res.status(401).json({ error: 'Incorrect PIN' })
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
