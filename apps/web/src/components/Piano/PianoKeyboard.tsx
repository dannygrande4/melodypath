import { useCallback, useMemo, useRef } from 'react'
import { cn } from '@/lib/cn'

// ─── Types ───────────────────────────────────────────────────────────────────

export type NoteRole = 'root' | 'third' | 'fifth' | 'seventh' | 'other'

export interface HighlightedNote {
  note: string   // e.g. "C4"
  role?: NoteRole
}

interface PianoKeyboardProps {
  startOctave?: number
  octaves?: number
  highlightedNotes?: HighlightedNote[]
  activeNotes?: string[]
  onNotePlay?: (note: string) => void
  onNoteRelease?: (note: string) => void
  showLabels?: boolean
  compact?: boolean
  /** When true and there are active notes, dim non-active highlights to spotlight the active one */
  dimInactive?: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────

// White keys: C D E F G A B (indices 0,2,4,5,7,9,11)
// Black keys: C# D# F# G# A# (indices 1,3,6,8,10)
const WHITE_NOTE_INDICES = [0, 2, 4, 5, 7, 9, 11] as const
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

const FLAT_TO_SHARP: Record<string, string> = {
  Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#',
  Cb: 'B', Fb: 'E', 'E#': 'F', 'B#': 'C',
}

/** Normalize "Eb4" -> "D#4" so flat-spelled notes match the sharp-keyed keyboard. */
function toSharpForm(note: string): string {
  const m = note.match(/^([A-G](?:#|b)?)(-?\d+)?$/)
  if (!m) return note
  const [, pc, oct] = m
  const sharp = FLAT_TO_SHARP[pc] ?? pc
  return oct !== undefined ? `${sharp}${oct}` : sharp
}

// Which white keys have a black key to their RIGHT
// C→C#, D→D#, F→F#, G→G#, A→A#
const WHITE_WITH_BLACK_RIGHT: Record<number, number> = {
  0: 1,   // C → C#
  2: 3,   // D → D#
  5: 6,   // F → F#
  7: 8,   // G → G#
  9: 10,  // A → A#
}

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
  dimInactive = false,
}: PianoKeyboardProps) {
  const highlightMap = useMemo(() => {
    const map = new Map<string, HighlightedNote>()
    for (const h of highlightedNotes) map.set(toSharpForm(h.note), h)
    return map
  }, [highlightedNotes])

  const activeSet = useMemo(() => new Set(activeNotes.map(toSharpForm)), [activeNotes])

  const handlePlay = useCallback((note: string) => onNotePlay?.(note), [onNotePlay])
  const handleRelease = useCallback((note: string) => onNoteRelease?.(note), [onNoteRelease])

  // Touch gesture state — defers note play until pointer-up so vertical scrolls
  // through the keyboard don't accidentally fire notes. Mouse input stays
  // immediate so click-and-hold still works on desktop.
  const TAP_THRESHOLD_PX = 8
  const gestureRef = useRef<
    | {
        note: string
        pointerType: string
        startX: number
        startY: number
        firedDown: boolean
      }
    | null
  >(null)

  const handleKeyDown = useCallback(
    (e: React.PointerEvent, note: string) => {
      const isMouse = e.pointerType === 'mouse'
      gestureRef.current = {
        note,
        pointerType: e.pointerType,
        startX: e.clientX,
        startY: e.clientY,
        firedDown: isMouse,
      }
      if (isMouse) handlePlay(note)
    },
    [handlePlay],
  )

  const handleKeyMove = useCallback(
    (e: React.PointerEvent) => {
      const g = gestureRef.current
      if (!g) return
      const dx = e.clientX - g.startX
      const dy = e.clientY - g.startY
      if (Math.hypot(dx, dy) > TAP_THRESHOLD_PX) {
        if (g.firedDown) handleRelease(g.note)
        gestureRef.current = null
      }
    },
    [handleRelease],
  )

  const handleKeyUp = useCallback(
    (note: string) => {
      const g = gestureRef.current
      if (!g || g.note !== note) {
        gestureRef.current = null
        return
      }
      if (g.firedDown) {
        handleRelease(note)
      } else {
        // Touch tap that didn't drift — fire and auto-release for percussive feel
        handlePlay(note)
        window.setTimeout(() => handleRelease(note), 220)
      }
      gestureRef.current = null
    },
    [handlePlay, handleRelease],
  )

  const handleKeyCancel = useCallback(
    (note: string) => {
      const g = gestureRef.current
      if (g?.firedDown && g.note === note) handleRelease(note)
      gestureRef.current = null
    },
    [handleRelease],
  )

  // Sizing
  const wKeyW = compact ? 36 : 48   // px
  const wKeyH = compact ? 112 : 160
  const bKeyW = compact ? 24 : 32
  const bKeyH = compact ? 64 : 96

  // Build white key + optional black key pairs
  type KeyPair = {
    white: { note: string; noteIdx: number }
    black?: { note: string }
  }

  const keyPairs: KeyPair[] = useMemo(() => {
    const result: KeyPair[] = []
    for (let oct = startOctave; oct < startOctave + octaves; oct++) {
      for (const wIdx of WHITE_NOTE_INDICES) {
        const whiteNote = `${NOTE_NAMES[wIdx]}${oct}`
        const pair: KeyPair = { white: { note: whiteNote, noteIdx: wIdx } }

        const bIdx = WHITE_WITH_BLACK_RIGHT[wIdx]
        if (bIdx !== undefined) {
          pair.black = { note: `${NOTE_NAMES[bIdx]}${oct}` }
        }
        result.push(pair)
      }
    }
    // Final C
    result.push({ white: { note: `C${startOctave + octaves}`, noteIdx: 0 } })
    return result
  }, [startOctave, octaves])

  return (
    <div
      className="inline-flex relative select-none"
      style={{ touchAction: 'pan-y' }}
      role="group"
      aria-label="Piano keyboard"
    >
      {keyPairs.map(({ white, black }) => {
        const wNote = white.note
        const wActive = activeSet.has(wNote)
        const wHighlight = highlightMap.get(wNote)
        const wPitchClass = wNote.replace(/\d/, '')
        const dimWhite = dimInactive && activeSet.size > 0 && !wActive && !!wHighlight

        return (
          <div key={wNote} className="relative" style={{ width: wKeyW }}>
            {/* White key */}
            <button
              onPointerDown={(e) => handleKeyDown(e, wNote)}
              onPointerMove={handleKeyMove}
              onPointerUp={() => handleKeyUp(wNote)}
              onPointerCancel={() => handleKeyCancel(wNote)}
              onPointerLeave={() => handleKeyCancel(wNote)}
              className={cn(
                'border border-surface-200 rounded-b-lg transition-all duration-75 select-none flex flex-col items-center justify-end pb-2 w-full',
                wActive
                  ? 'bg-primary-200 border-primary-500 shadow-[0_0_16px_rgba(79,110,247,0.5)]'
                  : wHighlight
                    ? `bg-white ring-2 ring-inset ${ROLE_RING_COLORS[wHighlight.role ?? 'other']}`
                    : 'bg-white hover:bg-surface-50',
              )}
              style={{ height: wKeyH, opacity: dimWhite ? 0.25 : 1, transition: 'opacity 120ms' }}
              aria-label={wNote}
            >
              {/* Colored dot */}
              {(wHighlight || wActive) && (
                <span
                  className={cn(
                    'rounded-full mb-1 transition-transform',
                    wActive ? 'w-6 h-6 shadow-lg scale-110' : 'w-5 h-5',
                    wActive ? 'bg-primary-500' : ROLE_COLORS[wHighlight?.role ?? 'other'],
                  )}
                />
              )}
              {/* Label */}
              {showLabels && (
                <span className={cn(
                  'text-[10px] font-medium',
                  wActive ? 'text-primary-700' : 'text-surface-400',
                )}>
                  {wPitchClass}
                </span>
              )}
            </button>

            {/* Black key - positioned at the right edge of this white key */}
            {black && (() => {
              const bNote = black.note
              const bActive = activeSet.has(bNote)
              const bHighlight = highlightMap.get(bNote)
              const dimBlack = dimInactive && activeSet.size > 0 && !bActive && !!bHighlight

              return (
                <button
                  key={bNote}
                  onPointerDown={(e) => handleKeyDown(e, bNote)}
                  onPointerMove={handleKeyMove}
                  onPointerUp={() => handleKeyUp(bNote)}
                  onPointerCancel={() => handleKeyCancel(bNote)}
                  onPointerLeave={() => handleKeyCancel(bNote)}
                  className={cn(
                    'absolute top-0 z-10 rounded-b-md border border-surface-900 transition-all duration-75 select-none flex flex-col items-center justify-end pb-1',
                    bActive
                      ? 'bg-primary-400 border-primary-500 shadow-[0_0_12px_rgba(79,110,247,0.7)]'
                      : bHighlight
                        ? `${ROLE_COLORS[bHighlight.role ?? 'other']} border-transparent`
                        : 'bg-surface-900 hover:bg-surface-800',
                  )}
                  style={{
                    width: bKeyW,
                    height: bKeyH,
                    right: -(bKeyW / 2),
                    opacity: dimBlack ? 0.25 : 1,
                    transition: 'opacity 120ms',
                  }}
                  aria-label={bNote}
                >
                  {/* Dot */}
                  {(bHighlight || bActive) && (
                    <span className={cn(
                      'rounded-full bg-white mb-0.5',
                      bActive ? 'w-3.5 h-3.5 opacity-90' : 'w-3 h-3 opacity-70',
                    )} />
                  )}
                </button>
              )
            })()}
          </div>
        )
      })}
    </div>
  )
}
