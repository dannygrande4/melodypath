import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { useLessonStore } from '@/stores/lessonStore'
import { LESSONS } from '@/lib/lessons/lessonData'
import { BADGES } from '@/lib/badges'
import { ADMIN_LOCAL_KEY, isAdminEmailExact } from '@/lib/unlocks'

/**
 * When an admin email is signed in, force-fill the local stores with the
 * "fully unlocked" admin profile: every lesson complete, every badge earned,
 * max XP/level, and the sticky admin flag set so all gates pass even after
 * sign-out. Re-runs on every auth change so a fresh login or cleared
 * localStorage snaps back to a maxed state.
 *
 * Gate-only checks (chord/scale/route etc.) already short-circuit on admin
 * via `isAdminEmail` — this hook is what makes the *visible* progress
 * (level number, badges, completed checkmarks) match.
 */
export function useAdminSync() {
  const email = useAuthStore((s) => s.user?.email ?? null)

  useEffect(() => {
    if (!isAdminEmailExact(email)) return

    try { localStorage.setItem(ADMIN_LOCAL_KEY, 'true') } catch { /* ignore */ }

    const now = new Date().toISOString()
    const completedLessons: Record<string, { score: number; completedAt: string }> = {}
    for (const l of LESSONS) completedLessons[l.id] = { score: 100, completedAt: now }
    useLessonStore.setState({ completedLessons, pendingUnlocks: [] })

    useUserStore.setState({
      xp: 1_000_000,
      level: 100,
      earnedBadgeIds: BADGES.map((b) => b.id),
      pendingBadgeIds: [],
      pendingLevelUp: null,
    })
  }, [email])
}
