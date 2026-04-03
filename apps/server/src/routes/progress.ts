import type { FastifyInstance } from 'fastify'
import { prisma } from '../db.js'
import { authMiddleware, getUserId } from '../middleware/auth.js'
import { updateStreak } from '../services/streak.service.js'
import { checkAndAwardBadges } from '../services/achievement.service.js'

const XP_PER_LEVEL = (level: number) => Math.floor(100 * Math.pow(1.2, level - 1))

function computeLevel(xp: number): number {
  let level = 1
  let accumulated = 0
  while (accumulated + XP_PER_LEVEL(level) <= xp) {
    accumulated += XP_PER_LEVEL(level)
    level++
  }
  return Math.min(level, 100)
}

export default async function progressRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware)

  // ── Add XP ────────────────────────────────────────────────────────────
  app.post<{ Body: { amount: number } }>('/api/progress/xp', async (request, reply) => {
    const userId = getUserId(request)
    const { amount } = request.body

    if (!amount || amount <= 0) {
      return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'amount must be > 0' } })
    }

    const user = await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, email: `${userId}@melodypath.local`, xp: amount, level: computeLevel(amount) },
      update: { xp: { increment: amount } },
    })

    const newLevel = computeLevel(user.xp)
    const leveledUp = newLevel > user.level

    if (leveledUp) {
      await prisma.user.update({ where: { id: userId }, data: { level: newLevel } })
    }

    // Update streak
    const streak = await updateStreak(userId)

    // Check badges
    const newBadges = await checkAndAwardBadges(userId)

    return {
      data: {
        xp: user.xp,
        level: leveledUp ? newLevel : user.level,
        leveled_up: leveledUp,
        streak_days: streak,
        new_badges: newBadges,
      },
    }
  })

  // ── Mark lesson complete ──────────────────────────────────────────────
  app.post<{ Body: { lesson_id: string; score: number } }>('/api/progress/lesson', async (request, reply) => {
    const userId = getUserId(request)
    const { lesson_id, score } = request.body

    if (!lesson_id) {
      return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'lesson_id required' } })
    }

    const progress = await prisma.lessonProgress.upsert({
      where: { user_id_lesson_id: { user_id: userId, lesson_id } },
      create: {
        user_id: userId,
        lesson_id,
        completed: true,
        score: score ?? null,
        attempts: 1,
        completed_at: new Date(),
      },
      update: {
        completed: true,
        score: score ?? undefined,
        attempts: { increment: 1 },
        completed_at: new Date(),
      },
    })

    return { data: progress }
  })

  // ── Record song attempt ───────────────────────────────────────────────
  app.post<{
    Body: {
      song_id: string
      difficulty: number
      score: number
      accuracy: number
      grade: string
      note_results: string[]
    }
  }>('/api/progress/song', async (request, reply) => {
    const userId = getUserId(request)
    const { song_id, difficulty, score, accuracy, grade, note_results } = request.body

    if (!song_id) {
      return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'song_id required' } })
    }

    const attempt = await prisma.songAttempt.create({
      data: {
        user_id: userId,
        song_id,
        difficulty: difficulty ?? 1,
        score: score ?? 0,
        accuracy: accuracy ?? 0,
        grade: grade ?? 'D',
        note_results: note_results ?? [],
      },
    })

    return { data: attempt }
  })

  // ── Get user progress ─────────────────────────────────────────────────
  app.get('/api/progress', async (request) => {
    const userId = getUserId(request)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    const lessons = await prisma.lessonProgress.findMany({
      where: { user_id: userId },
    })
    const achievements = await prisma.userAchievement.findMany({
      where: { user_id: userId },
      include: { achievement: true },
    })

    return {
      data: {
        user,
        lessons,
        achievements: achievements.map((a) => ({
          badge_id: a.achievement.badge_id,
          name: a.achievement.name,
          description: a.achievement.description,
          icon_url: a.achievement.icon_url,
          earned_at: a.earned_at.toISOString(),
        })),
      },
    }
  })
}
