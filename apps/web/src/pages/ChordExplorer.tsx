import { useState, useCallback, useMemo } from 'react'
import PianoKeyboard, { type HighlightedNote, type NoteRole } from '@/components/Piano/PianoKeyboard'
import GuitarFretboard from '@/components/Guitar/GuitarFretboard'
import { chordShapeToFretNotes, getAvailableChordShapes } from '@/lib/chordShapes'
import { useAudioInit } from '@/hooks/useAudioInit'
import { useAudioStore } from '@/stores/audioStore'
import {
  getChord,
  getChordNotes,
  identifyChord,
} from '@melodypath/music-theory'

const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const CHORD_TYPES = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'dim', label: 'Dim' },
  { value: 'aug', label: 'Aug' },
  { value: 'maj7', label: 'Maj7' },
  { value: '7', label: '7 (Dom)' },
  { value: 'm7', label: 'Min7' },
]

type Mode = 'explore' | 'tryit'

export default function ChordExplorer() {
  const { ensureAudio } = useAudioInit()
  const engine = useAudioStore((s) => s.engine)

  // Explore mode state
  const [root, setRoot] = useState('C')
  const [chordType, setChordType] = useState('major')
  const [activeNotes, setActiveNotes] = useState<string[]>([])

  // Try It mode state
  const [mode, setMode] = useState<Mode>('explore')
  const [tryItNotes, setTryItNotes] = useState<string[]>([])
  const [identifiedChord, setIdentifiedChord] = useState<string | null>(null)

  // Build the chord name for display and guitar lookup
  const chordName = useMemo(() => {
    if (chordType === 'major') return root
    if (chordType === 'minor') return `${root}m`
    if (chordType === '7') return `${root}7`
    if (chordType === 'm7') return `${root}m7`
    if (chordType === 'maj7') return `${root}maj7`
    return `${root}${chordType}`
  }, [root, chordType])

  // Get chord info from Tonal.js
  const chordInfo = useMemo(() => getChord(chordName), [chordName])
  const chordNotesWithOctave = useMemo(() => getChordNotes(root, chordType, 4), [root, chordType])

  // Piano highlights
  const pianoHighlights: HighlightedNote[] = useMemo(() => {
    if (mode === 'tryit') {
      return tryItNotes.map((n) => ({ note: n, role: 'other' as NoteRole }))
    }
    if (!chordInfo) return []
    return chordNotesWithOctave.map((note, i) => {
      const roles: NoteRole[] = ['root', 'third', 'fifth', 'seventh', 'other']
      return { note, role: roles[i] ?? 'other' }
    })
  }, [chordInfo, chordNotesWithOctave, mode, tryItNotes])

  // Guitar notes
  const guitarShapeKey = useMemo(() => {
    const shapes = getAvailableChordShapes()
    if (shapes.includes(chordName)) return chordName
    // fallback for minor chords with 'm' suffix
    if (chordType === 'minor' && shapes.includes(`${root}m`)) return `${root}m`
    return null
  }, [chordName, root, chordType])

  const guitarNotes = useMemo(() => {
    if (mode === 'tryit' || !guitarShapeKey) return []
    return chordShapeToFretNotes(guitarShapeKey)
  }, [guitarShapeKey, mode])

  // ─── Handlers ───────────────────────────────────────────────────────────

  const playChord = useCallback(async () => {
    await ensureAudio()
    if (chordNotesWithOctave.length > 0) {
      engine.playChord(chordNotesWithOctave, '2n')
      setActiveNotes(chordNotesWithOctave)
      setTimeout(() => setActiveNotes([]), 800)
    }
  }, [ensureAudio, engine, chordNotesWithOctave])

  const handlePianoNote = useCallback(
    async (note: string) => {
      await ensureAudio()
      engine.playNote(note, '8n')

      if (mode === 'tryit') {
        setTryItNotes((prev) => {
          const next = prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
          const id = identifyChord(next)
          setIdentifiedChord(id)
          return next
        })
      } else {
        setActiveNotes([note])
        setTimeout(() => setActiveNotes([]), 300)
      }
    },
    [ensureAudio, engine, mode],
  )

  const handleGuitarNote = useCallback(
    async (note: string) => {
      await ensureAudio()
      engine.playNote(note, '8n')
      setActiveNotes([note])
      setTimeout(() => setActiveNotes([]), 300)
    },
    [ensureAudio, engine],
  )

  const clearTryIt = useCallback(() => {
    setTryItNotes([])
    setIdentifiedChord(null)
  }, [])

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Chord Explorer</h1>
          <p className="text-surface-500 text-sm mt-1">
            {mode === 'explore'
              ? 'Select a chord to see it on piano and guitar'
              : 'Click piano keys to build a chord — we\'ll identify it'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-surface-100 rounded-lg p-1">
          <button
            onClick={() => { setMode('explore'); clearTryIt() }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'explore' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setMode('tryit')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'tryit' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500'
            }`}
          >
            Try It
          </button>
        </div>
      </div>

      {/* Explore mode controls */}
      {mode === 'explore' && (
        <div className="flex flex-wrap items-end gap-4">
          {/* Root selector */}
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Root Note</label>
            <div className="flex flex-wrap gap-1">
              {ROOTS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRoot(r)}
                  className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                    r === root
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-surface-200 text-surface-700 hover:bg-surface-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5">Chord Type</label>
            <div className="flex flex-wrap gap-1">
              {CHORD_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  onClick={() => setChordType(ct.value)}
                  className={`px-3 h-9 text-sm font-medium rounded-lg transition-colors ${
                    ct.value === chordType
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-surface-200 text-surface-700 hover:bg-surface-50'
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Play button */}
          <button
            onClick={playChord}
            className="h-9 px-6 bg-accent-500 text-white font-bold rounded-lg hover:bg-accent-600 transition-colors"
          >
            Play {chordName}
          </button>
        </div>
      )}

      {/* Try It mode display */}
      {mode === 'tryit' && (
        <div className="flex items-center gap-4 bg-surface-100 rounded-xl p-4">
          <div className="flex-1">
            <span className="text-sm text-surface-500">Your notes: </span>
            <span className="font-mono font-medium text-surface-900">
              {tryItNotes.length > 0 ? tryItNotes.join(' ') : '(click piano keys)'}
            </span>
          </div>
          <div className="text-lg font-bold text-primary-700">
            {identifiedChord ? identifiedChord : tryItNotes.length >= 2 ? '...' : ''}
          </div>
          <button
            onClick={clearTryIt}
            className="px-3 py-1.5 text-sm bg-white border border-surface-200 rounded-lg hover:bg-surface-50"
          >
            Clear
          </button>
        </div>
      )}

      {/* Chord info card */}
      {mode === 'explore' && chordInfo && (
        <div className="bg-white rounded-xl border border-surface-200 p-5 flex flex-wrap gap-8">
          <div>
            <div className="text-xs text-surface-500 mb-1">Chord</div>
            <div className="text-3xl font-bold text-surface-900">{chordInfo.name || chordName}</div>
          </div>
          <div>
            <div className="text-xs text-surface-500 mb-1">Notes</div>
            <div className="flex gap-2 mt-1">
              {chordInfo.notes.map((n, i) => {
                const roles: NoteRole[] = ['root', 'third', 'fifth', 'seventh', 'other']
                const role = roles[i] ?? 'other'
                const colors: Record<NoteRole, string> = {
                  root: 'bg-note-root',
                  third: 'bg-note-third',
                  fifth: 'bg-note-fifth',
                  seventh: 'bg-note-seventh',
                  other: 'bg-note-other',
                }
                return (
                  <span
                    key={n}
                    className={`${colors[role]} text-white px-2.5 py-1 rounded-md text-sm font-bold`}
                  >
                    {n}
                  </span>
                )
              })}
            </div>
          </div>
          <div>
            <div className="text-xs text-surface-500 mb-1">Intervals</div>
            <div className="text-sm text-surface-700 font-mono mt-1">
              {chordInfo.intervals.join(' ')}
            </div>
          </div>
          <div>
            <div className="text-xs text-surface-500 mb-1">Type</div>
            <div className="text-sm text-surface-700 mt-1 capitalize">{chordInfo.type}</div>
          </div>
        </div>
      )}

      {/* Piano */}
      <div>
        <h2 className="text-sm font-semibold text-surface-500 mb-3">Piano</h2>
        <div className="overflow-x-auto pb-2">
          <PianoKeyboard
            startOctave={3}
            octaves={3}
            highlightedNotes={pianoHighlights}
            activeNotes={activeNotes}
            onNotePlay={handlePianoNote}
            showLabels
          />
        </div>
        {/* Legend */}
        {mode === 'explore' && (
          <div className="flex gap-4 mt-3 text-xs text-surface-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-note-root" /> Root</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-note-third" /> 3rd</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-note-fifth" /> 5th</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-note-seventh" /> 7th</span>
          </div>
        )}
      </div>

      {/* Guitar */}
      {mode === 'explore' && (
        <div>
          <h2 className="text-sm font-semibold text-surface-500 mb-3">
            Guitar
            {!guitarShapeKey && (
              <span className="ml-2 text-xs font-normal text-surface-400">(no shape for this chord yet)</span>
            )}
          </h2>
          <div className="bg-white rounded-xl border border-surface-200 p-4">
            <GuitarFretboard
              frets={5}
              notes={guitarNotes}
              activeNotes={activeNotes}
              onNotePlay={handleGuitarNote}
              showLabels
            />
          </div>
        </div>
      )}
    </div>
  )
}
