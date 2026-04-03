import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PerTypeStats {
  correct: number
  total: number
}

interface EarTrainingState {
  /** Stats per interval name */
  intervalStats: Record<string, PerTypeStats>
  /** Stats per chord type name */
  chordStats: Record<string, PerTypeStats>
  /** Total correct across all modes */
  totalCorrect: number

  recordAnswer: (mode: 'interval' | 'chord', type: string, correct: boolean) => void
  getAccuracy: (mode: 'interval' | 'chord', type: string) => number
  getDifficulty: (mode: 'interval' | 'chord') => 'easy' | 'medium' | 'hard'
  reset: () => void
}

export const useEarTrainingStore = create<EarTrainingState>()(
  persist(
    (set, get) => ({
      intervalStats: {},
      chordStats: {},
      totalCorrect: 0,

      recordAnswer: (mode, type, correct) => {
        const statsKey = mode === 'interval' ? 'intervalStats' : 'chordStats'
        set((state) => {
          const stats = { ...state[statsKey] }
          const prev = stats[type] ?? { correct: 0, total: 0 }
          stats[type] = {
            correct: prev.correct + (correct ? 1 : 0),
            total: prev.total + 1,
          }
          return {
            [statsKey]: stats,
            totalCorrect: state.totalCorrect + (correct ? 1 : 0),
          }
        })
      },

      getAccuracy: (mode, type) => {
        const statsKey = mode === 'interval' ? 'intervalStats' : 'chordStats'
        const stats = get()[statsKey][type]
        if (!stats || stats.total === 0) return 0
        return stats.correct / stats.total
      },

      getDifficulty: (mode) => {
        const statsKey = mode === 'interval' ? 'intervalStats' : 'chordStats'
        const allStats = Object.values(get()[statsKey])
        if (allStats.length === 0) return 'easy'
        const totalCorrect = allStats.reduce((s, v) => s + v.correct, 0)
        const totalAttempts = allStats.reduce((s, v) => s + v.total, 0)
        if (totalAttempts < 10) return 'easy'
        const overallAccuracy = totalCorrect / totalAttempts
        if (overallAccuracy >= 0.8) return 'hard'
        if (overallAccuracy >= 0.5) return 'medium'
        return 'easy'
      },

      reset: () => set({ intervalStats: {}, chordStats: {}, totalCorrect: 0 }),
    }),
    { name: 'melodypath-ear-training' },
  ),
)
