import * as jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

const JWT_SECRET = () => {
  const secret = process.env.SUPABASE_JWT_SECRET
  if (!secret) throw new Error('Missing SUPABASE_JWT_SECRET')
  return secret
}

interface RestaurantClaims {
  user_type: 'restaurant'
  restaurant_id: string
}

interface AdminClaims {
  user_type: 'admin'
  admin_role: 'developer' | 'super_admin' | 'view_only'
  admin_tags: string[]
  admin_id: string
}

export function signRestaurantToken(restaurantId: string): string {
  const payload = {
    sub: restaurantId,
    role: 'authenticated',
    aud: 'authenticated',
    app_metadata: {
      user_type: 'restaurant',
      restaurant_id: restaurantId,
    } satisfies RestaurantClaims,
  }
  return jwt.sign(payload, JWT_SECRET(), { expiresIn: '7d', jwtid: randomUUID() })
}

export function signAdminToken(
  adminId: string,
  role: 'developer' | 'super_admin' | 'view_only',
  tags: string[],
): string {
  const payload = {
    sub: adminId,
    role: 'authenticated',
    aud: 'authenticated',
    app_metadata: {
      user_type: 'admin',
      admin_role: role,
      admin_tags: tags,
      admin_id: adminId,
    } satisfies AdminClaims,
  }
  return jwt.sign(payload, JWT_SECRET(), { expiresIn: '24h', jwtid: randomUUID() })
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET())
}
