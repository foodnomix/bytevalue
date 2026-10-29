import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    env: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasViteUrl: !!process.env.VITE_SUPABASE_URL,
      hasViteAnon: !!process.env.VITE_SUPABASE_ANON_KEY,
    },
  })
}
