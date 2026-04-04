import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_db'
import { getUserId } from '../_auth'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const userId = await getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { amount } = req.body ?? {}
  if (!amount || amount <= 0) return res.status(400).json({ error: 'amount must be > 0' })

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
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const lastDate = user.last_practice?.toISOString().split('T')[0]
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0]

  const streak = lastDate === today
    ? user.streak_days
    : lastDate === yesterday
      ? user.streak_days + 1
      : 1

  await prisma.user.update({
    where: { id: userId },
    data: { streak_days: streak, last_practice: now },
  })

  res.json({
    data: {
      xp: user.xp,
      level: leveledUp ? newLevel : user.level,
      leveled_up: leveledUp,
      streak_days: streak,
    },
  })
}
