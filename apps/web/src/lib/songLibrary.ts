import type { NoteEvent } from '@melodypath/shared-types'
import { generateOdeToJoy, generateSmokeOnTheWater, generateDemoSong } from './midiParser'

export interface SongData {
  id: string
  title: string
  artist: string
  bpm: number
  key: string
  difficulty: 1 | 2 | 3 | 4 | 5
  genre: string
  concepts: string[]
  getNotes: () => { notes: NoteEvent[]; duration: number }
}

export const SONG_LIBRARY: SongData[] = [
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    bpm: 100,
    key: 'C',
    difficulty: 1,
    genre: 'Classical',
    concepts: ['melody', 'stepwise motion', 'quarter notes'],
    getNotes: () => generateOdeToJoy(100),
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
    getNotes: () => generateSmokeOnTheWater(112),
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
    getNotes: () => generateDemoSong(120),
  },
]

export function getSongById(id: string): SongData | undefined {
  return SONG_LIBRARY.find((s) => s.id === id)
}
