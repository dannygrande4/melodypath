import type { FretNote, NoteRole } from '@/components/Guitar/GuitarFretboard'
import { getChord } from '@moniquemusic/music-theory'

// ─── Types ───────────────────────────────────────────────────────────────────

type Frets = [number, number, number, number, number, number]
type Fingers = [number, number, number, number, number, number]

export interface ChordVoicing {
  /** e.g. "Open", "Barre (5th fret)", "Barre (8th fret)" */
  label: string
  /** Fret positions: strings 6→1 (low E to high E), -1 = muted, 0 = open */
  frets: Frets
  /** Finger numbers 1–4 (0 = open/muted) */
  fingers: Fingers
  /** Which string the root is on (1–6) */
  rootString: number
  /** Minimum fret needed to display (for barre chords) */
  minFret?: number
}

// ─── Shape Templates ─────────────────────────────────────────────────────────
// These are moveable shapes (barre chord forms). The fret values are relative
// to the root fret position. We compute actual frets by adding an offset.

interface BarreTemplate {
  label: string
  /** Base shape at fret 0 (some use open strings so only work at certain offsets) */
  shape: Frets
  fingers: Fingers
  rootString: number
  /** Which fret the root note sits on in this shape (relative) */
  rootFret: number
  /** String index (0–5) of the root note in the frets array */
  rootStringIdx: number
}

// E-form barre (root on 6th string). Shapes are low-E-to-high-E, relative to the
// barre fret (shape[i] = how many frets above the barre the note sits).
const E_MAJOR_BARRE: BarreTemplate = {
  label: 'E-form Barre', shape: [0, 2, 2, 1, 0, 0], fingers: [1, 3, 4, 2, 1, 1],
  rootString: 6, rootFret: 0, rootStringIdx: 0,
}
const E_MINOR_BARRE: BarreTemplate = {
  label: 'E-form Barre', shape: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1],
  rootString: 6, rootFret: 0, rootStringIdx: 0,
}
const E7_BARRE: BarreTemplate = {
  label: 'E-form Barre', shape: [0, 2, 0, 1, 0, 0], fingers: [1, 3, 1, 2, 1, 1],
  rootString: 6, rootFret: 0, rootStringIdx: 0,
}
const EM7_BARRE: BarreTemplate = {
  label: 'E-form Barre', shape: [0, 2, 0, 0, 0, 0], fingers: [1, 3, 1, 1, 1, 1],
  rootString: 6, rootFret: 0, rootStringIdx: 0,
}
const EMAJ7_BARRE: BarreTemplate = {
  label: 'E-form Barre', shape: [0, 2, 1, 1, 0, 0], fingers: [1, 3, 2, 1, 1, 1],
  rootString: 6, rootFret: 0, rootStringIdx: 0,
}

// A-form barre (root on 5th string)
const A_MAJOR_BARRE: BarreTemplate = {
  label: 'A-form Barre', shape: [-1, 0, 2, 2, 2, 0], fingers: [0, 1, 3, 3, 3, 1],
  rootString: 5, rootFret: 0, rootStringIdx: 1,
}
const A_MINOR_BARRE: BarreTemplate = {
  label: 'A-form Barre', shape: [-1, 0, 2, 2, 1, 0], fingers: [0, 1, 3, 4, 2, 1],
  rootString: 5, rootFret: 0, rootStringIdx: 1,
}
const A7_BARRE: BarreTemplate = {
  label: 'A-form Barre', shape: [-1, 0, 2, 0, 2, 0], fingers: [0, 1, 2, 1, 3, 1],
  rootString: 5, rootFret: 0, rootStringIdx: 1,
}
const AM7_BARRE: BarreTemplate = {
  label: 'A-form Barre', shape: [-1, 0, 2, 0, 1, 0], fingers: [0, 1, 3, 1, 2, 1],
  rootString: 5, rootFret: 0, rootStringIdx: 1,
}

