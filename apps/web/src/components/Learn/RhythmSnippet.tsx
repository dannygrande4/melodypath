/**
 * Rhythm visualization for lessons. Renders a row of note shapes (whole,
 * half, quarter, eighth, sixteenth — plus dotted variants and rests) with
 * an optional time-signature on the left and beat-count labels underneath.
 *
 * Token grammar (one entry per beat-group, comma-separated):
 *   w   whole note     |  wr  whole rest
 *   h   half note      |  hr  half rest
 *   q   quarter note   |  qr  quarter rest
 *   e   eighth note    |  er  eighth rest
 *   s   sixteenth note |  sr  sixteenth rest
 * Append "." to dot a note (e.g. q., h.).
 *
 * Examples:
 *   <RhythmSnippet timeSig="4/4" pattern="q,q,q,q" title="Four quarter notes" />
 *   <RhythmSnippet timeSig="6/8" pattern="q.,q." />
 *   <RhythmSnippet pattern="w" title="Whole note = 4 beats" />
 */

interface RhythmSnippetProps {
  pattern: string
  timeSig?: string
  title?: string
  showCount?: boolean
}

interface NoteSpec {
  raw: string
  kind: 'w' | 'h' | 'q' | 'e' | 's'
  isRest: boolean
  dotted: boolean
  beats: number
}

const BEAT_VALUES: Record<NoteSpec['kind'], number> = { w: 4, h: 2, q: 1, e: 0.5, s: 0.25 }

function parseNote(token: string): NoteSpec | null {
  const t = token.trim()
  const dotted = t.endsWith('.')
  const core = dotted ? t.slice(0, -1) : t
  const isRest = core.endsWith('r')
  const kindChar = (isRest ? core.slice(0, -1) : core) as NoteSpec['kind']
  if (!(kindChar in BEAT_VALUES)) return null
  const base = BEAT_VALUES[kindChar]
  return {
    raw: t,
    kind: kindChar,
    isRest,
    dotted,
    beats: dotted ? base * 1.5 : base,
  }
}

export default function RhythmSnippet({ pattern, timeSig, title, showCount = true }: RhythmSnippetProps) {
  const notes = pattern.split(',').map(parseNote).filter((n): n is NoteSpec => n !== null)

  // Width allocated per note scales with its duration so the visual length
  // roughly matches its rhythmic weight. Whole notes get the most space.
  const noteWidth = (n: NoteSpec) => 24 + Math.min(n.beats, 4) * 14
  const padLeft = timeSig ? 56 : 28
  const padRight = 16
  const totalNoteWidth = notes.reduce((sum, n) => sum + noteWidth(n), 0)
  const width = padLeft + totalNoteWidth + padRight
  const height = 110

  const staffTop = 30
  const lineSpacing = 8
  const middleLineY = staffTop + 2 * lineSpacing
  const stemUpFromY = (y: number) => y - 28

  // Cumulative beat counter for the count row underneath.
  let beatCursor = 1

  return (
    <div className="inline-flex flex-col items-center my-2 text-surface-700 dark:text-surface-200">
      {title && <div className="text-xs font-medium text-surface-500 mb-1">{title}</div>}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="bg-white dark:bg-surface-900/40 rounded-lg border border-surface-200 dark:border-surface-700"
        style={{ width: Math.min(width, 600), maxWidth: '100%' }}
      >
        {/* Staff lines — currentColor so they work in light + dark */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`line-${i}`}
            x1={padLeft - 8}
            y1={staffTop + i * lineSpacing}
            x2={width - padRight}
            y2={staffTop + i * lineSpacing}
            stroke="currentColor"
            strokeOpacity={0.45}
            strokeWidth={1}
          />
        ))}

        {/* Time signature */}
        {timeSig && (() => {
          const [top, bottom] = timeSig.split('/')
          return (
            <g>
              <text
                x={padLeft - 30}
                y={staffTop + 1.5 * lineSpacing}
                fontSize={20}
                fontWeight="bold"
                fill="#2563eb"
                fontFamily="Georgia, serif"
                textAnchor="middle"
              >
                {top}
              </text>
              <text
                x={padLeft - 30}
                y={staffTop + 3.5 * lineSpacing}
                fontSize={20}
                fontWeight="bold"
                fill="#2563eb"
                fontFamily="Georgia, serif"
                textAnchor="middle"
              >
                {bottom}
              </text>
            </g>
          )
        })()}

        {/* Notes */}
        {(() => {
          let cursorX = padLeft
          return notes.map((n, i) => {
            const w = noteWidth(n)
            const cx = cursorX + w / 2
            cursorX += w
            const beatStart = beatCursor
            beatCursor += n.beats

            return (
              <g key={`note-${i}`}>
                {renderGlyph(n, cx, middleLineY, lineSpacing, stemUpFromY)}
                {showCount && !n.isRest && (
                  <text
                    x={cx}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#71717a"
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                  >
                    {formatCount(beatStart)}
                  </text>
                )}
              </g>
            )
          })
        })()}
      </svg>
    </div>
  )
}

