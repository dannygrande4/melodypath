import { useState, useCallback, useMemo, useRef } from 'react'
import PianoKeyboard, { type HighlightedNote, type NoteRole } from '@/components/Piano/PianoKeyboard'
import GuitarFretboard from '@/components/Guitar/GuitarFretboard'
import { scaleToFretNotes } from '@/lib/scalePositions'
import { useAudioInit } from '@/hooks/useAudioInit'
import { useAudioStore } from '@/stores/audioStore'
import InfoTooltip from '@/components/ui/InfoTooltip'
import { getScale, getScaleNotes } from '@melodypath/music-theory'

const SPEED_PRESETS = [
  { label: 'Slow', ms: 500 },
  { label: 'Medium', ms: 300 },
  { label: 'Fast', ms: 150 },
]

const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const SCALE_TYPES = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'major pentatonic', label: 'Pentatonic Maj' },
  { value: 'minor pentatonic', label: 'Pentatonic Min' },
  { value: 'dorian', label: 'Dorian' },
  { value: 'phrygian', label: 'Phrygian' },
  { value: 'lydian', label: 'Lydian' },
  { value: 'mixolydian', label: 'Mixolydian' },
  { value: 'harmonic minor', label: 'Harmonic Minor' },
  { value: 'melodic minor', label: 'Melodic Minor' },
  { value: 'blues', label: 'Blues' },
]

