/**
 * Library of common guitar chord shapes for lesson visuals.
 * Frets order: low E (index 0) → high E (index 5).
 * -1 = mute, 0 = open, n>0 = fret number.
 */

export interface ChordShape {
  frets: number[]
  fingers?: number[]
  baseFret?: number
  barre?: { fromString: number; toString: number; fret: number }
}

export const CHORD_LIBRARY: Record<string, ChordShape> = {
  // ─── Major open chords ────────────────────────────────────────────────────
  C: {
    frets: [-1, 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
  },
  A: {
    frets: [-1, 0, 2, 2, 2, 0],
    fingers: [0, 0, 1, 2, 3, 0],
  },
  G: {
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [3, 2, 0, 0, 0, 4],
  },
  E: {
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
  },
  D: {
    frets: [-1, -1, 0, 2, 3, 2],
    fingers: [0, 0, 0, 1, 3, 2],
  },
  F: {
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    barre: { fromString: 0, toString: 5, fret: 1 },
  },

  // ─── Minor open chords ────────────────────────────────────────────────────
  Am: {
    frets: [-1, 0, 2, 2, 1, 0],
    fingers: [0, 0, 2, 3, 1, 0],
  },
  Em: {
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
  },
  Dm: {
    frets: [-1, -1, 0, 2, 3, 1],
    fingers: [0, 0, 0, 2, 3, 1],
  },

  // ─── 7th chords ───────────────────────────────────────────────────────────
  G7: {
    frets: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
  },
  C7: {
    frets: [-1, 3, 2, 3, 1, 0],
    fingers: [0, 3, 2, 4, 1, 0],
  },
  D7: {
    frets: [-1, -1, 0, 2, 1, 2],
    fingers: [0, 0, 0, 2, 1, 3],
  },
  E7: {
    frets: [0, 2, 0, 1, 0, 0],
    fingers: [0, 2, 0, 1, 0, 0],
  },
  A7: {
    frets: [-1, 0, 2, 0, 2, 0],
    fingers: [0, 0, 2, 0, 3, 0],
  },
  B7: {
    frets: [-1, 2, 1, 2, 0, 2],
    fingers: [0, 2, 1, 3, 0, 4],
  },

  // ─── Maj7 / Min7 ──────────────────────────────────────────────────────────
  Cmaj7: {
    frets: [-1, 3, 2, 0, 0, 0],
    fingers: [0, 3, 2, 0, 0, 0],
  },
  Fmaj7: {
    frets: [-1, -1, 3, 2, 1, 0],
    fingers: [0, 0, 3, 2, 1, 0],
  },
  Am7: {
    frets: [-1, 0, 2, 0, 1, 0],
    fingers: [0, 0, 2, 0, 1, 0],
  },
  Em7: {
    frets: [0, 2, 0, 0, 0, 0],
    fingers: [0, 2, 0, 0, 0, 0],
  },
  Dm7: {
    frets: [-1, -1, 0, 2, 1, 1],
    fingers: [0, 0, 0, 2, 1, 1],
  },

  // ─── Sus chords ───────────────────────────────────────────────────────────
  Dsus2: {
    frets: [-1, -1, 0, 2, 3, 0],
    fingers: [0, 0, 0, 1, 2, 0],
  },
  Dsus4: {
    frets: [-1, -1, 0, 2, 3, 3],
    fingers: [0, 0, 0, 1, 2, 3],
  },
  Asus2: {
    frets: [-1, 0, 2, 2, 0, 0],
    fingers: [0, 0, 1, 2, 0, 0],
  },
  Asus4: {
    frets: [-1, 0, 2, 2, 3, 0],
    fingers: [0, 0, 1, 2, 3, 0],
  },
  Esus4: {
    frets: [0, 2, 2, 2, 0, 0],
    fingers: [0, 1, 2, 3, 0, 0],
  },

  // ─── Power chords (movable, shown in open position) ───────────────────────
  E5: {
    frets: [0, 2, 2, -1, -1, -1],
    fingers: [0, 1, 2, 0, 0, 0],
  },
  A5: {
    frets: [-1, 0, 2, 2, -1, -1],
    fingers: [0, 0, 1, 2, 0, 0],
  },
  D5: {
    frets: [-1, -1, 0, 2, 3, -1],
    fingers: [0, 0, 0, 1, 2, 0],
  },
  G5: {
    frets: [3, 5, 5, -1, -1, -1],
    fingers: [1, 3, 4, 0, 0, 0],
    baseFret: 3,
  },

  // ─── Diminished ───────────────────────────────────────────────────────────
  Bdim: {
    frets: [-1, 2, 3, 4, 3, -1],
    fingers: [0, 1, 2, 4, 3, 0],
  },
  Adim: {
    frets: [-1, 0, 1, 2, 1, -1],
    fingers: [0, 0, 1, 3, 2, 0],
  },

  // ─── Augmented ────────────────────────────────────────────────────────────
  Caug: {
    frets: [-1, 3, 2, 1, 1, 0],
    fingers: [0, 4, 3, 1, 2, 0],
  },
  Eaug: {
    frets: [0, 3, 2, 1, 1, 0],
    fingers: [0, 4, 3, 1, 2, 0],
  },

  // ─── Extended / add chords ────────────────────────────────────────────────
  Cadd9: {
    frets: [-1, 3, 2, 0, 3, 0],
    fingers: [0, 2, 1, 0, 3, 0],
  },
  Gadd9: {
    frets: [3, 2, 0, 2, 0, 3],
    fingers: [3, 2, 0, 1, 0, 4],
  },
  Dadd9: {
    frets: [-1, -1, 0, 2, 3, 0],
    fingers: [0, 0, 0, 1, 2, 0],
  },

  // ─── Slash chords (root + bass on different string) ──────────────────────
  'C/G': {
    frets: [3, 3, 2, 0, 1, 0],
    fingers: [3, 4, 2, 0, 1, 0],
  },
  'D/F#': {
    frets: [2, -1, 0, 2, 3, 2],
    fingers: [2, 0, 0, 3, 4, 1],
  },
  'G/B': {
    frets: [-1, 2, 0, 0, 0, 3],
    fingers: [0, 1, 0, 0, 0, 3],
  },
}

export function getChordShape(name: string): ChordShape | undefined {
  return CHORD_LIBRARY[name]
}
