import { useState, useCallback, useRef, useEffect } from 'react'
import { PitchDetector } from '@moniquemusic/audio-engine'
import { useAudioInit } from '@/hooks/useAudioInit'
import { useAudioStore } from '@/stores/audioStore'
import type { PitchResult } from '@moniquemusic/shared-types'

interface SingingExerciseProps {
  /** Target notes to sing, e.g. ["C4", "E4", "G4"] */
  targetNotes: string[]
  onComplete?: (accuracy: number) => void
}

export default function SingingExercise({ targetNotes, onComplete }: SingingExerciseProps) {
  const { ensureAudio } = useAudioInit()
  const engine = useAudioStore((s) => s.engine)

  const [listening, setListening] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [pitch, setPitch] = useState<PitchResult | null>(null)
  const [matchedNotes, setMatchedNotes] = useState<boolean[]>([])
  const [done, setDone] = useState(false)

  const detectorRef = useRef<PitchDetector | null>(null)
  const matchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const targetNote = targetNotes[currentIdx]

  // Play the target note so the user knows what to sing
  const playTarget = useCallback(async () => {
    await ensureAudio()
    if (targetNote) engine.playNote(targetNote, '2n')
  }, [ensureAudio, engine, targetNote])

  const startListening = useCallback(async () => {
    const detector = new PitchDetector()
    detectorRef.current = detector
    setListening(true)
    setCurrentIdx(0)
    setMatchedNotes([])
    setDone(false)

    await detector.start((result) => setPitch(result))
  }, [])

  const stopListening = useCallback(() => {
    detectorRef.current?.stop()
    detectorRef.current = null
    setListening(false)
    setPitch(null)
  }, [])

  // Check if current pitch matches target
  useEffect(() => {
    if (!listening || !pitch || done) return

    const target = targetNotes[currentIdx]
    if (!target) return

    const targetPc = target.replace(/\d/, '')
    const detectedPc = pitch.note.replace(/\d/, '')

    if (targetPc === detectedPc && pitch.confidence > 0.7) {
      // Hold for 500ms to confirm
      if (!matchTimerRef.current) {
        matchTimerRef.current = setTimeout(() => {
          setMatchedNotes((prev) => [...prev, true])

          if (currentIdx >= targetNotes.length - 1) {
            setDone(true)
            stopListening()
            const accuracy = 1.0 // All matched
            onComplete?.(accuracy)
          } else {
            setCurrentIdx((i) => i + 1)
          }
          matchTimerRef.current = null
        }, 500)
      }
    } else {
      if (matchTimerRef.current) {
        clearTimeout(matchTimerRef.current)
        matchTimerRef.current = null
      }
    }
  }, [pitch, listening, currentIdx, targetNotes, done, stopListening, onComplete])

  // Cleanup
  useEffect(() => {
    return () => {
      detectorRef.current?.stop()
      if (matchTimerRef.current) clearTimeout(matchTimerRef.current)
    }
  }, [])

  const detectedPc = pitch?.note.replace(/\d/, '') ?? ''
  const targetPc = targetNote?.replace(/\d/, '') ?? ''
  const isMatching = detectedPc === targetPc && (pitch?.confidence ?? 0) > 0.7

  return (
    <div className="bg-surface-50 rounded-xl p-6 space-y-5">
      <div className="text-sm text-surface-500 text-center">
        Sing each note - hold it steady for half a second to confirm
      </div>

      {/* Note targets */}
      <div className="flex items-center justify-center gap-3">
        {targetNotes.map((note, i) => {
          const matched = i < matchedNotes.length
          const isCurrent = i === currentIdx && listening && !done
          const pc = note.replace(/\d/, '')

          return (
            <div
              key={note + i}
              className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-lg font-bold transition-all ${
                matched
                  ? 'bg-timing-perfect text-white scale-105'
                  : isCurrent
                    ? isMatching
                      ? 'bg-timing-good text-white scale-110 shadow-lg'
                      : 'bg-primary-500 text-white animate-pulse'
                    : 'bg-surface-200 text-surface-500'
              }`}
            >
              {pc}
              <span className="text-[9px] font-normal opacity-70">{note.match(/\d/)?.[0]}</span>
            </div>
          )
        })}
      </div>

      {/* Current detection */}
      {listening && !done && (
        <div className="text-center">
          <div className="text-sm text-surface-400 mb-1">You're singing:</div>
          <div className={`text-4xl font-extrabold transition-colors ${
            isMatching ? 'text-timing-perfect' : pitch ? 'text-timing-miss' : 'text-surface-300'
          }`}>
            {pitch ? pitch.note.replace(/\d/, '') : '...'}
          </div>
          {pitch && (
            <div className="text-xs text-surface-400 mt-1">
              {pitch.frequency.toFixed(0)} Hz · {Math.abs(pitch.cents) < 10 ? 'In tune' : `${pitch.cents > 0 ? '+' : ''}${pitch.cents} cents`}
            </div>
          )}
        </div>
      )}

      {/* Done */}
      {done && (
        <div className="text-center p-4 bg-green-50 rounded-lg text-green-800 font-medium">
          Perfect! You sang all {targetNotes.length} notes correctly!
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        {!listening && !done && (
          <>
            <button
              onClick={playTarget}
              className="px-5 py-2.5 bg-white border border-surface-200 text-surface-700 font-medium rounded-lg hover:bg-surface-50"
            >
              Hear Target Note
            </button>
            <button
              onClick={startListening}
              className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700"
            >
              Start Singing
            </button>
          </>
        )}
        {listening && (
          <button
            onClick={stopListening}
            className="px-5 py-2.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
          >
            Stop
          </button>
        )}
        {done && (
          <button
            onClick={() => { setDone(false); setMatchedNotes([]); setCurrentIdx(0) }}
            className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
