import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { MOCK_RESTAURANTS } from '../lib/mock'
import type { Restaurant } from '../types'

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL

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

    if (USE_MOCK) {
      setTimeout(() => {
        const r = MOCK_RESTAURANTS.find(r => r.code.toLowerCase() === code.toLowerCase()) || null
        setRestaurant(r)
        setNotFound(!r)
        setLoading(false)
      }, 400)
      return
    }

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
