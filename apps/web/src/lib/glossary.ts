/**
 * Music glossary - simple definitions for every term used in the app.
 * Used by both the static WhatIsThis tooltips AND the dynamic in-lesson
 * GlossaryText component which only highlights terms whose `lessonId` has
 * been completed by the user.
 */

export interface GlossaryEntry {
  /** Plain-language one-liner. */
  simple: string
  /** Optional follow-up paragraph for deeper explanation. */
  detail?: string
  /** Lesson that introduces this term. Once completed, the term is taught. */
  lessonId?: string
  /** Alternate spellings, plural forms, and synonyms — matched the same way. */
  aliases?: string[]
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  // ─── Foundations ────────────────────────────────────────────────────────────
  octave: {
    simple: 'The distance from one note to the same note higher or lower — like A3 to A4.',
    detail: 'After 12 notes, you arrive at the same letter again — the cycle repeats at a higher or lower pitch.',
    lessonId: 'musical-alphabet',
    aliases: ['octaves'],
  },
  'half step': {
    simple: 'The smallest distance in Western music — one fret on guitar, or one key on piano.',
    lessonId: 'musical-alphabet',
    aliases: ['half steps', 'semitone', 'semitones'],
  },
  'whole step': {
    simple: 'Two half steps in a row — two frets on guitar, or two piano keys.',
    lessonId: 'musical-alphabet',
    aliases: ['whole steps', 'whole tone', 'tone'],
  },
  sharp: {
    simple: 'Raises a note by one half step. C# is one fret higher than C.',
    lessonId: 'musical-alphabet',
    aliases: ['sharps'],
  },
  flat: {
    simple: 'Lowers a note by one half step. Db is one fret lower than D. C# and Db are the same note.',
    lessonId: 'musical-alphabet',
    aliases: ['flats'],
  },
  enharmonic: {
    simple: 'Two names for the same pitch — like C# and Db.',
    lessonId: 'musical-alphabet',
    aliases: ['enharmonic equivalent', 'enharmonic equivalents'],
  },

  // ─── Reading the staff ─────────────────────────────────────────────────────
  staff: {
    simple: 'The 5 horizontal lines that music is written on. Notes sit on lines or in the spaces between.',
    lessonId: 'reading-the-staff',
  },
  'treble clef': {
    simple: 'The curly symbol at the start of a staff. Tells you the lines and spaces are higher-pitched notes.',
    lessonId: 'reading-the-staff',
  },
  'ledger line': {
    simple: 'Tiny extra lines drawn above or below the staff for notes that don\'t fit on the regular 5 lines.',
    lessonId: 'reading-the-staff',
    aliases: ['ledger lines'],
  },
  'staff notation': {
    simple: 'Traditional sheet music. Notes are dots on 5 lines. Higher on the lines = higher pitch.',
    lessonId: 'reading-the-staff',
  },

  // ─── Major scale ───────────────────────────────────────────────────────────
  scale: {
    simple: 'A group of notes in a specific pattern, like a musical ladder you can climb up or down.',
    lessonId: 'major-scale',
    aliases: ['scales'],
  },
  'major scale': {
    simple: 'The most common scale in pop music — sounds happy and bright. Pattern: W-W-H-W-W-W-H.',
    lessonId: 'major-scale',
  },
  root: {
    simple: 'The "home note" of a chord or scale. Everything else is built from it.',
    lessonId: 'major-scale',
    aliases: ['root note'],
  },

  // ─── Key signatures ────────────────────────────────────────────────────────
  key: {
    simple: 'The home note and scale a song is built around. A song "in G major" is built from the G major scale.',
    lessonId: 'key-signatures',
    aliases: ['keys'],
  },
  'key signature': {
    simple: 'The sharps or flats shown at the start of a piece that tell you which key it\'s in.',
    lessonId: 'key-signatures',
    aliases: ['key signatures'],
  },
  'circle of fifths': {
    simple: 'A circle showing all 12 keys arranged so neighbors share most of their notes — a map of how keys relate.',
    lessonId: 'key-signatures',
  },

