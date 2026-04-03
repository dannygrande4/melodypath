import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import NoteHighway from '@/components/PlayMode/NoteHighway'
import { getSongById } from '@/lib/songLibrary'
import { useAudioInit } from '@/hooks/useAudioInit'
import { useAudioStore } from '@/stores/audioStore'
import { useUserStore } from '@/stores/userStore'
import { MIDIManager } from '@melodypath/audio-engine'
import { useLeaderboardStore } from '@/stores/leaderboardStore'
import type { TimingGrade, SongGrade, NoteEvent } from '@melodypath/shared-types'

// ─── Scoring ─────────────────────────────────────────────────────────────────

const GRADE_POINTS: Record<TimingGrade, number> = {
  PERFECT: 100,
  GOOD: 60,
  OK: 30,
  MISS: 0,
}

function computeGrade(accuracy: number): SongGrade {
  if (accuracy >= 0.95) return 'S'
  if (accuracy >= 0.85) return 'A'
  if (accuracy >= 0.70) return 'B'
  if (accuracy >= 0.55) return 'C'
  return 'D'
}

type GameState = 'ready' | 'countdown' | 'playing' | 'results'

export default function PlayGame() {
  const { songId } = useParams<{ songId: string }>()
  const { ensureAudio } = useAudioInit()
  const engine = useAudioStore((s) => s.engine)
  const addXP = useUserStore((s) => s.addXP)
  const recordPractice = useUserStore((s) => s.recordPractice)

  const song = getSongById(songId ?? '')

  // Game state
  const [gameState, setGameState] = useState<GameState>('ready')
  const [countdown, setCountdown] = useState(3)
  const [currentTime, setCurrentTime] = useState(0)
  const [notes, setNotes] = useState<NoteEvent[]>([])
  const [songDuration, setSongDuration] = useState(0)

  // Scoring
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [results, setResults] = useState<TimingGrade[]>([])
  const [lastGrade, setLastGrade] = useState<TimingGrade | null>(null)

  const startTimeRef = useRef(0)
  const animFrameRef = useRef(0)

  // MIDI input state
  const [midiConnected, setMidiConnected] = useState(false)
  const [midiLaneHit, setMidiLaneHit] = useState<number | null>(null)
  const midiManagerRef = useRef<MIDIManager | null>(null)

  // Connect MIDI on mount
  useEffect(() => {
    if (!engine.initialized) return

    const manager = new MIDIManager(engine)
    midiManagerRef.current = manager

    manager.connect().then((inputs) => {
      if (inputs.length > 0) {
        manager.selectInput()
        setMidiConnected(true)

        // Map MIDI notes to lanes: divide the MIDI range into 4 zones
        manager.setCallbacks(
          (note) => {
            // Map note name to lane: C/D = 0, E/F = 1, G/A = 2, B = 3
            const pc = note.replace(/\d/, '')
            const laneMap: Record<string, number> = {
              'C': 0, 'C#': 0, 'D': 0, 'D#': 0,
              'E': 1, 'F': 1, 'F#': 1,
              'G': 2, 'G#': 2, 'A': 2, 'A#': 2,
              'B': 3,
            }
            const lane = laneMap[pc] ?? 0
            setMidiLaneHit(lane)
            // Reset after a frame so next note triggers
            setTimeout(() => setMidiLaneHit(null), 16)
          },
          () => {}, // noteOff — not needed for play mode
        )
      }
    })

    return () => {
      manager.disconnect()
    }
  }, [engine, engine.initialized])

  // ─── Start game ─────────────────────────────────────────────────────

  const startGame = useCallback(async () => {
    if (!song) return
    await ensureAudio()

    const { notes: songNotes, duration } = song.getNotes()
    setNotes(songNotes)
    setSongDuration(duration)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setMultiplier(1)
    setResults([])
    setLastGrade(null)
    setCurrentTime(0)

    // Countdown
    setGameState('countdown')
    setCountdown(3)

    let c = 3
    const countdownInterval = setInterval(() => {
      c--
      setCountdown(c)
      if (c <= 0) {
        clearInterval(countdownInterval)
        setGameState('playing')
        startTimeRef.current = performance.now()

        // Start the game loop
        function gameLoop() {
          const elapsed = (performance.now() - startTimeRef.current) / 1000
          setCurrentTime(elapsed)

          if (elapsed >= duration) {
            setGameState('results')
            return
          }

          animFrameRef.current = requestAnimationFrame(gameLoop)
        }
        animFrameRef.current = requestAnimationFrame(gameLoop)
      }
    }, 1000)
  }, [song, ensureAudio])

  // Cleanup animation frame
  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  // ─── Hit / Miss handlers ────────────────────────────────────────────

  const handleNoteHit = useCallback(
    (index: number, grade: TimingGrade) => {
      const note = notes[index]
      if (note) {
        engine.playNote(note.note, '16n')
      }

      const newCombo = combo + 1
      const newMultiplier = newCombo >= 30 ? 4 : newCombo >= 20 ? 3 : newCombo >= 10 ? 2 : 1
      const points = GRADE_POINTS[grade] * newMultiplier

      setScore((s) => s + points)
      setCombo(newCombo)
      setMaxCombo((m) => Math.max(m, newCombo))
      setMultiplier(newMultiplier)
      setLastGrade(grade)
      setResults((r) => [...r, grade])

      setTimeout(() => setLastGrade(null), 400)
    },
    [combo, engine, notes],
  )

  const handleNoteMiss = useCallback(
    (_index: number) => {
      setCombo(0)
      setMultiplier(1)
      setLastGrade('MISS')
      setResults((r) => [...r, 'MISS'])
      setTimeout(() => setLastGrade(null), 400)
    },
    [],
  )

  // ─── Results computation ────────────────────────────────────────────

  const totalNotes = notes.length
  const hitCount = results.filter((r) => r !== 'MISS').length
  const accuracy = totalNotes > 0 ? hitCount / totalNotes : 0
  const grade = computeGrade(accuracy)
  const perfectCount = results.filter((r) => r === 'PERFECT').length
  const goodCount = results.filter((r) => r === 'GOOD').length
  const okCount = results.filter((r) => r === 'OK').length
  const missCount = results.filter((r) => r === 'MISS').length

  const addLeaderboardScore = useLeaderboardStore((s) => s.addScore)
  const getTopScores = useLeaderboardStore((s) => s.getTopScores)
  const [isNewHighScore, setIsNewHighScore] = useState(false)

  // Award XP + record high score on results
  useEffect(() => {
    if (gameState === 'results' && totalNotes > 0 && songId) {
      const xp = Math.round(accuracy * 50) + (grade === 'S' ? 50 : grade === 'A' ? 25 : 10)
      addXP(xp)
      recordPractice()
      const isNew = addLeaderboardScore({ songId, score, accuracy, grade })
      setIsNewHighScore(isNew)
    }
  }, [gameState]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── No song found ──────────────────────────────────────────────────

  if (!song) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-surface-900 mb-4">Song Not Found</h1>
        <Link to="/play" className="text-primary-600 hover:underline">Back to Song Library</Link>
      </div>
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface-900 text-white flex flex-col">
      {/* Top HUD */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-surface-900/80 border-b border-surface-800">
        <div className="min-w-0 mr-3">
          <div className="text-xs sm:text-sm text-surface-400 truncate">{song.artist}</div>
          <div className="font-bold text-sm sm:text-base truncate">{song.title}</div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-extrabold tabular-nums">{score.toLocaleString()}</div>
            <div className="text-[10px] sm:text-xs text-surface-400">Score</div>
          </div>
          <div className="text-center">
            <div className={`text-base sm:text-xl font-bold ${combo >= 10 ? 'text-accent-500' : ''}`}>
              {combo}x
            </div>
            <div className="text-[10px] sm:text-xs text-surface-400">Combo</div>
          </div>
          <div className="text-center">
            <div className={`text-xs sm:text-sm font-bold px-2 py-0.5 rounded ${
              multiplier >= 4 ? 'bg-accent-500' : multiplier >= 2 ? 'bg-primary-600' : 'bg-surface-700'
            }`}>
              {multiplier}x
            </div>
            <div className="text-[10px] sm:text-xs text-surface-400 mt-0.5">Multi</div>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex items-center justify-center relative px-4">
        {/* Ready screen */}
        {gameState === 'ready' && (
          <div className="text-center space-y-4 sm:space-y-6 w-full max-w-lg">
            <div className="text-2xl sm:text-4xl font-extrabold">{song.title}</div>
            <div className="text-sm sm:text-base text-surface-400">{song.artist} · {song.bpm} BPM · {song.key}</div>
            <div className="flex gap-2 justify-center text-xs">
              {song.concepts.map((c) => (
                <span key={c} className="px-2 py-1 bg-surface-800 rounded-md text-surface-300">{c}</span>
              ))}
            </div>
            <div className="text-sm text-surface-500 mt-4">
              Use keys <kbd className="px-1.5 py-0.5 bg-surface-700 rounded text-white font-mono">D</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-surface-700 rounded text-white font-mono">F</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-surface-700 rounded text-white font-mono">J</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-surface-700 rounded text-white font-mono">K</kbd>{' '}
              to hit the notes, or tap the lanes
            </div>
            {midiConnected && (
              <div className="mt-2 px-3 py-1.5 bg-green-900/50 border border-green-700 rounded-lg text-green-400 text-sm font-medium inline-block">
                🎹 MIDI device connected — play your instrument to hit notes!
              </div>
            )}
            {!midiConnected && (
              <div className="mt-2 text-xs text-surface-600">
                Connect a MIDI keyboard or guitar interface to play with your instrument
              </div>
            )}
            <button
              onClick={startGame}
              className="px-10 py-4 bg-primary-600 text-white font-bold text-lg rounded-xl hover:bg-primary-700 transition-colors"
            >
              Play
            </button>
          </div>
        )}

        {/* Countdown */}
        {gameState === 'countdown' && (
          <div className="text-8xl font-extrabold animate-pulse">
            {countdown}
          </div>
        )}

        {/* Note highway */}
        {(gameState === 'playing') && (
          <div className="relative w-full flex justify-center">
            <NoteHighway
              notes={notes}
              bpm={song.bpm}
              isPlaying={true}
              currentTime={currentTime}
              onNoteHit={handleNoteHit}
              onNoteMiss={handleNoteMiss}
              externalLaneHit={midiLaneHit}
              width={500}
              height={550}
            />
            {/* Floating grade display */}
            {lastGrade && (
              <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 text-3xl font-extrabold animate-bounce ${
                lastGrade === 'PERFECT' ? 'text-timing-perfect' :
                lastGrade === 'GOOD' ? 'text-timing-good' :
                lastGrade === 'OK' ? 'text-timing-ok' :
                'text-timing-miss'
              }`}>
                {lastGrade}
              </div>
            )}
          </div>
        )}

        {/* Results screen */}
        {gameState === 'results' && (
          <div className="text-center space-y-4 sm:space-y-6 max-w-md w-full">
            <div className={`text-6xl sm:text-8xl font-extrabold ${
              grade === 'S' ? 'text-accent-500' :
              grade === 'A' ? 'text-timing-perfect' :
              grade === 'B' ? 'text-timing-good' :
              grade === 'C' ? 'text-timing-ok' :
              'text-timing-miss'
            }`}>
              {grade}
            </div>
            <div className="text-lg sm:text-xl font-bold">{song.title}</div>
            <div className="text-2xl sm:text-3xl font-extrabold">{score.toLocaleString()} pts</div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="bg-surface-800 rounded-lg p-3">
                <div className="text-xs text-surface-400">Accuracy</div>
                <div className="text-xl font-bold">{(accuracy * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-surface-800 rounded-lg p-3">
                <div className="text-xs text-surface-400">Max Combo</div>
                <div className="text-xl font-bold">{maxCombo}x</div>
              </div>
              <div className="bg-surface-800 rounded-lg p-3">
                <div className="text-timing-perfect text-xs">Perfect</div>
                <div className="text-lg font-bold">{perfectCount}</div>
              </div>
              <div className="bg-surface-800 rounded-lg p-3">
                <div className="text-timing-good text-xs">Good</div>
                <div className="text-lg font-bold">{goodCount}</div>
              </div>
              <div className="bg-surface-800 rounded-lg p-3">
                <div className="text-timing-ok text-xs">OK</div>
                <div className="text-lg font-bold">{okCount}</div>
              </div>
              <div className="bg-surface-800 rounded-lg p-3">
                <div className="text-timing-miss text-xs">Miss</div>
                <div className="text-lg font-bold">{missCount}</div>
              </div>
            </div>

            {/* Actions */}
            {/* New high score banner */}
            {isNewHighScore && (
              <div className="bg-accent-500/20 border border-accent-500 rounded-lg p-3 text-accent-500 font-bold">
                New High Score!
              </div>
            )}

            {/* High scores */}
            {songId && (() => {
              const topScores = getTopScores(songId, 5)
              return topScores.length > 1 ? (
                <div className="text-left">
                  <div className="text-xs text-surface-400 uppercase tracking-wider mb-2">High Scores</div>
                  <div className="space-y-1">
                    {topScores.map((s, i) => (
                      <div key={i} className="flex justify-between text-sm bg-surface-800 rounded px-3 py-1.5">
                        <span className="text-surface-300">#{i + 1}</span>
                        <span className="font-bold">{s.score.toLocaleString()}</span>
                        <span className="text-surface-400">{(s.accuracy * 100).toFixed(0)}%</span>
                        <span className={
                          s.grade === 'S' ? 'text-accent-500' :
                          s.grade === 'A' ? 'text-timing-perfect' :
                          'text-surface-400'
                        }>{s.grade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            })()}

            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Play Again
              </button>
              <Link
                to="/play"
                className="px-6 py-3 bg-surface-700 text-white font-medium rounded-xl hover:bg-surface-600 transition-colors"
              >
                Song List
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {gameState === 'playing' && songDuration > 0 && (
        <div className="h-1 bg-surface-800">
          <div
            className="h-1 bg-primary-500 transition-all"
            style={{ width: `${Math.min(100, (currentTime / songDuration) * 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
