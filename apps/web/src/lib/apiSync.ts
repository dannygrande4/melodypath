import { api } from './api'

/**
 * Sync layer: pushes local state changes to the backend API.
 * Falls back gracefully if the server is unreachable (offline-first).
 */

let syncDebounce: ReturnType<typeof setTimeout> | null = null

/**
 * Debounced XP sync — batches rapid XP gains into one API call.
 */
export function syncXP(amount: number): void {
  if (syncDebounce) clearTimeout(syncDebounce)
  syncDebounce = setTimeout(async () => {
    try {
      await api.post('/api/progress/xp', { amount })
    } catch {
      // Offline or server down — local store is the source of truth
      console.debug('[sync] XP sync failed — will retry next session')
    }
  }, 500)
}

/**
 * Sync lesson completion to server.
 */
export async function syncLessonComplete(lessonId: string, score: number): Promise<void> {
  try {
    await api.post('/api/progress/lesson', { lesson_id: lessonId, score })
  } catch {
    console.debug('[sync] Lesson sync failed')
  }
}

/**
 * Sync song attempt to server.
 */
export async function syncSongAttempt(data: {
  songId: string
  difficulty: number
  score: number
  accuracy: number
  grade: string
  noteResults: string[]
}): Promise<void> {
  try {
    await api.post('/api/progress/song', {
      song_id: data.songId,
      difficulty: data.difficulty,
      score: data.score,
      accuracy: data.accuracy,
      grade: data.grade,
      note_results: data.noteResults,
    })
  } catch {
    console.debug('[sync] Song attempt sync failed')
  }
}

/**
 * Load full user progress from server (called on app init).
 * Returns null if server is unreachable.
 */
export async function loadProgress(): Promise<{
  user: any
  lessons: any[]
  achievements: any[]
} | null> {
  try {
    const result = await api.get<{ data: any }>('/api/progress')
    return result.data
  } catch {
    console.debug('[sync] Could not load progress from server — using local state')
    return null
  }
}
