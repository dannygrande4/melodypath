import { Midi } from '@tonejs/midi'
import type { NoteEvent } from '@moniquemusic/shared-types'

// Chromatic note names for scalar neighbor lookup
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function getScalarNeighbor(note: string, direction: 1 | -1): string {
  const pc = note.replace(/\d/, '')
  const octave = parseInt(note.match(/\d/)?.[0] ?? '4')
  const idx = CHROMATIC.indexOf(pc)
  if (idx === -1) return note

  // Move by a whole step (2 semitones) for a more musical passing tone
  const newIdx = idx + direction * 2
  const wrappedIdx = ((newIdx % 12) + 12) % 12
  const newOctave = octave + (newIdx < 0 ? -1 : newIdx >= 12 ? 1 : 0)
  return `${CHROMATIC[wrappedIdx]}${newOctave}`
}

/**
 * Create difficulty variants from a set of notes.
 * Easy: keep strong beats only (removes passing tones, keeps melody shape)
 * Hard: add scalar passing tones between notes
 */
export function applyDifficultyFilter(
  notes: NoteEvent[],
  tier: 'easy' | 'medium' | 'hard',
): NoteEvent[] {
  if (tier === 'medium') return notes

  if (tier === 'easy') {
    // Keep notes on strong beats (every other), but always keep first and last
    return notes.filter((_, i) => i === 0 || i === notes.length - 1 || i % 2 === 0)
  }

  // Hard: add scalar neighbor passing tones between notes
  const result: NoteEvent[] = []
  for (let i = 0; i < notes.length; i++) {
    result.push(notes[i])
    if (i < notes.length - 1) {
      const curr = notes[i]
      const next = notes[i + 1]
      const gap = next.time - (curr.time + curr.duration)
      if (gap > 0.15) {
        // Choose a passing tone: scalar neighbor moving toward the next note
        const currMidi = noteNameToMidi(curr.note)
        const nextMidi = noteNameToMidi(next.note)
        const direction: 1 | -1 = nextMidi > currMidi ? 1 : -1
        const passingNote = getScalarNeighbor(curr.note, direction)

        result.push({
          note: passingNote,
          time: curr.time + (next.time - curr.time) * 0.5,
          duration: curr.duration * 0.4,
          lane: curr.lane, // same lane as the note it's passing from
          velocity: Math.round(curr.velocity * 0.6),
        })
      }
    }
  }
  return result
}

function noteNameToMidi(name: string): number {
  const pc = name.replace(/\d/, '')
  const oct = parseInt(name.match(/\d/)?.[0] ?? '4')
  const idx = CHROMATIC.indexOf(pc)
  return (oct + 1) * 12 + idx
}

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
 * Ode to Joy - a real melody for the demo song library
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
  // Riff: G5-Bb5-C5 | G5-Bb5-Db5-C5 | G5-Bb5-C5 | Bb5-G5 (power chord roots)
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

/**
 * Seven Nation Army - iconic bass riff
 */
export function generateSevenNationArmy(bpm = 120, numLanes = 4): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  // E E G E D C B (rhythmic)
  const riff = [
    { note: 'E3', lane: 0, time: 0 },
    { note: 'E3', lane: 0, time: 2 },
    { note: 'G3', lane: 1, time: 3 },
    { note: 'E3', lane: 0, time: 4.5 },
    { note: 'D3', lane: 0, time: 6 },
    { note: 'C3', lane: 0, time: 7.5 },
    { note: 'B2', lane: 1, time: 8 },
    // repeat
    { note: 'E3', lane: 0, time: 12 },
    { note: 'E3', lane: 0, time: 14 },
    { note: 'G3', lane: 1, time: 15 },
    { note: 'E3', lane: 0, time: 16.5 },
    { note: 'D3', lane: 0, time: 18 },
    { note: 'C3', lane: 0, time: 19.5 },
    { note: 'B2', lane: 1, time: 20 },
    // variation
    { note: 'E3', lane: 0, time: 24 },
    { note: 'E3', lane: 0, time: 26 },
    { note: 'G3', lane: 1, time: 27 },
    { note: 'E3', lane: 0, time: 28.5 },
    { note: 'D3', lane: 2, time: 30 },
    { note: 'C3', lane: 2, time: 31.5 },
    { note: 'D3', lane: 2, time: 32 },
    { note: 'C3', lane: 2, time: 33 },
    { note: 'B2', lane: 1, time: 34 },
    { note: 'B2', lane: 1, time: 36 },
  ]

  const notes: NoteEvent[] = riff.map((r) => ({
    note: r.note,
    time: r.time * beat,
    duration: beat * 1,
    lane: r.lane,
    velocity: 110,
  }))

  return { notes, duration: 38 * beat }
}

