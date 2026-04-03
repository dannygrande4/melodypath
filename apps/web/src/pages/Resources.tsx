import { useState } from 'react'
import { SCALE_REFERENCES, type ScaleReference } from '@/lib/scaleReference'
import InfoTooltip from '@/components/ui/InfoTooltip'

// ─── Simple Staff Notation Renderer ──────────────────────────────────────────

function StaffNotation({ notes, label }: { notes: number[]; label: string }) {
  const width = Math.max(300, notes.length * 36 + 80)
  const staffTop = 30
  const lineSpacing = 8
  const noteRadius = 4.5

  // Middle C = MIDI 60, B4 = MIDI 71 is on the middle line of treble clef
  // Each staff line/space = half step in pitch mapped to vertical position
  // Treble clef: bottom line = E4(64), top line = F5(77)
  function noteY(midi: number): number {
    // Map MIDI to staff position: each semitone = ~3.5px, but we use diatonic
    // Simplified: map to lines where E4=bottom line of staff
    const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    const octave = Math.floor(midi / 12) - 1
    const noteIdx = midi % 12
    const diatonicMap: Record<number, number> = {
      0: 0, 1: 0, 2: 1, 3: 1, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 5, 10: 5, 11: 6,
    }
    const diatonic = diatonicMap[noteIdx] + (octave - 4) * 7
    // E4 = diatonic position 2 (in octave 4), which is the bottom line
    // Staff bottom line position = staffTop + 4 * lineSpacing
    const bottomLineY = staffTop + 4 * lineSpacing
    const e4Diatonic = 2 // E is index 2 in C scale
    return bottomLineY - (diatonic - e4Diatonic) * (lineSpacing / 2)
  }

  const isSharp = (midi: number) => [1, 3, 6, 8, 10].includes(midi % 12)
  const noteName = (midi: number) => {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    return names[midi % 12]
  }

  return (
    <div>
      <div className="text-xs font-medium text-surface-500 mb-1">{label}</div>
      <svg viewBox={`0 0 ${width} 80`} className="w-full max-w-lg bg-white rounded-lg border border-surface-100 p-1">
        {/* Staff lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={30}
            y1={staffTop + i * lineSpacing}
            x2={width - 10}
            y2={staffTop + i * lineSpacing}
            stroke="#d4d4d8"
            strokeWidth={0.8}
          />
        ))}

        {/* Treble clef symbol */}
        <text x={8} y={staffTop + 3.2 * lineSpacing} fontSize={28} fill="#71717a" fontFamily="serif">
          𝄞
        </text>

        {/* Notes */}
        {notes.map((midi, i) => {
          const x = 55 + i * 32
          const y = noteY(midi)
          const needsLedgerAbove = y < staffTop - lineSpacing
          const needsLedgerBelow = y > staffTop + 4 * lineSpacing + lineSpacing / 2
          const sharp = isSharp(midi)

          return (
            <g key={i}>
              {/* Ledger lines */}
              {needsLedgerBelow && (
                <line x1={x - 8} y1={staffTop + 5 * lineSpacing} x2={x + 8} y2={staffTop + 5 * lineSpacing} stroke="#d4d4d8" strokeWidth={0.8} />
              )}
              {needsLedgerAbove && (
                <line x1={x - 8} y1={staffTop - lineSpacing} x2={x + 8} y2={staffTop - lineSpacing} stroke="#d4d4d8" strokeWidth={0.8} />
              )}
              {/* Sharp symbol */}
              {sharp && (
                <text x={x - 10} y={y + 3} fontSize={10} fill="#52525b" fontFamily="serif">♯</text>
              )}
              {/* Note head */}
              <ellipse cx={x} cy={y} rx={noteRadius} ry={noteRadius * 0.8} fill="#18181b" />
              {/* Stem */}
              <line x1={x + noteRadius} y1={y} x2={x + noteRadius} y2={y - 22} stroke="#18181b" strokeWidth={1} />
              {/* Note name below */}
              <text x={x} y={75} textAnchor="middle" fontSize={7} fill="#a1a1aa" fontFamily="Inter, sans-serif">
                {noteName(midi)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Tab Notation Renderer ───────────────────────────────────────────────────

function TabNotation({ tab, label }: { tab: ScaleReference['tab']; label: string }) {
  const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']
  const allFrets = tab.flatMap((t) => t.frets)
  const width = Math.max(250, allFrets.length * 28 + 80)

  // Flatten to ordered list of (string, fret) for left-to-right rendering
  const orderedNotes: { string: number; fret: number }[] = []
  for (const t of tab) {
    for (const fret of t.frets) {
      orderedNotes.push({ string: t.string, fret })
    }
  }

  return (
    <div>
      <div className="text-xs font-medium text-surface-500 mb-1">{label}</div>
      <svg viewBox={`0 0 ${width} 78`} className="w-full max-w-lg bg-white rounded-lg border border-surface-100 p-1">
        {/* TAB label */}
        <text x={6} y={22} fontSize={7} fill="#71717a" fontWeight="bold" fontFamily="monospace">T</text>
        <text x={6} y={32} fontSize={7} fill="#71717a" fontWeight="bold" fontFamily="monospace">A</text>
        <text x={6} y={42} fontSize={7} fill="#71717a" fontWeight="bold" fontFamily="monospace">B</text>

        {/* String lines + labels */}
        {STRING_NAMES.map((name, i) => {
          const y = 12 + i * 10
          return (
            <g key={i}>
              <line x1={20} y1={y} x2={width - 10} y2={y} stroke="#d4d4d8" strokeWidth={0.8} />
              <text x={width - 6} y={y + 3} fontSize={7} fill="#a1a1aa" textAnchor="end" fontFamily="monospace">
                {name}
              </text>
            </g>
          )
        })}

        {/* Fret numbers */}
        {orderedNotes.map((note, i) => {
          const x = 30 + i * 26
          // Tab: string 1 (high e) = top line (index 0), string 6 (low E) = bottom line (index 5)
          const stringIdx = note.string - 1
          const y = 12 + stringIdx * 10
          return (
            <g key={i}>
              {/* White background to cover the line */}
              <rect x={x - 5} y={y - 5} width={10} height={10} fill="white" />
              <text
                x={x}
                y={y + 3.5}
                textAnchor="middle"
                fontSize={9}
                fontWeight="bold"
                fontFamily="monospace"
                fill="#18181b"
              >
                {note.fret}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Scale Card ──────────────────────────────────────────────────────────────

function ScaleCard({ scale }: { scale: ScaleReference }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-center justify-between hover:bg-surface-50 transition-colors"
      >
        <div>
          <div className="font-bold text-surface-900">{scale.name}</div>
          <div className="text-sm text-surface-500 mt-0.5">{scale.mood}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {scale.genres.slice(0, 3).map((g) => (
              <span key={g} className="px-1.5 py-0.5 bg-surface-100 rounded text-[10px] text-surface-500 font-medium">
                {g}
              </span>
            ))}
          </div>
          <span className="text-surface-300 text-lg">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-surface-200 p-5 space-y-4">
          {/* Description + formula */}
          <p className="text-sm text-surface-600">{scale.description}</p>

          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <div className="text-xs text-surface-400 mb-0.5">Formula</div>
              <div className="font-mono font-bold text-surface-800">{scale.formula}</div>
            </div>
            <div>
              <div className="text-xs text-surface-400 mb-0.5">Key of {scale.exampleKey}</div>
              <div className="flex gap-1">
                {scale.exampleNotes.map((n, i) => (
                  <span
                    key={n}
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      i === 0
                        ? 'bg-note-root text-white'
                        : 'bg-surface-100 text-surface-700'
                    }`}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Staff notation */}
          <StaffNotation notes={scale.staffNotes} label="Staff Notation" />

          {/* Tab notation */}
          <TabNotation tab={scale.tab} label="Guitar Tab" />
        </div>
      )}
    </div>
  )
}

// ─── Resources Page ──────────────────────────────────────────────────────────

export default function Resources() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Resources</h1>
        <p className="text-surface-500 text-sm mt-1">
          Scale reference sheets with staff notation and guitar tab
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-surface-400 bg-surface-50 rounded-lg p-3">
        <InfoTooltip
          size="md"
          text="Click any scale to expand it and see the staff notation (for reading sheet music) and guitar tab (numbers showing which fret to play on each string). The root note is highlighted in blue."
        />
        Click a scale to see notation — staff for reading, tab for guitar frets
      </div>

      <div className="space-y-2">
        {SCALE_REFERENCES.map((scale) => (
          <ScaleCard key={scale.name} scale={scale} />
        ))}
      </div>
    </div>
  )
}
