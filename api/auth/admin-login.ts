import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as bcrypt from 'bcryptjs'
import { adminClient } from '../_supabase'
import { signAdminToken } from '../_jwt'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const supabase = adminClient()

    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, email, name, role, tags, password_hash, status')
      .ilike('email', email.trim())
      .single()

    if (error || !admin) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (admin.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive' })
    }

    const passwordValid = await bcrypt.compare(password, admin.password_hash)
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const tags = Array.isArray(admin.tags) ? admin.tags : []
    const token = signAdminToken(admin.id, admin.role, tags)

    // Update last_login_at
    await supabase
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id)

    // Log login action (skip for developer role)
    if (admin.role !== 'developer') {
      await supabase.from('activity_log').insert({
        admin_id: admin.id,
        action: 'login',
        entity_type: 'admin',
        entity_id: admin.id,
        ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress || null,
      })
    }

    return res.status(200).json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        tags,
      },
    })
  } catch (err) {
    console.error('Admin login error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
