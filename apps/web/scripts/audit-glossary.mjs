#!/usr/bin/env node
/**
 * Glossary lessonId audit. Walks the curriculum and confirms that every
 * glossary term's lessonId points at a lesson where the term (or one of
 * its aliases) is actually bolded. Mismatches are listed; the script
 * exits non-zero so it can be wired into CI.
 *
 * Usage:
 *   node apps/web/scripts/audit-glossary.mjs
 *   node apps/web/scripts/audit-glossary.mjs --check   (CI mode, fails on mismatch)
 *
 * Some mismatches are intentional — terms that are first MENTIONED in an
 * earlier lesson but properly TAUGHT later. Whitelist them via INTENTIONAL.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const lessonSrc = readFileSync(`${root}/src/lib/lessons/lessonData.ts`, 'utf8')
const glossSrc = readFileSync(`${root}/src/lib/glossary.ts`, 'utf8')

// Mismatches that are deliberate. Key = glossary term; value = expected lessonId.
const INTENTIONAL = {
  triad: 'major-minor-triads',
  'quarter note': 'quarter-eighth-notes',
  'eighth note': 'quarter-eighth-notes',
  rest: 'rests-and-ties',
}

// ── Parse lessons ──────────────────────────────────────────────────────────
const lessons = []
const lessonRe = /\{\s*id:\s*'([^']+)',[\s\S]*?order:\s*(\d+),[\s\S]*?steps:\s*\[([\s\S]*?)\n\s*\],\s*\}/g
let m
while ((m = lessonRe.exec(lessonSrc)) !== null) {
  const id = m[1]
  const order = parseInt(m[2], 10)
  const stepsBlock = m[3]
  const contents = []
  for (const cm of stepsBlock.matchAll(/content:\s*`([\s\S]*?)`/g)) contents.push(cm[1])
  for (const cm of stepsBlock.matchAll(/question:\s*`([\s\S]*?)`/g)) contents.push(cm[1])
  for (const cm of stepsBlock.matchAll(/question:\s*'([^']*)'/g)) contents.push(cm[1])
  for (const cm of stepsBlock.matchAll(/question:\s*"([^"]*)"/g)) contents.push(cm[1])
  lessons.push({ id, order, contents })
}
lessons.sort((a, b) => a.order - b.order)

// ── Parse glossary ─────────────────────────────────────────────────────────
const lines = glossSrc.split('\n')
const entries = []
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  let mt = line.match(/^\s*'([^']+)':\s*\{$/) || line.match(/^\s*([a-zA-Z][\w]*):\s*\{$/)
  if (!mt) continue
  const term = mt[1]
  let body = ''
  for (let j = i + 1; j < lines.length; j++) {
    if (/^\s*\},$/.test(lines[j])) break
    body += lines[j] + '\n'
  }
  const lessonIdMatch = body.match(/lessonId:\s*'([^']+)'/)
  const aliasesMatch = body.match(/aliases:\s*\[([^\]]*)\]/)
  const aliases = aliasesMatch
    ? aliasesMatch[1].split(',').map((a) => a.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
    : []
  if (!lessonIdMatch) continue
  entries.push({ term, lessonId: lessonIdMatch[1], aliases })
}

// ── Find first-bolded lesson per term ──────────────────────────────────────
function findFirstBolded(variants) {
  for (const lesson of lessons) {
    for (const content of lesson.contents) {
      for (const v of variants) {
        const re = new RegExp(`\\*\\*\\s*${v.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}s?\\s*\\*\\*`, 'i')
        if (re.test(content)) return lesson.id
      }
    }
  }
  return null
}

// ── Validate ───────────────────────────────────────────────────────────────
const lessonIds = new Set(lessons.map((l) => l.id))
const problems = []
for (const e of entries) {
  if (!lessonIds.has(e.lessonId)) {
    problems.push({ term: e.term, kind: 'missing-lesson', lessonId: e.lessonId })
    continue
  }
  const firstBolded = findFirstBolded([e.term, ...e.aliases])
  if (firstBolded && firstBolded !== e.lessonId) {
    if (INTENTIONAL[e.term] === e.lessonId) continue
    problems.push({ term: e.term, kind: 'lesson-mismatch', current: e.lessonId, firstBolded })
  }
}

// ── Output ─────────────────────────────────────────────────────────────────
console.log(`Glossary entries with lessonIds: ${entries.length}`)
console.log(`Lessons in curriculum: ${lessons.length}`)
if (problems.length === 0) {
  console.log('✓ All glossary lessonIds are consistent with the curriculum.')
  process.exit(0)
}
console.log(`\n✗ ${problems.length} problem(s):`)
for (const p of problems) {
  if (p.kind === 'missing-lesson') {
    console.log(`  ${p.term}  →  lessonId '${p.lessonId}' does not exist in lessonData.ts`)
  } else {
    console.log(`  ${p.term}  current=${p.current}  firstBolded=${p.firstBolded}`)
  }
}
console.log(
  '\nIf a mismatch is intentional (term first mentioned in an earlier lesson but taught later),',
)
console.log('add it to the INTENTIONAL map at the top of this script.')
const isCheckMode = process.argv.includes('--check')
process.exit(isCheckMode ? 1 : 0)
