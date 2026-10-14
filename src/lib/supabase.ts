import { createClient } from '@supabase/supabase-js'
import { getToken } from './auth'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  console.warn('Supabase env vars not set — using mock data')
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder', {
  global: {
    fetch: (input, init) => {
      const token = getToken()
      const headers = new Headers(init?.headers)
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return fetch(input, { ...init, headers })
    },
  },
})
