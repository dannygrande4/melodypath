import { useCallback, useMemo } from 'react'
import { cn } from '@/lib/cn'

// ─── Types ───────────────────────────────────────────────────────────────────

export type NoteRole = 'root' | 'third' | 'fifth' | 'seventh' | 'other'

export interface HighlightedNote {
  note: string   // e.g. "C4"
  role?: NoteRole
}

interface PianoKeyboardProps {
  /** Starting octave (default 3) */
  startOctave?: number
  /** Number of octaves to display (default 2) */
  octaves?: number
  /** Notes to highlight with colored dots */
  highlightedNotes?: HighlightedNote[]
  /** Active/pressed notes (shown as fully colored) */
  activeNotes?: string[]
  /** Called when a key is clicked */
  onNotePlay?: (note: string) => void
  /** Called when mouse/touch releases a key */
  onNoteRelease?: (note: string) => void
  /** Show note labels on keys */
  showLabels?: boolean
  /** Compact mode (smaller keys) */
  compact?: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
const BLACK_KEYS = new Set([1, 3, 6, 8, 10]) // indices of sharps/flats in NOTE_NAMES

const ROLE_COLORS: Record<NoteRole, string> = {
  root: 'bg-note-root',
  third: 'bg-note-third',
  fifth: 'bg-note-fifth',
  seventh: 'bg-note-seventh',
  other: 'bg-note-other',
}

const ROLE_RING_COLORS: Record<NoteRole, string> = {
  root: 'ring-note-root',
  third: 'ring-note-third',
  fifth: 'ring-note-fifth',
  seventh: 'ring-note-seventh',
  other: 'ring-note-other',
}

// ─── Key component ───────────────────────────────────────────────────────────

interface KeyProps {
  note: string
  isBlack: boolean
  isActive: boolean
  highlight?: HighlightedNote
  showLabel: boolean
  compact: boolean
  onPlay: (note: string) => void
  onRelease: (note: string) => void
}

function PianoKey({ note, isBlack, isActive, highlight, showLabel, compact, onPlay, onRelease }: KeyProps) {
  const handlePointerDown = useCallback(() => onPlay(note), [note, onPlay])
  const handlePointerUp = useCallback(() => onRelease(note), [note, onRelease])
  const handlePointerLeave = useCallback(() => onRelease(note), [note, onRelease])

  const baseHeight = compact ? 'h-28' : 'h-40'
  const blackHeight = compact ? 'h-16' : 'h-24'
  const baseWidth = compact ? 'w-8' : 'w-12'
  const blackWidth = compact ? 'w-5' : 'w-8'

  const pitchClass = note.replace(/\d/, '')
  const label = showLabel ? pitchClass : null

  if (isBlack) {
    return (
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className={cn(
          'absolute z-10 rounded-b-md border border-surface-900 transition-colors select-none',
          blackWidth,
          blackHeight,
          isActive
            ? 'bg-primary-600 border-primary-700'
            : highlight
              ? `${ROLE_COLORS[highlight.role ?? 'other']} opacity-90`
              : 'bg-surface-900 hover:bg-surface-800',
        )}
        style={{ marginLeft: compact ? '-10px' : '-16px' }}
        aria-label={note}
      >
        {highlight && (
          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/60" />
        )}
      </button>
    )
  }

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className={cn(
        'relative border border-surface-200 rounded-b-lg transition-colors select-none flex flex-col items-center justify-end pb-2',
        baseWidth,
        baseHeight,
        isActive
          ? 'bg-primary-100 border-primary-400'
          : highlight
            ? `bg-white ring-2 ring-inset ${ROLE_RING_COLORS[highlight.role ?? 'other']}`
            : 'bg-white hover:bg-surface-50',
      )}
      aria-label={note}
    >
      {highlight && (
        <span
          className={cn(
            'w-4 h-4 rounded-full mb-1',
            ROLE_COLORS[highlight.role ?? 'other'],
          )}
        />
      )}
      {label && (
        <span className={cn(
          'text-[10px] font-medium',
          isActive ? 'text-primary-700' : 'text-surface-400',
        )}>
          {label}
        </span>
      )}
    </button>
  )
}

// ─── Piano Keyboard ──────────────────────────────────────────────────────────

export default function PianoKeyboard({
  startOctave = 3,
  octaves = 2,
  highlightedNotes = [],
  activeNotes = [],
  onNotePlay,
  onNoteRelease,
  showLabels = true,
  compact = false,
}: PianoKeyboardProps) {
  const highlightMap = useMemo(() => {
    const map = new Map<string, HighlightedNote>()
    for (const h of highlightedNotes) {
      map.set(h.note, h)
    }
    return map
  }, [highlightedNotes])

  const activeSet = useMemo(() => new Set(activeNotes), [activeNotes])

  const handlePlay = useCallback(
    (note: string) => onNotePlay?.(note),
    [onNotePlay],
  )

  const handleRelease = useCallback(
    (note: string) => onNoteRelease?.(note),
    [onNoteRelease],
  )

  // Build the list of keys
  const keys: { note: string; isBlack: boolean }[] = useMemo(() => {
    const result: { note: string; isBlack: boolean }[] = []
    for (let oct = startOctave; oct < startOctave + octaves; oct++) {
      for (let i = 0; i < 12; i++) {
        result.push({
          note: `${NOTE_NAMES[i]}${oct}`,
          isBlack: BLACK_KEYS.has(i),
        })
      }
    }
    // Add final C
    result.push({ note: `C${startOctave + octaves}`, isBlack: false })
    return result
  }, [startOctave, octaves])

  return (
    <div className="inline-flex relative select-none" role="group" aria-label="Piano keyboard">
      {keys.map(({ note, isBlack }) => (
        <PianoKey
          key={note}
          note={note}
          isBlack={isBlack}
          isActive={activeSet.has(note)}
          highlight={highlightMap.get(note)}
          showLabel={showLabels}
          compact={compact}
          onPlay={handlePlay}
          onRelease={handleRelease}
        />
      ))}
    </div>
  )
}
