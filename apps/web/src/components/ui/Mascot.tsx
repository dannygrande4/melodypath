import { useState, useEffect } from 'react'
import { getRandomMascotMessage, type MASCOT_MESSAGES } from '@/lib/kidsMode'
import { useUIStore } from '@/stores/uiStore'

interface MascotProps {
  /** Message category to pull from */
  category?: keyof typeof MASCOT_MESSAGES
  /** Or a specific message */
  message?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

export default function Mascot({ category = 'welcome', message, size = 'md' }: MascotProps) {
  const ageMode = useUIStore((s) => s.ageMode)
  const [displayMsg, setDisplayMsg] = useState(message ?? '')

  useEffect(() => {
    if (!message) {
      setDisplayMsg(getRandomMascotMessage(category))
    }
  }, [category, message])

  // Only show in kids mode
  if (ageMode !== 'kids') return null

  const sizes = {
    sm: { icon: 'text-3xl', bubble: 'text-xs p-2', container: 'gap-2' },
    md: { icon: 'text-5xl', bubble: 'text-sm p-3', container: 'gap-3' },
    lg: { icon: 'text-6xl', bubble: 'text-base p-4', container: 'gap-4' },
  }

  const s = sizes[size]

  return (
    <div className={`flex items-start ${s.container}`}>
      {/* Mascot character — a friendly music note */}
      <div className={`flex-shrink-0 ${s.icon}`}>
        <div className="animate-bounce" style={{ animationDuration: '2s' }}>
          🎵
        </div>
      </div>

      {/* Speech bubble */}
      <div className={`relative bg-kids-blue/10 border-2 border-kids-blue/30 rounded-2xl ${s.bubble} max-w-sm`}>
        {/* Triangle pointer */}
        <div className="absolute left-0 top-4 -translate-x-2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-kids-blue/30" />
        <p className="text-surface-800 font-medium leading-relaxed">{displayMsg}</p>
      </div>
    </div>
  )
}
