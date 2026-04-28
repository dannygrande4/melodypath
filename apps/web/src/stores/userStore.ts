import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, SkillLevel, InstrumentType, AgeGroup } from '@moniquemusic/shared-types'
import { syncXP } from '@/lib/apiSync'
import { checkBadges, type BadgeCheckStats } from '@/lib/badges'

// XP thresholds per level (level 1 → 2 needs 100 XP, etc.)
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

export function xpToNextLevel(currentXp: number, currentLevel: number): number {
  let accumulated = 0
  for (let l = 1; l < currentLevel; l++) {
    accumulated += XP_PER_LEVEL(l)
  }
  return XP_PER_LEVEL(currentLevel) - (currentXp - accumulated)
}

interface LevelUpEvent {
  newLevel: number
  timestamp: number
}

interface UserState {
  // Profile
  id: string | null
  email: string | null
  age_group: AgeGroup
  instrument: InstrumentType
  skill_level: SkillLevel
  xp: number
  level: number
  streak_days: number
  last_practice: string | null

  // UI state
  pendingLevelUp: LevelUpEvent | null

  // Achievement state
  earnedBadgeIds: string[]
  pendingBadgeIds: string[]

  // Actions
  setUser: (user: Partial<User>) => void
  addXP: (amount: number) => void
  clearLevelUp: () => void
  setSkillLevel: (level: SkillLevel) => void
  setInstrument: (instrument: InstrumentType) => void
  setAgeGroup: (group: AgeGroup) => void
  recordPractice: () => void
  checkAndAwardBadges: (extra: Partial<BadgeCheckStats>) => void
  consumeBadge: () => void
  reset: () => void
}

const defaultState = {
  id: null,
  email: null,
  age_group: 'ADULT' as AgeGroup,
  instrument: 'PIANO' as InstrumentType,
  skill_level: 'BEGINNER' as SkillLevel,
  xp: 0,
  level: 1,
  streak_days: 0,
  last_practice: null,
  pendingLevelUp: null,
  earnedBadgeIds: [] as string[],
  pendingBadgeIds: [] as string[],
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setUser: (user) => set((state) => ({ ...state, ...user })),

      addXP: (amount) => {
        const { xp, level } = get()
        const newXP = xp + amount
        const newLevel = computeLevel(newXP)

        set({
          xp: newXP,
          level: newLevel,
          pendingLevelUp: newLevel > level ? { newLevel, timestamp: Date.now() } : null,
        })

        // Sync to backend (debounced, fire-and-forget)
        syncXP(amount)
      },

      clearLevelUp: () => set({ pendingLevelUp: null }),

      setSkillLevel: (skill_level) => set({ skill_level }),
      setInstrument: (instrument) => set({ instrument }),
      setAgeGroup: (age_group) => set({ age_group }),

      checkAndAwardBadges: (extra) => {
        const state = get()
        const stats: BadgeCheckStats = {
          lessonsCompleted: extra.lessonsCompleted ?? 0,
          songsPlayed: extra.songsPlayed ?? 0,
          streakDays: state.streak_days,
          totalXP: state.xp,
          level: state.level,
          earTrainingCorrect: extra.earTrainingCorrect ?? 0,
        }
        const earned = new Set(state.earnedBadgeIds)
        const newly = checkBadges(stats, earned)
        if (newly.length === 0) return
        set({
          earnedBadgeIds: [...state.earnedBadgeIds, ...newly.map((b) => b.id)],
          pendingBadgeIds: [...state.pendingBadgeIds, ...newly.map((b) => b.id)],
        })
      },

      consumeBadge: () =>
        set((state) => ({ pendingBadgeIds: state.pendingBadgeIds.slice(1) })),

      recordPractice: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0]
          const lastDate = state.last_practice?.split('T')[0]
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

          const streak_days =
            lastDate === today
              ? state.streak_days
              : lastDate === yesterday
                ? state.streak_days + 1
                : 1

          return { last_practice: new Date().toISOString(), streak_days }
        }),

      reset: () => set(defaultState),
    }),
    {
      name: 'moniquemusic-user',
      partialize: (state) => ({
        id: state.id,
        email: state.email,
        age_group: state.age_group,
        instrument: state.instrument,
        skill_level: state.skill_level,
        xp: state.xp,
        level: state.level,
        streak_days: state.streak_days,
        last_practice: state.last_practice,
        earnedBadgeIds: state.earnedBadgeIds,
      }),
    }
  )
)
