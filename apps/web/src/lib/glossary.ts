/**
 * Music glossary - simple definitions for every term used in the app.
 * Referenced by WhatIsThis components and tooltips.
 */
export const GLOSSARY: Record<string, { simple: string; detail?: string; lessonId?: string }> = {
  chord: {
    simple: 'Three or more notes played at the same time. Major chords sound happy, minor chords sound sad.',
    lessonId: 'first-chord',
  },
  scale: {
    simple: 'A group of notes that sound good together, played one at a time going up or down. Like a musical ladder.',
    lessonId: 'major-scale',
  },
  interval: {
    simple: 'The distance between two notes. A small interval = notes close together. A big interval = notes far apart.',
    detail: 'Intervals have names like "major 3rd" or "perfect 5th" based on how many steps apart the notes are.',
  },
  progression: {
    simple: 'A series of chords played one after another. This is the backbone of every song you hear.',
    lessonId: 'chord-progressions-intro',
  },
  key: {
    simple: 'The "home base" of a song. It tells you which notes and chords will sound right.',
    lessonId: 'major-scale',
  },
  bpm: {
    simple: 'Beats Per Minute - how fast the music goes. 60 BPM = one beat per second. 120 BPM = two beats per second.',
    lessonId: 'rhythm-basics',
  },
  octave: {
    simple: 'The same note played higher or lower. Going up one octave doubles the pitch.',
    lessonId: 'notes-basics',
  },
  root: {
    simple: 'The "home note" of a chord or scale. Everything else is built from this note.',
    lessonId: 'first-chord',
  },
  voicing: {
    simple: 'A different way to play the same chord. Same notes, different positions on the guitar or piano.',
    lessonId: 'chord-inversions',
  },
  fret: {
    simple: 'The metal bars on a guitar neck. Pressing a string behind a fret changes the note.',
  },
  'roman numeral': {
    simple: 'A shorthand for chords in any key. I = first chord, IV = fourth chord, V = fifth chord. Capital = major, lowercase = minor.',
    lessonId: 'chord-progressions-intro',
  },
  triad: {
    simple: 'The simplest chord - just 3 notes: the 1st, 3rd, and 5th of a scale.',
    lessonId: 'first-chord',
  },
  mode: {
    simple: 'A scale that starts on a different note of the major scale. Each mode has its own mood - Dorian sounds jazzy, Phrygian sounds Spanish.',
    lessonId: 'intro-to-modes',
  },
  metronome: {
    simple: 'A tool that makes a clicking sound at a steady speed. It helps you keep time when you practice.',
    lessonId: 'rhythm-basics',
  },
  tab: {
    simple: 'Guitar tablature - a way to write music for guitar using numbers. Each number tells you which fret to press on which string.',
  },
  'staff notation': {
    simple: 'Traditional sheet music. Notes are dots on 5 lines. Higher on the lines = higher pitch.',
  },
  'time signature': {
    simple: 'Tells you how many beats are in each bar. 4/4 = four beats per bar (the most common).',
    lessonId: 'rhythm-basics',
  },
  combo: {
    simple: 'Hitting notes in a row without missing. The longer your streak, the more points you earn!',
  },
  'open string': {
    simple: 'Playing a guitar string without pressing any fret. The 6 open strings are E, A, D, G, B, E.',
  },
}

export function getGlossaryEntry(term: string) {
  return GLOSSARY[term.toLowerCase()] ?? null
}
