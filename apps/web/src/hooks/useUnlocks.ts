import { useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useLessonStore } from '@/stores/lessonStore'
import {
  isAdminEmail,
  isFeatureUnlocked,
  TAB_UNLOCKS,
  CHORD_UNLOCKS,
  SCALE_UNLOCKS,
  PROGRESSION_UNLOCKS,
  EAR_TRAINING_UNLOCKS,
} from '@/lib/unlocks'

/** True when the current signed-in user is an admin (everything unlocked). */
export function useIsAdmin(): boolean {
  const email = useAuthStore((s) => s.user?.email)
  return isAdminEmail(email)
}

/** Memoized Set of completed lesson IDs (recomputes when the underlying map changes). */
export function useCompletedSet(): Set<string> {
  const completedLessons = useLessonStore((s) => s.completedLessons)
  return useMemo(() => new Set(Object.keys(completedLessons)), [completedLessons])
}

/** Hook that returns checker functions for each gate kind. */
export function useUnlockChecks() {
  const isAdmin = useIsAdmin()
  const completed = useCompletedSet()

  return useMemo(
    () => ({
      isAdmin,
      route: (path: string) => {
        const gate = TAB_UNLOCKS[path]
        return isFeatureUnlocked(gate?.unlockedBy, completed, isAdmin)
      },
      chord: (chordType: string) =>
        isFeatureUnlocked(CHORD_UNLOCKS[chordType], completed, isAdmin),
      scale: (scaleType: string) =>
        isFeatureUnlocked(SCALE_UNLOCKS[scaleType], completed, isAdmin),
      progression: (presetName: string) =>
        isFeatureUnlocked(PROGRESSION_UNLOCKS[presetName], completed, isAdmin),
      earTraining: (exerciseType: string) =>
        isFeatureUnlocked(EAR_TRAINING_UNLOCKS[exerciseType], completed, isAdmin),
    }),
    [completed, isAdmin],
  )
}
