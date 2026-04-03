import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'

export default function LevelUpOverlay() {
  const { pendingLevelUp, clearLevelUp } = useUserStore()

  useEffect(() => {
    if (pendingLevelUp) {
      const timer = setTimeout(clearLevelUp, 3000)
      return () => clearTimeout(timer)
    }
  }, [pendingLevelUp, clearLevelUp])

  if (!pendingLevelUp) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 animate-[fadeIn_0.2s_ease-out]" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-4 animate-level-up">
        <div className="text-6xl">🎵</div>
        <div className="text-white text-xl font-bold tracking-wider uppercase">Level Up!</div>
        <div className="text-7xl font-extrabold text-accent-500 drop-shadow-lg">
          {pendingLevelUp.newLevel}
        </div>
        <div className="text-white/60 text-sm">Keep going — you're doing great!</div>
      </div>
    </div>
  )
}
