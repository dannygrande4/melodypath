/**
 * Canonical guitar chord-chart diagram.
 *
 * Convention: low E on the LEFT, high E on the RIGHT (player's perspective
 * looking down at the fretboard). The frets array follows the same order:
 * frets[0] = low E (6th string), frets[5] = high E (1st string).
 *
 * Values: -1 = muted ("X" above the string), 0 = open ("O" above), n>0 = fretted.
 */

export interface ChordDiagramProps {
  /** Chord name shown above the diagram (e.g. "C", "Am", "Dm7"). */
  name: string
  /** Fret positions, low E to high E. -1 mute, 0 open, n>0 fretted. */
  frets: number[]
  /** Optional finger numbers (0 = none, 1–4 fingers). */
  fingers?: number[]
  /** First fret shown. 1 = open position. Higher values draw a "Nfr" label. */
  baseFret?: number
  /** Optional barre line spanning a contiguous string range at a given fret. */
  barre?: { fromString: number; toString: number; fret: number }
  /** Number of frets to render (default 4). */
  fretsToShow?: number
  /** Compact diagram for inline use. */
  size?: 'sm' | 'md'
}

const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e']

export default function ChordDiagram({
  name,
  frets,
  fingers,
  baseFret = 1,
  barre,
  fretsToShow = 4,
  size = 'md',
}: ChordDiagramProps) {
  const stringSpacing = size === 'sm' ? 14 : 20
  const fretSpacing = size === 'sm' ? 18 : 26
  const dotRadius = size === 'sm' ? 5.5 : 8
  const fontSize = size === 'sm' ? 8 : 10

  const padTop = size === 'sm' ? 26 : 34
  const padLeft = size === 'sm' ? 20 : 28
  const padRight = size === 'sm' ? 20 : 28
  const padBottom = size === 'sm' ? 14 : 18

  const width = padLeft + 5 * stringSpacing + padRight
  const height = padTop + fretsToShow * fretSpacing + padBottom

  const isOpenPosition = baseFret <= 1
  const nutY = padTop

  return (
    <div className="inline-flex flex-col items-center select-none">
      <div className={`font-bold text-surface-900 mb-1 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
        {name}
      </div>
      <svg width={width} height={height} role="img" aria-label={`${name} chord diagram`}>
        {/* Open / mute markers above strings */}
        {frets.map((f, i) => {
          const x = padLeft + i * stringSpacing
          if (f === -1) {
            return (
              <text
                key={`mark-${i}`}
                x={x}
                y={padTop - 8}
                textAnchor="middle"
                fontSize={fontSize + 1}
                fill="#71717a"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
              >
                ✕
              </text>
            )
          }
          if (f === 0) {
            return (
              <circle
                key={`mark-${i}`}
                cx={x}
                cy={padTop - 9}
                r={dotRadius * 0.55}
                fill="none"
                stroke="#71717a"
                strokeWidth={1.4}
              />
            )
          }
          return null
        })}

        {/* Nut (thick line if open position) */}
        {isOpenPosition && (
          <line
            x1={padLeft}
            y1={nutY}
            x2={padLeft + 5 * stringSpacing}
            y2={nutY}
            stroke="#1a1a1a"
            strokeWidth={size === 'sm' ? 3 : 4}
          />
        )}

        {/* Fret label when not open position (e.g. "5fr") */}
        {!isOpenPosition && (
          <text
            x={padLeft - 6}
            y={nutY + fretSpacing - 2}
            textAnchor="end"
            fontSize={fontSize}
            fill="#71717a"
            fontFamily="Inter, sans-serif"
          >
            {baseFret}fr
          </text>
        )}

        {/* Fret lines */}
        {Array.from({ length: fretsToShow }, (_, i) => {
          const y = nutY + (i + 1) * fretSpacing
          return (
            <line
              key={`fret-${i}`}
              x1={padLeft}
              y1={y}
              x2={padLeft + 5 * stringSpacing}
              y2={y}
              stroke="#c4c4c4"
              strokeWidth={1.2}
            />
          )
        })}

        {/* Strings */}
        {STRING_LABELS.map((_, i) => {
          const x = padLeft + i * stringSpacing
          return (
            <line
              key={`string-${i}`}
              x1={x}
              y1={nutY}
              x2={x}
              y2={nutY + fretsToShow * fretSpacing}
              stroke="#a0a0a0"
              strokeWidth={1.1}
            />
          )
        })}

        {/* Barre */}
        {barre && (() => {
          const x1 = padLeft + barre.fromString * stringSpacing
          const x2 = padLeft + barre.toString * stringSpacing
          const relFret = barre.fret - baseFret + 1
          const y = nutY + (relFret - 0.5) * fretSpacing
          return (
            <rect
              x={x1 - dotRadius}
              y={y - dotRadius * 0.55}
              width={x2 - x1 + dotRadius * 2}
              height={dotRadius * 1.1}
              rx={dotRadius * 0.55}
              fill="#4f6ef7"
              opacity={0.9}
            />
          )
        })()}

        {/* Fretted dots */}
        {frets.map((f, i) => {
          if (f <= 0) return null
          const relFret = f - baseFret + 1
          if (relFret < 1 || relFret > fretsToShow) return null
          const x = padLeft + i * stringSpacing
          const y = nutY + (relFret - 0.5) * fretSpacing
          const finger = fingers?.[i] ?? 0
          return (
            <g key={`dot-${i}`}>
              <circle cx={x} cy={y} r={dotRadius} fill="#4f6ef7" stroke="white" strokeWidth={1.5} />
              {finger > 0 && (
                <text
                  x={x}
                  y={y + fontSize * 0.36}
                  textAnchor="middle"
                  fontSize={fontSize}
                  fontWeight="bold"
                  fill="white"
                  fontFamily="Inter, sans-serif"
                  pointerEvents="none"
                >
                  {finger}
                </text>
              )}
            </g>
          )
        })}

        {/* String name labels at the bottom */}
        {STRING_LABELS.map((label, i) => (
          <text
            key={`slabel-${i}`}
            x={padLeft + i * stringSpacing}
            y={nutY + fretsToShow * fretSpacing + padBottom - 4}
            textAnchor="middle"
            fontSize={fontSize - 1}
            fill="#a1a1aa"
            fontFamily="Inter, sans-serif"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
}
