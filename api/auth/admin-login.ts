import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const bcrypt = await import('bcryptjs')
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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

    await supabase
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id)

    await supabase.from('activity_log').insert({
      admin_id: admin.id,
      action: 'login',
      entity_type: 'admin',
      entity_id: admin.id,
      details: JSON.stringify({ admin_name: admin.name, admin_email: admin.email, role: admin.role }),
    }).then(() => {})

    const tags = Array.isArray(admin.tags) ? admin.tags : []

    return res.status(200).json({
      token: 'admin-auth',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        tags,
      },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error: 'Server error', details: msg })
  }
}
