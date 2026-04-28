import { useEffect } from 'react'
import { useLessonStore } from '@/stores/lessonStore'

const KIND_LABELS: Record<string, string> = {
  tab: 'New section unlocked',
  chord: 'New chord unlocked',
  scale: 'New scale unlocked',
  progression: 'New progression unlocked',
  'ear-training': 'New ear-training mode unlocked',
}

export default function UnlockOverlay() {
  const pendingUnlocks = useLessonStore((s) => s.pendingUnlocks)
  const consumeUnlock = useLessonStore((s) => s.consumeUnlock)
  const current = pendingUnlocks[0]

  useEffect(() => {
    if (!current) return
    const timer = setTimeout(consumeUnlock, 2800)
    return () => clearTimeout(timer)
  }, [current, consumeUnlock])

  if (!current) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/30 animate-[fadeIn_0.2s_ease-out]" />
      <div className="relative flex flex-col items-center gap-3 animate-level-up">
        <div className="text-5xl">🆕</div>
        <div className="text-white text-xs font-bold tracking-wider uppercase">
          {KIND_LABELS[current.kind] ?? 'Unlocked'}
        </div>
        <div className="text-4xl font-extrabold text-accent-500 drop-shadow-lg capitalize">
          {current.label}
        </div>
      </div>
    </div>
  )
}
