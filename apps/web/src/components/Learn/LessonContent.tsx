import ChordDiagram from '@/components/Guitar/ChordDiagram'
import { getChordShape } from '@/lib/chordLibrary'
import GlossaryText from '@/components/Learn/GlossaryText'
import StaffSnippet, { getStaffPreset } from '@/components/Learn/StaffSnippet'
import RhythmSnippet, { getRhythmPreset } from '@/components/Learn/RhythmSnippet'

/**
 * Renders lesson text content with inline visual tokens.
 *
 * Supported tokens (placed on their own line):
 *   [chord:C]                          Single chord diagram
 *   [chords:C,Am,F,G]                  Row of chord diagrams
 *   [staff:c-major-scale]              Named preset on a staff
 *   [staff-notes:C4,E4,G4|C major triad]  Arbitrary notes; optional |title
 *   [rhythm:four-quarter-notes]        Named rhythm preset
 *   [rhythm-pattern:4/4|q,q,q,q|Title] Arbitrary rhythm; timeSig optional
 */
export default function LessonContent({ content }: { content: string }) {
  const blocks: { kind: 'text' | 'visual'; payload: string }[] = []
  let buffer: string[] = []
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (
      trimmed.startsWith('[') &&
      trimmed.endsWith(']') &&
      /^\[(chord|chords|staff|staff-notes|rhythm|rhythm-pattern):[^\]]+\]$/.test(trimmed)
    ) {
      if (buffer.length) {
        blocks.push({ kind: 'text', payload: buffer.join('\n') })
        buffer = []
      }
      blocks.push({ kind: 'visual', payload: trimmed.slice(1, -1) })
    } else {
      buffer.push(line)
    }
  }
  if (buffer.length) blocks.push({ kind: 'text', payload: buffer.join('\n') })

  return (
    <div className="space-y-4">
      {blocks.map((b, i) =>
        b.kind === 'text' ? <TextBlock key={i} text={b.payload} /> : <VisualBlock key={i} token={b.payload} />,
      )}
    </div>
  )
}

function TextBlock({ text }: { text: string }) {
  // Author-emphasis (**bold**) + glossary linking applied to plain segments.
  return (
    <div className="prose text-surface-700 leading-relaxed whitespace-pre-line">
      {text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="text-surface-900">
              <GlossaryText text={part.slice(2, -2)} />
            </strong>
          )
        }
        return <GlossaryText key={i} text={part} />
      })}
    </div>
  )
}

function VisualBlock({ token }: { token: string }) {
  const [kind, args = ''] = token.split(':')

  if (kind === 'chord') {
    const shape = getChordShape(args)
    if (!shape) return null
    return (
      <div className="flex justify-center py-2">
        <ChordDiagram name={args} {...shape} />
      </div>
    )
  }

  if (kind === 'chords') {
    const names = args.split(',').map((n) => n.trim())
    return (
      <div className="flex flex-wrap justify-center gap-4 py-2">
        {names.map((name) => {
          const shape = getChordShape(name)
          if (!shape) return null
          return <ChordDiagram key={name} name={name} {...shape} />
        })}
      </div>
    )
  }

  if (kind === 'staff') {
    const preset = getStaffPreset(args)
    if (!preset) return null
    return (
      <div className="flex justify-center py-2">
        <StaffSnippet notes={preset.notes} title={preset.title} />
      </div>
    )
  }

  if (kind === 'staff-notes') {
    const [notesPart, titlePart] = args.split('|')
    const notes = notesPart.split(',').map((n) => n.trim()).filter(Boolean)
    return (
      <div className="flex justify-center py-2">
        <StaffSnippet notes={notes} title={titlePart?.trim()} />
      </div>
    )
  }

  if (kind === 'rhythm') {
    const preset = getRhythmPreset(args)
    if (!preset) return null
    return (
      <div className="flex justify-center py-2">
        <RhythmSnippet pattern={preset.pattern} timeSig={preset.timeSig} title={preset.title} />
      </div>
    )
  }

  if (kind === 'rhythm-pattern') {
    // Format: timeSig|pattern|title — timeSig may be empty.
    const parts = args.split('|')
    const timeSig = parts[0]?.trim() || undefined
    const pattern = parts[1]?.trim() ?? ''
    const title = parts[2]?.trim()
    if (!pattern) return null
    return (
      <div className="flex justify-center py-2">
        <RhythmSnippet pattern={pattern} timeSig={timeSig} title={title} />
      </div>
    )
  }

  return null
}
