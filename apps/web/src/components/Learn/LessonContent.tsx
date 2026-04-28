import ChordDiagram from '@/components/Guitar/ChordDiagram'
import { getChordShape } from '@/lib/chordLibrary'
import GlossaryText from '@/components/Learn/GlossaryText'

/**
 * Renders lesson text content with inline visual tokens.
 *
 * Supported tokens (placed on their own line):
 *   [chord:C]                Single chord diagram
 *   [chords:C,Am,F,G]        Row of chord diagrams
 */
export default function LessonContent({ content }: { content: string }) {
  const blocks: { kind: 'text' | 'visual'; payload: string }[] = []
  let buffer: string[] = []
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (
      trimmed.startsWith('[') &&
      trimmed.endsWith(']') &&
      /^\[(chord|chords):[^\]]+\]$/.test(trimmed)
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

  return null
}
