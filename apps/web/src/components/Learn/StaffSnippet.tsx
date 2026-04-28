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
    <div className="inline-flex flex-col items-center my-2">
      {title && <div className="text-xs font-medium text-surface-500 mb-1">{title}</div>}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="bg-white rounded-lg border border-surface-100"
        style={{ width: Math.min(width, 600), maxWidth: '100%' }}
      >
        {/* Staff lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`line-${i}`}
            x1={padLeft - 4}
            y1={staffTop + i * lineSpacing}
            x2={width - padRight}
            y2={staffTop + i * lineSpacing}
            stroke="#d4d4d8"
            strokeWidth={0.9}
          />
        ))}

        {/* Treble clef */}
        <text x={padLeft - 30} y={staffTop + 3.4 * lineSpacing} fontSize={36} fill="#52525b" fontFamily="serif">
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
                <line key={k} x1={x - 9} y1={ly} x2={x + 9} y2={ly} stroke="#d4d4d8" strokeWidth={0.9} />
              ))}
              {isSharp(parsed.pc) && (
                <text x={x - 13} y={y + 3} fontSize={12} fill="#52525b" fontFamily="serif" fontWeight="bold">
                  ♯
                </text>
              )}
              {isFlat(parsed.pc) && (
                <text x={x - 13} y={y + 3} fontSize={12} fill="#52525b" fontFamily="serif" fontWeight="bold">
                  ♭
                </text>
              )}
              <ellipse cx={x} cy={y} rx={noteRadius} ry={noteRadius * 0.78} fill="#18181b" />
              {/* Stem (up if note is in lower half, down if upper) */}
              <line
                x1={y > staffTop + 2 * lineSpacing ? x + noteRadius : x - noteRadius}
                y1={y}
                x2={y > staffTop + 2 * lineSpacing ? x + noteRadius : x - noteRadius}
                y2={y > staffTop + 2 * lineSpacing ? y - 26 : y + 26}
                stroke="#18181b"
                strokeWidth={1.1}
              />
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                fontSize={9}
                fill="#71717a"
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
}

export function getStaffPreset(key: string) {
  return PRESETS[key.toLowerCase()]
}
