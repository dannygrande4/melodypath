import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface HighScore {
  songId: string
  score: number
  accuracy: number
  grade: string
  date: string
}

interface LeaderboardState {
  highScores: Record<string, HighScore[]> // songId → sorted scores
  addScore: (entry: Omit<HighScore, 'date'>) => boolean // returns true if new high score
  getTopScores: (songId: string, limit?: number) => HighScore[]
  getBestScore: (songId: string) => HighScore | null
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      highScores: {},

      addScore: (entry) => {
        const date = new Date().toISOString()
        const newEntry: HighScore = { ...entry, date }

        const existing = get().highScores[entry.songId] ?? []
        const isNewBest = existing.length === 0 || entry.score > existing[0].score

        const updated = [...existing, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10) // keep top 10

        set((state) => ({
          highScores: {
            ...state.highScores,
            [entry.songId]: updated,
          },
        }))

        return isNewBest
      },

      getTopScores: (songId, limit = 5) => {
        return (get().highScores[songId] ?? []).slice(0, limit)
      },

      getBestScore: (songId) => {
        const scores = get().highScores[songId]
        return scores?.[0] ?? null
      },
    }),
    { name: 'melodypath-leaderboard' },
  ),
)
