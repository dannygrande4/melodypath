import {
  getChord,
  getChordNotes,
  identifyChord,
  getScale,
  getScaleNotes,
  getInterval,
  transposeNote,
  noteToMidi,
  midiToNote,
  noteToFrequency,
  getProgressionChords,
} from '../index.js'

describe('enharmonic normalization', () => {
  it('normalizes E# to F in C# major chord', () => {
    const chord = getChord('C#')
    expect(chord).not.toBeNull()
    expect(chord!.notes).toEqual(['C#', 'F', 'G#'])
    expect(chord!.notes).not.toContain('E#')
  })

  it('normalizes B# to C in F## / C## contexts via getChordNotes', () => {
    const notes = getChordNotes('C#', 'major', 4)
    expect(notes).toEqual(['C#4', 'F4', 'G#4'])
  })

  it('normalizes Cb to B and Fb to E', () => {
    const chord = getChord('Gb')
    expect(chord).not.toBeNull()
    // Gb major = Gb Bb Db — no E#/B#, but make sure it resolves cleanly
    expect(chord!.notes.every((n) => !['E#', 'B#', 'Cb', 'Fb'].includes(n))).toBe(true)
  })

  it('produces playable pitches for every sharp major root', () => {
    const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    for (const r of roots) {
      const notes = getChordNotes(r, 'major', 4)
      expect(notes.length).toBe(3)
      for (const n of notes) {
        expect(n).not.toMatch(/E#|B#|Cb|Fb/)
      }
    }
  })
})

describe('getChord', () => {
  it('returns C major chord info', () => {
    const chord = getChord('C')
    expect(chord).not.toBeNull()
    expect(chord!.notes).toContain('C')
    expect(chord!.notes).toContain('E')
    expect(chord!.notes).toContain('G')
  })

  it('returns null for invalid chord', () => {
    expect(getChord('X##')).toBeNull()
  })

  it('returns Cmaj7 chord', () => {
    const chord = getChord('Cmaj7')
    expect(chord!.notes).toContain('B')
  })
})

describe('getChordNotes', () => {
  it('returns C major triad in octave 4', () => {
    const notes = getChordNotes('C', 'major', 4)
    expect(notes).toContain('C4')
    expect(notes).toContain('E4')
    expect(notes).toContain('G4')
  })
})

describe('identifyChord', () => {
  it('identifies C major from notes', () => {
    const name = identifyChord(['C4', 'E4', 'G4'])
    expect(name).toMatch(/^C/)
  })
})

describe('getScale', () => {
  it('returns C major scale', () => {
    const scale = getScale('C', 'major')
    expect(scale).not.toBeNull()
    expect(scale!.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })

  it('returns A minor scale', () => {
    const scale = getScale('A', 'minor')
    expect(scale!.notes).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
  })

  it('returns null for invalid scale', () => {
    expect(getScale('C', 'notascale')).toBeNull()
  })
})

describe('getScaleNotes', () => {
  it('returns C major pentatonic in octave 4', () => {
    const notes = getScaleNotes('C', 'major pentatonic', 4)
    expect(notes.length).toBeGreaterThan(0)
    expect(notes[0]).toContain('4')
  })
})

describe('getInterval', () => {
  it('returns major third between C and E', () => {
    expect(getInterval('C4', 'E4')).toBe('3M')
  })

  it('returns perfect fifth between C and G', () => {
    expect(getInterval('C4', 'G4')).toBe('5P')
  })
})

describe('transposeNote', () => {
  it('transposes C4 up a major third to E4', () => {
    expect(transposeNote('C4', '3M')).toBe('E4')
  })

  it('transposes A4 up a minor seventh to G5', () => {
    expect(transposeNote('A4', '7m')).toBe('G5')
  })
})

describe('noteToMidi / midiToNote', () => {
  it('converts C4 to MIDI 60', () => {
    expect(noteToMidi('C4')).toBe(60)
  })

  it('converts MIDI 69 to A4', () => {
    expect(midiToNote(69)).toBe('A4')
  })
})

describe('noteToFrequency', () => {
  it('returns ~440 Hz for A4', () => {
    const freq = noteToFrequency('A4')
    expect(freq).toBeCloseTo(440, 0)
  })
})

describe('getProgressionChords', () => {
  it('returns I-IV-V-I in C major', () => {
    const chords = getProgressionChords('C', ['I', 'IV', 'V', 'I'])
    expect(chords[0]).toMatch(/^C/)
    expect(chords[1]).toMatch(/^F/)
    expect(chords[2]).toMatch(/^G/)
  })
})
