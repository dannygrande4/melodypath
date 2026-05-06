/**
 * Compact treble-clef staff snippet for lessons.
 * Pass note names like ['C4', 'E4', 'G4'] or with sharps ['F#4', 'C#5'].
 * Renders the notes in order, automatically drawing ledger lines as needed.
 */

interface StaffSnippetProps {
  notes: string[]
  title?: string
}

const NOTE_SEMITONES: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4,
  F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
}

// Diatonic step index (C=0, D=1, E=2 ...) — flats and sharps share the natural step.
const DIATONIC_STEP: Record<string, number> = {
  C: 0, 'C#': 0, Db: 1, D: 1, 'D#': 1, Eb: 2, E: 2,
  F: 3, 'F#': 3, Gb: 4, G: 4, 'G#': 4, Ab: 5, A: 5, 'A#': 5, Bb: 6, B: 6,
}

function parseNote(note: string): { pc: string; octave: number } | null {
  const m = note.match(/^([A-G](?:#|b)?)(-?\d+)$/)
  if (!m) return null
  return { pc: m[1], octave: parseInt(m[2], 10) }
}

export default function StaffSnippet({ notes, title }: StaffSnippetProps) {
  const noteSpacing = 38
  const staffTop = 26
  const lineSpacing = 8
  const noteRadius = 4.8
  const padLeft = 36
  const padRight = 16
  const width = padLeft + notes.length * noteSpacing + padRight
  const height = 110

  // Diatonic position for E4 = bottom line of treble clef (step 2 in C scale).
  const e4Position = 2

  function noteY(parsed: { pc: string; octave: number }): number {
    const step = DIATONIC_STEP[parsed.pc]
    const diatonic = step + parsed.octave * 7
    const e4Diatonic = e4Position + 4 * 7
    const bottomLineY = staffTop + 4 * lineSpacing
    return bottomLineY - (diatonic - e4Diatonic) * (lineSpacing / 2)
  }

  function isSharp(pc: string) {
    return pc.endsWith('#')
  }
  function isFlat(pc: string) {
    return pc.endsWith('b') && pc.length > 1
  }

  return (
    <div className="inline-flex flex-col items-center my-2 text-surface-700 dark:text-surface-200">
      {title && <div className="text-xs font-medium text-surface-500 mb-1">{title}</div>}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="bg-white dark:bg-surface-900/40 rounded-lg border border-surface-200 dark:border-surface-700"
        style={{ width: Math.min(width, 600), maxWidth: '100%' }}
      >
        {/* Staff lines — currentColor adapts to theme */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`line-${i}`}
            x1={padLeft - 4}
            y1={staffTop + i * lineSpacing}
            x2={width - padRight}
            y2={staffTop + i * lineSpacing}
            stroke="currentColor"
            strokeOpacity={0.45}
            strokeWidth={1}
          />
        ))}

        {/* Treble clef */}
        <text x={padLeft - 30} y={staffTop + 3.4 * lineSpacing} fontSize={36} fill="#2563eb" fontFamily="serif">
          𝄞
        </text>

        {/* Notes */}
        {notes.map((noteName, i) => {
          const parsed = parseNote(noteName)
          if (!parsed) return null
          const x = padLeft + i * noteSpacing + noteSpacing / 2
          const y = noteY(parsed)
          const needsLedgerAbove = y < staffTop - lineSpacing / 2
          const needsLedgerBelow = y > staffTop + 4 * lineSpacing + lineSpacing / 2

          // Draw all ledger lines between note and staff
          const ledgerLines: number[] = []
          if (needsLedgerBelow) {
            for (let ly = staffTop + 5 * lineSpacing; ly <= y + 1; ly += lineSpacing) {
              ledgerLines.push(ly)
            }
          }
          if (needsLedgerAbove) {
            for (let ly = staffTop - lineSpacing; ly >= y - 1; ly -= lineSpacing) {
              ledgerLines.push(ly)
            }
          }

          return (
            <g key={`note-${i}`}>
              {ledgerLines.map((ly, k) => (
                <line key={k} x1={x - 9} y1={ly} x2={x + 9} y2={ly} stroke="currentColor" strokeOpacity={0.45} strokeWidth={1} />
              ))}
              {isSharp(parsed.pc) && (
                <text x={x - 13} y={y + 3} fontSize={12} fill="#2563eb" fontFamily="serif" fontWeight="bold">
                  ♯
                </text>
              )}
              {isFlat(parsed.pc) && (
                <text x={x - 13} y={y + 3} fontSize={12} fill="#2563eb" fontFamily="serif" fontWeight="bold">
                  ♭
                </text>
              )}
              <ellipse cx={x} cy={y} rx={noteRadius} ry={noteRadius * 0.78} fill="#2563eb" />
              {/* Stem (up if note is in lower half, down if upper) */}
              <line
                x1={y > staffTop + 2 * lineSpacing ? x + noteRadius : x - noteRadius}
                y1={y}
                x2={y > staffTop + 2 * lineSpacing ? x + noteRadius : x - noteRadius}
                y2={y > staffTop + 2 * lineSpacing ? y - 26 : y + 26}
                stroke="#2563eb"
                strokeWidth={1.4}
              />
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                fontSize={9}
                fill="currentColor"
                fillOpacity={0.7}
                fontFamily="Inter, sans-serif"
                fontWeight="500"
              >
                {parsed.pc}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Convenience presets keyed by name ───────────────────────────────────────
const PRESETS: Record<string, { notes: string[]; title: string }> = {
  'c-major-scale': { notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], title: 'C major scale' },
  'g-major-scale': { notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'], title: 'G major scale' },
  'a-minor-scale': { notes: ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'], title: 'A natural minor scale' },
  'c-major-pentatonic': { notes: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'], title: 'C major pentatonic' },
  'a-minor-pentatonic': { notes: ['A4', 'C5', 'D5', 'E5', 'G5', 'A5'], title: 'A minor pentatonic' },
  'c-blues-scale': { notes: ['C4', 'Eb4', 'F4', 'F#4', 'G4', 'Bb4', 'C5'], title: 'C blues scale' },
  'c-major-triad': { notes: ['C4', 'E4', 'G4'], title: 'C major triad' },
  'c-minor-triad': { notes: ['C4', 'Eb4', 'G4'], title: 'C minor triad' },

  // Modes — all rooted on C for easy comparison.
  'c-ionian': { notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], title: 'C Ionian (major)' },
  'c-dorian': { notes: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4', 'C5'], title: 'C Dorian — minor with raised 6th' },
  'c-phrygian': { notes: ['C4', 'Db4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'], title: 'C Phrygian — minor with lowered 2nd' },
  'c-lydian': { notes: ['C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5'], title: 'C Lydian — major with raised 4th' },
  'c-mixolydian': { notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5'], title: 'C Mixolydian — major with lowered 7th' },
  'c-aeolian': { notes: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'], title: 'C Aeolian (natural minor)' },
  'c-locrian': { notes: ['C4', 'Db4', 'Eb4', 'F4', 'Gb4', 'Ab4', 'Bb4', 'C5'], title: 'C Locrian — minor with lowered 2nd & 5th' },

  // Other scales used in modal/jazz/advanced content.
  'a-harmonic-minor': { notes: ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G#5', 'A5'], title: 'A harmonic minor (raised 7th)' },
  'a-melodic-minor': { notes: ['A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G#5', 'A5'], title: 'A melodic minor (raised 6th & 7th)' },
  'c-whole-tone': { notes: ['C4', 'D4', 'E4', 'F#4', 'G#4', 'A#4', 'C5'], title: 'C whole-tone scale' },
  'c-chromatic': { notes: ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'], title: 'C chromatic scale' },

  // Triad inversions on C major (root, 1st, 2nd).
  'c-triad-root': { notes: ['C4', 'E4', 'G4'], title: 'C major — root position' },
  'c-triad-1st': { notes: ['E4', 'G4', 'C5'], title: 'C major — 1st inversion (E in bass)' },
  'c-triad-2nd': { notes: ['G4', 'C5', 'E5'], title: 'C major — 2nd inversion (G in bass)' },

  // 7th chord stacks on C.
  'c-maj7': { notes: ['C4', 'E4', 'G4', 'B4'], title: 'Cmaj7 — C, E, G, B' },
  'c-dom7': { notes: ['C4', 'E4', 'G4', 'Bb4'], title: 'C7 (dominant) — C, E, G, Bb' },
  'c-min7': { notes: ['C4', 'Eb4', 'G4', 'Bb4'], title: 'Cm7 — C, Eb, G, Bb' },

  // ii-V-I voicings for jazz reference.
  'ii-v-i-bass': { notes: ['D3', 'G3', 'C4'], title: 'ii–V–I bass roots in C major' },
  'tritone-sub': { notes: ['G3', 'Db4'], title: 'V (G7) and its tritone sub (Db7)' },
}

export function getStaffPreset(key: string) {
  return PRESETS[key.toLowerCase()]
}
