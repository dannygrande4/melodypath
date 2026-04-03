import { useState, useCallback, useMemo } from 'react'
import { useAudioInit } from '@/hooks/useAudioInit'
import { useAudioStore } from '@/stores/audioStore'
import { useUserStore } from '@/stores/userStore'
import { transposeNote, getChordNotes } from '@melodypath/music-theory'
import InfoTooltip from '@/components/ui/InfoTooltip'
import { useEarTrainingStore } from '@/stores/earTrainingStore'

// ─── Exercise types ──────────────────────────────────────────────────────────

type ExerciseType = 'intervals' | 'chords' | 'melody' | 'rhythm'

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
  const { recordAnswer, getDifficulty } = useEarTrainingStore()

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

  // ─── Melody dictation ────────────────────────────────────────────────

  const [melodyNotes, setMelodyNotes] = useState<string[]>([])
  const [melodyAnswer, setMelodyAnswer] = useState<string[]>([])
  const [melodyTarget, setMelodyTarget] = useState<string[]>([])

  const MELODY_NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']

  const generateMelody = useCallback(async () => {
    await ensureAudio()
    const len = 4
    const melody: string[] = []
    for (let i = 0; i < len; i++) {
      melody.push(randomFrom(MELODY_NOTES))
    }

    setMelodyTarget(melody)
    setMelodyAnswer([])
    setFeedback(null)

    const playFn = () => {
      melody.forEach((note, i) => {
        setTimeout(() => engine.playNote(note, '4n'), i * 500)
      })
    }

    setCurrentQ({ answer: melody.join(' '), playFn })
    playFn()
  }, [ensureAudio, engine])

  const handleMelodyNote = useCallback((note: string) => {
    engine.playNote(note, '8n')
    setMelodyAnswer((prev) => {
      const next = [...prev, note]
      if (next.length === melodyTarget.length) {
        const correct = next.every((n, i) => n === melodyTarget[i])
        setFeedback({ correct, answer: melodyTarget.join(' → ') })
        setScore((s) => ({
          correct: s.correct + (correct ? 1 : 0),
          total: s.total + 1,
        }))
        if (correct) addXP(10)
      }
      return next
    })
  }, [engine, melodyTarget, addXP])

  // ─── Rhythm tapping ─────────────────────────────────────────────────

  const [rhythmPattern, setRhythmPattern] = useState<number[]>([])
  const [rhythmTaps, setRhythmTaps] = useState<number[]>([])
  const [rhythmStartTime, setRhythmStartTime] = useState(0)
  const [rhythmPlaying, setRhythmPlaying] = useState(false)

  const generateRhythm = useCallback(async () => {
    await ensureAudio()
    // Generate a 4-beat pattern with some syncopation
    const bpm = 100
    const beatMs = (60 / bpm) * 1000
    const patterns = [
      [0, 1, 2, 3],                    // straight quarter notes
      [0, 1, 2, 3],
      [0, 0.5, 1, 2, 3],              // with an eighth note
      [0, 1, 1.5, 2, 3],
      [0, 0.5, 1, 1.5, 2, 3],
    ]
    const pattern = randomFrom(patterns).map((b) => b * beatMs)

    setRhythmPattern(pattern)
    setRhythmTaps([])
    setRhythmPlaying(false)
    setFeedback(null)

    const playFn = () => {
      pattern.forEach((time) => {
        setTimeout(() => engine.playNote('C5', '16n'), time)
      })
    }

    setCurrentQ({ answer: `${pattern.length} beats`, playFn })
    playFn()
  }, [ensureAudio, engine])

  const startRhythmTapping = useCallback(() => {
    setRhythmTaps([])
    setRhythmStartTime(Date.now())
    setRhythmPlaying(true)

    // Auto-stop after pattern duration + buffer
    const duration = Math.max(...rhythmPattern) + 2000
    setTimeout(() => {
      setRhythmPlaying(false)
      // Check will happen on stop
    }, duration)
  }, [rhythmPattern])

  const handleRhythmTap = useCallback(() => {
    if (!rhythmPlaying) return
    engine.playNote('C5', '16n')
    const tapTime = Date.now() - rhythmStartTime
    setRhythmTaps((prev) => {
      const next = [...prev, tapTime]
      if (next.length === rhythmPattern.length) {
        // Check accuracy: each tap should be within 150ms of the pattern beat
        const tolerance = 150
        const allClose = next.every((tap, i) => Math.abs(tap - rhythmPattern[i]) < tolerance)
        setFeedback({ correct: allClose, answer: allClose ? 'Great rhythm!' : 'Try to match the beat pattern' })
        setScore((s) => ({
          correct: s.correct + (allClose ? 1 : 0),
          total: s.total + 1,
        }))
        if (allClose) addXP(10)
        setRhythmPlaying(false)
      }
      return next
    })
  }, [rhythmPlaying, rhythmStartTime, rhythmPattern, engine, addXP])

  const generateNew = useCallback(() => {
    if (exerciseType === 'intervals') generateInterval()
    else if (exerciseType === 'chords') generateChord()
    else if (exerciseType === 'melody') generateMelody()
    else if (exerciseType === 'rhythm') generateRhythm()
  }, [exerciseType, generateInterval, generateChord, generateMelody, generateRhythm])

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
      if (correct) addXP(5)

      // Track for adaptive difficulty
      if (exerciseType === 'intervals') {
        recordAnswer('interval', currentQ.answer, correct)
      } else if (exerciseType === 'chords') {
        recordAnswer('chord', currentQ.answer, correct)
      }
    },
    [currentQ, addXP, exerciseType, recordAnswer],
  )

  const replay = useCallback(() => {
    currentQ?.playFn()
  }, [currentQ])

  // ─── Options for current exercise ──────────────────────────────────────

  const options = useMemo(() => {
    if (exerciseType === 'intervals') return INTERVALS.map((i) => i.name)
    if (exerciseType === 'chords') return CHORD_TYPES.map((c) => c.name)
    return [] // melody and rhythm have custom UI
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
      <div className="flex items-center gap-3">
        <div className="flex bg-surface-100 rounded-lg p-1">
        {(['intervals', 'chords', 'melody', 'rhythm'] as const).map((type) => (
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
        <InfoTooltip
          size="md"
          text={
            exerciseType === 'intervals'
              ? 'An interval is the distance between two notes. We\'ll play two notes — listen to the gap between them and pick the right name.'
              : exerciseType === 'chords'
                ? 'We\'ll play a chord (multiple notes at once). Listen to its overall mood: Major = happy/bright, Minor = sad/dark, Dim = tense, Aug = mysterious.'
                : exerciseType === 'melody'
                  ? 'We\'ll play a 4-note melody. Listen carefully, then click the piano keys to recreate it note by note. +10 XP for a perfect match!'
                  : 'We\'ll play a rhythm pattern. Listen, then tap the spacebar (or the Tap button) to reproduce the same rhythm. +10 XP for accurate timing!'
          }
        />
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
        {(exerciseType === 'intervals' || exerciseType === 'chords') && (
          <div className={`text-xs font-bold px-2 py-1 rounded ${
            getDifficulty(exerciseType === 'intervals' ? 'interval' : 'chord') === 'hard'
              ? 'bg-red-100 text-red-700'
              : getDifficulty(exerciseType === 'intervals' ? 'interval' : 'chord') === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
          }`}>
            {getDifficulty(exerciseType === 'intervals' ? 'interval' : 'chord')}
          </div>
        )}
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

      {/* Answer options — interval / chord mode */}
      {currentQ && !feedback && (exerciseType === 'intervals' || exerciseType === 'chords') && (
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

      {/* Melody dictation UI */}
      {currentQ && !feedback && exerciseType === 'melody' && (
        <div>
          <h2 className="text-sm font-semibold text-surface-500 mb-3">
            Recreate the melody — click the notes in order ({melodyAnswer.length}/{melodyTarget.length})
          </h2>
          {/* Progress */}
          <div className="flex gap-1 mb-4">
            {melodyTarget.map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  i < melodyAnswer.length
                    ? melodyAnswer[i] === melodyTarget[i]
                      ? 'bg-timing-perfect text-white'
                      : 'bg-timing-miss text-white'
                    : 'bg-surface-100 text-surface-400'
                }`}
              >
                {i < melodyAnswer.length ? melodyAnswer[i].replace(/\d/, '') : '?'}
              </div>
            ))}
          </div>
          {/* Note buttons */}
          <div className="flex gap-2 flex-wrap">
            {MELODY_NOTES.map((note) => (
              <button
                key={note}
                onClick={() => handleMelodyNote(note)}
                className="w-12 h-12 bg-white border border-surface-200 rounded-xl text-sm font-bold text-surface-700 hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                {note.replace(/\d/, '')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rhythm tapping UI */}
      {currentQ && exerciseType === 'rhythm' && (
        <div className="text-center space-y-4">
          <h2 className="text-sm font-semibold text-surface-500">
            {rhythmPlaying
              ? `Tap! (${rhythmTaps.length}/${rhythmPattern.length})`
              : feedback
                ? ''
                : 'Press "Tap Along" then tap the rhythm'}
          </h2>

          {/* Visual beat indicators */}
          <div className="flex justify-center gap-2">
            {rhythmPattern.map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all ${
                  i < rhythmTaps.length
                    ? 'bg-primary-500 border-primary-500 text-white scale-110'
                    : 'border-surface-200 text-surface-400'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {!feedback && (
            <div className="flex gap-3 justify-center">
              {!rhythmPlaying ? (
                <button
                  onClick={startRhythmTapping}
                  className="px-8 py-4 bg-accent-500 text-white font-bold text-lg rounded-xl hover:bg-accent-600 transition-colors"
                >
                  Tap Along
                </button>
              ) : (
                <button
                  onClick={handleRhythmTap}
                  onKeyDown={(e) => { if (e.code === 'Space') { e.preventDefault(); handleRhythmTap() } }}
                  className="px-12 py-6 bg-primary-600 text-white font-bold text-xl rounded-2xl hover:bg-primary-700 active:scale-95 transition-all"
                  autoFocus
                >
                  TAP
                </button>
              )}
            </div>
          )}
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