/**
 * Twinkle Twinkle Little Star
 */
export function generateTwinkle(bpm = 90): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  const melody = [
    // C C G G A A G - F F E E D D C
    { note: 'C4', lane: 0 }, { note: 'C4', lane: 0 },
    { note: 'G4', lane: 2 }, { note: 'G4', lane: 2 },
    { note: 'A4', lane: 3 }, { note: 'A4', lane: 3 },
    { note: 'G4', lane: 2 },
    { note: 'F4', lane: 1 }, { note: 'F4', lane: 1 },
    { note: 'E4', lane: 1 }, { note: 'E4', lane: 1 },
    { note: 'D4', lane: 0 }, { note: 'D4', lane: 0 },
    { note: 'C4', lane: 0 },
    // G G F F E E D
    { note: 'G4', lane: 2 }, { note: 'G4', lane: 2 },
    { note: 'F4', lane: 1 }, { note: 'F4', lane: 1 },
    { note: 'E4', lane: 1 }, { note: 'E4', lane: 1 },
    { note: 'D4', lane: 0 },
    // G G F F E E D
    { note: 'G4', lane: 2 }, { note: 'G4', lane: 2 },
    { note: 'F4', lane: 1 }, { note: 'F4', lane: 1 },
    { note: 'E4', lane: 1 }, { note: 'E4', lane: 1 },
    { note: 'D4', lane: 0 },
    // C C G G A A G - F F E E D D C
    { note: 'C4', lane: 0 }, { note: 'C4', lane: 0 },
    { note: 'G4', lane: 2 }, { note: 'G4', lane: 2 },
    { note: 'A4', lane: 3 }, { note: 'A4', lane: 3 },
    { note: 'G4', lane: 2 },
    { note: 'F4', lane: 1 }, { note: 'F4', lane: 1 },
    { note: 'E4', lane: 1 }, { note: 'E4', lane: 1 },
    { note: 'D4', lane: 0 }, { note: 'D4', lane: 0 },
    { note: 'C4', lane: 0 },
  ]

  const notes: NoteEvent[] = melody.map((m, i) => ({
    note: m.note,
    time: i * beat,
    duration: beat * 0.9,
    lane: m.lane,
    velocity: 90,
  }))

  return { notes, duration: (melody.length + 2) * beat }
}

/**
 * Happy Birthday melody
 */
export function generateHappyBirthday(bpm = 100): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  const melody = [
    { note: 'C4', lane: 0, dur: 0.75 },
    { note: 'C4', lane: 0, dur: 0.25 },
    { note: 'D4', lane: 0, dur: 1 },
    { note: 'C4', lane: 0, dur: 1 },
    { note: 'F4', lane: 1, dur: 1 },
    { note: 'E4', lane: 1, dur: 2 },
    { note: 'C4', lane: 0, dur: 0.75 },
    { note: 'C4', lane: 0, dur: 0.25 },
    { note: 'D4', lane: 0, dur: 1 },
    { note: 'C4', lane: 0, dur: 1 },
    { note: 'G4', lane: 2, dur: 1 },
    { note: 'F4', lane: 1, dur: 2 },
    { note: 'C4', lane: 0, dur: 0.75 },
    { note: 'C4', lane: 0, dur: 0.25 },
    { note: 'C5', lane: 3, dur: 1 },
    { note: 'A4', lane: 3, dur: 1 },
    { note: 'F4', lane: 1, dur: 1 },
    { note: 'E4', lane: 1, dur: 1 },
    { note: 'D4', lane: 0, dur: 2 },
    { note: 'A#4', lane: 2, dur: 0.75 },
    { note: 'A#4', lane: 2, dur: 0.25 },
    { note: 'A4', lane: 3, dur: 1 },
    { note: 'F4', lane: 1, dur: 1 },
    { note: 'G4', lane: 2, dur: 1 },
    { note: 'F4', lane: 1, dur: 2 },
  ]

  let time = 0
  const notes: NoteEvent[] = melody.map((m) => {
    const n: NoteEvent = {
      note: m.note,
      time: time * beat,
      duration: m.dur * beat * 0.9,
      lane: m.lane,
      velocity: 95,
    }
    time += m.dur
    return n
  })

  return { notes, duration: (time + 2) * beat }
}

