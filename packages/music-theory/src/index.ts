import { Chord, Scale, Interval, Note, Key } from 'tonal'
import type { ChordInfo, ScaleInfo } from '@melodypath/shared-types'

// ─── Chord Utilities ──────────────────────────────────────────────────────────

/**
 * Get chord info by name (e.g. "Cmaj7", "Am", "G7")
 */
export function getChord(name: string): ChordInfo | null {
  const chord = Chord.get(name)
  if (!chord.tonic) return null

  return {
    name: chord.symbol,
    root: chord.tonic,
    type: chord.aliases[0] ?? chord.type,
    notes: chord.notes,
    intervals: chord.intervals,
  }
}

/**
 * Get all notes of a chord in a specific octave.
 * e.g. getChordNotes("C", "major", 4) → ["C4", "E4", "G4"]
 * Notes are assigned to the given octave, with octave bumped when a note
 * would be lower than the root.
 */
export function getChordNotes(root: string, type: string, octave = 4): string[] {
  const chord = Chord.getChord(type, root)
  if (!chord.tonic) return []

  const rootMidi = Note.midi(`${root}${octave}`) ?? 0
  return chord.notes.map((pc) => {
    // Try the given octave first; if the result is below root, bump up one
    const candidate = `${pc}${octave}`
    const midi = Note.midi(candidate) ?? 0
    if (midi >= rootMidi) return candidate
    return `${pc}${octave + 1}`
  })
}

/**
 * Given an array of notes, identify the chord name (if any)
 */
export function identifyChord(notes: string[]): string | null {
  const stripped = notes.map((n) => Note.pitchClass(n))
  const matches = Chord.detect(stripped)
  return matches[0] ?? null
}

// ─── Scale Utilities ──────────────────────────────────────────────────────────

/**
 * Get scale info (e.g. getScale("C", "major"))
 */
export function getScale(root: string, type: string): ScaleInfo | null {
  const scale = Scale.get(`${root} ${type}`)
  if (!scale.tonic) return null

  return {
    root: scale.tonic,
    type: scale.type,
    notes: scale.notes,
    degrees: scale.intervals,
  }
}

/**
 * Get all notes of a scale in a specific octave
 */
export function getScaleNotes(root: string, type: string, octave = 4): string[] {
  const scale = Scale.get(`${root}${octave} ${type}`)
  return scale.notes
}

/**
 * List all available scale names
 */
export function listScaleTypes(): string[] {
  return Scale.names()
}

// ─── Interval Utilities ───────────────────────────────────────────────────────

/**
 * Get interval between two notes (e.g. "C4" → "E4" → "3M")
 */
export function getInterval(from: string, to: string): string | null {
  return Interval.distance(from, to)
}

/**
 * Get interval name from shorthand (e.g. "3M" → "Major Third")
 */
export function getIntervalName(interval: string): string {
  return Interval.get(interval).name ?? interval
}

// ─── Note / Transposition Utilities ──────────────────────────────────────────

/**
 * Transpose a note by an interval (e.g. transposeNote("C4", "3M") → "E4")
 */
export function transposeNote(note: string, interval: string): string | null {
  const result = Note.transpose(note, interval)
  return result || null
}

/**
 * Get the MIDI number for a note (e.g. "C4" → 60)
 */
export function noteToMidi(note: string): number | null {
  return Note.midi(note) ?? null
}

/**
 * Convert MIDI number to note name (e.g. 60 → "C4")
 */
export function midiToNote(midi: number): string {
  return Note.fromMidi(midi)
}

/**
 * Get the frequency of a note in Hz (e.g. "A4" → 440)
 */
export function noteToFrequency(note: string): number | null {
  return Note.freq(note) ?? null
}

// ─── Progression Utilities ────────────────────────────────────────────────────

const NUMERAL_TO_DEGREE: Record<string, number> = {
  I: 0, II: 1, III: 2, IV: 3, V: 4, VI: 5, VII: 6,
  i: 0, ii: 1, iii: 2, iv: 3, v: 4, vi: 5, vii: 6,
}

/**
 * Get chord names for a progression in a given key
 * e.g. getProgressionChords("C", ["I", "IV", "V", "I"]) → ["C", "F", "G", "C"]
 */
export function getProgressionChords(keyRoot: string, numerals: string[]): string[] {
  const majorKey = Key.majorKey(keyRoot)
  const chords = majorKey.chords

  return numerals.map((numeral) => {
    const isMinor = numeral === numeral.toLowerCase()
    const upperNumeral = numeral.toUpperCase().replace('°', '').replace('+', '')
    const degree = NUMERAL_TO_DEGREE[upperNumeral]
    if (degree === undefined) return numeral

    const chord = chords[degree]
    return chord ?? numeral
  })
}

/**
 * Get common chord progressions
 */
export const COMMON_PROGRESSIONS: Record<string, { name: string; numerals: string[] }> = {
  'I-IV-V-I': { name: 'Classic Rock/Pop', numerals: ['I', 'IV', 'V', 'I'] },
  'I-V-vi-IV': { name: 'Axis Progression', numerals: ['I', 'V', 'vi', 'IV'] },
  'ii-V-I': { name: 'Jazz ii-V-I', numerals: ['ii', 'V', 'I'] },
  'I-vi-IV-V': { name: '50s Progression', numerals: ['I', 'vi', 'IV', 'V'] },
  '12-bar-blues': {
    name: '12-Bar Blues',
    numerals: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'],
  },
}