// Sus/Add barre templates
const E_SUS2_BARRE: BarreTemplate = {
  label: 'E-form Barre', shape: [0, 2, 2, 4, 0, 0], fingers: [1, 2, 3, 4, 1, 1],
  rootString: 6, rootFret: 0, rootStringIdx: 0,
}
const E_SUS4_BARRE: BarreTemplate = {
  label: 'E-form Barre', shape: [0, 2, 2, 2, 0, 0], fingers: [1, 2, 3, 4, 1, 1],
  rootString: 6, rootFret: 0, rootStringIdx: 0,
}
const A_SUS2_BARRE: BarreTemplate = {
  label: 'A-form Barre', shape: [-1, 0, 2, 2, 0, 0], fingers: [0, 1, 3, 4, 1, 1],
  rootString: 5, rootFret: 0, rootStringIdx: 1,
}
const A_SUS4_BARRE: BarreTemplate = {
  label: 'A-form Barre', shape: [-1, 0, 2, 2, 3, 0], fingers: [0, 1, 2, 3, 4, 1],
  rootString: 5, rootFret: 0, rootStringIdx: 1,
}

// Power chord template (root + 5th)
const POWER_CHORD_6: BarreTemplate = {
  label: 'Power Chord', shape: [0, 2, 2, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0],
  rootString: 6, rootFret: 0, rootStringIdx: 0,
}
const POWER_CHORD_5: BarreTemplate = {
  label: 'Power Chord', shape: [-1, 0, 2, 2, -1, -1], fingers: [0, 1, 3, 4, 0, 0],
  rootString: 5, rootFret: 0, rootStringIdx: 1,
}

// ─── Note lookup ─────────────────────────────────────────────────────────────

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const STANDARD_TUNING_NOTES = ['E', 'A', 'D', 'G', 'B', 'E']
const STANDARD_TUNING_OCTAVES = [2, 2, 3, 3, 3, 4]

function noteIndex(note: string): number {
  return NOTE_NAMES.indexOf(note)
}

function semitonesBetween(from: string, to: string): number {
  const diff = noteIndex(to) - noteIndex(from)
  return ((diff % 12) + 12) % 12
}

// ─── Generate barre chord voicing ────────────────────────────────────────────

function barreVoicing(root: string, template: BarreTemplate): ChordVoicing {
  // How many frets to shift up from the template's base note
  const baseNote = STANDARD_TUNING_NOTES[template.rootStringIdx]
  const offset = semitonesBetween(baseNote, root)

  const frets: Frets = [...template.shape] as Frets
  const fingers: Fingers = [...template.fingers] as Fingers

  for (let i = 0; i < 6; i++) {
    if (frets[i] >= 0) frets[i] += offset
  }

  const minFret = Math.min(...frets.filter((f) => f > 0))
  const label = offset === 0 ? 'Open' : `${template.label} (fret ${offset})`

  return { label, frets, fingers, rootString: template.rootString, minFret }
}

// ─── Hardcoded open voicings for common chords ──────────────────────────────
// These are the classic open-position shapes that don't follow barre patterns.

