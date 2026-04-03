import type { FretNote, NoteRole } from '@/components/Guitar/GuitarFretboard'

/**
 * Chord shape definition: fret positions for each string (1=high E, 6=low E)
 * -1 = muted, 0 = open, 1+ = fret number
 */
interface ChordShape {
  name: string
  frets: [number, number, number, number, number, number] // strings 6→1 (low E to high E)
  fingers: [number, number, number, number, number, number]
  root: number // which string is the root (1-6)
}

// Common open chord shapes (frets ordered: string 6, 5, 4, 3, 2, 1)
const CHORD_SHAPES: Record<string, ChordShape> = {
  C: { name: 'C', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], root: 5 },
  D: { name: 'D', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], root: 4 },
  Dm: { name: 'Dm', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], root: 4 },
  E: { name: 'E', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], root: 6 },
  Em: { name: 'Em', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], root: 6 },
  F: { name: 'F', frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 4, 3, 1], root: 6 },
  G: { name: 'G', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], root: 6 },
  A: { name: 'A', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], root: 5 },
  Am: { name: 'Am', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], root: 5 },
  B7: { name: 'B7', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], root: 5 },
  C7: { name: 'C7', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], root: 5 },
  D7: { name: 'D7', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], root: 4 },
  E7: { name: 'E7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], root: 6 },
  G7: { name: 'G7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], root: 6 },
  A7: { name: 'A7', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0], root: 5 },
  Am7: { name: 'Am7', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], root: 5 },
  Dm7: { name: 'Dm7', frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], root: 4 },
  Em7: { name: 'Em7', frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0], root: 6 },
  Cmaj7: { name: 'Cmaj7', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], root: 5 },
  Fmaj7: { name: 'Fmaj7', frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], root: 4 },
}

const NOTE_NAMES_ALL = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const STANDARD_TUNING_NOTES = ['E', 'A', 'D', 'G', 'B', 'E']
const STANDARD_TUNING_OCTAVES = [2, 2, 3, 3, 3, 4]

/**
 * Convert a chord shape into an array of FretNote for the GuitarFretboard.
 */
export function chordShapeToFretNotes(chordName: string): FretNote[] {
  const shape = CHORD_SHAPES[chordName]
  if (!shape) return []

  const chordNotes = getChordPitchClasses(chordName)
  const result: FretNote[] = []

  for (let i = 0; i < 6; i++) {
    const fret = shape.frets[i]
    if (fret < 0) continue // muted

    const stringNum = 6 - i // convert array index to string number (6=low E)
    const openPitchClass = STANDARD_TUNING_NOTES[i]
    const openOctave = STANDARD_TUNING_OCTAVES[i]

    const startIdx = NOTE_NAMES_ALL.indexOf(openPitchClass)
    const totalSemitones = startIdx + fret
    const pitchClass = NOTE_NAMES_ALL[totalSemitones % 12]
    const octave = openOctave + Math.floor(totalSemitones / 12)

    let role: NoteRole = 'other'
    if (chordNotes.length > 0) {
      if (pitchClass === chordNotes[0]) role = 'root'
      else if (chordNotes.length > 1 && pitchClass === chordNotes[1]) role = 'third'
      else if (chordNotes.length > 2 && pitchClass === chordNotes[2]) role = 'fifth'
      else if (chordNotes.length > 3 && pitchClass === chordNotes[3]) role = 'seventh'
    }

    result.push({
      note: pitchClass,
      fullNote: `${pitchClass}${octave}`,
      string: stringNum,
      fret,
      role,
      finger: shape.fingers[i] || undefined,
    })
  }

  return result
}

function getChordPitchClasses(name: string): string[] {
  // Simple lookup — will be replaced with Tonal.js integration
  const basic: Record<string, string[]> = {
    C: ['C', 'E', 'G'],
    D: ['D', 'F#', 'A'],
    Dm: ['D', 'F', 'A'],
    E: ['E', 'G#', 'B'],
    Em: ['E', 'G', 'B'],
    F: ['F', 'A', 'C'],
    G: ['G', 'B', 'D'],
    A: ['A', 'C#', 'E'],
    Am: ['A', 'C', 'E'],
    B7: ['B', 'D#', 'F#', 'A'],
    C7: ['C', 'E', 'G', 'A#'],
    D7: ['D', 'F#', 'A', 'C'],
    E7: ['E', 'G#', 'B', 'D'],
    G7: ['G', 'B', 'D', 'F'],
    A7: ['A', 'C#', 'E', 'G'],
    Am7: ['A', 'C', 'E', 'G'],
    Dm7: ['D', 'F', 'A', 'C'],
    Em7: ['E', 'G', 'B', 'D'],
    Cmaj7: ['C', 'E', 'G', 'B'],
    Fmaj7: ['F', 'A', 'C', 'E'],
  }
  return basic[name] ?? []
}

export function getAvailableChordShapes(): string[] {
  return Object.keys(CHORD_SHAPES)
}

export { CHORD_SHAPES }
