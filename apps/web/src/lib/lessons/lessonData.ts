import type { SkillLevel } from '@melodypath/shared-types'

export type StepType = 'text' | 'exercise' | 'quiz'

export interface TextStep {
  type: 'text'
  title: string
  content: string  // markdown-ish (we'll render with basic formatting)
}

export interface ExerciseStep {
  type: 'exercise'
  instruction: string
  expectedNotes: string[]  // notes to play
}

export interface QuizStep {
  type: 'quiz'
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type LessonStep = TextStep | ExerciseStep | QuizStep

export interface LessonDef {
  id: string
  title: string
  module: string
  level: SkillLevel
  concepts: string[]
  xpReward: number
  order: number
  prerequisites: string[]
  steps: LessonStep[]
}

// ─── Beginner Lessons ────────────────────────────────────────────────────────

export const LESSONS: LessonDef[] = [
  {
    id: 'notes-basics',
    title: 'The Musical Alphabet',
    module: 'Foundations',
    level: 'BEGINNER',
    concepts: ['notes', 'musical alphabet'],
    xpReward: 20,
    order: 1,
    prerequisites: [],
    steps: [
      {
        type: 'text',
        title: 'Welcome to Music!',
        content: `Music is built on just 12 notes. The main seven are named after letters:\n\n**A  B  C  D  E  F  G**\n\nAfter G, it starts over at A again. This repeating pattern is called an **octave**.\n\nThe other 5 notes are the sharps/flats — they sit between certain letter notes (like the black keys on a piano).`,
      },
      {
        type: 'quiz',
        question: 'How many letter-named notes are there in music?',
        options: ['5', '7', '12', '26'],
        correctIndex: 1,
        explanation: 'There are 7 letter-named notes: A through G. The remaining 5 are sharps/flats.',
      },
      {
        type: 'text',
        title: 'Sharps and Flats',
        content: `Between most letter notes, there's an extra note:\n\nC → **C#** → D → **D#** → E → F → **F#** → G → **G#** → A → **A#** → B → C\n\nNotice: there's **no sharp between E-F** and **no sharp between B-C**. These pairs are only a half-step apart.\n\nA sharp (#) raises a note by one half-step. A flat (b) lowers it by one half-step. C# and Db are the same sound!`,
      },
      {
        type: 'quiz',
        question: 'Which pair of notes does NOT have a sharp/flat between them?',
        options: ['C and D', 'E and F', 'G and A', 'A and B'],
        correctIndex: 1,
        explanation: 'E and F are naturally a half-step apart — there\'s no note between them. Same for B and C.',
      },
      {
        type: 'exercise',
        instruction: 'Play these notes on the piano: C4, D4, E4, F4, G4',
        expectedNotes: ['C4', 'D4', 'E4', 'F4', 'G4'],
      },
    ],
  },
  {
    id: 'major-scale',
    title: 'The Major Scale',
    module: 'Foundations',
    level: 'BEGINNER',
    concepts: ['major scale', 'whole steps', 'half steps'],
    xpReward: 25,
    order: 2,
    prerequisites: ['notes-basics'],
    steps: [
      {
        type: 'text',
        title: 'What is a Scale?',
        content: `A **scale** is a set of notes played in order. The most important one is the **major scale** — it's the foundation of almost all Western music.\n\nThe major scale follows a specific pattern of **whole steps (W)** and **half steps (H)**:\n\n**W  W  H  W  W  W  H**\n\nA whole step = 2 frets on guitar, or skipping one key on piano.\nA half step = 1 fret, or the very next key.`,
      },
      {
        type: 'text',
        title: 'C Major Scale',
        content: `The easiest major scale is **C major** — it uses only white keys on the piano:\n\n**C → D → E → F → G → A → B → C**\n\nLet's verify the pattern:\n- C to D = Whole step ✓\n- D to E = Whole step ✓\n- E to F = Half step ✓\n- F to G = Whole step ✓\n- G to A = Whole step ✓\n- A to B = Whole step ✓\n- B to C = Half step ✓\n\nThat's W-W-H-W-W-W-H. It works!`,
      },
      {
        type: 'quiz',
        question: 'What is the pattern of a major scale?',
        options: ['W-W-W-H-W-W-H', 'W-W-H-W-W-W-H', 'H-W-W-W-H-W-W', 'W-H-W-W-W-H-W'],
        correctIndex: 1,
        explanation: 'The major scale pattern is: Whole, Whole, Half, Whole, Whole, Whole, Half.',
      },
      {
        type: 'exercise',
        instruction: 'Play the C major scale: C4, D4, E4, F4, G4, A4, B4, C5',
        expectedNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
      },
    ],
  },
  {
    id: 'first-chord',
    title: 'Your First Chord',
    module: 'Chords',
    level: 'BEGINNER',
    concepts: ['chords', 'triads', 'C major chord'],
    xpReward: 30,
    order: 3,
    prerequisites: ['major-scale'],
    steps: [
      {
        type: 'text',
        title: 'What is a Chord?',
        content: `A **chord** is three or more notes played at the same time. The most basic chord is a **triad** — built from 3 notes.\n\nTo build a major triad, take the **1st, 3rd, and 5th** notes of the major scale.\n\nFor C major: C (1st) + E (3rd) + G (5th) = **C major chord**\n\nThat's it! Those three notes together create a bright, happy sound.`,
      },
      {
        type: 'quiz',
        question: 'A major triad uses which scale degrees?',
        options: ['1st, 2nd, 3rd', '1st, 3rd, 5th', '1st, 4th, 5th', '1st, 3rd, 7th'],
        correctIndex: 1,
        explanation: 'A major triad is built from the 1st (root), 3rd, and 5th degrees of the major scale.',
      },
      {
        type: 'text',
        title: 'Major vs Minor',
        content: `If you **lower the 3rd by one half-step**, you get a **minor chord**.\n\n- C major = C, E, G (bright, happy)\n- C minor = C, **Eb**, G (dark, sad)\n\nThe only difference is that one note — the 3rd! This tiny change completely transforms the mood.`,
      },
      {
        type: 'quiz',
        question: 'What makes a chord minor instead of major?',
        options: ['Remove the 5th', 'Lower the 3rd by a half step', 'Add a 7th note', 'Raise the root'],
        correctIndex: 1,
        explanation: 'A minor chord has a lowered (flat) 3rd compared to major. That\'s the only difference!',
      },
      {
        type: 'exercise',
        instruction: 'Play a C major chord: press C4, E4, and G4 together',
        expectedNotes: ['C4', 'E4', 'G4'],
      },
    ],
  },
  {
    id: 'chord-progressions-intro',
    title: 'Chord Progressions',
    module: 'Chords',
    level: 'BEGINNER',
    concepts: ['chord progressions', 'I-IV-V', 'roman numerals'],
    xpReward: 30,
    order: 4,
    prerequisites: ['first-chord'],
    steps: [
      {
        type: 'text',
        title: 'What is a Chord Progression?',
        content: `A **chord progression** is a sequence of chords played in order. It's the harmonic backbone of a song.\n\nWe label chords with **Roman numerals** based on their position in the scale:\n\n- I = chord built on the 1st note (C in C major)\n- IV = chord built on the 4th note (F in C major)\n- V = chord built on the 5th note (G in C major)\n\nUppercase = major, lowercase = minor.`,
      },
      {
        type: 'text',
        title: 'The I-IV-V Progression',
        content: `The **I-IV-V** progression is the most common in all of music. In the key of C:\n\n**C → F → G → C**\n\nThis progression is used in thousands of songs across rock, pop, blues, country, and folk. It sounds natural because the V chord creates tension that wants to resolve back to I.`,
      },
      {
        type: 'quiz',
        question: 'In the key of C major, what chord is the V (five)?',
        options: ['C', 'D', 'F', 'G'],
        correctIndex: 3,
        explanation: 'G is the 5th note of the C major scale, so the V chord is G major.',
      },
      {
        type: 'quiz',
        question: 'The I-V-vi-IV progression (C-G-Am-F) is used in many pop songs. Which chord is minor?',
        options: ['I (C)', 'V (G)', 'vi (Am)', 'IV (F)'],
        correctIndex: 2,
        explanation: 'Lowercase Roman numerals indicate minor chords. The "vi" chord is A minor (Am).',
      },
    ],
  },
  {
    id: 'rhythm-basics',
    title: 'Rhythm & Time',
    module: 'Rhythm',
    level: 'BEGINNER',
    concepts: ['rhythm', 'time signature', 'BPM', 'note values'],
    xpReward: 25,
    order: 5,
    prerequisites: ['notes-basics'],
    steps: [
      {
        type: 'text',
        title: 'The Beat',
        content: `Music happens in **time**. The basic unit is the **beat** — a steady pulse you can tap your foot to.\n\n**BPM** (Beats Per Minute) tells you how fast the beats go:\n- 60 BPM = one beat per second (slow ballad)\n- 120 BPM = two beats per second (typical pop/rock)\n- 180 BPM = three beats per second (fast punk)`,
      },
      {
        type: 'text',
        title: 'Note Values',
        content: `Notes have different **durations** — how long they ring out:\n\n- **Whole note** = 4 beats\n- **Half note** = 2 beats\n- **Quarter note** = 1 beat (the most common)\n- **Eighth note** = 1/2 beat\n- **Sixteenth note** = 1/4 beat\n\nEach step cuts the duration in half. A rest is silence for the same duration.`,
      },
      {
        type: 'quiz',
        question: 'How many beats does a half note last?',
        options: ['1 beat', '2 beats', '4 beats', '1/2 beat'],
        correctIndex: 1,
        explanation: 'A half note lasts 2 beats — half of a whole note (4 beats).',
      },
      {
        type: 'text',
        title: 'Time Signatures',
        content: `A **time signature** tells you how many beats are in each **measure** (bar).\n\nThe most common is **4/4 time**:\n- Top number (4) = 4 beats per measure\n- Bottom number (4) = a quarter note gets one beat\n\n**3/4 time** (waltz) has 3 beats per measure. **6/8 time** has a different feel entirely.`,
      },
      {
        type: 'quiz',
        question: 'In 4/4 time, how many beats are in each measure?',
        options: ['2', '3', '4', '8'],
        correctIndex: 2,
        explanation: '4/4 time has 4 beats per measure. The top number always tells you the count.',
      },
    ],
  },
]

export function getLessonById(id: string): LessonDef | undefined {
  return LESSONS.find((l) => l.id === id)
}

export function getLessonsByLevel(level: SkillLevel): LessonDef[] {
  return LESSONS.filter((l) => l.level === level).sort((a, b) => a.order - b.order)
}

export function isLessonUnlocked(id: string, completedIds: Set<string>): boolean {
  const lesson = getLessonById(id)
  if (!lesson) return false
  return lesson.prerequisites.every((prereq) => completedIds.has(prereq))
}
