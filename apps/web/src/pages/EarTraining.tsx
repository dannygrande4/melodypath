import { useState, useCallback, useMemo } from 'react'
import { useAudioInit } from '@/hooks/useAudioInit'
import { useAudioStore } from '@/stores/audioStore'
import { useUserStore } from '@/stores/userStore'
import { transposeNote, getChordNotes } from '@melodypath/music-theory'

// ─── Exercise types ──────────────────────────────────────────────────────────

type ExerciseType = 'intervals' | 'chords'

const INTERVALS = [
  { name: 'Minor 2nd', short: 'm2', interval: '2m' },
  { name: 'Major 2nd', short: 'M2', interval: '2M' },
  { name: 'Minor 3rd', short: 'm3', interval: '3m' },
  { name: 'Major 3rd', short: 'M3', interval: '3M' },
  { name: 'Perfect 4th', short: 'P4', interval: '4P' },
  { name: 'Tritone', short: 'TT', interval: '4A' },
  { name: 'Perfect 5th', short: 'P5', interval: '5P' },
  { name: 'Minor 6th', short: 'm6', interval: '6m' },
  { name: 'Major 6th', short: 'M6', interval: '6M' },
  { name: 'Minor 7th', short: 'm7', interval: '7m' },
  { name: 'Major 7th', short: 'M7', interval: '7M' },
  { name: 'Octave', short: 'P8', interval: '8P' },
]

const CHORD_TYPES = [
  { name: 'Major', type: 'major' },
  { name: 'Minor', type: 'minor' },
  { name: 'Diminished', type: 'dim' },
  { name: 'Augmented', type: 'aug' },
  { name: 'Dominant 7th', type: '7' },
]

const ROOT_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

// ─── Random helpers ──────────────────────────────────────────────────────────

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomOctave(): number {
  return 3 + Math.floor(Math.random() * 2) // 3 or 4
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EarTraining() {
  const { ensureAudio } = useAudioInit()
  const engine = useAudioStore((s) => s.engine)
  const addXP = useUserStore((s) => s.addXP)

  const [exerciseType, setExerciseType] = useState<ExerciseType>('intervals')
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string } | null>(null)
  const [currentQ, setCurrentQ] = useState<{
    answer: string
    playFn: () => void
  } | null>(null)

  // ─── Generate a new question ────────────────────────────────────────────

  const generateInterval = useCallback(async () => {
    await ensureAudio()
    const iv = randomFrom(INTERVALS)
    const rootNote = `${randomFrom(ROOT_NOTES)}${randomOctave()}`
    const secondNote = transposeNote(rootNote, iv.interval)

    if (!secondNote) return

    const playFn = () => {
      engine.playNote(rootNote, '4n')
      setTimeout(() => engine.playNote(secondNote, '4n'), 600)
    }

    setCurrentQ({ answer: iv.name, playFn })
    setFeedback(null)
    playFn()
  }, [ensureAudio, engine])

  const generateChord = useCallback(async () => {
    await ensureAudio()
    const ct = randomFrom(CHORD_TYPES)
    const rootName = randomFrom(ROOT_NOTES)
    const notes = getChordNotes(rootName, ct.type, randomOctave())

    if (notes.length === 0) return

    const playFn = () => {
      engine.playChord(notes, '2n')
    }

    setCurrentQ({ answer: ct.name, playFn })
    setFeedback(null)
    playFn()
  }, [ensureAudio, engine])

  const generateNew = useCallback(() => {
    if (exerciseType === 'intervals') generateInterval()
    else generateChord()
  }, [exerciseType, generateInterval, generateChord])

  // ─── Answer check ───────────────────────────────────────────────────────

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!currentQ) return
      const correct = answer === currentQ.answer
      setFeedback({ correct, answer: currentQ.answer })
      setScore((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1,
      }))
      if (correct) {
        addXP(5)
      }
    },
    [currentQ, addXP],
  )

  const replay = useCallback(() => {
    currentQ?.playFn()
  }, [currentQ])

  // ─── Options for current exercise ──────────────────────────────────────

  const options = useMemo(() => {
    if (exerciseType === 'intervals') return INTERVALS.map((i) => i.name)
    return CHORD_TYPES.map((c) => c.name)
  }, [exerciseType])

  const accuracy =
    score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Ear Training</h1>
        <p className="text-surface-500 text-sm mt-1">
          Listen, then identify what you hear. +5 XP per correct answer.
        </p>
      </div>

      {/* Exercise type toggle */}
      <div className="flex bg-surface-100 rounded-lg p-1 w-fit">
        {(['intervals', 'chords'] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              setExerciseType(type)
              setCurrentQ(null)
              setFeedback(null)
              setScore({ correct: 0, total: 0 })
            }}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
              exerciseType === type
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-500'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Score bar */}
      <div className="flex items-center gap-6 bg-white rounded-xl border border-surface-200 p-4">
        <div>
          <span className="text-2xl font-bold text-surface-900">{score.correct}</span>
          <span className="text-surface-400 text-sm"> / {score.total}</span>
        </div>
        <div className="flex-1">
          <div className="w-full bg-surface-100 rounded-full h-2">
            <div
              className="bg-timing-perfect h-2 rounded-full transition-all"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>
        <div className="text-sm font-bold text-surface-600">{accuracy}%</div>
      </div>

      {/* Play / New buttons */}
      <div className="flex gap-3">
        <button
          onClick={generateNew}
          className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
        >
          {currentQ ? 'Next Question' : 'Start'}
        </button>
        {currentQ && (
          <button
            onClick={replay}
            className="px-6 py-3 bg-white border border-surface-200 text-surface-700 font-medium rounded-xl hover:bg-surface-50 transition-colors"
          >
            Replay
          </button>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`rounded-xl p-4 font-medium ${
            feedback.correct
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.correct ? (
            <span>Correct! +5 XP</span>
          ) : (
            <span>
              Not quite — the answer was <strong>{feedback.answer}</strong>
            </span>
          )}
        </div>
      )}

      {/* Answer options */}
      {currentQ && !feedback && (
        <div>
          <h2 className="text-sm font-semibold text-surface-500 mb-3">What do you hear?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="px-4 py-3 bg-white border border-surface-200 rounded-xl text-sm font-medium text-surface-700 hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Not started state */}
      {!currentQ && score.total === 0 && (
        <div className="rounded-xl border-2 border-dashed border-surface-200 p-12 text-center text-surface-400">
          <div className="text-4xl mb-3">👂</div>
          Press <strong>Start</strong> to begin. We'll play a sound and you pick the right answer.
        </div>
      )}
    </div>
  )
}
