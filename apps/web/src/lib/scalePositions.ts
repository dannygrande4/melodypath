import type { FretNote, NoteRole } from '@/components/Guitar/GuitarFretboard'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E']
const STANDARD_OCTAVES = [2, 2, 3, 3, 3, 4]

/**
 * Given an array of scale note pitch classes and a root note,
 * generate FretNote positions across all strings up to maxFret.
 */
export function scaleToFretNotes(
  scaleNotes: string[],
  root: string,
  maxFret = 12,
): FretNote[] {
  const scaleSet = new Set(scaleNotes)
  const result: FretNote[] = []

  for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
    const openPitchClass = STANDARD_TUNING[stringIdx]
    const openOctave = STANDARD_OCTAVES[stringIdx]
    const startSemitone = NOTE_NAMES.indexOf(openPitchClass)

    for (let fret = 0; fret <= maxFret; fret++) {
      const totalSemitones = startSemitone + fret
      const pitchClass = NOTE_NAMES[totalSemitones % 12]
      const octave = openOctave + Math.floor(totalSemitones / 12)

      if (!scaleSet.has(pitchClass)) continue

      // Determine role
      let role: NoteRole = 'other'
      if (pitchClass === root) role = 'root'
      else {
        const idx = scaleNotes.indexOf(pitchClass)
        if (idx === 2) role = 'third'
        else if (idx === 4) role = 'fifth'
        else if (idx === 6) role = 'seventh'
      }

      result.push({
        note: pitchClass,
        fullNote: `${pitchClass}${octave}`,
        string: 6 - stringIdx, // 6 = low E
        fret,
        role,
      })
    }
  }

  return result
}
