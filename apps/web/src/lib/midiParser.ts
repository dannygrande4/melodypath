import { Midi } from '@tonejs/midi'
import type { NoteEvent } from '@melodypath/shared-types'

/**
 * Parse a MIDI file (ArrayBuffer) into NoteEvent[] for the note highway.
 * Assigns lanes based on pitch ranges.
 */
export function parseMidiToNoteEvents(
  midiData: ArrayBuffer,
  trackIndex = 0,
  numLanes = 4,
): NoteEvent[] {
  const midi = new Midi(midiData)
  const track = midi.tracks[trackIndex]
  if (!track) return []

  const notes = track.notes
  if (notes.length === 0) return []

  // Determine pitch range for lane assignment
  const pitches = notes.map((n) => n.midi)
  const minPitch = Math.min(...pitches)
  const maxPitch = Math.max(...pitches)
  const range = maxPitch - minPitch || 1

  return notes.map((note) => ({
    note: note.name,
    time: note.time,
    duration: note.duration,
    lane: Math.min(numLanes - 1, Math.floor(((note.midi - minPitch) / range) * numLanes)),
    velocity: Math.round(note.velocity * 127),
  }))
}

/**
 * Generate a simple demo song as NoteEvent[] (no MIDI file needed).
 * Creates a melody pattern for testing the note highway.
 */
export function generateDemoSong(bpm = 120, numLanes = 4): { notes: NoteEvent[]; duration: number } {
  const beatDuration = 60 / bpm
  const notes: NoteEvent[] = []

  // Simple ascending/descending pattern
  const patterns = [
    // Intro - quarter notes ascending
    { lane: 0, beats: [0, 4, 8, 12] },
    { lane: 1, beats: [1, 5, 9, 13] },
    { lane: 2, beats: [2, 6, 10, 14] },
    { lane: 3, beats: [3, 7, 11, 15] },
    // Chorus - faster
    { lane: 0, beats: [16, 17, 20, 21, 24, 25, 28, 29] },
    { lane: 1, beats: [16.5, 18, 20.5, 22, 24.5, 26, 28.5, 30] },
    { lane: 2, beats: [17.5, 19, 21.5, 23, 25.5, 27, 29.5, 31] },
    { lane: 3, beats: [18.5, 19.5, 22.5, 23.5, 26.5, 27.5, 30.5, 31.5] },
  ]

  const noteNames = ['C4', 'E4', 'G4', 'C5']

  for (const pattern of patterns) {
    for (const beat of pattern.beats) {
      notes.push({
        note: noteNames[pattern.lane],
        time: beat * beatDuration,
        duration: beatDuration * 0.8,
        lane: pattern.lane,
        velocity: 100,
      })
    }
  }

  notes.sort((a, b) => a.time - b.time)
  const duration = (32 + 2) * beatDuration

  return { notes, duration }
}

/**
 * Ode to Joy — a real melody for the demo song library
 */
export function generateOdeToJoy(bpm = 100, numLanes = 4): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  // E E F G | G F E D | C C D E | E D D
  // E E F G | G F E D | C C D E | D C C
  const melody = [
    { note: 'E4', lane: 1 },
    { note: 'E4', lane: 1 },
    { note: 'F4', lane: 2 },
    { note: 'G4', lane: 3 },
    { note: 'G4', lane: 3 },
    { note: 'F4', lane: 2 },
    { note: 'E4', lane: 1 },
    { note: 'D4', lane: 0 },
    { note: 'C4', lane: 0 },
    { note: 'C4', lane: 0 },
    { note: 'D4', lane: 0 },
    { note: 'E4', lane: 1 },
    { note: 'E4', lane: 1 },
    { note: 'D4', lane: 0 },
    { note: 'D4', lane: 0 },
    // second phrase
    { note: 'E4', lane: 1 },
    { note: 'E4', lane: 1 },
    { note: 'F4', lane: 2 },
    { note: 'G4', lane: 3 },
    { note: 'G4', lane: 3 },
    { note: 'F4', lane: 2 },
    { note: 'E4', lane: 1 },
    { note: 'D4', lane: 0 },
    { note: 'C4', lane: 0 },
    { note: 'C4', lane: 0 },
    { note: 'D4', lane: 0 },
    { note: 'E4', lane: 1 },
    { note: 'D4', lane: 0 },
    { note: 'C4', lane: 0 },
    { note: 'C4', lane: 0 },
  ]

  const notes: NoteEvent[] = melody.map((m, i) => ({
    note: m.note,
    time: i * beat,
    duration: beat * 0.9,
    lane: m.lane,
    velocity: 100,
  }))

  return { notes, duration: (melody.length + 2) * beat }
}

/**
 * Smoke on the Water riff
 */
export function generateSmokeOnTheWater(bpm = 112, numLanes = 4): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  // G Bb C | G Bb Db C | G Bb C | Bb G (simplified to lanes)
  const riff = [
    { note: 'G3', lane: 0, time: 0 },
    { note: 'Bb3', lane: 1, time: 1.5 },
    { note: 'C4', lane: 2, time: 3 },
    { note: 'G3', lane: 0, time: 5 },
    { note: 'Bb3', lane: 1, time: 6.5 },
    { note: 'Db4', lane: 3, time: 8 },
    { note: 'C4', lane: 2, time: 9 },
    { note: 'G3', lane: 0, time: 11 },
    { note: 'Bb3', lane: 1, time: 12.5 },
    { note: 'C4', lane: 2, time: 14 },
    { note: 'Bb3', lane: 1, time: 16 },
    { note: 'G3', lane: 0, time: 17.5 },
    // Repeat
    { note: 'G3', lane: 0, time: 20 },
    { note: 'Bb3', lane: 1, time: 21.5 },
    { note: 'C4', lane: 2, time: 23 },
    { note: 'G3', lane: 0, time: 25 },
    { note: 'Bb3', lane: 1, time: 26.5 },
    { note: 'Db4', lane: 3, time: 28 },
    { note: 'C4', lane: 2, time: 29 },
    { note: 'G3', lane: 0, time: 31 },
    { note: 'Bb3', lane: 1, time: 32.5 },
    { note: 'C4', lane: 2, time: 34 },
    { note: 'Bb3', lane: 1, time: 36 },
    { note: 'G3', lane: 0, time: 37.5 },
  ]

  const notes: NoteEvent[] = riff.map((r) => ({
    note: r.note,
    time: r.time * beat,
    duration: beat * 1.2,
    lane: r.lane,
    velocity: 110,
  }))

  return { notes, duration: 40 * beat }
}