function formatCount(beat: number): string {
  // Show whole-number beats as "1", "2", etc., halves as "&", quarters as "e"/"a".
  const whole = Math.floor(beat)
  const frac = beat - whole
  if (frac < 0.01) return String(whole)
  if (Math.abs(frac - 0.5) < 0.01) return '&'
  if (Math.abs(frac - 0.25) < 0.01) return 'e'
  if (Math.abs(frac - 0.75) < 0.01) return 'a'
  return ''
}

function renderGlyph(
  n: NoteSpec,
  cx: number,
  midY: number,
  lineSpacing: number,
  stemUpFromY: (y: number) => number,
) {
  // Notes sit on the middle line (B4) for readability; rests use centered glyphs.
  const noteY = midY
  const noteRx = 5.4
  const noteRy = 4.2
  const stemColor = '#2563eb'
  const noteColor = '#2563eb'

  const dotEl = n.dotted && !n.isRest ? (
    <circle cx={cx + noteRx + 4} cy={noteY} r={1.6} fill={stemColor} />
  ) : n.dotted && n.isRest ? (
    <circle cx={cx + 8} cy={noteY} r={1.6} fill={stemColor} />
  ) : null

  if (n.isRest) {
    return (
      <g>
        {renderRest(n.kind, cx, midY, lineSpacing)}
        {dotEl}
      </g>
    )
  }

  // Stems: down from upper notes, up from lower; placed on right-side for up.
  const stemX = cx + noteRx
  const stemY1 = noteY
  const stemY2 = stemUpFromY(noteY)

  if (n.kind === 'w') {
    return (
      <g>
        <ellipse cx={cx} cy={noteY} rx={noteRx} ry={noteRy} fill="none" stroke={noteColor} strokeWidth={1.4} />
        {dotEl}
      </g>
    )
  }

  if (n.kind === 'h') {
    return (
      <g>
        <ellipse cx={cx} cy={noteY} rx={noteRx} ry={noteRy} fill="none" stroke={noteColor} strokeWidth={1.4} />
        <line x1={stemX} y1={stemY1} x2={stemX} y2={stemY2} stroke={stemColor} strokeWidth={1.2} />
        {dotEl}
      </g>
    )
  }

  if (n.kind === 'q') {
    return (
      <g>
        <ellipse cx={cx} cy={noteY} rx={noteRx} ry={noteRy} fill={noteColor} />
        <line x1={stemX} y1={stemY1} x2={stemX} y2={stemY2} stroke={stemColor} strokeWidth={1.2} />
        {dotEl}
      </g>
    )
  }

  if (n.kind === 'e') {
    return (
      <g>
        <ellipse cx={cx} cy={noteY} rx={noteRx} ry={noteRy} fill={noteColor} />
        <line x1={stemX} y1={stemY1} x2={stemX} y2={stemY2} stroke={stemColor} strokeWidth={1.2} />
        {/* Single flag */}
        <path
          d={`M ${stemX} ${stemY2} q 8 4 6 14`}
          fill="none"
          stroke={stemColor}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {dotEl}
      </g>
    )
  }

  // sixteenth
  return (
    <g>
      <ellipse cx={cx} cy={noteY} rx={noteRx} ry={noteRy} fill={noteColor} />
      <line x1={stemX} y1={stemY1} x2={stemX} y2={stemY2} stroke={stemColor} strokeWidth={1.2} />
      <path d={`M ${stemX} ${stemY2} q 8 4 6 14`} fill="none" stroke={stemColor} strokeWidth={1.5} strokeLinecap="round" />
      <path d={`M ${stemX} ${stemY2 + 6} q 8 4 6 14`} fill="none" stroke={stemColor} strokeWidth={1.5} strokeLinecap="round" />
      {dotEl}
    </g>
  )
}

