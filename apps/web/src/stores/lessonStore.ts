import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LessonState {
  completedLessons: Record<string, { score: number; completedAt: string }>
  markComplete: (lessonId: string, score: number) => void
  isCompleted: (lessonId: string) => boolean
  completedIds: () => Set<string>
  reset: () => void
}

export const useLessonStore = create<LessonState>()(
  persist(
    (set, get) => ({
      completedLessons: {},

      markComplete: (lessonId, score) =>
        set((state) => ({
          completedLessons: {
            ...state.completedLessons,
            [lessonId]: { score, completedAt: new Date().toISOString() },
          },
        })),

      isCompleted: (lessonId) => !!get().completedLessons[lessonId],

      completedIds: () => new Set(Object.keys(get().completedLessons)),

      reset: () => set({ completedLessons: {} }),
    }),
    { name: 'melodypath-lessons' },
  ),
)
