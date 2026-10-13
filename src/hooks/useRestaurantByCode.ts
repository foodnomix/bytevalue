import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Restaurant } from '../types'

export function useRestaurantByCode(code: string) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!code) {
      setLoading(false)
      setNotFound(true)
      return
    }
    setLoading(true)
    setNotFound(false)

    supabase
      .from('restaurants')
      .select('*')
      .ilike('code', code)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setRestaurant(null)
          setNotFound(true)
        } else {
          setRestaurant(data)
        }
        setLoading(false)
      })
  }, [code])

  return { restaurant, loading, notFound }
}