function renderRest(kind: NoteSpec['kind'], cx: number, midY: number, lineSpacing: number) {
  const color = '#dc2626'

  if (kind === 'w') {
    // Whole rest hangs from the 4th line (one above middle).
    const y = midY - lineSpacing
    return <rect x={cx - 5} y={y} width={10} height={3.5} fill={color} />
  }
  if (kind === 'h') {
    // Half rest sits on the middle line.
    return <rect x={cx - 5} y={midY - 3.5} width={10} height={3.5} fill={color} />
  }
  if (kind === 'q') {
    // Quarter rest — stylized squiggle.
    return (
      <path
        d={`M ${cx - 3} ${midY - 10} q 6 4 0 9 q -6 4 2 10 q 4 4 -2 8`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )
  }
  if (kind === 'e') {
    // Eighth rest — slanted stroke with one flag-blob at top.
    return (
      <g>
        <line x1={cx - 5} y1={midY + 6} x2={cx + 5} y2={midY - 8} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        <circle cx={cx + 4} cy={midY - 7} r={2} fill={color} />
      </g>
    )
  }
  // sixteenth rest — same with two blobs.
  return (
    <g>
      <line x1={cx - 5} y1={midY + 8} x2={cx + 5} y2={midY - 10} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={cx + 4} cy={midY - 9} r={2} fill={color} />
      <circle cx={cx + 1} cy={midY - 3} r={2} fill={color} />
    </g>
  )
}

// ─── Convenience presets ────────────────────────────────────────────────────
const PRESETS: Record<string, { pattern: string; timeSig?: string; title: string }> = {
  'four-quarter-notes': { pattern: 'q,q,q,q', timeSig: '4/4', title: 'Four quarter notes in 4/4' },
  'eighth-notes': { pattern: 'e,e,e,e,e,e,e,e', timeSig: '4/4', title: 'Eight eighth notes — count "1 & 2 & 3 & 4 &"' },
  'note-values': { pattern: 'w', title: 'Whole note = 4 beats' },
  'half-vs-whole': { pattern: 'h,h', timeSig: '4/4', title: 'Two half notes = one whole note' },
  'quarter-vs-half': { pattern: 'q,q,q,q', timeSig: '4/4', title: 'Four quarters = one whole' },
  'dotted-half': { pattern: 'h.,q', timeSig: '4/4', title: 'Dotted half + quarter = 4 beats' },
  'dotted-quarter-eighth': { pattern: 'q.,e,q,q', timeSig: '4/4', title: 'Dotted quarter + eighth — common pop rhythm' },
  'quarter-rest': { pattern: 'q,qr,q,q', timeSig: '4/4', title: 'Beat 2 is silent (quarter rest)' },
  'rests-mixed': { pattern: 'q,er,e,q,q', timeSig: '4/4', title: 'Eighth rest in beat 2' },
  'three-four': { pattern: 'q,q,q', timeSig: '3/4', title: '3/4 time — waltz feel' },
  'six-eight': { pattern: 'e,e,e,e,e,e', timeSig: '6/8', title: '6/8 — two groups of three eighths' },
  'six-eight-dotted': { pattern: 'q.,q.', timeSig: '6/8', title: '6/8 felt as two beats (each = dotted quarter)' },
}

export function getRhythmPreset(key: string) {
  return PRESETS[key.toLowerCase()]
}
