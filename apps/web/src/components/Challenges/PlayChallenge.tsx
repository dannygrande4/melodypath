import { useState, useCallback, useEffect, useRef } from 'react'
import { usePitchListener } from '@/hooks/usePitchListener'
import { useAudioInit } from '@/hooks/useAudioInit'
import { useAudioStore } from '@/stores/audioStore'
import { useUserStore } from '@/stores/userStore'

// ─── Challenge Types ─────────────────────────────────────────────────────────

export type ChallengeType = 'note' | 'sequence' | 'chord'

interface NoteChallenge {
  type: 'note'
  prompt: string        // e.g. "Play an E"
  targetNote: string    // pitch class e.g. "E" (any octave accepted)
  hint?: string
}

interface SequenceChallenge {
  type: 'sequence'
  prompt: string
  targetNotes: string[] // pitch classes in order
  hint?: string
}

interface ChordChallenge {
  type: 'chord'
  prompt: string
  targetNotes: string[] // pitch classes that make up the chord (any order)
  chordName: string
  hint?: string
}

export type Challenge = NoteChallenge | SequenceChallenge | ChordChallenge

interface PlayChallengeProps {
  challenge: Challenge
  onComplete: (correct: boolean) => void
  /** Show "hear it" reference button */
  showReference?: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PlayChallenge({ challenge, onComplete, showReference = true }: PlayChallengeProps) {
  const { ensureAudio } = useAudioInit()
  const engine = useAudioStore((s) => s.engine)
  const { listening, currentPitch, confirmedNote, holdProgress, start, stop } = usePitchListener({ holdTime: 700 })

  const [started, setStarted] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [sequenceProgress, setSequenceProgress] = useState<string[]>([])
  const [chordDetected, setChordDetected] = useState<Set<string>>(new Set())
  const processedRef = useRef(false)

  // ─── Start challenge ────────────────────────────────────────────────

  const handleStart = useCallback(async () => {
    await ensureAudio()
    setStarted(true)
    setResult(null)
    setSequenceProgress([])
    setChordDetected(new Set())
    processedRef.current = false
    await start()
  }, [ensureAudio, start])

  // ─── Play reference sound ──────────────────────────────────────────

  const playReference = useCallback(async () => {
    await ensureAudio()
    if (challenge.type === 'note') {
      engine.playNote(`${challenge.targetNote}4`, '2n')
    } else if (challenge.type === 'sequence') {
      challenge.targetNotes.forEach((note, i) => {
        setTimeout(() => engine.playNote(`${note}4`, '4n'), i * 500)
      })
    } else if (challenge.type === 'chord') {
      engine.playChord(challenge.targetNotes.map((n) => `${n}4`), '2n')
    }
  }, [ensureAudio, engine, challenge])

  // ─── Check answers ─────────────────────────────────────────────────

  useEffect(() => {
    if (!confirmedNote || !started || result || processedRef.current) return

    const detectedPc = confirmedNote.replace(/\d/, '')

    if (challenge.type === 'note') {
      processedRef.current = true
      const correct = detectedPc === challenge.targetNote
      setResult(correct ? 'correct' : 'wrong')
      stop()
      setTimeout(() => onComplete(correct), 1200)
    }

    if (challenge.type === 'sequence') {
      const nextExpected = challenge.targetNotes[sequenceProgress.length]
      if (detectedPc === nextExpected) {
        const newProgress = [...sequenceProgress, detectedPc]
        setSequenceProgress(newProgress)
        if (newProgress.length === challenge.targetNotes.length) {
          processedRef.current = true
          setResult('correct')
          stop()
          setTimeout(() => onComplete(true), 1200)
        }
      } else if (sequenceProgress.length > 0) {
        // Wrong note in sequence — reset
        setSequenceProgress([])
      }
    }

    if (challenge.type === 'chord') {
      const newDetected = new Set(chordDetected)
      newDetected.add(detectedPc)
      setChordDetected(newDetected)

      const allFound = challenge.targetNotes.every((n) => newDetected.has(n))
      if (allFound) {
        processedRef.current = true
        setResult('correct')
        stop()
        setTimeout(() => onComplete(true), 1200)
      }
    }
  }, [confirmedNote]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    return () => stop()
  }, [stop])

