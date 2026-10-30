import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    if (req.method === 'POST') {
      const { name, email, phone, phone2, city, state, status, admin_id, admin_name, admin_email } = req.body || {}
      if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' })

      const { data, error } = await supabase
        .from('restaurants')
        .insert({
          name, email: email || null, phone,
          phone2: phone2 || null, city: city || null, state: state || null,
          status: status || 'active',
        })
        .select()
        .single()

      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          return res.status(400).json({ error: 'A restaurant with this phone number already exists' })
        }
        return res.status(500).json({ error: 'Failed to create restaurant', details: error.message })
      }

      if (admin_id) {
        await supabase.from('activity_log').insert({
          admin_id,
          action: 'create_restaurant',
          entity_type: 'restaurant', entity_id: data.id,
          details: JSON.stringify({ admin_name, admin_email, restaurant_name: name, city, state }),
        }).then(() => {})
      }

      return res.status(201).json({ restaurant: data })
    }

    if (req.method === 'PUT') {
      const { id, name, email, phone, phone2, city, state, status, admin_id, admin_name, admin_email } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Restaurant ID is required' })

      const { data, error } = await supabase
        .from('restaurants')
        .update({ name, email, phone, phone2: phone2 || null, city: city || null, state: state || null, status })
        .eq('id', id)
        .select()
        .single()

      if (error) return res.status(500).json({ error: 'Failed to update', details: error.message })

      if (admin_id) {
        await supabase.from('activity_log').insert({
          admin_id,
          action: 'update_restaurant',
          entity_type: 'restaurant', entity_id: id,
          details: JSON.stringify({ admin_name, admin_email, restaurant_name: name, fields_updated: Object.keys({ name, email, phone, phone2, city, state, status }) }),
        }).then(() => {})
      }

      return res.status(200).json({ restaurant: data })
    }

    if (req.method === 'DELETE') {
      const id = req.query.id as string
      if (!id) return res.status(400).json({ error: 'Restaurant ID is required' })

      const { data: restaurant } = await supabase.from('restaurants').select('name').eq('id', id).single()

      const { error } = await supabase.from('restaurants').delete().eq('id', id)
      if (error) return res.status(500).json({ error: 'Failed to delete', details: error.message })

      const adminId = req.query.admin_id as string
      const adminName = req.query.admin_name as string
      const adminEmail = req.query.admin_email as string
      if (adminId) {
        await supabase.from('activity_log').insert({
          admin_id: adminId,
          action: 'delete_restaurant',
          entity_type: 'restaurant', entity_id: id,
          details: JSON.stringify({ admin_name: adminName, admin_email: adminEmail, restaurant_name: restaurant?.name || 'Unknown' }),
        }).then(() => {})
      }

      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error: 'Server error', details: msg })
  }
}