  // ─── Intervals ─────────────────────────────────────────────────────────────
  interval: {
    simple: 'The distance between two notes, measured in steps. A major 3rd is 4 half steps; a perfect 5th is 7.',
    lessonId: 'intervals',
    aliases: ['intervals'],
  },
  'perfect fifth': {
    simple: 'Seven half steps between two notes. The strongest, most stable interval — used in power chords.',
    lessonId: 'intervals',
    aliases: ['perfect 5th'],
  },
  'major third': {
    simple: 'Four half steps. Gives major chords their happy sound.',
    lessonId: 'intervals',
    aliases: ['major 3rd'],
  },
  'minor third': {
    simple: 'Three half steps. Gives minor chords their sad/serious sound.',
    lessonId: 'intervals',
    aliases: ['minor 3rd'],
  },

  // ─── First chord / triads ──────────────────────────────────────────────────
  chord: {
    simple: 'Three or more notes played at the same time. C major = C + E + G.',
    lessonId: 'first-chord',
    aliases: ['chords'],
  },
  triad: {
    simple: 'A 3-note chord built by stacking 3rds — root, third, fifth. The basic building block of harmony.',
    lessonId: 'major-minor-triads',
    aliases: ['triads'],
  },
  'major chord': {
    simple: 'Built from root + major 3rd + perfect 5th. Sounds happy and resolved.',
    lessonId: 'major-minor-triads',
    aliases: ['major chords'],
  },
  'minor chord': {
    simple: 'Built from root + minor 3rd + perfect 5th. Sounds sad or serious.',
    lessonId: 'major-minor-triads',
    aliases: ['minor chords'],
  },

  // ─── Rhythm ────────────────────────────────────────────────────────────────
  beat: {
    simple: 'The steady pulse you tap your foot to. Most pop songs have 4 beats per measure.',
    lessonId: 'rhythm-basics',
    aliases: ['beats'],
  },
  tempo: {
    simple: 'How fast a song goes, measured in BPM. 60 BPM = one beat per second.',
    lessonId: 'rhythm-basics',
  },
  bpm: {
    simple: 'Beats Per Minute — how fast the beat is. 120 BPM is medium-fast.',
    lessonId: 'rhythm-basics',
  },
  measure: {
    simple: 'A group of beats — usually 4. Music is divided into measures separated by bar lines.',
    lessonId: 'rhythm-basics',
    aliases: ['measures', 'bar', 'bars'],
  },
  metronome: {
    simple: 'A tool that makes a clicking sound at a steady speed. Helps you keep time when you practice.',
    lessonId: 'rhythm-basics',
  },
  'time signature': {
    simple: 'The two stacked numbers at the start of music. Top = beats per measure. Bottom = which note value gets the beat.',
    lessonId: 'rhythm-basics',
    aliases: ['time signatures'],
  },

