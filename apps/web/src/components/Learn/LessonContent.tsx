import { useEffect, useRef, useState } from 'react'
import ChordDiagram from '@/components/Guitar/ChordDiagram'
import { getChordShape } from '@/lib/chordLibrary'
import StaffSnippet, { getStaffPreset } from '@/components/Learn/StaffSnippet'
import RhythmSnippet, { getRhythmPreset } from '@/components/Learn/RhythmSnippet'
import type { ContentNode } from '@/lib/lessonRender'
import type { GlossaryEntry } from '@/lib/glossary'

/**
 * Renders pre-tokenized lesson content. Tokenization (bold + glossary
 * dedup) is done in `lib/lessonRender.ts` so dedup is deterministic and
 * shared across an entire lesson — only the first mention of each term
 * gets highlighted.
 */
export default function LessonContent({ blocks }: { blocks: ContentNode[][] }) {
  return (
    <div className="space-y-4">
      {blocks.map((nodes, i) => {
        if (nodes.length === 1 && nodes[0].kind === 'visual') {
          return <VisualBlock key={i} token={nodes[0].token} />
        }
        return <TextBlock key={i} nodes={nodes} />
      })}
    </div>
  )
}

function TextBlock({ nodes }: { nodes: ContentNode[] }) {
  return (
    <div className="prose text-surface-700 leading-relaxed whitespace-pre-line">
      {nodes.map((n, i) => {
        if (n.kind === 'text') return <span key={i}>{n.value}</span>
        if (n.kind === 'bold') return <strong key={i} className="text-surface-900">{n.value}</strong>
        if (n.kind === 'gloss') return <TermChip key={i} match={n.value} entry={n.entry} />
        return null
      })}
    </div>
  )
}

function TermChip({ match, entry }: { match: string; entry: GlossaryEntry }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent | TouchEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('touchstart', handle)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('touchstart', handle)
    }
  }, [open])

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-bold underline decoration-primary-400 decoration-2 underline-offset-2 text-surface-900 hover:text-primary-700 transition-colors"
      >
        {match}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-1 w-64 max-w-[80vw] rounded-lg bg-surface-900 text-white text-xs shadow-xl p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="block font-bold capitalize mb-1">{match}</span>
          <span className="block leading-snug whitespace-normal">{entry.simple}</span>
          {entry.detail && (
            <span className="block leading-snug mt-1 text-surface-300 whitespace-normal">{entry.detail}</span>
          )}
          {entry.lessonId && (
            <a
              href={`/learn/${entry.lessonId}`}
              className="inline-block mt-2 text-primary-300 hover:text-primary-200 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Revisit lesson →
            </a>
          )}
        </span>
      )}
    </span>
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