/**
 * La Bamba basic riff (C-F-G pattern)
 */
export function generateLaBamba(bpm = 130): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  // Simplified strumming pattern on C-F-G
  const pattern = [
    // Bar 1: C
    { note: 'C4', lane: 0, time: 0 }, { note: 'E4', lane: 1, time: 0.5 },
    { note: 'G4', lane: 2, time: 1 }, { note: 'C4', lane: 0, time: 1.5 },
    // Bar 1: F
    { note: 'F4', lane: 1, time: 2 }, { note: 'A4', lane: 3, time: 2.5 },
    // Bar 1: G
    { note: 'G4', lane: 2, time: 3 }, { note: 'B4', lane: 3, time: 3.5 },
    // Bar 2: C
    { note: 'C4', lane: 0, time: 4 }, { note: 'E4', lane: 1, time: 4.5 },
    { note: 'G4', lane: 2, time: 5 }, { note: 'C4', lane: 0, time: 5.5 },
    // Bar 2: F-G
    { note: 'F4', lane: 1, time: 6 }, { note: 'A4', lane: 3, time: 6.5 },
    { note: 'G4', lane: 2, time: 7 }, { note: 'B4', lane: 3, time: 7.5 },
    // Repeat x2
    { note: 'C4', lane: 0, time: 8 }, { note: 'E4', lane: 1, time: 8.5 },
    { note: 'G4', lane: 2, time: 9 }, { note: 'C4', lane: 0, time: 9.5 },
    { note: 'F4', lane: 1, time: 10 }, { note: 'A4', lane: 3, time: 10.5 },
    { note: 'G4', lane: 2, time: 11 }, { note: 'B4', lane: 3, time: 11.5 },
    { note: 'C4', lane: 0, time: 12 }, { note: 'E4', lane: 1, time: 12.5 },
    { note: 'G4', lane: 2, time: 13 }, { note: 'C4', lane: 0, time: 13.5 },
    { note: 'F4', lane: 1, time: 14 }, { note: 'A4', lane: 3, time: 14.5 },
    { note: 'G4', lane: 2, time: 15 }, { note: 'B4', lane: 3, time: 15.5 },
  ]

  const notes: NoteEvent[] = pattern.map((r) => ({
    note: r.note,
    time: r.time * beat,
    duration: beat * 0.8,
    lane: r.lane,
    velocity: 100,
  }))

  return { notes, duration: 17 * beat }
}

/**
 * Mary Had a Little Lamb
 */
export function generateMaryLamb(bpm = 100): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  const melody = [
    { note: 'E4', lane: 1 }, { note: 'D4', lane: 0 }, { note: 'C4', lane: 0 }, { note: 'D4', lane: 0 },
    { note: 'E4', lane: 1 }, { note: 'E4', lane: 1 }, { note: 'E4', lane: 1 },
    { note: 'D4', lane: 0 }, { note: 'D4', lane: 0 }, { note: 'D4', lane: 0 },
    { note: 'E4', lane: 1 }, { note: 'G4', lane: 2 }, { note: 'G4', lane: 2 },
    { note: 'E4', lane: 1 }, { note: 'D4', lane: 0 }, { note: 'C4', lane: 0 }, { note: 'D4', lane: 0 },
    { note: 'E4', lane: 1 }, { note: 'E4', lane: 1 }, { note: 'E4', lane: 1 }, { note: 'E4', lane: 1 },
    { note: 'D4', lane: 0 }, { note: 'D4', lane: 0 }, { note: 'E4', lane: 1 }, { note: 'D4', lane: 0 },
    { note: 'C4', lane: 0 },
  ]
  const notes: NoteEvent[] = melody.map((m, i) => ({
    note: m.note, time: i * beat, duration: beat * 0.9, lane: m.lane, velocity: 90,
  }))
  return { notes, duration: (melody.length + 2) * beat }
}

/**
 * When The Saints Go Marching In (simplified)
 */
