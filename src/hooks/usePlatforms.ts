import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { PlatformRecord } from '../types'

let cached: PlatformRecord[] | null = null

export function usePlatforms() {
  const [platforms, setPlatforms] = useState<PlatformRecord[]>(cached || [])
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    if (cached) return
    supabase
      .from('platforms')
      .select('*')
      .eq('is_active', true)
      .then(({ data }) => {
        cached = data || []
        setPlatforms(cached)
        setLoading(false)
      })
  }, [])

  function getPlatformId(name: string): string | undefined {
    return platforms.find(p => p.name === name)?.id
  }

  return { platforms, loading, getPlatformId }
}