const OPEN_VOICINGS: Record<string, ChordVoicing[]> = {
  // ─── Major ────────────────────────────────────────────────────────────
  C_major: [
    { label: 'Open', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], rootString: 5 },
    { label: 'C-form (Alt)', frets: [-1, 3, 5, 5, 5, 3], fingers: [0, 1, 2, 3, 4, 1], rootString: 5, minFret: 3 },
  ],
  D_major: [
    { label: 'Open', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], rootString: 4 },
  ],
  E_major: [
    { label: 'Open', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], rootString: 6 },
  ],
  G_major: [
    { label: 'Open', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], rootString: 6 },
    { label: 'Open (Alt)', frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4], rootString: 6 },
  ],
  A_major: [
    { label: 'Open', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], rootString: 5 },
  ],

  // ─── Minor ────────────────────────────────────────────────────────────
  D_minor: [
    { label: 'Open', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], rootString: 4 },
  ],
  E_minor: [
    { label: 'Open', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], rootString: 6 },
  ],
  A_minor: [
    { label: 'Open', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], rootString: 5 },
  ],

  // ─── Dominant 7 ───────────────────────────────────────────────────────
  C_7: [
    { label: 'Open', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], rootString: 5 },
  ],
  D_7: [
    { label: 'Open', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], rootString: 4 },
  ],
  E_7: [
    { label: 'Open', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], rootString: 6 },
  ],
  G_7: [
    { label: 'Open', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], rootString: 6 },
  ],
  A_7: [
    { label: 'Open', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0], rootString: 5 },
  ],
  B_7: [
    { label: 'Open', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], rootString: 5 },
  ],

  // ─── Minor 7 ──────────────────────────────────────────────────────────
  A_m7: [
    { label: 'Open', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], rootString: 5 },
  ],
  D_m7: [
    { label: 'Open', frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], rootString: 4 },
  ],
  E_m7: [
    { label: 'Open', frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0], rootString: 6 },
    { label: 'Open (Alt)', frets: [0, 2, 2, 0, 3, 0], fingers: [0, 1, 2, 0, 3, 0], rootString: 6 },
  ],

  // ─── Major 7 ──────────────────────────────────────────────────────────
  C_maj7: [
    { label: 'Open', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], rootString: 5 },
  ],
  F_maj7: [
    { label: 'Open', frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], rootString: 4 },
    { label: 'Alt', frets: [1, 0, 2, 2, 1, 0], fingers: [2, 0, 3, 4, 1, 0], rootString: 6 },
  ],
  G_maj7: [
    { label: 'Open', frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1], rootString: 6 },
  ],
  A_maj7: [
    { label: 'Open', frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0], rootString: 5 },
  ],
  D_maj7: [
    { label: 'Open', frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3], rootString: 4 },
  ],
  E_maj7: [
    { label: 'Open', frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0], rootString: 6 },
  ],

  // ─── Diminished ───────────────────────────────────────────────────────
  B_dim: [
    { label: 'Open', frets: [-1, 2, 3, 4, 3, -1], fingers: [0, 1, 2, 4, 3, 0], rootString: 5 },
  ],

  // ─── Augmented ────────────────────────────────────────────────────────
  C_aug: [
    { label: 'Open', frets: [-1, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0], rootString: 5 },
  ],
  E_aug: [
    { label: 'Open', frets: [0, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 2, 1, 0], rootString: 6 },
  ],

  // ─── Sus2 ─────────────────────────────────────────────────────────
  A_sus2: [
    { label: 'Open', frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0], rootString: 5 },
  ],
  D_sus2: [
    { label: 'Open', frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0], rootString: 4 },
  ],
  E_sus2: [
    { label: 'Open', frets: [0, 2, 4, 4, 0, 0], fingers: [0, 1, 3, 4, 0, 0], rootString: 6 },
  ],

  // ─── Sus4 ─────────────────────────────────────────────────────────
  A_sus4: [
    { label: 'Open', frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], rootString: 5 },
  ],
  D_sus4: [
    { label: 'Open', frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3], rootString: 4 },
  ],
  E_sus4: [
    { label: 'Open', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0], rootString: 6 },
  ],

  // ─── Power Chords (5th) ───────────────────────────────────────────
  E_5: [
    { label: 'Open', frets: [0, 2, 2, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], rootString: 6 },
  ],
  A_5: [
    { label: 'Open', frets: [-1, 0, 2, 2, -1, -1], fingers: [0, 1, 3, 4, 0, 0], rootString: 5 },
  ],

  // ─── Add9 ─────────────────────────────────────────────────────────
  C_add9: [
    { label: 'Open', frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0], rootString: 5 },
  ],
  G_add9: [
    { label: 'Open', frets: [3, 0, 0, 2, 0, 3], fingers: [2, 0, 0, 1, 0, 3], rootString: 6 },
  ],
  D_add9: [
    { label: 'Open', frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0], rootString: 4 },
  ],
  A_add9: [
    { label: 'Open', frets: [-1, 0, 2, 4, 2, 0], fingers: [0, 0, 1, 3, 2, 0], rootString: 5 },
  ],

  // ─── Extra positions for common chords ────────────────────────────
  C_major_alt: [
    { label: 'C (higher)', frets: [-1, 3, 5, 5, 5, 3], fingers: [0, 1, 2, 3, 4, 1], rootString: 5, minFret: 3 },
  ],
  G_major_alt: [
    { label: 'G (barre 3)', frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], rootString: 6, minFret: 3 },
  ],
  D_major_alt: [
    { label: 'D (barre 5)', frets: [-1, 5, 7, 7, 7, 5], fingers: [0, 1, 3, 3, 3, 1], rootString: 5, minFret: 5 },
  ],
  A_major_alt: [
    { label: 'A (barre 5)', frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1], rootString: 6, minFret: 5 },
  ],
}

