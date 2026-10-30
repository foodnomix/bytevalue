import type { VercelRequest, VercelResponse } from '@vercel/node'

const WARN_THRESHOLD = 5
const LOCK_THRESHOLD = 10
const LOCK_MINUTES = 30
const MAX_CONSECUTIVE_LOCKS = 2

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { phone, pin } = req.body || {}
  if (!phone || !pin) {
    return res.status(400).json({ error: 'Phone number and PIN are required' })
  }

  const trimmed = phone.trim().replace(/\s+/g, '')

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const bcrypt = await import('bcryptjs')
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: restaurants, error: dbErr } = await supabase
      .from('restaurants')
      .select('id, name, email, phone, phone2, pin_hash, status')
      .or(`phone.eq.${trimmed},phone2.eq.${trimmed}`)

    if (dbErr) {
      return res.status(500).json({ error: 'Internal server error', details: dbErr.message })
    }

    const restaurant = restaurants?.[0]
    if (!restaurant) {
      return res.status(401).json({ error: 'The phone number you entered is not registered' })
    }

    if (restaurant.status !== 'active') {
      return res.status(403).json({ error: `Account is ${restaurant.status}` })
    }

    const isPhone2 = restaurant.phone2 === trimmed && restaurant.phone !== trimmed
    const pinHash = restaurant.pin_hash

    if (!pinHash) {
      return res.status(401).json({ error: 'PIN not set for this phone number. Contact support.' })
    }

    // Try to load security record; skip rate limiting if table doesn't exist
    let sec: Record<string, unknown> | null = null
    let securityEnabled = false

    try {
      const { data, error } = await supabase
        .from('login_security')
        .select('*')
        .eq('phone', trimmed)
        .single()

      if (!error || error.code === 'PGRST116') {
        securityEnabled = true
        sec = data
      }
    } catch {
      // table doesn't exist, skip security
    }

    if (securityEnabled && !sec) {
      try {
        const { data: created } = await supabase
          .from('login_security')
          .insert({ phone: trimmed, restaurant_id: restaurant.id })
          .select()
          .single()
        sec = created
      } catch {
        // insert failed, continue without security
      }
      if (!sec) sec = { failed_attempts: 0, lock_count: 0, on_hold: false, locked_until: null }
    }

    if (securityEnabled && sec) {
      if (sec.on_hold) {
        return res.status(403).json({
          error: 'This phone number has been blocked due to too many failed attempts. Only an admin can reset your PIN and unblock your account.'
        })
      }

      if (sec.locked_until && new Date(sec.locked_until as string) > new Date()) {
        const mins = Math.ceil((new Date(sec.locked_until as string).getTime() - Date.now()) / 60000)
        return res.status(403).json({
          error: `Account is temporarily locked. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`
        })
      }

      if (sec.locked_until && new Date(sec.locked_until as string) <= new Date() && (sec.failed_attempts as number) >= LOCK_THRESHOLD) {
        await supabase
          .from('login_security')
          .update({ failed_attempts: 0, locked_until: null, updated_at: new Date().toISOString() })
          .eq('phone', trimmed)
        sec.failed_attempts = 0
        sec.locked_until = null
      }
    }

    const pinValid = await bcrypt.compare(pin, pinHash)

    if (!pinValid) {
      if (securityEnabled && sec) {
        const attempts = ((sec.failed_attempts as number) || 0) + 1

        if (attempts >= LOCK_THRESHOLD) {
          const newLockCount = ((sec.lock_count as number) || 0) + 1

          if (newLockCount >= MAX_CONSECUTIVE_LOCKS) {
            await supabase
              .from('login_security')
              .update({
                failed_attempts: attempts,
                lock_count: newLockCount,
                on_hold: true,
                updated_at: new Date().toISOString(),
              })
              .eq('phone', trimmed)

            await logSecurityEvent(supabase, trimmed, restaurant.id, 'on_hold',
              `Phone ${trimmed} put on hold after ${newLockCount} consecutive lockouts`)

            return res.status(403).json({
              error: 'This phone number has been blocked due to repeated failed attempts. Only an admin can reset your PIN and unblock your account.'
            })
          }

          const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString()
          await supabase
            .from('login_security')
            .update({
              failed_attempts: attempts,
              locked_until: lockedUntil,
              lock_count: newLockCount,
              updated_at: new Date().toISOString(),
            })
            .eq('phone', trimmed)

          await logSecurityEvent(supabase, trimmed, restaurant.id, 'locked',
            `Phone ${trimmed} locked for ${LOCK_MINUTES} min (lock #${newLockCount})`)

          return res.status(403).json({
            error: `Too many failed attempts. Your account has been locked for ${LOCK_MINUTES} minutes. Please contact us to reset your PIN.`
          })
        }

        await supabase
          .from('login_security')
          .update({ failed_attempts: attempts, updated_at: new Date().toISOString() })
          .eq('phone', trimmed)

        if (attempts >= WARN_THRESHOLD) {
          const remaining = LOCK_THRESHOLD - attempts
          return res.status(401).json({
            error: `Wrong PIN entered. You only have ${remaining} more ${remaining === 1 ? 'try' : 'tries'}. Please contact us to reset your PIN.`
          })
        }
      }

      return res.status(401).json({ error: 'Wrong PIN entered' })
    }

    // Successful login: reset security counters if table exists
    if (securityEnabled) {
      await supabase
        .from('login_security')
        .update({
          failed_attempts: 0,
          locked_until: null,
          lock_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('phone', trimmed)
    }

    return res.status(200).json({
      token: 'phone-auth',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        phone: isPhone2 ? restaurant.phone2 : restaurant.phone,
      },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error: 'Server error', details: msg })
  }
}

async function logSecurityEvent(
  supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>,
  phone: string,
  restaurantId: string,
  eventType: string,
  details: string,
) {
  try {
    await supabase.from('security_events').insert({
      phone,
      restaurant_id: restaurantId,
      event_type: eventType,
      details,
    })
  } catch {
    // table may not exist yet, ignore
  }
}