  // ─── Note values ───────────────────────────────────────────────────────────
  'whole note': {
    simple: 'A note held for 4 beats in 4/4 time. Drawn as an open oval with no stem.',
    lessonId: 'rhythm-basics',
    aliases: ['whole notes'],
  },
  'half note': {
    simple: 'A note held for 2 beats. Open oval with a stem.',
    lessonId: 'rhythm-basics',
    aliases: ['half notes'],
  },
  'quarter note': {
    simple: 'One beat in 4/4 time. The most common rhythm.',
    lessonId: 'quarter-eighth-notes',
    aliases: ['quarter notes'],
  },
  'eighth note': {
    simple: 'Half a beat — two of these fit in one beat.',
    lessonId: 'quarter-eighth-notes',
    aliases: ['eighth notes'],
  },
  'sixteenth note': {
    simple: 'A quarter of a beat — four of these fit in one beat. Used for fast subdivisions.',
    lessonId: 'rhythm-basics',
    aliases: ['sixteenth notes'],
  },
  downbeat: {
    simple: 'The main numbered beats — 1, 2, 3, 4. Where the foot taps. The strongest pulse.',
    lessonId: 'quarter-eighth-notes',
    aliases: ['downbeats'],
  },
  upbeat: {
    simple: 'The "and" between beats — the offbeat. Lighter than the downbeat.',
    lessonId: 'quarter-eighth-notes',
    aliases: ['upbeats', 'offbeat', 'offbeats'],
  },
  'dotted note': {
    simple: 'A note with a dot after it — adds half its value. Dotted half = 3 beats; dotted quarter = 1.5 beats.',
    lessonId: 'dotted-notes',
    aliases: ['dotted notes', 'dotted half', 'dotted quarter', 'dotted eighth', 'dotted half note', 'dotted quarter note', 'dotted eighth note'],
  },
  rest: {
    simple: 'Silence. Just as important as notes — rests give music its rhythm and breath.',
    lessonId: 'rests-and-ties',
    aliases: ['rests'],
  },
  tie: {
    simple: 'A curved line that joins two notes into one longer sound.',
    lessonId: 'rests-and-ties',
    aliases: ['ties'],
  },
  slur: {
    simple: 'A curved line connecting notes of DIFFERENT pitches — play them smoothly. Don\'t confuse with a tie.',
    lessonId: 'rests-and-ties',
    aliases: ['slurs'],
  },
  'common time': {
    simple: 'Another name for 4/4 time — 4 beats per measure, quarter note gets the beat. Used in most pop and rock.',
    lessonId: 'rhythm-basics',
  },
  'compound meter': {
    simple: 'A time signature where each beat divides into 3 (like 6/8 or 12/8). Has a lilting, swung feel.',
    lessonId: 'three-four-six-eight',
    aliases: ['compound time', 'compound duple', 'compound triple'],
  },
  waltz: {
    simple: 'A dance in 3/4 time with a strong "ONE two three" feel.',
    lessonId: 'three-four-six-eight',
  },

  // ─── Power & sus chords ────────────────────────────────────────────────────
  'power chord': {
    simple: 'Just root + 5th, no 3rd. Not major or minor — sounds neutral and aggressive. Heart of rock.',
    lessonId: 'power-chords',
    aliases: ['power chords'],
  },
  'suspended chord': {
    simple: 'A chord where the 3rd is replaced with a 2nd or 4th. Sounds open and unresolved.',
    lessonId: 'suspended-chords',
    aliases: ['suspended chords', 'sus chord', 'sus chords'],
  },

  // ─── Progressions ──────────────────────────────────────────────────────────
  progression: {
    simple: 'A sequence of chords played in order — the backbone of every song.',
    lessonId: 'one-four-five',
    aliases: ['progressions', 'chord progression', 'chord progressions'],
  },
  'roman numeral': {
    simple: 'A shorthand for chords in any key. I = first chord, IV = fourth chord, V = fifth chord. Capital = major, lowercase = minor.',
    lessonId: 'one-four-five',
    aliases: ['roman numerals'],
  },

  // ─── Tonal functions (used widely from one-four-five onward) ──────────────
  tonic: {
    simple: 'The "home" chord (the I) — where a song feels resolved. In C major, the tonic is C.',
    lessonId: 'one-four-five',
  },
  dominant: {
    simple: 'The V chord — built on the 5th note of the scale. Pulls strongly back to the tonic. In C major, the dominant is G.',
    lessonId: 'one-four-five',
  },
  subdominant: {
    simple: 'The IV chord — built on the 4th note of the scale. Sounds open, "stepping away" from home. In C major, the subdominant is F.',
    lessonId: 'one-four-five',
  },

