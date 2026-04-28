import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncLessonComplete } from '@/lib/apiSync'
import { unlocksFromLesson, type UnlockEvent } from '@/lib/unlocks'

interface LessonState {
  completedLessons: Record<string, { score: number; completedAt: string }>
  pendingUnlocks: UnlockEvent[]
  markComplete: (lessonId: string, score: number) => void
  isCompleted: (lessonId: string) => boolean
  completedIds: () => Set<string>
  consumeUnlock: () => void
  reset: () => void
}

export const useLessonStore = create<LessonState>()(
  persist(
    (set, get) => ({
      completedLessons: {},
      pendingUnlocks: [],

      markComplete: (lessonId, score) => {
        const wasAlreadyDone = !!get().completedLessons[lessonId]
        set((state) => ({
          completedLessons: {
            ...state.completedLessons,
            [lessonId]: { score, completedAt: new Date().toISOString() },
          },
        }))
        // Only fire unlock toasts the first time a lesson completes
        if (!wasAlreadyDone) {
          const newUnlocks = unlocksFromLesson(lessonId)
          if (newUnlocks.length > 0) {
            set((state) => ({ pendingUnlocks: [...state.pendingUnlocks, ...newUnlocks] }))
          }
        }
        // Sync to backend (fire-and-forget)
        syncLessonComplete(lessonId, score)
      },

      isCompleted: (lessonId) => !!get().completedLessons[lessonId],

      completedIds: () => new Set(Object.keys(get().completedLessons)),

      consumeUnlock: () =>
        set((state) => ({ pendingUnlocks: state.pendingUnlocks.slice(1) })),

      reset: () => set({ completedLessons: {}, pendingUnlocks: [] }),
    }),
    {
      name: 'moniquemusic-lessons',
      // Don't persist pendingUnlocks across page loads — toasts should only fire fresh.
      partialize: (s) => ({ completedLessons: s.completedLessons }),
    },
  ),
)
