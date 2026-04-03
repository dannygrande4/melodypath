import { useMemo, useCallback } from 'react'
import type { NoteRole } from '@/components/Piano/PianoKeyboard'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FretNote {
  note: string       // pitch class, e.g. "C"
  fullNote: string   // with octave, e.g. "C4"
  string: number     // 1–6 (1 = high E)
  fret: number       // 0–24
  role?: NoteRole
  finger?: number    // 1–4 for chord fingering
}

interface GuitarFretboardProps {
  /** Number of frets to display (default 12) */
  frets?: number
  /** Notes to display on the fretboard */
  notes?: FretNote[]
  /** Active/pressed notes */
  activeNotes?: string[]
  /** Called when a position is clicked */
  onNotePlay?: (note: string) => void
  /** Show fret numbers */
  showFretNumbers?: boolean
  /** Show note name labels in dots */
  showLabels?: boolean
  /** Tuning: array of 6 note names from low to high E (default standard) */
  tuning?: string[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STANDARD_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
const FRET_MARKERS = new Set([3, 5, 7, 9, 12, 15, 17, 19, 21])
const DOUBLE_MARKERS = new Set([12])
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const ROLE_COLORS: Record<NoteRole, string> = {
  root: '#4f6ef7',
  third: '#22c55e',
  fifth: '#f59e0b',
  seventh: '#a855f7',
  other: '#64748b',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function noteAtFret(openNote: string, fret: number): string {
  const pitchClass = openNote.replace(/\d/, '')
  const octave = parseInt(openNote.match(/\d+/)?.[0] ?? '3')
  const startIndex = NOTE_NAMES.indexOf(pitchClass)
  const totalSemitones = startIndex + fret
  const newPitchClass = NOTE_NAMES[totalSemitones % 12]
  const newOctave = octave + Math.floor(totalSemitones / 12)
  return `${newPitchClass}${newOctave}`
}

// ─── Guitar Fretboard ────────────────────────────────────────────────────────

export default function GuitarFretboard({
  frets = 12,
  notes = [],
  activeNotes = [],
  onNotePlay,
  showFretNumbers = true,
  showLabels = true,
  tuning = STANDARD_TUNING,
}: GuitarFretboardProps) {
  const activeSet = useMemo(() => new Set(activeNotes), [activeNotes])

  // Build a lookup: "string-fret" → FretNote
  const noteMap = useMemo(() => {
    const map = new Map<string, FretNote>()
    for (const n of notes) {
      map.set(`${n.string}-${n.fret}`, n)
    }
    return map
  }, [notes])

  const handleClick = useCallback(
    (stringNum: number, fret: number) => {
      const openNote = tuning[stringNum - 1]
      const note = noteAtFret(openNote, fret)
      onNotePlay?.(note)
    },
    [tuning, onNotePlay],
  )

  // SVG dimensions
  const stringSpacing = 24
  const fretSpacing = 60
  const paddingLeft = 40
  const paddingTop = 30
  const paddingBottom = showFretNumbers ? 30 : 10
  const width = paddingLeft + frets * fretSpacing + 20
  const height = paddingTop + 5 * stringSpacing + paddingBottom
  const nutX = paddingLeft

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-4xl"
      role="img"
      aria-label="Guitar fretboard"
    >
      {/* Nut */}
      <line
        x1={nutX}
        y1={paddingTop - 4}
        x2={nutX}
        y2={paddingTop + 5 * stringSpacing + 4}
        stroke="#1a1a1a"
        strokeWidth={4}
      />

      {/* Fret lines */}
      {Array.from({ length: frets }, (_, i) => {
        const x = paddingLeft + (i + 1) * fretSpacing
        return (
          <line
            key={`fret-${i}`}
            x1={x}
            y1={paddingTop - 2}
            x2={x}
            y2={paddingTop + 5 * stringSpacing + 2}
            stroke="#c4c4c4"
            strokeWidth={1.5}
          />
        )
      })}

      {/* Fret markers (dots) */}
      {Array.from({ length: frets }, (_, i) => {
        const fret = i + 1
        const cx = paddingLeft + (i + 0.5) * fretSpacing
        if (DOUBLE_MARKERS.has(fret)) {
          return (
            <g key={`marker-${fret}`}>
              <circle cx={cx} cy={paddingTop + 1.5 * stringSpacing} r={4} fill="#e4e4e7" />
              <circle cx={cx} cy={paddingTop + 3.5 * stringSpacing} r={4} fill="#e4e4e7" />
            </g>
          )
        }
        if (FRET_MARKERS.has(fret)) {
          return (
            <circle
              key={`marker-${fret}`}
              cx={cx}
              cy={paddingTop + 2.5 * stringSpacing}
              r={4}
              fill="#e4e4e7"
            />
          )
        }
        return null
      })}

      {/* Strings */}
      {tuning.map((_, i) => {
        const y = paddingTop + i * stringSpacing
        const thickness = 1 + (5 - i) * 0.3 // thicker for lower strings
        return (
          <line
            key={`string-${i}`}
            x1={nutX}
            y1={y}
            x2={width - 10}
            y2={y}
            stroke="#a0a0a0"
            strokeWidth={thickness}
          />
        )
      })}

      {/* String labels (open string names) */}
      {tuning.map((openNote, i) => (
        <text
          key={`label-${i}`}
          x={nutX - 8}
          y={paddingTop + i * stringSpacing + 4}
          textAnchor="end"
          fill="#71717a"
          fontSize={11}
          fontFamily="Inter, sans-serif"
        >
          {openNote.replace(/\d/, '')}
        </text>
      ))}

      {/* Fret numbers */}
      {showFretNumbers &&
        Array.from({ length: frets }, (_, i) => (
          <text
            key={`fretnum-${i}`}
            x={paddingLeft + (i + 0.5) * fretSpacing}
            y={height - 8}
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize={10}
            fontFamily="Inter, sans-serif"
          >
            {i + 1}
          </text>
        ))}

      {/* Note dots — interactive */}
      {/* Fret 0 (open) positions + fretted positions */}
      {Array.from({ length: frets + 1 }, (_, fret) => {
        return tuning.map((_, stringIdx) => {
          const stringNum = stringIdx + 1 // 1-indexed
          const key = `${stringNum}-${fret}`
          const fretNote = noteMap.get(key)
          if (!fretNote) return null

          const cx =
            fret === 0
              ? nutX - 14
              : paddingLeft + (fret - 0.5) * fretSpacing
          const cy = paddingTop + stringIdx * stringSpacing
          const fullNote = fretNote.fullNote
          const isActive = activeSet.has(fullNote)
          const color = ROLE_COLORS[fretNote.role ?? 'other']

          return (
            <g
              key={key}
              onClick={() => handleClick(stringNum, fret)}
              className="cursor-pointer"
            >
              <circle
                cx={cx}
                cy={cy}
                r={10}
                fill={isActive ? color : color}
                opacity={isActive ? 1 : 0.85}
                stroke="white"
                strokeWidth={2}
              />
              {showLabels && (
                <text
                  x={cx}
                  y={cy + 3.5}
                  textAnchor="middle"
                  fill="white"
                  fontSize={9}
                  fontWeight="bold"
                  fontFamily="Inter, sans-serif"
                  pointerEvents="none"
                >
                  {fretNote.finger ?? fretNote.note}
                </text>
              )}
            </g>
          )
        })
      })}

      {/* X marks for muted strings could go here */}
    </svg>
  )
}

// ─── Utility: build chord fingering for standard tuning ──────────────────────

export { noteAtFret, NOTE_NAMES, STANDARD_TUNING }