  // ─── Minor keys ────────────────────────────────────────────────────────────
  'minor key': {
    simple: 'A key built on the minor scale. Sounds darker and more serious than a major key.',
    lessonId: 'minor-keys',
    aliases: ['minor keys'],
  },
  'relative minor': {
    simple: 'Every major key has a relative minor that uses the same notes — like C major and A minor.',
    lessonId: 'minor-keys',
  },

  // ─── Pentatonic & blues ────────────────────────────────────────────────────
  pentatonic: {
    simple: 'A 5-note scale that sounds good over almost anything. The most popular soloing scale.',
    lessonId: 'pentatonic-scales',
    aliases: ['pentatonic scale', 'pentatonic scales'],
  },
  'blues scale': {
    simple: 'The minor pentatonic plus one extra "blue note" (b5) that gives blues its signature sound.',
    lessonId: 'blues-scale',
  },

  // ─── 7th chords ────────────────────────────────────────────────────────────
  'seventh chord': {
    simple: 'A 4-note chord — a triad with an extra 7th on top. Sounds richer and more colorful.',
    lessonId: 'seventh-chords',
    aliases: ['seventh chords', '7th chord', '7th chords'],
  },
  inversion: {
    simple: 'Playing a chord with a note other than the root on the bottom — same chord, different feel.',
    lessonId: 'chord-inversions',
    aliases: ['inversions', 'chord inversion', 'chord inversions'],
  },
  voicing: {
    simple: 'A different way to play the same chord. Same notes, different positions on the guitar or piano.',
    lessonId: 'chord-inversions',
  },

  // ─── Modes ─────────────────────────────────────────────────────────────────
  mode: {
    simple: 'A scale built by starting on a different note of the major scale. There are 7 modes — each has its own mood.',
    lessonId: 'intro-to-modes',
    aliases: ['modes'],
  },

  // ─── Guitar physical reference (always available) ─────────────────────────
  fret: {
    simple: 'The metal bars on a guitar neck. Pressing a string behind a fret changes the note.',
    aliases: ['frets'],
  },
  tab: {
    simple: 'Guitar tablature — a way to write music using numbers. Each number = which fret to press on which string.',
  },
  'open string': {
    simple: 'Playing a guitar string without pressing any fret. The 6 open strings are E, A, D, G, B, E.',
    aliases: ['open strings'],
  },
}

export function getGlossaryEntry(term: string): GlossaryEntry | null {
  const key = term.toLowerCase()
  if (GLOSSARY[key]) return GLOSSARY[key]
  for (const entry of Object.values(GLOSSARY)) {
    if (entry.aliases?.some((a) => a.toLowerCase() === key)) return entry
  }
  return null
}

/**
 * Build a regex matching any unlocked glossary term (or alias).
 * `unlockedIds` is the user's completed-lesson set. Terms with no `lessonId`
 * are always considered taught (e.g. fret, tab, open string).
 *
 * Sort longest-first so multi-word terms ("perfect fifth") win over substrings.
 */
export function buildGlossaryRegex(
  unlockedIds: Set<string>,
  options: { assumeAllUnlocked?: boolean } = {},
): {
  regex: RegExp | null
  entryFor: (match: string) => GlossaryEntry | null
} {
  const variantToEntry = new Map<string, GlossaryEntry>()
  const variants: string[] = []

  for (const [canonical, entry] of Object.entries(GLOSSARY)) {
    const isTaught =
      options.assumeAllUnlocked || !entry.lessonId || unlockedIds.has(entry.lessonId)
    if (!isTaught) continue
    const all = [canonical, ...(entry.aliases ?? [])]
    for (const v of all) {
      variantToEntry.set(v.toLowerCase(), entry)
      variants.push(v)
    }
  }

  if (variants.length === 0) {
    return { regex: null, entryFor: () => null }
  }

  variants.sort((a, b) => b.length - a.length)
  const escaped = variants.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')

  return {
    regex,
    entryFor: (match: string) => variantToEntry.get(match.toLowerCase()) ?? null,
  }
}
