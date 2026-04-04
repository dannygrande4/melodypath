import type { VercelRequest } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
)

/**
 * Extract and verify the user ID from the Authorization header.
 * Returns the Supabase user ID or null.
 */
export async function getUserId(req: VercelRequest): Promise<string | null> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    // Dev mode: allow unauthenticated
    if (process.env.NODE_ENV !== 'production') return 'dev-user'
    return null
  }

  const token = authHeader.slice(7)

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null
    return user.id
  } catch {
    return null
  }
}