  // ─── Render ────────────────────────────────────────────────────────

  const currentPc = currentPitch?.note.replace(/\d/, '') ?? null

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-5">
      {/* Prompt */}
      <div className="text-center">
        <div className="text-sm text-primary-600 font-bold uppercase tracking-wider mb-2">
          {challenge.type === 'note' ? 'Play This Note' :
           challenge.type === 'sequence' ? 'Play These Notes' :
           'Play This Chord'}
        </div>
        <div className="text-2xl font-extrabold text-surface-900">{challenge.prompt}</div>
        {challenge.hint && (
          <div className="text-sm text-surface-400 mt-1">{challenge.hint}</div>
        )}
      </div>

      {/* Target visualization */}
      <div className="flex items-center justify-center gap-2">
        {challenge.type === 'note' && (
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold transition-all ${
            result === 'correct' ? 'bg-timing-perfect text-white scale-110' :
            result === 'wrong' ? 'bg-timing-miss text-white' :
            currentPc === challenge.targetNote ? 'bg-primary-100 text-primary-700 scale-105 ring-4 ring-primary-300' :
            'bg-surface-100 text-surface-700'
          }`}>
            {challenge.targetNote}
          </div>
        )}

        {challenge.type === 'sequence' && challenge.targetNotes.map((note, i) => {
          const completed = i < sequenceProgress.length
          const isCurrent = i === sequenceProgress.length && started
          const isCorrectNote = isCurrent && currentPc === note
          return (
            <div key={i} className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
              completed ? 'bg-timing-perfect text-white' :
              isCorrectNote ? 'bg-primary-100 text-primary-700 scale-105 ring-4 ring-primary-300' :
              isCurrent ? 'bg-primary-50 text-primary-600 animate-pulse' :
              'bg-surface-100 text-surface-500'
            }`}>
              {note}
            </div>
          )
        })}

        {challenge.type === 'chord' && challenge.targetNotes.map((note, i) => {
          const found = chordDetected.has(note)
          return (
            <div key={i} className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
              found ? 'bg-timing-perfect text-white' :
              currentPc === note ? 'bg-primary-100 text-primary-700 ring-4 ring-primary-300' :
              'bg-surface-100 text-surface-500'
            }`}>
              {note}
            </div>
          )
        })}
      </div>

      {/* Hold progress bar */}
      {started && !result && holdProgress > 0 && (
        <div className="w-32 mx-auto bg-surface-100 rounded-full h-1.5">
          <div
            className="bg-primary-500 h-1.5 rounded-full transition-all duration-100"
            style={{ width: `${holdProgress * 100}%` }}
          />
        </div>
      )}

      {/* Current detection display */}
      {started && !result && (
        <div className="text-center">
          <div className="text-sm text-surface-400">Hearing:</div>
          <div className={`text-4xl font-extrabold transition-colors ${
            currentPc ? 'text-surface-900' : 'text-surface-200'
          }`}>
            {currentPc ?? '...'}
          </div>
          {currentPitch && (
            <div className="text-xs text-surface-400 mt-1">
              {currentPitch.frequency.toFixed(0)} Hz
              {Math.abs(currentPitch.cents) > 5 && ` · ${currentPitch.cents > 0 ? '+' : ''}${currentPitch.cents} cents`}
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`text-center p-4 rounded-xl font-bold text-lg ${
          result === 'correct'
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {result === 'correct' ? 'Perfect! 🎉' : `Not quite — that was ${currentPc ?? '?'}`}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!started && (
          <>
            {showReference && (
              <button
                onClick={playReference}
                className="px-5 py-2.5 bg-white border border-surface-200 text-surface-700 font-medium rounded-xl hover:bg-surface-50 transition-colors"
              >
                Hear It First
              </button>
            )}
            <button
              onClick={handleStart}
              className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Start Listening
            </button>
          </>
        )}
        {started && !result && (
          <div className="text-sm text-surface-400 animate-pulse">
            🎤 Listening — play the {challenge.type === 'chord' ? 'chord' : 'note'} on your instrument...
          </div>
        )}
      </div>
    </div>
  )
}
