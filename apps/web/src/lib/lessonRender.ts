import type { GlossaryEntry } from './glossary'

/**
 * Pre-tokenized lesson content. Produced once per lesson so bold and glossary
 * highlights only appear on their first occurrence across the whole lesson —
 * later mentions render as plain text.
 *
 * Visual tokens like [chord:C], [staff:c-major-scale], [rhythm:...] are kept
 * intact as `visual` nodes for the renderer to expand.
 */
export type ContentNode =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; value: string }
  | { kind: 'gloss'; value: string; entry: GlossaryEntry }
  | { kind: 'visual'; token: string }

export interface Tokenizer {
  glossRegex: RegExp | null
  entryFor: (match: string) => GlossaryEntry | null
  seenBolds: Set<string>
  seenGloss: Set<string>
  /** Terms taught BY this lesson are not highlighted — they're being introduced here. */
  excludeLessonId?: string
}

export function makeTokenizer(
  glossRegex: RegExp | null,
  entryFor: (match: string) => GlossaryEntry | null,
  options: { excludeLessonId?: string } = {},
): Tokenizer {
  return {
    glossRegex,
    entryFor,
    seenBolds: new Set(),
    seenGloss: new Set(),
    excludeLessonId: options.excludeLessonId,
  }
}

const VISUAL_RE = /^\[(chord|chords|staff|staff-notes|rhythm|rhythm-pattern):[^\]]+\]$/

/** Tokenize a single content string into blocks (visual tokens on their own line). */
export function tokenizeBlocks(content: string, t: Tokenizer): ContentNode[][] {
  const out: ContentNode[][] = []
  const lines = content.split('\n')
  let buffer: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('[') && trimmed.endsWith(']') && VISUAL_RE.test(trimmed)) {
      if (buffer.length) {
        out.push(tokenizeText(buffer.join('\n'), t))
        buffer = []
      }
      out.push([{ kind: 'visual', token: trimmed.slice(1, -1) }])
    } else {
      buffer.push(line)
    }
  }
  if (buffer.length) out.push(tokenizeText(buffer.join('\n'), t))
  return out
}

/** Walk a plain text segment, deduping bolds and glossary terms via the shared sets. */
function tokenizeText(text: string, t: Tokenizer): ContentNode[] {
  const nodes: ContentNode[] = []
  // First split on **bold** segments — bold dedup happens at the source level.
  const segments = text.split(/(\*\*[^*]+\*\*)/)
  for (const seg of segments) {
    if (!seg) continue
    if (seg.startsWith('**') && seg.endsWith('**')) {
      const inner = seg.slice(2, -2)
      const key = inner.toLowerCase().trim()
      if (t.seenBolds.has(key)) {
        // Already shown in bold elsewhere — render the inside as plain text.
        // Still subject to glossary dedup.
        nodes.push(...tokenizeGloss(inner, t))
      } else {
        t.seenBolds.add(key)
        nodes.push({ kind: 'bold', value: inner })
      }
    } else {
      nodes.push(...tokenizeGloss(seg, t))
    }
  }
  return nodes
}

function tokenizeGloss(text: string, t: Tokenizer): ContentNode[] {
  if (!t.glossRegex || !text) return text ? [{ kind: 'text', value: text }] : []
  const out: ContentNode[] = []
  const re = new RegExp(t.glossRegex.source, t.glossRegex.flags)
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    const matched = match[0]
    const entry = t.entryFor(matched)
    const lemma = entry ? canonicalKey(entry) : matched.toLowerCase()

    if (match.index > lastIndex) {
      out.push({ kind: 'text', value: text.slice(lastIndex, match.index) })
    }

    const isIntroducedByThisLesson = entry?.lessonId && entry.lessonId === t.excludeLessonId
    if (entry && !isIntroducedByThisLesson && !t.seenGloss.has(lemma)) {
      t.seenGloss.add(lemma)
      out.push({ kind: 'gloss', value: matched, entry })
    } else {
      out.push({ kind: 'text', value: matched })
    }

    lastIndex = match.index + matched.length
    if (re.lastIndex === match.index) re.lastIndex++
  }
  if (lastIndex < text.length) {
    out.push({ kind: 'text', value: text.slice(lastIndex) })
  }
  return out
}

/** Stable identity for a glossary entry — the simple line is unique per entry. */
function canonicalKey(entry: GlossaryEntry): string {
  return entry.simple
}