export function generateWhenTheSaints(bpm = 110): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  const melody = [
    { note: 'C4', lane: 0 }, { note: 'E4', lane: 1 }, { note: 'F4', lane: 2 }, { note: 'G4', lane: 3 },
    { note: 'C4', lane: 0 }, { note: 'E4', lane: 1 }, { note: 'F4', lane: 2 }, { note: 'G4', lane: 3 },
    { note: 'C4', lane: 0 }, { note: 'E4', lane: 1 }, { note: 'F4', lane: 2 }, { note: 'G4', lane: 3 },
    { note: 'E4', lane: 1 }, { note: 'C4', lane: 0 }, { note: 'E4', lane: 1 }, { note: 'D4', lane: 0 },
    { note: 'E4', lane: 1 }, { note: 'E4', lane: 1 }, { note: 'D4', lane: 0 }, { note: 'C4', lane: 0 },
    { note: 'C4', lane: 0 }, { note: 'E4', lane: 1 }, { note: 'G4', lane: 3 }, { note: 'G4', lane: 3 },
    { note: 'F4', lane: 2 },
    { note: 'E4', lane: 1 }, { note: 'F4', lane: 2 }, { note: 'G4', lane: 3 }, { note: 'E4', lane: 1 },
    { note: 'C4', lane: 0 }, { note: 'D4', lane: 0 }, { note: 'C4', lane: 0 },
  ]
  const notes: NoteEvent[] = melody.map((m, i) => ({
    note: m.note, time: i * beat, duration: beat * 0.9, lane: m.lane, velocity: 95,
  }))
  return { notes, duration: (melody.length + 2) * beat }
}

/**
 * Für Elise opening theme
 */
export function generateFurElise(bpm = 85): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  const half = beat / 2
  const melody = [
    { note: 'E5', time: 0 }, { note: 'D#5', time: half },
    { note: 'E5', time: half * 2 }, { note: 'D#5', time: half * 3 },
    { note: 'E5', time: half * 4 }, { note: 'B4', time: half * 5 },
    { note: 'D5', time: half * 6 }, { note: 'C5', time: half * 7 },
    { note: 'A4', time: half * 8 },
    // pause
    { note: 'C4', time: half * 10 }, { note: 'E4', time: half * 11 },
    { note: 'A4', time: half * 12 }, { note: 'B4', time: half * 13 },
    // pause
    { note: 'E4', time: half * 15 }, { note: 'G#4', time: half * 16 },
    { note: 'B4', time: half * 17 }, { note: 'C5', time: half * 18 },
    // repeat
    { note: 'E5', time: half * 20 }, { note: 'D#5', time: half * 21 },
    { note: 'E5', time: half * 22 }, { note: 'D#5', time: half * 23 },
    { note: 'E5', time: half * 24 }, { note: 'B4', time: half * 25 },
    { note: 'D5', time: half * 26 }, { note: 'C5', time: half * 27 },
    { note: 'A4', time: half * 28 },
  ]

  const laneMap: Record<string, number> = {
    'C4': 0, 'E4': 1, 'G#4': 2, 'A4': 3,
    'B4': 2, 'C5': 3, 'D5': 1, 'D#5': 0, 'E5': 1,
  }

  const notes: NoteEvent[] = melody.map((m) => ({
    note: m.note,
    time: m.time,
    duration: half * 0.9,
    lane: laneMap[m.note] ?? 0,
    velocity: 85,
  }))
  return { notes, duration: half * 30 + beat }
}

/**
 * Amazing Grace
 */
export function generateAmazingGrace(bpm = 80): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  const melody = [
    { note: 'G3', lane: 0 }, { note: 'C4', lane: 1 }, { note: 'E4', lane: 2 },
    { note: 'C4', lane: 1 }, { note: 'E4', lane: 2 }, { note: 'D4', lane: 1 },
    { note: 'C4', lane: 1 }, { note: 'A3', lane: 0 }, { note: 'G3', lane: 0 },
    { note: 'G3', lane: 0 }, { note: 'C4', lane: 1 }, { note: 'E4', lane: 2 },
    { note: 'C4', lane: 1 }, { note: 'E4', lane: 2 }, { note: 'G4', lane: 3 },
    { note: 'E4', lane: 2 }, { note: 'C4', lane: 1 }, { note: 'A3', lane: 0 },
    { note: 'C4', lane: 1 }, { note: 'C4', lane: 1 }, { note: 'A3', lane: 0 },
    { note: 'G3', lane: 0 }, { note: 'C4', lane: 1 },
  ]
  const notes: NoteEvent[] = melody.map((m, i) => ({
    note: m.note, time: i * beat * 1.2, duration: beat, lane: m.lane, velocity: 85,
  }))
  return { notes, duration: (melody.length + 2) * beat * 1.2 }
}

