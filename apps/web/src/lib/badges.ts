export interface BadgeDef {
  id: string
  name: string
  description: string
  icon: string
  condition: (stats: BadgeCheckStats) => boolean
}

export interface BadgeCheckStats {
  lessonsCompleted: number
  songsPlayed: number
  streakDays: number
  totalXP: number
  level: number
  earTrainingCorrect: number
}

export const BADGES: BadgeDef[] = [
  {
    id: 'first-lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🌱',
    condition: (s) => s.lessonsCompleted >= 1,
  },
  {
    id: 'five-lessons',
    name: 'Eager Learner',
    description: 'Complete 5 lessons',
    icon: '📚',
    condition: (s) => s.lessonsCompleted >= 5,
  },
  {
    id: 'first-song',
    name: 'Rock Star',
    description: 'Play your first song',
    icon: '🎸',
    condition: (s) => s.songsPlayed >= 1,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Keep a 7-day streak',
    icon: '🔥',
    condition: (s) => s.streakDays >= 7,
  },
  {
    id: 'streak-30',
    name: 'Dedicated',
    description: 'Keep a 30-day streak',
    icon: '💪',
    condition: (s) => s.streakDays >= 30,
  },
  {
    id: 'level-5',
    name: 'Getting Somewhere',
    description: 'Reach level 5',
    icon: '⭐',
    condition: (s) => s.level >= 5,
  },
  {
    id: 'level-10',
    name: 'Double Digits',
    description: 'Reach level 10',
    icon: '🏆',
    condition: (s) => s.level >= 10,
  },
  {
    id: 'xp-1000',
    name: 'XP Hunter',
    description: 'Earn 1,000 total XP',
    icon: '💎',
    condition: (s) => s.totalXP >= 1000,
  },
  {
    id: 'ear-training-10',
    name: 'Ear of the Tiger',
    description: 'Get 10 correct in ear training',
    icon: '👂',
    condition: (s) => s.earTrainingCorrect >= 10,
  },
]

export function checkBadges(stats: BadgeCheckStats, alreadyEarned: Set<string>): BadgeDef[] {
  return BADGES.filter((b) => !alreadyEarned.has(b.id) && b.condition(stats))
}
