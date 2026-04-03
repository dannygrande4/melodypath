import type { FastifyInstance } from 'fastify'
import { prisma } from '../db.js'
import { authMiddleware, getUserId } from '../middleware/auth.js'

export default async function lessonRoutes(app: FastifyInstance) {
  // ── List lessons (public) ─────────────────────────────────────────────
  app.get<{
    Querystring: { level?: string }
  }>('/api/lessons', async (request) => {
    const { level } = request.query

    const where: Record<string, unknown> = { published: true }
    if (level) where.level = level

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    return { data: lessons }
  })

  // ── Get lesson with user progress ─────────────────────────────────────
  app.get<{ Params: { id: string } }>('/api/lessons/:id', async (request, reply) => {
    const lesson = await prisma.lesson.findUnique({
      where: { id: request.params.id },
    })

    if (!lesson) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Lesson not found' } })
    }

    // If authenticated, include progress
    let progress = null
    try {
      await authMiddleware(request, reply)
      const userId = getUserId(request)
      progress = await prisma.lessonProgress.findUnique({
        where: { user_id_lesson_id: { user_id: userId, lesson_id: lesson.id } },
      })
    } catch {
      // Not authenticated — just return lesson without progress
    }

    return { data: { ...lesson, progress } }
  })

  // ── Get achievements list ─────────────────────────────────────────────
  app.get('/api/achievements', async () => {
    const achievements = await prisma.achievement.findMany({
      orderBy: { badge_id: 'asc' },
    })
    return { data: achievements }
  })
}
