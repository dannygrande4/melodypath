import type { FastifyInstance } from 'fastify'
import { prisma } from '../db.js'

export default async function songRoutes(app: FastifyInstance) {
  // ── List songs ────────────────────────────────────────────────────────
  app.get<{
    Querystring: { difficulty?: string; genre?: string; limit?: string }
  }>('/api/songs', async (request) => {
    const { difficulty, genre, limit } = request.query

    const where: Record<string, unknown> = { published: true }
    if (difficulty) where.difficulty = parseInt(difficulty)
    if (genre) where.genre = genre

    const songs = await prisma.song.findMany({
      where,
      orderBy: { difficulty: 'asc' },
      take: limit ? parseInt(limit) : 50,
    })

    return { data: songs }
  })

  // ── Get single song ───────────────────────────────────────────────────
  app.get<{ Params: { id: string } }>('/api/songs/:id', async (request, reply) => {
    const song = await prisma.song.findUnique({
      where: { id: request.params.id },
    })

    if (!song) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Song not found' } })
    }

    return { data: song }
  })
}
