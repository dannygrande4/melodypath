import type { FastifyRequest, FastifyReply } from 'fastify'

/**
 * Auth middleware — validates JWT from Supabase.
 * For now, uses a simple token check. Replace with Supabase JWT
 * verification when Supabase is configured.
 */
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    // In development, allow unauthenticated requests with a default user
    if (process.env.NODE_ENV !== 'production') {
      ;(request as any).userId = 'dev-user'
      return
    }
    return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Missing auth token' } })
  }

  const token = authHeader.slice(7)

  // TODO: Verify Supabase JWT
  // For now, accept any non-empty token and use it as user ID
  if (!token) {
    return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } })
  }

  ;(request as any).userId = token
}

export function getUserId(request: FastifyRequest): string {
  return (request as any).userId ?? 'dev-user'
}
