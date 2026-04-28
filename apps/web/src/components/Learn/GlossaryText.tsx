import { useMemo, useState, useRef, useEffect } from 'react'
import { useLessonStore } from '@/stores/lessonStore'
import { useIsAdmin } from '@/hooks/useUnlocks'
import { buildGlossaryRegex, type GlossaryEntry } from '@/lib/glossary'

/**
 * Renders text and replaces every glossary term the user has already learned
 * with a bold-underlined chip that opens a definition popover on tap/click.
 *
 * Admins see all terms taught regardless of lesson completion.
 */
export default function GlossaryText({ text }: { text: string }) {
  const completedLessons = useLessonStore((s) => s.completedLessons)
  const isAdmin = useIsAdmin()

  const { regex, entryFor } = useMemo(() => {
    const completed = new Set(Object.keys(completedLessons))
    return buildGlossaryRegex(completed, { assumeAllUnlocked: isAdmin })
  }, [completedLessons, isAdmin])

  if (!regex) return <>{text}</>

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let key = 0
  const re = new RegExp(regex.source, regex.flags)
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>)
    }
    const matched = match[0]
    const entry = entryFor(matched)
    if (entry) {
      parts.push(<TermChip key={key++} match={matched} entry={entry} />)
    } else {
      parts.push(<span key={key++}>{matched}</span>)
    }
    lastIndex = match.index + matched.length
    if (re.lastIndex === match.index) re.lastIndex++
  }
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>)
  }

  return <>{parts}</>
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
