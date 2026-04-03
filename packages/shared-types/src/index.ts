// ─── Enums ───────────────────────────────────────────────────────────────────

export type AgeGroup = 'KIDS' | 'ADULT' | 'SENIOR'
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type InstrumentType = 'PIANO' | 'GUITAR' | 'GENERAL'
export type AgeMode = 'kids' | 'adult' | 'accessible'
export type LessonStepType = 'text' | 'animation' | 'exercise' | 'quiz'
export type TimingGrade = 'PERFECT' | 'GOOD' | 'OK' | 'MISS'
export type SongGrade = 'S' | 'A' | 'B' | 'C' | 'D'

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  age_group: AgeGroup
  instrument: InstrumentType
  skill_level: SkillLevel
  xp: number
  level: number
  streak_days: number
  last_practice: string | null
  settings: UserSettings
}

export interface UserSettings {
  ageMode: AgeMode
  volume: number
  metronomeEnabled: boolean
  highContrast: boolean
  reducedMotion: boolean
}

// ─── Songs ────────────────────────────────────────────────────────────────────

export interface Song {
  id: string
  title: string
  artist: string
  bpm: number
  key: string
  difficulty: 1 | 2 | 3 | 4 | 5
  genre: string
  concepts: string[]
  midi_url: string
  audio_url: string
}

export interface NoteEvent {
  note: string         // e.g. "C4"
  time: number         // seconds from song start
  duration: number     // seconds
  lane: number         // 0-indexed lane in note highway
  velocity: number     // 0–127
}

export interface SongAttemptResult {
  song_id: string
  difficulty: number
  score: number
  accuracy: number     // 0.0–1.0
  grade: SongGrade
  note_results: TimingGrade[]
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export interface Lesson {
  id: string
  module: string
  title: string
  level: SkillLevel
  concepts: string[]
  xp_reward: number
  order: number
  content_url: string
  prerequisite_ids: string[]
}

export interface LessonContent {
  steps: LessonStep[]
}

export interface LessonStep {
  type: LessonStepType
  content: TextStepContent | AnimationStepContent | ExerciseStepContent | QuizStepContent
}

export interface TextStepContent {
  markdown: string
}

export interface AnimationStepContent {
  component: string   // key into animation component registry
  props: Record<string, unknown>
}

export interface ExerciseStepContent {
  instruction: string
  expected_notes: string[]   // e.g. ["C4", "E4", "G4"]
  instrument: InstrumentType
}

export interface QuizStepContent {
  question: string
  options: string[]
  correct_index: number
  explanation: string
}

export interface LessonProgress {
  lesson_id: string
  completed: boolean
  score: number | null
  attempts: number
  completed_at: string | null
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export interface Achievement {
  id: string
  badge_id: string
  name: string
  description: string
  icon_url: string
}

export interface UserAchievement {
  achievement_id: string
  badge_id: string
  name: string
  description: string
  icon_url: string
  earned_at: string
}

// ─── Music Theory ─────────────────────────────────────────────────────────────

export interface ChordInfo {
  name: string           // e.g. "Cmaj7"
  root: string           // e.g. "C"
  type: string           // e.g. "maj7"
  notes: string[]        // e.g. ["C4", "E4", "G4", "B4"]
  intervals: string[]    // e.g. ["1P", "3M", "5P", "7M"]
}

export interface ScaleInfo {
  root: string
  type: string
  notes: string[]
  degrees: string[]
}

export interface PitchResult {
  note: string           // e.g. "A4"
  frequency: number      // Hz
  confidence: number     // 0.0–1.0
  cents: number          // deviation from nearest semitone
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: {
    message: string
    code: string
  }
}

export type ApiResult<T> = ApiResponse<T> | ApiError
