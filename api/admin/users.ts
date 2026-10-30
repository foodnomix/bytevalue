import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('admins')
        .select('id, email, name, role, tags, status, created_at, last_login_at')
        .order('created_at', { ascending: false })

      if (error) return res.status(500).json({ error: 'Failed to fetch users', details: error.message })
      return res.status(200).json({ users: data || [] })
    }

    if (req.method === 'POST') {
      const bcrypt = await import('bcryptjs')
      const { email, name, password, role, admin_id, admin_name, admin_email } = req.body || {}
      if (!email || !name || !password || !role) {
        return res.status(400).json({ error: 'Email, name, password, and role are required' })
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const { data, error } = await supabase
        .from('admins')
        .insert({ email, name, password_hash: passwordHash, role, status: 'active' })
        .select('id, email, name, role, status, created_at')
        .single()

      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          return res.status(400).json({ error: 'An admin with this email already exists' })
        }
        return res.status(500).json({ error: 'Failed to create user', details: error.message })
      }

      if (admin_id) {
        await supabase.from('activity_log').insert({
          admin_id,
          action: 'create_user',
          entity_type: 'admin', entity_id: data.id,
          details: JSON.stringify({ admin_name, admin_email, user_name: name, role }),
        }).then(() => {})
      }

      return res.status(201).json({ user: data })
    }

    if (req.method === 'PUT') {
      const bcrypt = await import('bcryptjs')
      const { id, name, email, role, status, password, admin_id, admin_name, admin_email } = req.body || {}
      if (!id) return res.status(400).json({ error: 'User ID is required' })

      const updates: Record<string, unknown> = {}
      if (name !== undefined) updates.name = name
      if (email !== undefined) updates.email = email
      if (role !== undefined) updates.role = role
      if (status !== undefined) updates.status = status
      if (password) updates.password_hash = await bcrypt.hash(password, 10)

      const { data, error } = await supabase
        .from('admins')
        .update(updates)
        .eq('id', id)
        .select('id, email, name, role, status')
        .single()

      if (error) return res.status(500).json({ error: 'Failed to update user', details: error.message })

      if (admin_id) {
        await supabase.from('activity_log').insert({
          admin_id,
          action: 'update_user',
          entity_type: 'admin', entity_id: id,
          details: JSON.stringify({ admin_name, admin_email, user_name: data.name, fields_updated: Object.keys(updates), password_changed: !!password }),
        }).then(() => {})
      }

      return res.status(200).json({ user: data })
    }

    if (req.method === 'DELETE') {
      const id = req.query.id as string
      if (!id) return res.status(400).json({ error: 'User ID is required' })

      const { data: user } = await supabase.from('admins').select('name, email').eq('id', id).single()

      const { error } = await supabase.from('admins').delete().eq('id', id)
      if (error) return res.status(500).json({ error: 'Failed to delete user', details: error.message })

      const adminId = req.query.admin_id as string
      const adminName = req.query.admin_name as string
      const adminEmail = req.query.admin_email as string
      if (adminId) {
        await supabase.from('activity_log').insert({
          admin_id: adminId,
          action: 'delete_user',
          entity_type: 'admin', entity_id: id,
          details: JSON.stringify({ admin_name: adminName, admin_email: adminEmail, user_name: user?.name || 'Unknown', user_email: user?.email }),
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
