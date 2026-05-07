import type { FretNote, NoteRole } from '@/components/Guitar/GuitarFretboard'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E']
const STANDARD_OCTAVES = [2, 2, 3, 3, 3, 4]

// Map flat / enharmonic pitch classes to the sharp form used by NOTE_NAMES
// so flat-spelled scales (Eb, Ab, Bb, ...) match positions on the fretboard.
const PITCH_CLASS_NORMALIZE: Record<string, string> = {
  Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#',
  Cb: 'B', Fb: 'E', 'E#': 'F', 'B#': 'C',
}
const toSharp = (pc: string) => PITCH_CLASS_NORMALIZE[pc] ?? pc

/**
 * Given an array of scale note pitch classes and a root note,
 * generate FretNote positions across all strings up to maxFret.
 */
export function scaleToFretNotes(
  scaleNotes: string[],
  root: string,
  maxFret = 12,
): FretNote[] {
  // Index scale notes by their sharp-form pitch class so flat spellings
  // (Eb, Ab, Bb, ...) still match the chromatic NOTE_NAMES table. Preserve
  // the original spelling for display.
  const sharpToOriginal = new Map<string, string>()
  scaleNotes.forEach((pc) => sharpToOriginal.set(toSharp(pc), pc))
  const sharpRoot = toSharp(root)

  const result: FretNote[] = []

  for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
    const openPitchClass = STANDARD_TUNING[stringIdx]
    const openOctave = STANDARD_OCTAVES[stringIdx]
    const startSemitone = NOTE_NAMES.indexOf(openPitchClass)

    for (let fret = 0; fret <= maxFret; fret++) {
      const totalSemitones = startSemitone + fret
      const sharpPc = NOTE_NAMES[totalSemitones % 12]
      const octave = openOctave + Math.floor(totalSemitones / 12)

      const displayPc = sharpToOriginal.get(sharpPc)
      if (!displayPc) continue

      // Determine role from the semitone interval against the root, so
      // pentatonic / blues / modal scales colour the actual 3rd/5th/7th
      // (not whatever happens to land at array index 2/4/6).
      const rootSemi = NOTE_NAMES.indexOf(sharpRoot)
      const interval = (NOTE_NAMES.indexOf(sharpPc) - rootSemi + 12) % 12
      let role: NoteRole = 'other'
      if (interval === 0) role = 'root'
      else if (interval === 3 || interval === 4) role = 'third'
      else if (interval === 7) role = 'fifth'
      else if (interval === 10 || interval === 11) role = 'seventh'

      result.push({
        note: displayPc,
        fullNote: `${sharpPc}${octave}`,
        string: 6 - stringIdx, // 6 = low E
        fret,
        role,
      })
    }
  }

  return result
}
