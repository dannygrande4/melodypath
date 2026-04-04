import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_db'
import { getUserId } from '../_auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const userId = await getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  const lessons = await prisma.lessonProgress.findMany({ where: { user_id: userId } })
  const achievements = await prisma.userAchievement.findMany({
    where: { user_id: userId },
    include: { achievement: true },
  })

  res.json({
    data: {
      user,
      lessons,
      achievements: achievements.map((a) => ({
        badge_id: a.achievement.badge_id,
        name: a.achievement.name,
        earned_at: a.earned_at.toISOString(),
      })),
    },
  })
}