// ─── Map from chord type to barre templates ──────────────────────────────────

const BARRE_TEMPLATES: Record<string, BarreTemplate[]> = {
  major: [E_MAJOR_BARRE, A_MAJOR_BARRE],
  minor: [E_MINOR_BARRE, A_MINOR_BARRE],
  '7': [E7_BARRE, A7_BARRE],
  m7: [EM7_BARRE, AM7_BARRE],
  maj7: [EMAJ7_BARRE],
  sus2: [E_SUS2_BARRE, A_SUS2_BARRE],
  sus4: [E_SUS4_BARRE, A_SUS4_BARRE],
  '5': [POWER_CHORD_6, POWER_CHORD_5],  // power chords
  dim: [],
  aug: [],
}

// ─── Diminished template (moveable shape) ────────────────────────────────────
const DIM_TEMPLATE_6: BarreTemplate = {
  label: 'Dim', shape: [-1, -1, 1, 2, 1, 2], fingers: [0, 0, 1, 3, 2, 4],
  rootString: 4, rootFret: 1, rootStringIdx: 2,
}
const DIM_TEMPLATE_5: BarreTemplate = {
  label: 'Dim', shape: [-1, 0, 1, 2, 1, -1], fingers: [0, 1, 2, 4, 3, 0],
  rootString: 5, rootFret: 0, rootStringIdx: 1,
}

// Aug template (moveable, symmetrical)
const AUG_TEMPLATE_6: BarreTemplate = {
  label: 'Aug', shape: [-1, -1, 2, 1, 1, 0], fingers: [0, 0, 3, 2, 1, 0],
  rootString: 4, rootFret: 2, rootStringIdx: 2,
}

// ─── Main API ────────────────────────────────────────────────────────────────

/**
 * Normalize chord type from the display name to internal key.
 * "major" → "major", "minor" → "minor", "dim" → "dim", etc.
 */
function normalizeType(type: string): string {
  const map: Record<string, string> = {
    major: 'major', minor: 'minor', dim: 'dim', aug: 'aug',
    '7': '7', m7: 'm7', maj7: 'maj7',
  }
  return map[type] ?? type
}

/**
 * Build the display chord name (e.g. "C", "Am", "F#7")
 */
function buildChordDisplayName(root: string, type: string): string {
  if (type === 'major') return root
  if (type === 'minor') return `${root}m`
  if (type === '7') return `${root}7`
  if (type === 'm7') return `${root}m7`
  if (type === 'maj7') return `${root}maj7`
  if (type === 'dim') return `${root}dim`
  if (type === 'aug') return `${root}aug`
  if (type === 'sus2') return `${root}sus2`
  if (type === 'sus4') return `${root}sus4`
  if (type === '5') return `${root}5`
  if (type === 'add9') return `${root}add9`
  return `${root}${type}`
}

/**
 * Internal key for the open voicings lookup (e.g. "C_major", "A_minor")
 */
function openKey(root: string, type: string): string {
  return `${root}_${type}`
}

/**
 * Get all available voicings for a chord (root + type).
 * Returns open voicings + generated barre voicings.
 */
