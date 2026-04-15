import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { useLessonStore } from '@/stores/lessonStore'
import { useLeaderboardStore } from '@/stores/leaderboardStore'
import { useEarTrainingStore } from '@/stores/earTrainingStore'
import {
  getActiveUserId,
  setActiveUserId,
  clearAnonymousProgress,
} from '@/lib/userStorage'

/**
 * Syncs store state with the authenticated user.
 *
 * On login: saves current user ID, loads user-specific data from localStorage.
 * On logout: resets all stores, clears active user.
 * On first run: clears any anonymous progress so everyone starts fresh.
 */
export function useAuthSync() {
  const user = useAuthStore((s) => s.user)
  const prevUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    const currentUserId = user?.id ?? null
    const prevUserId = prevUserIdRef.current
    const storedUserId = getActiveUserId()

    // First time ever - clear anonymous progress
    if (!storedUserId && !currentUserId) {
      clearAnonymousProgress()
    }

    // User changed (login, logout, or switch)
    if (currentUserId !== prevUserId) {
      if (currentUserId) {
        // ── Logged in ──────────────────────────────────────────────
        // Save all current stores under the new user's key
        const userId = currentUserId

        // Save current state to user-scoped keys
        const userState = useUserStore.getState()
        const lessonState = useLessonStore.getState()
        const leaderboardState = useLeaderboardStore.getState()
        const earState = useEarTrainingStore.getState()

        localStorage.setItem(
          `moniquemusic-user-${userId}`,
          JSON.stringify({
            state: {
              id: userId,
              email: user?.email ?? null,
              age_group: userState.age_group,
              instrument: userState.instrument,
              skill_level: userState.skill_level,
              xp: userState.xp,
              level: userState.level,
              streak_days: userState.streak_days,
              last_practice: userState.last_practice,
            },
          }),
        )
        localStorage.setItem(
          `moniquemusic-lessons-${userId}`,
          JSON.stringify({ state: { completedLessons: lessonState.completedLessons } }),
        )
        localStorage.setItem(
          `moniquemusic-leaderboard-${userId}`,
          JSON.stringify({ state: { highScores: leaderboardState.highScores } }),
        )
        localStorage.setItem(
          `moniquemusic-ear-training-${userId}`,
          JSON.stringify({
            state: {
              intervalStats: earState.intervalStats,
              chordStats: earState.chordStats,
              totalCorrect: earState.totalCorrect,
            },
          }),
        )

        // If switching from a different user, load the new user's data
        if (prevUserId && prevUserId !== currentUserId) {
          loadUserData(userId)
        }

        setActiveUserId(userId)
        useUserStore.getState().setUser({ id: userId, email: user?.email ?? null })
      } else {
        // ── Logged out ─────────────────────────────────────────────
        // Save current user's data before resetting
        if (prevUserId) {
          saveCurrentUserData(prevUserId)
        }

        // Reset all stores
        useUserStore.getState().reset()
        useLessonStore.getState().reset()
        useEarTrainingStore.getState().reset()

        setActiveUserId(null)
      }

      prevUserIdRef.current = currentUserId
    }
  }, [user])
}

function saveCurrentUserData(userId: string) {
  const userState = useUserStore.getState()
  const lessonState = useLessonStore.getState()
  const leaderboardState = useLeaderboardStore.getState()
  const earState = useEarTrainingStore.getState()

  localStorage.setItem(
    `moniquemusic-user-${userId}`,
    JSON.stringify({
      state: {
        id: userId,
        email: userState.email,
        age_group: userState.age_group,
        instrument: userState.instrument,
        skill_level: userState.skill_level,
        xp: userState.xp,
        level: userState.level,
        streak_days: userState.streak_days,
        last_practice: userState.last_practice,
      },
    }),
  )
  localStorage.setItem(
    `moniquemusic-lessons-${userId}`,
    JSON.stringify({ state: { completedLessons: lessonState.completedLessons } }),
  )
  localStorage.setItem(
    `moniquemusic-leaderboard-${userId}`,
    JSON.stringify({ state: { highScores: leaderboardState.highScores } }),
  )
  localStorage.setItem(
    `moniquemusic-ear-training-${userId}`,
    JSON.stringify({
      state: {
        intervalStats: earState.intervalStats,
        chordStats: earState.chordStats,
        totalCorrect: earState.totalCorrect,
      },
    }),
  )
}

function loadUserData(userId: string) {
  // Load user store
  try {
    const raw = localStorage.getItem(`moniquemusic-user-${userId}`)
    if (raw) {
      const { state } = JSON.parse(raw)
      useUserStore.getState().setUser(state)
    } else {
      useUserStore.getState().reset()
    }
  } catch { /* fresh start */ }

  // Load lesson store
  try {
    const raw = localStorage.getItem(`moniquemusic-lessons-${userId}`)
    if (raw) {
      const { state } = JSON.parse(raw)
      useLessonStore.setState({ completedLessons: state.completedLessons ?? {} })
    } else {
      useLessonStore.getState().reset()
    }
  } catch { /* fresh start */ }

  // Load leaderboard
  try {
    const raw = localStorage.getItem(`moniquemusic-leaderboard-${userId}`)
    if (raw) {
      const { state } = JSON.parse(raw)
      useLeaderboardStore.setState({ highScores: state.highScores ?? {} })
    }
  } catch { /* fresh start */ }

  // Load ear training
  try {
    const raw = localStorage.getItem(`moniquemusic-ear-training-${userId}`)
    if (raw) {
      const { state } = JSON.parse(raw)
      useEarTrainingStore.setState({
        intervalStats: state.intervalStats ?? {},
        chordStats: state.chordStats ?? {},
        totalCorrect: state.totalCorrect ?? 0,
      })
    } else {
      useEarTrainingStore.getState().reset()
    }
  } catch { /* fresh start */ }
}