export default function ScaleExplorer() {
  const { ensureAudio } = useAudioInit()
  const engine = useAudioStore((s) => s.engine)

  const [root, setRoot] = useState('C')
  const [scaleType, setScaleType] = useState('major')
  const [activeNotes, setActiveNotes] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(300) // ms between notes
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Get scale info
  const scaleInfo = useMemo(() => getScale(root, scaleType), [root, scaleType])
  const scaleNotesOctave = useMemo(() => getScaleNotes(root, scaleType, 4), [root, scaleType])

  // Piano highlights — spread across octaves 3–5
  const pianoHighlights: HighlightedNote[] = useMemo(() => {
    if (!scaleInfo) return []
    const highlights: HighlightedNote[] = []
    for (let octave = 3; octave <= 5; octave++) {
      scaleInfo.notes.forEach((pc, i) => {
        let role: NoteRole = 'other'
        if (i === 0) role = 'root'
        else if (i === 2) role = 'third'
        else if (i === 4) role = 'fifth'
        else if (i === 6) role = 'seventh'
        highlights.push({ note: `${pc}${octave}`, role })
      })
    }
    return highlights
  }, [scaleInfo])

  // Guitar positions
  const guitarNotes = useMemo(() => {
    if (!scaleInfo) return []
    return scaleToFretNotes(scaleInfo.notes, root, 12)
  }, [scaleInfo, root])

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handlePianoNote = useCallback(
    async (note: string) => {
      await ensureAudio()
      engine.playNote(note, '8n')
      setActiveNotes([note])
      setTimeout(() => setActiveNotes([]), 300)
    },
    [ensureAudio, engine],
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

  const playScale = useCallback(async () => {
    if (isPlaying) return
    await ensureAudio()
    setIsPlaying(true)

    // Clear any existing timeouts
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    // Play ascending scale
    const notes = scaleNotesOctave.length > 0 ? scaleNotesOctave : []

    notes.forEach((note, i) => {
      const t = setTimeout(() => {
        engine.playNote(note, '8n')
        setActiveNotes([note])
      }, i * speed)
      timeoutsRef.current.push(t)
    })

    // Clear at end
    const endT = setTimeout(() => {
      setActiveNotes([])
      setIsPlaying(false)
    }, notes.length * speed + 200)
    timeoutsRef.current.push(endT)
  }, [ensureAudio, engine, scaleNotesOctave, isPlaying, speed])

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Scale Explorer</h1>
        <p className="text-surface-500 text-sm mt-1">
          Select a root note and scale type to visualize it on piano and guitar
        </p>
      </div>

      {/* Controls */}
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

        {/* Scale type */}
        <div>
          <label className="block text-xs font-medium text-surface-500 mb-1.5">Scale Type</label>
          <div className="flex flex-wrap gap-1">
            {SCALE_TYPES.map((st) => (
              <button
                key={st.value}
                onClick={() => setScaleType(st.value)}
                className={`px-3 h-9 text-sm font-medium rounded-lg transition-colors ${
                  st.value === scaleType
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-surface-200 text-surface-700 hover:bg-surface-50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speed control */}
        <div>
          <label className="flex items-center text-xs font-medium text-surface-500 mb-1.5">
            Playback Speed
            <InfoTooltip text="Controls how fast the scale notes play. Slow it down to hear each note clearly, or speed it up to hear the overall sound." />
          </label>
          <div className="flex gap-1">
            {SPEED_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setSpeed(preset.ms)}
                className={`px-3 h-9 text-sm font-medium rounded-lg transition-colors ${
                  speed === preset.ms
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-surface-200 text-surface-700 hover:bg-surface-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Play button */}
        <button
          onClick={playScale}
          disabled={isPlaying}
          className="h-9 px-6 bg-accent-500 text-white font-bold rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50"
        >
          {isPlaying ? 'Playing...' : `Play ${root} ${scaleType}`}
        </button>
      </div>

      {/* Scale info card */}
      {scaleInfo && (
        <div className="bg-white rounded-xl border border-surface-200 p-4 sm:p-5 flex flex-wrap gap-4 sm:gap-8">
          <div>
            <div className="flex items-center text-xs text-surface-500 mb-1">
              Scale
              <InfoTooltip text="A scale is a set of notes arranged in order by pitch. Different scales create different moods and feelings." />
            </div>
            <div className="text-3xl font-bold text-surface-900">{root} {scaleType}</div>
          </div>
          <div>
            <div className="flex items-center text-xs text-surface-500 mb-1">
              Notes
              <InfoTooltip text="These are the individual notes that make up this scale. The root (blue) is the 'home' note the scale is built from." />
            </div>
            <div className="flex gap-2 mt-1">
              {scaleInfo.notes.map((n, i) => {
                const roles: NoteRole[] = ['root', 'other', 'third', 'other', 'fifth', 'other', 'seventh']
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
            <div className="flex items-center text-xs text-surface-500 mb-1">
              Formula
              <InfoTooltip text="The interval formula shows the distance between each note. '1P' = root, '2M' = whole step, '3M' = major third, etc. This pattern is what gives each scale its unique character." />
            </div>
            <div className="text-sm text-surface-700 font-mono mt-1">
              {scaleInfo.degrees.join(' ')}
            </div>
          </div>
          <div>
            <div className="text-xs text-surface-500 mb-1">Notes Count</div>
            <div className="text-sm text-surface-700 mt-1">{scaleInfo.notes.length} notes</div>
          </div>
        </div>
      )}

      {/* Piano */}
      <div>
        <h2 className="text-sm font-semibold text-surface-500 mb-3">Piano</h2>
        <div className="overflow-x-auto pb-2 hidden sm:block">
          <PianoKeyboard
            startOctave={3}
            octaves={3}
            highlightedNotes={pianoHighlights}
            activeNotes={activeNotes}
            onNotePlay={handlePianoNote}
            showLabels
          />
        </div>
        <div className="overflow-x-auto pb-2 sm:hidden">
          <PianoKeyboard
            startOctave={3}
            octaves={2}
            highlightedNotes={pianoHighlights}
            activeNotes={activeNotes}
            onNotePlay={handlePianoNote}
            showLabels
            compact
          />
        </div>
        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs text-surface-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-note-root" /> Root</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-note-third" /> 3rd</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-note-fifth" /> 5th</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-note-seventh" /> 7th</span>
        </div>
      </div>

      {/* Guitar */}
      <div>
        <h2 className="text-sm font-semibold text-surface-500 mb-3">Guitar Fretboard</h2>
        <div className="bg-white rounded-xl border border-surface-200 p-2 sm:p-4 overflow-x-auto">
          <GuitarFretboard
            frets={12}
            notes={guitarNotes}
            activeNotes={activeNotes}
            onNotePlay={handleGuitarNote}
            showLabels
          />
        </div>
      </div>
    </div>
  )
}
