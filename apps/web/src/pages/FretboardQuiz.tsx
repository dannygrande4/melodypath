import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAudioInit } from '@/hooks/useAudioInit'
import { useAudioStore } from '@/stores/audioStore'
import GuitarFretboard, {
  noteAtFret,
  NOTE_NAMES,
  STANDARD_TUNING,
} from '@/components/Guitar/GuitarFretboard'
import type { FretNote } from '@/components/Guitar/GuitarFretboard'

type Mode = 'any' | 'string' | 'reverse'

// String 1 = high E, String 6 = low E (matches GuitarFretboard convention)
const STRINGS: { value: number; label: string; short: string }[] = [
  { value: 6, label: 'Low E (6th)', short: 'low E' },
  { value: 5, label: 'A (5th)', short: 'A' },
  { value: 4, label: 'D (4th)', short: 'D' },
  { value: 3, label: 'G (3rd)', short: 'G' },
  { value: 2, label: 'B (2nd)', short: 'B' },
  { value: 1, label: 'High E (1st)', short: 'high E' },
]

const QUIZ_FRETS = 12

interface Question {
  note: string
  hilite?: { string: number; fret: number }
  options?: string[]
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pitchClass(note: string): string {
  return note.replace(/-?\d+$/, '')
}

function newQuestion(mode: Mode): Question {
  if (mode === 'reverse') {
    const string = Math.floor(Math.random() * 6) + 1
    const fret = Math.floor(Math.random() * QUIZ_FRETS) + 1
    const stringIdx = 6 - string
    const fullNote = noteAtFret(STANDARD_TUNING[stringIdx], fret)
    const correct = pitchClass(fullNote)
    const distractors: string[] = []
    while (distractors.length < 3) {
      const candidate = pickRandom(NOTE_NAMES)
      if (candidate !== correct && !distractors.includes(candidate)) distractors.push(candidate)
    }
    const options = [...distractors, correct].sort(() => Math.random() - 0.5)
    return { note: correct, hilite: { string, fret }, options }
  }
  return { note: pickRandom(NOTE_NAMES) }
}

type FeedbackKind = 'correct' | 'wrong' | 'wrongString'

export default function FretboardQuiz() {
  const { ensureAudio } = useAudioInit()
  const engine = useAudioStore((s) => s.engine)
  const setInstrument = useAudioStore((s) => s.setInstrument)
  const currentInstrument = useAudioStore((s) => s.instrument)

  const [mode, setMode] = useState<Mode>('any')
  const [targetString, setTargetString] = useState<number>(6)
  const [question, setQuestion] = useState<Question>(() => newQuestion('any'))
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [total, setTotal] = useState(0)
  const [feedback, setFeedback] = useState<{ kind: FeedbackKind; message: string } | null>(null)

  const advance = useCallback(() => {
    setFeedback(null)
    setQuestion(newQuestion(mode))
  }, [mode])

  const switchMode = useCallback((m: Mode) => {
    setMode(m)
    setFeedback(null)
    setQuestion(newQuestion(m))
  }, [])

  const reset = useCallback(() => {
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setTotal(0)
    setFeedback(null)
    setQuestion(newQuestion(mode))
  }, [mode])

  const playNote = useCallback(async (note: string) => {
    await ensureAudio()
    if (currentInstrument !== 'guitar') setInstrument('guitar')
    engine.playNote(note, '4n')
  }, [currentInstrument, engine, ensureAudio, setInstrument])

  const recordCorrect = useCallback(() => {
    setScore((s) => s + 1)
    setTotal((t) => t + 1)
    setStreak((s) => {
      const next = s + 1
      setBestStreak((b) => Math.max(b, next))
      return next
    })
  }, [])

  const recordWrong = useCallback(() => {
    setTotal((t) => t + 1)
    setStreak(0)
  }, [])

  const handleFretboardClick = useCallback(
    async (note: string, position?: { string: number; fret: number }) => {
      if (feedback || mode === 'reverse') return
      await playNote(note)

      if (mode === 'string' && position && position.string !== targetString) {
        const target = STRINGS.find((s) => s.value === targetString)
        setFeedback({ kind: 'wrongString', message: `That's the wrong string — try the ${target?.short} string` })
        window.setTimeout(() => setFeedback(null), 1100)
        return
      }

      const pc = pitchClass(note)
      if (pc === question.note) {
        recordCorrect()
        setFeedback({ kind: 'correct', message: '✓ Correct!' })
        window.setTimeout(advance, 700)
      } else {
        recordWrong()
        setFeedback({ kind: 'wrong', message: `✗ That's ${pc}. Looking for ${question.note}` })
        window.setTimeout(advance, 1500)
      }
    },
    [advance, feedback, mode, playNote, question.note, recordCorrect, recordWrong, targetString],
  )

  const handleReverseAnswer = useCallback(
    async (option: string) => {
      if (feedback || !question.hilite) return
      const stringIdx = 6 - question.hilite.string
      const fullNote = noteAtFret(STANDARD_TUNING[stringIdx], question.hilite.fret)
      await playNote(fullNote)

      if (option === question.note) {
        recordCorrect()
        setFeedback({ kind: 'correct', message: '✓ Correct!' })
        window.setTimeout(advance, 700)
      } else {
        recordWrong()
        setFeedback({ kind: 'wrong', message: `✗ That note is ${question.note}` })
        window.setTimeout(advance, 1500)
      }
    },
    [advance, feedback, playNote, question, recordCorrect, recordWrong],
  )

  const reverseHilite: FretNote[] = useMemo(() => {
    if (mode !== 'reverse' || !question.hilite) return []
    const stringIdx = 6 - question.hilite.string
    const fullNote = noteAtFret(STANDARD_TUNING[stringIdx], question.hilite.fret)
    return [{ note: '?', fullNote, string: question.hilite.string, fret: question.hilite.fret, role: 'root' }]
  }, [mode, question])

  const accuracy = total === 0 ? 0 : Math.round((score / total) * 100)
  const targetStringMeta = STRINGS.find((s) => s.value === targetString)

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <Link to="/practice" className="text-sm text-surface-500 hover:text-surface-700">← Back to Practice</Link>
          <h1 className="text-2xl font-bold text-surface-900 mt-1">Fretboard Quiz</h1>
          <p className="text-surface-500 text-sm">Train your knowledge of every note on the guitar.</p>
        </div>
        <button
          onClick={reset}
          className="px-3 py-1.5 text-sm rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50"
        >
          Reset stats
        </button>
      </div>

      {/* Mode tabs */}
      <div className="grid grid-cols-3 bg-surface-100 rounded-xl p-1 max-w-2xl">
        {(
          [
            { v: 'any' as const, label: 'Any String', desc: 'Find the note anywhere' },
            { v: 'string' as const, label: 'Single String', desc: 'Drill one string at a time' },
            { v: 'reverse' as const, label: 'Name That Fret', desc: 'Identify the highlighted note' },
          ]
        ).map((t) => (
          <button
            key={t.v}
            onClick={() => switchMode(t.v)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === t.v ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500'
            }`}
          >
            <div>{t.label}</div>
            <div className="text-[10px] text-surface-400 font-normal mt-0.5">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Single-string string picker */}
      {mode === 'string' && (
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <div className="text-xs text-surface-500 mb-2 font-medium">Pick a string to practice</div>
          <div className="flex flex-wrap gap-2">
            {STRINGS.map((s) => (
              <button
                key={s.value}
                onClick={() => setTargetString(s.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                  targetString === s.value
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Score panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-surface-200 p-3 text-center">
          <div className="text-xs text-surface-500 font-medium">Score</div>
          <div className="text-2xl font-extrabold text-surface-900">
            {score}
            <span className="text-surface-300 text-base font-normal">/{total}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-3 text-center">
          <div className="text-xs text-surface-500 font-medium">Accuracy</div>
          <div className="text-2xl font-extrabold text-surface-900">{accuracy}%</div>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-3 text-center">
          <div className="text-xs text-surface-500 font-medium">Streak</div>
          <div className="text-2xl font-extrabold text-primary-600">🔥 {streak}</div>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-3 text-center">
          <div className="text-xs text-surface-500 font-medium">Best</div>
          <div className="text-2xl font-extrabold text-accent-500">{bestStreak}</div>
        </div>
      </div>

      {/* Prompt */}
      <div
        className={`rounded-2xl p-6 text-center transition-colors min-h-[140px] flex flex-col items-center justify-center ${
          feedback?.kind === 'correct'
            ? 'bg-green-50 border border-green-200'
            : feedback?.kind === 'wrong'
            ? 'bg-red-50 border border-red-200'
            : feedback?.kind === 'wrongString'
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-white border border-surface-200'
        }`}
      >
        {feedback ? (
          <div
            className={`text-2xl font-bold ${
              feedback.kind === 'correct'
                ? 'text-green-700'
                : feedback.kind === 'wrong'
                ? 'text-red-700'
                : 'text-yellow-700'
            }`}
          >
            {feedback.message}
          </div>
        ) : mode === 'reverse' ? (
          <>
            <div className="text-sm text-surface-500 mb-1">What note is highlighted on the fretboard?</div>
            <div className="text-xs text-surface-400">Pick from the buttons below</div>
          </>
        ) : mode === 'string' ? (
          <>
            <div className="text-sm text-surface-500 mb-1">
              Find this note on the <span className="font-semibold text-surface-700">{targetStringMeta?.label}</span> string
            </div>
            <div className="text-6xl font-extrabold text-surface-900 tracking-tight">{question.note}</div>
          </>
        ) : (
          <>
            <div className="text-sm text-surface-500 mb-1">Find this note anywhere on the fretboard</div>
            <div className="text-6xl font-extrabold text-surface-900 tracking-tight">{question.note}</div>
          </>
        )}
      </div>

      {/* Fretboard */}
      <div className="bg-white rounded-xl border border-surface-200 p-2 sm:p-4 overflow-x-auto">
        <GuitarFretboard
          frets={QUIZ_FRETS}
          notes={reverseHilite}
          freePlay={mode !== 'reverse'}
          showLabels={false}
          showFretNumbers
          onNotePlay={mode === 'reverse' ? undefined : handleFretboardClick}
        />
      </div>

      {/* Multiple choice for reverse mode */}
      {mode === 'reverse' && question.options && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleReverseAnswer(opt)}
              disabled={!!feedback}
              className="px-4 py-3 bg-white border border-surface-200 rounded-xl text-lg font-bold text-surface-900 hover:bg-primary-50 hover:border-primary-300 disabled:opacity-50 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={advance}
          disabled={!!feedback}
          className="px-6 py-2 text-sm rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 disabled:opacity-50"
        >
          Skip / Next
        </button>
      </div>
    </div>
  )
}