/**
 * Canon in D (simplified melody)
 */
export function generateCanonInD(bpm = 70): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  const melody = [
    { note: 'F#4', lane: 2 }, { note: 'E4', lane: 1 }, { note: 'D4', lane: 0 },
    { note: 'C#4', lane: 0 }, { note: 'B3', lane: 0 }, { note: 'A3', lane: 0 },
    { note: 'B3', lane: 0 }, { note: 'C#4', lane: 0 },
    { note: 'D4', lane: 1 }, { note: 'C#4', lane: 0 }, { note: 'B3', lane: 0 },
    { note: 'A3', lane: 0 }, { note: 'G3', lane: 0 }, { note: 'F#3', lane: 0 },
    { note: 'G3', lane: 0 }, { note: 'A3', lane: 0 },
    { note: 'D4', lane: 1 }, { note: 'F#4', lane: 2 }, { note: 'A4', lane: 3 },
    { note: 'G4', lane: 3 }, { note: 'F#4', lane: 2 }, { note: 'D4', lane: 1 },
    { note: 'F#4', lane: 2 }, { note: 'E4', lane: 1 }, { note: 'D4', lane: 1 },
    { note: 'B3', lane: 0 }, { note: 'B3', lane: 0 }, { note: 'C#4', lane: 0 },
    { note: 'D4', lane: 1 }, { note: 'D4', lane: 1 }, { note: 'A3', lane: 0 },
    { note: 'A3', lane: 0 },
  ]
  const notes: NoteEvent[] = melody.map((m, i) => ({
    note: m.note, time: i * beat, duration: beat * 0.9, lane: m.lane, velocity: 80,
  }))
  return { notes, duration: (melody.length + 2) * beat }
}

/**
 * Take Me Home, Country Roads (chorus melody)
 */
export function generateCountryRoads(bpm = 82): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  // "Country roads, take me home, to the place I belong..."
  const melody = [
    { note: 'A4', lane: 3 }, { note: 'G4', lane: 2 }, { note: 'E4', lane: 1 },
    { note: 'E4', lane: 1 }, { note: 'D4', lane: 0 },
    { note: 'E4', lane: 1 }, { note: 'E4', lane: 1 },
    { note: 'A4', lane: 3 }, { note: 'G4', lane: 2 }, { note: 'E4', lane: 1 },
    { note: 'E4', lane: 1 }, { note: 'D4', lane: 0 },
    { note: 'E4', lane: 1 },
    { note: 'A4', lane: 3 }, { note: 'A4', lane: 3 }, { note: 'G4', lane: 2 },
    { note: 'E4', lane: 1 }, { note: 'D4', lane: 0 }, { note: 'E4', lane: 1 },
    { note: 'E4', lane: 1 }, { note: 'D4', lane: 0 },
    { note: 'C4', lane: 0 }, { note: 'D4', lane: 0 },
    { note: 'E4', lane: 1 }, { note: 'D4', lane: 0 }, { note: 'C4', lane: 0 },
    { note: 'A3', lane: 0 },
  ]
  const notes: NoteEvent[] = melody.map((m, i) => ({
    note: m.note, time: i * beat, duration: beat * 0.9, lane: m.lane, velocity: 90,
  }))
  return { notes, duration: (melody.length + 2) * beat }
}

/**
 * Let It Be (verse melody)
 */
