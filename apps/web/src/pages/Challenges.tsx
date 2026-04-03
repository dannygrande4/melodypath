import { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import PlayChallenge, { type Challenge } from '@/components/Challenges/PlayChallenge'
import { useUserStore } from '@/stores/userStore'
import InfoTooltip from '@/components/ui/InfoTooltip'

// ─── Challenge Banks ─────────────────────────────────────────────────────────

const NOTE_CHALLENGES: Challenge[] = [
  { type: 'note', prompt: 'Play an E', targetNote: 'E', hint: 'Open 6th string or 1st string' },
  { type: 'note', prompt: 'Play an A', targetNote: 'A', hint: 'Open 5th string' },
  { type: 'note', prompt: 'Play a D', targetNote: 'D', hint: 'Open 4th string' },
  { type: 'note', prompt: 'Play a G', targetNote: 'G', hint: 'Open 3rd string' },
  { type: 'note', prompt: 'Play a B', targetNote: 'B', hint: 'Open 2nd string' },
  { type: 'note', prompt: 'Play a C', targetNote: 'C', hint: '3rd fret on the 5th string' },
  { type: 'note', prompt: 'Play an F', targetNote: 'F', hint: '1st fret on the 1st string' },
  { type: 'note', prompt: 'Play a C#', targetNote: 'C#', hint: 'Also called Db' },
  { type: 'note', prompt: 'Play an F#', targetNote: 'F#', hint: '2nd fret on the 1st string' },
  { type: 'note', prompt: 'Play a Bb', targetNote: 'A#', hint: 'Also called A#' },
]

const SEQUENCE_CHALLENGES: Challenge[] = [
  { type: 'sequence', prompt: 'Play the open strings (low to high)', targetNotes: ['E', 'A', 'D', 'G', 'B', 'E'], hint: 'E A D G B E' },
  { type: 'sequence', prompt: 'Play C - D - E', targetNotes: ['C', 'D', 'E'], hint: 'First 3 notes of the C major scale' },
  { type: 'sequence', prompt: 'Play E - F - G - A', targetNotes: ['E', 'F', 'G', 'A'], hint: 'Part of the E minor scale' },
  { type: 'sequence', prompt: 'Play G - A - B - C', targetNotes: ['G', 'A', 'B', 'C'], hint: 'Start of G major scale' },
  { type: 'sequence', prompt: 'Play the first 5 notes of C major', targetNotes: ['C', 'D', 'E', 'F', 'G'], hint: 'C D E F G' },
  { type: 'sequence', prompt: 'Play A - B - C - D - E', targetNotes: ['A', 'B', 'C', 'D', 'E'], hint: 'Start of A minor scale' },
]

const CHORD_CHALLENGES: Challenge[] = [
  { type: 'chord', prompt: 'Play a C major chord', targetNotes: ['C', 'E', 'G'], chordName: 'C', hint: 'Root, 3rd, 5th: C E G' },
  { type: 'chord', prompt: 'Play a G major chord', targetNotes: ['G', 'B', 'D'], chordName: 'G', hint: 'Root, 3rd, 5th: G B D' },
  { type: 'chord', prompt: 'Play a D major chord', targetNotes: ['D', 'F#', 'A'], chordName: 'D', hint: 'Root, 3rd, 5th: D F# A' },
  { type: 'chord', prompt: 'Play an E minor chord', targetNotes: ['E', 'G', 'B'], chordName: 'Em', hint: 'Root, b3rd, 5th: E G B' },
  { type: 'chord', prompt: 'Play an A minor chord', targetNotes: ['A', 'C', 'E'], chordName: 'Am', hint: 'Root, b3rd, 5th: A C E' },
]

type Difficulty = 'notes' | 'sequences' | 'chords' | 'mixed'

const DIFFICULTY_INFO: Record<Difficulty, { label: string; desc: string; icon: string }> = {
  notes: { label: 'Single Notes', desc: 'Play one note at a time', icon: '🎵' },
  sequences: { label: 'Note Sequences', desc: 'Play notes in order', icon: '🎶' },
  chords: { label: 'Chords', desc: 'Play full chords', icon: '🎸' },
  mixed: { label: 'Mixed', desc: 'All challenge types', icon: '🔥' },
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// ─── Component ───────────────────────────────────────────────────────────────

const ROUNDS = 5

export default function Challenges() {
  const addXP = useUserStore((s) => s.addXP)
  const recordPractice = useUserStore((s) => s.recordPractice)

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [sessionDone, setSessionDone] = useState(false)

  // Generate challenge set when difficulty is picked
  const challenges = useMemo(() => {
    if (!difficulty) return []
    let pool: Challenge[]
    if (difficulty === 'notes') pool = NOTE_CHALLENGES
    else if (difficulty === 'sequences') pool = SEQUENCE_CHALLENGES
    else if (difficulty === 'chords') pool = CHORD_CHALLENGES
    else pool = [...NOTE_CHALLENGES, ...SEQUENCE_CHALLENGES, ...CHORD_CHALLENGES]
    return shuffleArray(pool).slice(0, ROUNDS)
  }, [difficulty])

  const currentChallenge = challenges[round]

  const handleComplete = useCallback((correct: boolean) => {
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }))

    if (correct) addXP(10)

    // Move to next round after a brief pause
    setTimeout(() => {
      if (round + 1 >= challenges.length) {
        setSessionDone(true)
        recordPractice()
      } else {
        setRound(round + 1)
      }
    }, 1500)
  }, [round, challenges.length, addXP, recordPractice])

  const restart = useCallback(() => {
    setDifficulty(null)
    setRound(0)
    setScore({ correct: 0, total: 0 })
    setSessionDone(false)
  }, [])

  // ─── Difficulty picker ──────────────────────────────────────────────

  if (!difficulty) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Play Challenges</h1>
          <p className="flex items-center text-surface-500 text-sm mt-1">
            Play what we ask — we'll listen with your mic
            <InfoTooltip text="The app uses your microphone to detect what note or chord you're playing on your instrument. Hold each note steady for about half a second for it to register." />
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(DIFFICULTY_INFO) as [Difficulty, typeof DIFFICULTY_INFO[Difficulty]][]).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setDifficulty(key)}
              className="bg-white rounded-xl border-2 border-surface-200 p-6 text-center hover:border-primary-400 hover:shadow-sm transition-all"
            >
              <div className="text-3xl mb-2">{info.icon}</div>
              <div className="font-bold text-surface-900">{info.label}</div>
              <div className="text-xs text-surface-500 mt-1">{info.desc}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Session complete ───────────────────────────────────────────────

  if (sessionDone) {
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    const xpEarned = score.correct * 10

    return (
      <div className="p-4 sm:p-6 max-w-md mx-auto text-center space-y-6">
        <div className="text-6xl">
          {accuracy >= 80 ? '🏆' : accuracy >= 50 ? '👏' : '💪'}
        </div>
        <h1 className="text-2xl font-bold text-surface-900">Session Complete!</h1>
        <div className="flex justify-center gap-8">
          <div>
            <div className="text-3xl font-extrabold text-surface-900">{score.correct}/{score.total}</div>
            <div className="text-xs text-surface-400">Correct</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-primary-600">{accuracy}%</div>
            <div className="text-xs text-surface-400">Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-accent-500">+{xpEarned}</div>
            <div className="text-xs text-surface-400">XP</div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={restart}
            className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Play Again
          </button>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-white border border-surface-200 text-surface-700 font-medium rounded-xl hover:bg-surface-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // ─── Active challenge ───────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <button onClick={restart} className="text-surface-400 hover:text-surface-600 text-sm">✕</button>
        <div className="flex-1 bg-surface-100 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all"
            style={{ width: `${((round) / challenges.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-surface-400 font-medium">
          {round + 1}/{challenges.length}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <span className="text-timing-perfect font-bold">{score.correct} correct</span>
        <span className="text-surface-300">·</span>
        <span className="text-surface-400">{score.total - score.correct} missed</span>
      </div>

      {/* Challenge */}
      {currentChallenge && (
        <PlayChallenge
          key={`${round}-${currentChallenge.prompt}`}
          challenge={currentChallenge}
          onComplete={handleComplete}
        />
      )}
    </div>
  )
}
