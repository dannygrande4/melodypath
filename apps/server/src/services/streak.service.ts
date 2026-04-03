import { prisma } from '../db.js'

/**
 * Compute and update streak for a user based on last_practice timestamp.
 * Returns the updated streak count.
 */
export async function updateStreak(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return 0

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const lastDate = user.last_practice?.toISOString().split('T')[0]

  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0]

  let newStreak: number
  if (lastDate === today) {
    // Already practiced today — no change
    newStreak = user.streak_days
  } else if (lastDate === yesterday) {
    // Continuing streak
    newStreak = user.streak_days + 1
  } else {
    // Streak broken (or first practice)
    newStreak = 1
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      streak_days: newStreak,
      last_practice: now,
    },
  })

  return newStreak
}
