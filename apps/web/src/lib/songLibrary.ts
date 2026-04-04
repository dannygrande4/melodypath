import type { NoteEvent } from '@melodypath/shared-types'
import {
  generateOdeToJoy,
  generateSmokeOnTheWater,
  generateDemoSong,
  generateSevenNationArmy,
  generateTwinkle,
  generateHappyBirthday,
  generateLaBamba,
  generateMaryLamb,
  generateWhenTheSaints,
  generateFurElise,
  generateAmazingGrace,
  generateCanonInD,
  generateCountryRoads,
  generateLetItBe,
  generateBlackbird,
  generateWonderwall,
  applyDifficultyFilter,
} from './midiParser'

/** Wrap a song generator with difficulty tier support */
function withTiers(
  gen: () => { notes: NoteEvent[]; duration: number },
): (tier?: DifficultyTier) => { notes: NoteEvent[]; duration: number } {
  return (tier = 'medium') => {
    const result = gen()
    return { notes: applyDifficultyFilter(result.notes, tier), duration: result.duration }
  }
}

export type DifficultyTier = 'easy' | 'medium' | 'hard'

export interface SongData {
  id: string
  title: string
  artist: string
  bpm: number
  key: string
  difficulty: 1 | 2 | 3 | 4 | 5
  genre: string
  concepts: string[]
  hasTiers?: boolean
  getNotes: (tier?: DifficultyTier) => { notes: NoteEvent[]; duration: number }
}

export const SONG_LIBRARY: SongData[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Traditional',
    bpm: 90,
    key: 'C',
    difficulty: 1,
    genre: 'Children',
    concepts: ['melody', 'simple rhythm', 'repetition'],
        hasTiers: true,
    getNotes: withTiers(() => generateTwinkle(90)),
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    bpm: 100,
    key: 'C',
    difficulty: 1,
    genre: 'Classical',
    concepts: ['melody', 'stepwise motion', 'quarter notes'],
        hasTiers: true,
    getNotes: withTiers(() => generateOdeToJoy(100)),
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    artist: 'Traditional',
    bpm: 100,
    key: 'C',
    difficulty: 1,
    genre: 'Traditional',
    concepts: ['melody', '3/4 feel', 'pickup notes'],
        hasTiers: true,
    getNotes: withTiers(() => generateHappyBirthday(100)),
  },
  {
    id: 'demo-pattern',
    title: 'Practice Patterns',
    artist: 'MelodyPath',
    bpm: 120,
    key: 'C',
    difficulty: 1,
    genre: 'Practice',
    concepts: ['rhythm', 'coordination', 'timing'],
        hasTiers: true,
    getNotes: withTiers(() => generateDemoSong(120)),
  },
  {
    id: 'seven-nation-army',
    title: 'Seven Nation Army',
    artist: 'The White Stripes',
    bpm: 120,
    key: 'Em',
    difficulty: 2,
    genre: 'Rock',
    concepts: ['riff', 'bass line', 'syncopation'],
        hasTiers: true,
    getNotes: withTiers(() => generateSevenNationArmy(120)),
  },
  {
    id: 'smoke-on-the-water',
    title: 'Smoke on the Water',
    artist: 'Deep Purple',
    bpm: 112,
    key: 'Gm',
    difficulty: 2,
    genre: 'Rock',
    concepts: ['riff', 'power chords', 'syncopation'],
        hasTiers: true,
    getNotes: withTiers(() => generateSmokeOnTheWater(112)),
  },
  {
    id: 'la-bamba',
    title: 'La Bamba',
    artist: 'Ritchie Valens',
    bpm: 130,
    key: 'C',
    difficulty: 3,
    genre: 'Latin Rock',
    concepts: ['I-IV-V', 'fast strumming', 'chord changes'],
        hasTiers: true,
    getNotes: withTiers(() => generateLaBamba(130)),
  },
  {
    id: 'mary-lamb',
    title: 'Mary Had a Little Lamb',
    artist: 'Traditional',
    bpm: 100,
    key: 'C',
    difficulty: 1,
    genre: 'Children',
    concepts: ['melody', 'repetition', 'simple rhythm'],
        hasTiers: true,
    getNotes: withTiers(() => generateMaryLamb(100)),
  },
  {
    id: 'when-the-saints',
    title: 'When The Saints Go Marching In',
    artist: 'Traditional',
    bpm: 110,
    key: 'C',
    difficulty: 2,
    genre: 'Jazz/Spiritual',
    concepts: ['melody', 'major key', 'syncopation'],
        hasTiers: true,
    getNotes: withTiers(() => generateWhenTheSaints(110)),
  },
  {
    id: 'fur-elise',
    title: 'Für Elise',
    artist: 'Beethoven',
    bpm: 85,
    key: 'Am',
    difficulty: 3,
    genre: 'Classical',
    concepts: ['classical', 'chromatic', 'eighth notes'],
        hasTiers: true,
    getNotes: withTiers(() => generateFurElise(85)),
  },
  {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    artist: 'Traditional',
    bpm: 80,
    key: 'C',
    difficulty: 1,
    genre: 'Hymn',
    concepts: ['melody', 'slow tempo', 'legato'],
    hasTiers: true,
    getNotes: withTiers(() => generateAmazingGrace(80)),
  },
  {
    id: 'canon-in-d',
    title: 'Canon in D',
    artist: 'Pachelbel',
    bpm: 70,
    key: 'D',
    difficulty: 3,
    genre: 'Classical',
    concepts: ['classical', 'arpeggios', 'sequence'],
    hasTiers: true,
    getNotes: withTiers(() => generateCanonInD(70)),
  },
  {
    id: 'country-roads',
    title: 'Take Me Home, Country Roads',
    artist: 'John Denver',
    bpm: 82,
    key: 'A',
    difficulty: 2,
    genre: 'Country',
    concepts: ['melody', 'country', 'singalong'],
    hasTiers: true,
    getNotes: withTiers(() => generateCountryRoads(82)),
  },
  {
    id: 'let-it-be',
    title: 'Let It Be',
    artist: 'The Beatles',
    bpm: 72,
    key: 'C',
    difficulty: 2,
    genre: 'Rock',
    concepts: ['melody', 'ballad', 'I-V-vi-IV'],
    hasTiers: true,
    getNotes: withTiers(() => generateLetItBe(72)),
  },
  {
    id: 'blackbird',
    title: 'Blackbird',
    artist: 'The Beatles',
    bpm: 92,
    key: 'G',
    difficulty: 3,
    genre: 'Folk Rock',
    concepts: ['fingerpicking', 'chromatic', 'melody'],
    hasTiers: true,
    getNotes: withTiers(() => generateBlackbird(92)),
  },
  {
    id: 'wonderwall',
    title: 'Wonderwall',
    artist: 'Oasis',
    bpm: 87,
    key: 'F#m',
    difficulty: 2,
    genre: 'Britpop',
    concepts: ['melody', 'strumming', 'popular'],
    hasTiers: true,
    getNotes: withTiers(() => generateWonderwall(87)),
  },
]

export function getSongById(id: string): SongData | undefined {
  return SONG_LIBRARY.find((s) => s.id === id)
}
