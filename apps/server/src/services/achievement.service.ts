import { prisma } from '../db.js'

interface BadgeCondition {
  badge_id: string
  name: string
  description: string
  icon_url: string
  check: (stats: UserStats) => boolean
}

interface UserStats {
  lessonsCompleted: number
  songsPlayed: number
  streakDays: number
  totalXP: number
  level: number
}

const BADGE_CONDITIONS: BadgeCondition[] = [
  {
    badge_id: 'first-lesson', name: 'First Steps',
    description: 'Complete your first lesson', icon_url: '🌱',
    check: (s) => s.lessonsCompleted >= 1,
  },
  {
    badge_id: 'five-lessons', name: 'Eager Learner',
    description: 'Complete 5 lessons', icon_url: '📚',
    check: (s) => s.lessonsCompleted >= 5,
  },
  {
    badge_id: 'first-song', name: 'Rock Star',
    description: 'Play your first song', icon_url: '🎸',
    check: (s) => s.songsPlayed >= 1,
  },
  {
    badge_id: 'streak-7', name: 'Week Warrior',
    description: 'Keep a 7-day streak', icon_url: '🔥',
    check: (s) => s.streakDays >= 7,
  },
  {
    badge_id: 'streak-30', name: 'Dedicated',
    description: 'Keep a 30-day streak', icon_url: '💪',
    check: (s) => s.streakDays >= 30,
  },
  {
    badge_id: 'level-5', name: 'Getting Somewhere',
    description: 'Reach level 5', icon_url: '⭐',
    check: (s) => s.level >= 5,
  },
  {
    badge_id: 'level-10', name: 'Double Digits',
    description: 'Reach level 10', icon_url: '🏆',
    check: (s) => s.level >= 10,
  },
  {
    badge_id: 'xp-1000', name: 'XP Hunter',
    description: 'Earn 1,000 total XP', icon_url: '💎',
    check: (s) => s.totalXP >= 1000,
  },
]

/**
 * Check all badge conditions and award any newly earned badges.
 * Returns the list of newly awarded badge IDs.
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  // Gather stats
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return []

  const lessonsCompleted = await prisma.lessonProgress.count({
    where: { user_id: userId, completed: true },
  })
  const songsPlayed = await prisma.songAttempt.count({
    where: { user_id: userId },
  })

  const stats: UserStats = {
    lessonsCompleted,
    songsPlayed,
    streakDays: user.streak_days,
    totalXP: user.xp,
    level: user.level,
  }

  // Get already earned badges
  const existing = await prisma.userAchievement.findMany({
    where: { user_id: userId },
    select: { achievement_id: true },
  })
  const existingIds = new Set(existing.map((e) => e.achievement_id))

  // Check conditions
  const newlyEarned: string[] = []

  for (const badge of BADGE_CONDITIONS) {
    if (existingIds.has(badge.badge_id)) continue
    if (!badge.check(stats)) continue

    // Ensure achievement exists in DB
    const achievement = await prisma.achievement.upsert({
      where: { badge_id: badge.badge_id },
      create: {
        badge_id: badge.badge_id,
        name: badge.name,
        description: badge.description,
        icon_url: badge.icon_url,
      },
      update: {},
    })

    // Award to user
    await prisma.userAchievement.create({
      data: {
        user_id: userId,
        achievement_id: achievement.id,
      },
    })

    newlyEarned.push(badge.badge_id)
  }

  return newlyEarned
}
