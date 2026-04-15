import { useState, useCallback } from 'react'
import { useAudioInit } from '@/hooks/useAudioInit'
import { useAudioStore } from '@/stores/audioStore'

interface ScaleStepAnimationProps {
  /** Scale notes with octave, e.g. ["C4", "D4", "E4", ...] */
  notes: string[]
  /** Step types: W = whole, H = half */
  steps: string[]
  scaleName: string
}

/**
 * Visual animation showing a scale being built step-by-step,
 * with whole/half step indicators between notes.
 */
export default function ScaleStepAnimation({ notes, steps, scaleName }: ScaleStepAnimationProps) {
  const { ensureAudio } = useAudioInit()
  const engine = useAudioStore((s) => s.engine)
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)

  const play = useCallback(async () => {
    await ensureAudio()
    setPlaying(true)
    setCurrentIdx(-1)

    for (let i = 0; i < notes.length; i++) {
      setCurrentIdx(i)
      engine.playNote(notes[i], '4n')
      await new Promise((r) => setTimeout(r, 400))
    }

    setPlaying(false)
  }, [ensureAudio, engine, notes])

  return (
    <div className="bg-surface-50 rounded-xl p-6 space-y-4">
      <div className="text-sm text-surface-500 text-center">
        <strong>{scaleName}</strong> - listen to each step
      </div>

      {/* Notes with step indicators */}
      <div className="flex items-center justify-center flex-wrap gap-0.5">
        {notes.map((note, i) => {
          const isActive = i === currentIdx
          const isPast = i < currentIdx
          const pc = note.replace(/\d/, '')

          return (
            <div key={note + i} className="flex items-center">
              {/* Note bubble */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white scale-110 shadow-lg'
                    : isPast
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-surface-200 text-surface-500'
                }`}
              >
                {pc}
              </div>

              {/* Step indicator between notes */}
              {i < notes.length - 1 && (
                <div className={`mx-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  steps[i] === 'H'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {steps[i]}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs text-surface-400">
        <span className="flex items-center gap-1">
          <span className="w-4 h-3 bg-blue-100 rounded text-[9px] text-blue-600 font-bold text-center">W</span>
          Whole step
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-3 bg-red-100 rounded text-[9px] text-red-600 font-bold text-center">H</span>
          Half step
        </span>
      </div>

      <div className="text-center">
        <button
          onClick={play}
          disabled={playing}
          className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {playing ? 'Playing...' : currentIdx >= 0 ? 'Play Again' : 'Play Scale'}
        </button>
      </div>
    </div>
  )
}
