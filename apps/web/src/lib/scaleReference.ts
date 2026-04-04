/**
 * Scale reference data — includes tab notation and staff note positions
 * for the Resources section.
 */

export interface ScaleReference {
  name: string
  formula: string
  description: string
  mood: string
  /** Notes in the key of C (or A for minor-based scales) */
  exampleKey: string
  exampleNotes: string[]
  /** Guitar tab for one octave (strings 6→1, -1 = not played) */
  tab: { string: number; frets: number[] }[]
  /** Staff positions: MIDI note numbers for rendering on a staff */
  staffNotes: number[]
  /** Common genres this scale is used in */
  genres: string[]
}

export const SCALE_REFERENCES: ScaleReference[] = [
  {
    name: 'Major (Ionian)',
    formula: 'W W H W W W H',
    description: 'The foundation of Western music. Bright, happy, resolved.',
    mood: 'Happy, bright, triumphant',
    exampleKey: 'C',
    exampleNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    tab: [
      // C major on low E string: E(0) F(1) G(3) A(5)
      { string: 6, frets: [0, 1, 3, 5] },
      // A string: A(0) B(2) C(3)
      { string: 5, frets: [0, 2, 3] },
      // D string: D(0) E(2) F(3)
      { string: 4, frets: [0, 2, 3] },
    ],
    staffNotes: [60, 62, 64, 65, 67, 69, 71, 72], // C4 to C5
    genres: ['Pop', 'Rock', 'Classical', 'Country'],
  },
  {
    name: 'Natural Minor (Aeolian)',
    formula: 'W H W W H W W',
    description: 'The sad counterpart to major. Dark, melancholic, emotional.',
    mood: 'Sad, dark, emotional',
    exampleKey: 'A',
    exampleNotes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    tab: [
      // A minor on low E: E(0) F(1) G(3) A(5)
      { string: 6, frets: [0, 1, 3, 5] },
      // A string: A(0) B(2) C(3) D(5)
      { string: 5, frets: [0, 2, 3, 5] },
    ],
    staffNotes: [57, 59, 60, 62, 64, 65, 67, 69], // A3 to A4
    genres: ['Rock', 'Pop', 'Metal', 'Classical'],
  },
  {
    name: 'Major Pentatonic',
    formula: 'W W m3 W m3',
    description: 'Major scale minus the 4th and 7th. Universally pleasant — can\'t hit a wrong note.',
    mood: 'Bright, carefree, uplifting',
    exampleKey: 'C',
    exampleNotes: ['C', 'D', 'E', 'G', 'A'],
    tab: [
      { string: 6, frets: [0, 2] },
      { string: 5, frets: [0, 2] },
      { string: 4, frets: [0, 2] },
    ],
    staffNotes: [60, 62, 64, 67, 69, 72],
    genres: ['Country', 'Rock', 'Pop', 'Folk'],
  },
  {
    name: 'Minor Pentatonic',
    formula: 'm3 W W m3 W',
    description: 'The most used scale in rock and blues. Five notes of pure expression.',
    mood: 'Bluesy, gritty, soulful',
    exampleKey: 'A',
    exampleNotes: ['A', 'C', 'D', 'E', 'G'],
    tab: [
      { string: 6, frets: [0, 3] },
      { string: 5, frets: [0, 2] },
      { string: 4, frets: [0, 2] },
    ],
    staffNotes: [57, 60, 62, 64, 67, 69],
    genres: ['Blues', 'Rock', 'Metal', 'Funk'],
  },
  {
    name: 'Blues',
    formula: 'm3 W H H m3 W',
    description: 'Minor pentatonic + the "blue note" (b5). The soul of blues music.',
    mood: 'Bluesy, expressive, gritty',
    exampleKey: 'A',
    exampleNotes: ['A', 'C', 'D', 'Eb', 'E', 'G'],
    tab: [
      { string: 6, frets: [0, 3] },
      { string: 5, frets: [0, 1, 2] },
      { string: 4, frets: [0, 2] },
    ],
    staffNotes: [57, 60, 62, 63, 64, 67, 69],
    genres: ['Blues', 'Jazz', 'Rock', 'R&B'],
  },
  {
    name: 'Dorian',
    formula: 'W H W W W H W',
    description: 'Minor scale with a bright 6th. Groovy, jazzy, sophisticated.',
    mood: 'Jazzy, groovy, cool',
    exampleKey: 'D',
    exampleNotes: ['D', 'E', 'F', 'G', 'A', 'B', 'C'],
    tab: [
      { string: 5, frets: [0, 2, 3, 5] },
      { string: 4, frets: [0, 2, 3] },
    ],
    staffNotes: [62, 64, 65, 67, 69, 71, 72, 74],
    genres: ['Jazz', 'Funk', 'R&B', 'Latin'],
  },
  {
    name: 'Mixolydian',
    formula: 'W W H W W H W',
    description: 'Major scale with a flat 7th. Bluesy major feel. Rock and folk staple.',
    mood: 'Bluesy-major, laid-back, rootsy',
    exampleKey: 'G',
    exampleNotes: ['G', 'A', 'B', 'C', 'D', 'E', 'F'],
    tab: [
      { string: 6, frets: [3, 5] },
      { string: 5, frets: [0, 2, 3, 5] },
    ],
    staffNotes: [67, 69, 71, 72, 74, 76, 77, 79],
    genres: ['Rock', 'Blues', 'Country', 'Folk'],
  },
  {
    name: 'Phrygian',
    formula: 'H W W W H W W',
    description: 'Minor scale with a flat 2nd. Exotic, Spanish, dark and dramatic.',
    mood: 'Exotic, Spanish, dark',
    exampleKey: 'E',
    exampleNotes: ['E', 'F', 'G', 'A', 'B', 'C', 'D'],
    tab: [
      { string: 6, frets: [0, 1, 3, 5] },
      { string: 5, frets: [0, 2, 3] },
    ],
    staffNotes: [64, 65, 67, 69, 71, 72, 74, 76],
    genres: ['Flamenco', 'Metal', 'Film scores'],
  },
  {
    name: 'Lydian',
    formula: 'W W W H W W H',
    description: 'Major scale with a raised 4th. Dreamy, floating, ethereal.',
    mood: 'Dreamy, magical, floating',
    exampleKey: 'F',
    exampleNotes: ['F', 'G', 'A', 'B', 'C', 'D', 'E'],
    tab: [
      { string: 6, frets: [1, 3, 5] },
      { string: 5, frets: [0, 2, 3] },
    ],
    staffNotes: [65, 67, 69, 71, 72, 74, 76, 77],
    genres: ['Jazz', 'Film scores', 'Progressive rock'],
  },
  {
    name: 'Harmonic Minor',
    formula: 'W H W W H A2 H',
    description: 'Natural minor with a raised 7th. Classical, dramatic, Middle Eastern.',
    mood: 'Classical, dramatic, exotic',
    exampleKey: 'A',
    exampleNotes: ['A', 'B', 'C', 'D', 'E', 'F', 'G#'],
    tab: [
      { string: 6, frets: [0, 2, 3, 5] },
      { string: 5, frets: [0, 1, 4] },
    ],
    staffNotes: [57, 59, 60, 62, 64, 65, 68, 69],
    genres: ['Classical', 'Metal', 'Middle Eastern', 'Film scores'],
  },
]