export function getChordVoicings(root: string, type: string): ChordVoicing[] {
  const nType = normalizeType(type)
  const voicings: ChordVoicing[] = []

  // 1. Add any hardcoded open voicings
  const key = openKey(root, nType)
  const opens = OPEN_VOICINGS[key]
  if (opens) voicings.push(...opens)

  // 2. Generate barre voicings from templates
  const templates = BARRE_TEMPLATES[nType] ?? []
  for (const tmpl of templates) {
    const v = barreVoicing(root, tmpl)
    // Skip duplicates: if offset is 0 and we already have an open voicing, skip
    const isDuplicate = voicings.some(
      (existing) => JSON.stringify(existing.frets) === JSON.stringify(v.frets),
    )
    if (!isDuplicate) voicings.push(v)
  }

  // 3. Generate dim barre voicings
  if (nType === 'dim') {
    for (const tmpl of [DIM_TEMPLATE_5, DIM_TEMPLATE_6]) {
      const v = barreVoicing(root, tmpl)
      const isDuplicate = voicings.some(
        (existing) => JSON.stringify(existing.frets) === JSON.stringify(v.frets),
      )
      if (!isDuplicate) voicings.push(v)
    }
  }

  // 4. Generate aug barre voicings
  if (nType === 'aug') {
    const v = barreVoicing(root, AUG_TEMPLATE_6)
    const isDuplicate = voicings.some(
      (existing) => JSON.stringify(existing.frets) === JSON.stringify(v.frets),
    )
    if (!isDuplicate) voicings.push(v)
  }

  // Sort: open voicings first, then by position (ascending fret)
  voicings.sort((a, b) => {
    const aMin = Math.min(...a.frets.filter((f) => f > 0), 99)
    const bMin = Math.min(...b.frets.filter((f) => f > 0), 99)
    return aMin - bMin
  })

  return voicings
}

// ─── Convert a voicing to FretNote[] for the GuitarFretboard component ───────

export function voicingToFretNotes(
  voicing: ChordVoicing,
  root: string,
  type: string,
): FretNote[] {
  // Use Tonal.js to get the chord's pitch classes
  const chordName = buildChordDisplayName(root, type)
  const chordInfo = getChord(chordName)
  const chordPitchClasses = chordInfo?.notes ?? []

  const result: FretNote[] = []

  for (let i = 0; i < 6; i++) {
    const fret = voicing.frets[i]
    if (fret < 0) continue

    const stringNum = 6 - i
    const openPitchClass = STANDARD_TUNING_NOTES[i]
    const openOctave = STANDARD_TUNING_OCTAVES[i]

    const startIdx = NOTE_NAMES.indexOf(openPitchClass)
    const totalSemitones = startIdx + fret
    const pitchClass = NOTE_NAMES[totalSemitones % 12]
    const octave = openOctave + Math.floor(totalSemitones / 12)

    // Determine role from position in chord
    let role: NoteRole = 'other'
    if (chordPitchClasses.length > 0) {
      const pcIdx = chordPitchClasses.indexOf(pitchClass)
      // Also check enharmonic (e.g. Db vs C#)
      const enharmonicIdx = pcIdx === -1
        ? chordPitchClasses.findIndex((pc) => noteIndex(pc) === noteIndex(pitchClass))
        : pcIdx
      if (enharmonicIdx === 0) role = 'root'
      else if (enharmonicIdx === 1) role = 'third'
      else if (enharmonicIdx === 2) role = 'fifth'
      else if (enharmonicIdx === 3) role = 'seventh'
    }

    result.push({
      note: pitchClass,
      fullNote: `${pitchClass}${octave}`,
      string: stringNum,
      fret,
      role,
      finger: voicing.fingers[i] || undefined,
    })
  }

  return result
}

// ─── Legacy compatibility ────────────────────────────────────────────────────

/**
 * @deprecated Use getChordVoicings() + voicingToFretNotes() instead.
 * Kept for any code still using the old API.
 */
export function chordShapeToFretNotes(chordName: string): FretNote[] {
  // Parse chord name → root + type
  const match = chordName.match(/^([A-G][#b]?)(m7|maj7|dim|aug|m|7)?$/)
  if (!match) return []
  const root = match[1]
  const suffix = match[2] ?? ''
  const typeMap: Record<string, string> = {
    '': 'major', m: 'minor', '7': '7', m7: 'm7', maj7: 'maj7', dim: 'dim', aug: 'aug',
  }
  const type = typeMap[suffix] ?? 'major'

  const voicings = getChordVoicings(root, type)
  if (voicings.length === 0) return []
  return voicingToFretNotes(voicings[0], root, type)
}

export function getAvailableChordShapes(): string[] {
  // Now everything is available
  const roots = NOTE_NAMES
  const types = ['major', 'minor', '7', 'm7', 'maj7', 'dim', 'aug', 'sus2', 'sus4', '5', 'add9']
  const result: string[] = []
  for (const root of roots) {
    for (const type of types) {
      const name = buildChordDisplayName(root, type)
      result.push(name)
    }
  }
  return result
}