export function generateLetItBe(bpm = 72): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  // "When I find myself in times of trouble, Mother Mary comes to me..."
  const melody = [
    { note: 'G4', lane: 2 }, { note: 'G4', lane: 2 }, { note: 'A4', lane: 3 },
    { note: 'G4', lane: 2 }, { note: 'G4', lane: 2 }, { note: 'E4', lane: 1 },
    { note: 'D4', lane: 0 }, { note: 'E4', lane: 1 },
    { note: 'G4', lane: 2 }, { note: 'G4', lane: 2 }, { note: 'A4', lane: 3 },
    { note: 'G4', lane: 2 }, { note: 'E4', lane: 1 },
    { note: 'D4', lane: 0 }, { note: 'C4', lane: 0 },
    { note: 'E4', lane: 1 }, { note: 'E4', lane: 1 }, { note: 'D4', lane: 0 },
    { note: 'C4', lane: 0 }, { note: 'D4', lane: 0 }, { note: 'E4', lane: 1 },
    { note: 'G4', lane: 2 }, { note: 'A4', lane: 3 }, { note: 'G4', lane: 2 },
    { note: 'C4', lane: 0 }, { note: 'D4', lane: 0 }, { note: 'E4', lane: 1 },
    { note: 'C4', lane: 0 },
  ]
  const notes: NoteEvent[] = melody.map((m, i) => ({
    note: m.note, time: i * beat, duration: beat * 0.85, lane: m.lane, velocity: 85,
  }))
  return { notes, duration: (melody.length + 2) * beat }
}

/**
 * Blackbird (simplified picking melody)
 */
export function generateBlackbird(bpm = 92): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  const half = beat / 2
  const melody = [
    { note: 'G3', time: 0 }, { note: 'A3', time: half },
    { note: 'B3', time: half * 2 }, { note: 'G4', time: half * 3 },
    { note: 'A4', time: half * 4 }, { note: 'G4', time: half * 5 },
    { note: 'E4', time: half * 7 }, { note: 'D4', time: half * 8 },
    { note: 'C4', time: half * 10 },
    { note: 'G3', time: half * 12 }, { note: 'A3', time: half * 13 },
    { note: 'B3', time: half * 14 }, { note: 'D4', time: half * 15 },
    { note: 'E4', time: half * 16 }, { note: 'D4', time: half * 17 },
    { note: 'C4', time: half * 19 }, { note: 'B3', time: half * 20 },
    { note: 'A3', time: half * 22 },
    { note: 'G3', time: half * 24 }, { note: 'A3', time: half * 25 },
    { note: 'B3', time: half * 26 }, { note: 'G4', time: half * 27 },
    { note: 'A4', time: half * 28 }, { note: 'B4', time: half * 29 },
    { note: 'A4', time: half * 30 }, { note: 'G4', time: half * 31 },
    { note: 'E4', time: half * 33 },
  ]
  const laneMap: Record<string, number> = {
    'G3': 0, 'A3': 0, 'B3': 1, 'C4': 1, 'D4': 1, 'E4': 2, 'G4': 3, 'A4': 3, 'B4': 3,
  }
  const notes: NoteEvent[] = melody.map((m) => ({
    note: m.note, time: m.time, duration: half * 0.9, lane: laneMap[m.note] ?? 0, velocity: 75,
  }))
  return { notes, duration: half * 35 + beat }
}

/**
 * Wonderwall (simplified vocal melody - chorus)
 */
export function generateWonderwall(bpm = 87): { notes: NoteEvent[]; duration: number } {
  const beat = 60 / bpm
  // "Because maybe, you're gonna be the one that saves me..."
  const melody = [
    { note: 'B4', lane: 3 }, { note: 'A4', lane: 3 },
    { note: 'G4', lane: 2 }, { note: 'G4', lane: 2 }, { note: 'F#4', lane: 2 },
    { note: 'E4', lane: 1 }, { note: 'E4', lane: 1 },
    { note: 'F#4', lane: 2 }, { note: 'G4', lane: 2 },
    { note: 'B4', lane: 3 }, { note: 'A4', lane: 3 },
    { note: 'G4', lane: 2 }, { note: 'G4', lane: 2 }, { note: 'F#4', lane: 2 },
    { note: 'E4', lane: 1 },
    { note: 'F#4', lane: 2 }, { note: 'G4', lane: 2 },
    { note: 'A4', lane: 3 }, { note: 'B4', lane: 3 },
    { note: 'A4', lane: 3 }, { note: 'G4', lane: 2 },
    { note: 'F#4', lane: 2 }, { note: 'E4', lane: 1 },
    { note: 'D4', lane: 0 }, { note: 'E4', lane: 1 },
  ]
  const notes: NoteEvent[] = melody.map((m, i) => ({
    note: m.note, time: i * beat, duration: beat * 0.85, lane: m.lane, velocity: 90,
  }))
  return { notes, duration: (melody.length + 2) * beat }
}
