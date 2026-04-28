import { getLessonById } from '@/lib/lessons/lessonData'

// ─── Admin override ──────────────────────────────────────────────────────────
// Emails listed here always see every section unlocked, regardless of progress.
// Also: setting localStorage["moniquemusic-admin"] = "true" forces admin on for
// the local browser, useful when you aren't signed in or use a different email.
const ADMIN_EMAILS = ['danny@moniquemusic.com', 'danny@grandes.ca']
const ADMIN_LOCAL_KEY = 'moniquemusic-admin'

function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location?.hostname ?? ''
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (typeof window !== 'undefined' && window.localStorage?.getItem(ADMIN_LOCAL_KEY) === 'true') {
    return true
  }
  if (isLocalhost()) return true
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

// ─── Tab gates ───────────────────────────────────────────────────────────────
// Each entry: route → lesson ID that unlocks it. Routes not in this map are
// always available (Dashboard, Learn, Practice, Chords, Profile, Settings).

export interface TabUnlock {
  unlockedBy: string         // lesson ID
  label: string              // human-readable section name
  description: string        // shown on the locked teaser page
}

export const TAB_UNLOCKS: Record<string, TabUnlock> = {
  '/explore/scales': {
    unlockedBy: 'major-scale',
    label: 'Scales',
    description: 'See every scale on a piano and guitar fretboard, hear it played slow or fast, and learn the formula for each one.',
  },
  '/ear-training': {
    unlockedBy: 'intervals',
    label: 'Ear Training',
    description: 'Train your ear to recognize intervals, chords, and melodies just by listening.',
  },
  '/progressions': {
    unlockedBy: 'one-four-five',
    label: 'Progressions',
    description: 'Build chord progressions with Roman numerals and hear how I, IV, V, and vi fit together.',
  },
  '/challenges': {
    unlockedBy: 'one-four-five',
    label: 'Challenges',
    description: 'Timed games and competitive drills to test what you know.',
  },
  '/resources': {
    unlockedBy: 'intro-to-modes',
    label: 'Resources',
    description: 'Reference sheets for every scale and mode, with staff notation and guitar tab.',
  },
  '/practice/fretboard-quiz': {
    unlockedBy: 'musical-alphabet',
    label: 'Fretboard Quiz',
    description: 'Drill your knowledge of every note on the guitar — any string, single string, or name-that-fret.',
  },
}

// ─── Content gates within tabs ───────────────────────────────────────────────
// Each map gates an individual chord type / scale type / progression preset
// behind a lesson ID. Items not in the map are always unlocked.

export const CHORD_UNLOCKS: Record<string, string> = {
  '5': 'power-chords',
  sus2: 'suspended-chords',
  sus4: 'suspended-chords',
  '7': 'seventh-chords',
  maj7: 'seventh-chords',
  m7: 'seventh-chords',
  dim: 'diminished-chords',
  aug: 'augmented-chords',
  add9: 'add-extended-chords',
}

export const SCALE_UNLOCKS: Record<string, string> = {
  minor: 'minor-scale-deep',
  'major pentatonic': 'pentatonic-scales',
  'minor pentatonic': 'pentatonic-scales',
  blues: 'blues-scale',
  mixolydian: 'ionian-mixolydian',
  dorian: 'dorian-aeolian',
  phrygian: 'phrygian-locrian',
  lydian: 'lydian-mode',
  'harmonic minor': 'harmonic-melodic-minor',
  'melodic minor': 'harmonic-melodic-minor',
}

// Progression presets, keyed by preset name.
export const PROGRESSION_UNLOCKS: Record<string, string> = {
  'I-V-vi-IV (Pop)': 'the-vi-chord',
  'I-vi-IV-V (50s)': 'the-vi-chord',
  'vi-IV-I-V': 'the-vi-chord',
  'ii-V-I (Jazz)': 'ii-v-i',
  '12-Bar Blues': 'one-four-five',
  'i-VI-III-VII (Andalusian)': 'minor-keys',
  'i-iv-V (Harmonic)': 'harmonic-melodic-minor',
  'i-III-VII-VI': 'minor-keys',
}

// Ear-training exercise types.
export const EAR_TRAINING_UNLOCKS: Record<string, string> = {
  chords: 'major-minor-triads',
  melody: 'melodic-intervals',
  rhythm: 'rhythm-basics',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Look up a lesson title for tooltips. Returns the raw ID if not found. */
export function getLessonTitle(lessonId: string): string {
  return getLessonById(lessonId)?.title ?? lessonId
}

/** True when the gating lesson is in the completed set OR the user is an admin. */
export function isFeatureUnlocked(
  unlockedByLessonId: string | undefined,
  completedIds: Set<string>,
  adminOverride = false,
): boolean {
  if (adminOverride) return true
  if (!unlockedByLessonId) return true
  return completedIds.has(unlockedByLessonId)
}

/**
 * Given a lesson that just completed, return the labels of every feature that
 * has now flipped from locked → unlocked. Used to drive the unlock toast.
 */
export interface UnlockEvent {
  kind: 'tab' | 'chord' | 'scale' | 'progression' | 'ear-training'
  label: string
}

export function unlocksFromLesson(lessonId: string): UnlockEvent[] {
  const events: UnlockEvent[] = []

  for (const [route, info] of Object.entries(TAB_UNLOCKS)) {
    if (info.unlockedBy === lessonId) {
      events.push({ kind: 'tab', label: info.label })
    }
    void route
  }

  for (const [name, gate] of Object.entries(CHORD_UNLOCKS)) {
    if (gate === lessonId) events.push({ kind: 'chord', label: name })
  }

  for (const [name, gate] of Object.entries(SCALE_UNLOCKS)) {
    if (gate === lessonId) events.push({ kind: 'scale', label: name })
  }

  for (const [name, gate] of Object.entries(PROGRESSION_UNLOCKS)) {
    if (gate === lessonId) events.push({ kind: 'progression', label: name })
  }

  for (const [name, gate] of Object.entries(EAR_TRAINING_UNLOCKS)) {
    if (gate === lessonId) events.push({ kind: 'ear-training', label: name })
  }

  return events
}
