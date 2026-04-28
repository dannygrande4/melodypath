import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { BADGES } from '@/lib/badges'

export default function AchievementToast() {
  const pendingBadgeIds = useUserStore((s) => s.pendingBadgeIds)
  const consumeBadge = useUserStore((s) => s.consumeBadge)
  const currentId = pendingBadgeIds[0]
  const badge = currentId ? BADGES.find((b) => b.id === currentId) : null

  useEffect(() => {
    if (!badge) return
    const timer = setTimeout(consumeBadge, 3500)
    return () => clearTimeout(timer)
  }, [badge, consumeBadge])

  if (!badge) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pointer-events-none">
      <div className="relative flex items-center gap-4 px-6 py-4 bg-surface-900 text-white rounded-2xl shadow-2xl border border-accent-500/40 animate-level-up">
        <div className="text-4xl">{badge.icon}</div>
        <div>
          <div className="text-xs font-bold tracking-wider uppercase text-accent-400">Achievement</div>
          <div className="text-lg font-bold">{badge.name}</div>
          <div className="text-sm text-surface-300">{badge.description}</div>
        </div>
      </div>
    </div>
  )
}
