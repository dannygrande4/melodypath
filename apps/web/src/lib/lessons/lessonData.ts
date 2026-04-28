import type { SkillLevel } from '@moniquemusic/shared-types'

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

// ─── Complete Curriculum: 65 Lessons ────────────────────────────────────────

export const LESSONS: LessonDef[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 1: FOUNDATIONS (BEGINNER, lessons 1-8)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'musical-alphabet',
    title: 'The Musical Alphabet',
    module: 'Foundations',
    level: 'BEGINNER',
    concepts: ['notes', 'sharps', 'flats', 'half steps'],
    xpReward: 20,
    order: 1,
    prerequisites: [],
    steps: [
      {
        type: 'text',
        title: 'Welcome to Music!',
        content: `Music is built on just 12 notes. The main seven are named after letters:\n\n**A  B  C  D  E  F  G**\n\nAfter G, it starts over at A again. This repeating cycle is called an **octave**. Every time you go through all 12 notes, you arrive at the same letter name but at a higher pitch.\n\nThink of it like a clock that only goes up to 12 — after 12, you're back at 1, but everything sounds higher.`,
      },
      {
        type: 'quiz',
        question: 'How many letter-named notes are there in music?',
        options: ['5', '7', '12', '26'],
        correctIndex: 1,
        explanation: 'There are 7 letter-named notes: A, B, C, D, E, F, and G. The remaining 5 notes in the 12-note system are sharps and flats.',
      },
      {
        type: 'text',
        title: 'Sharps and Flats',
        content: `Between most letter notes, there is an extra note — a sharp or flat:\n\nC → **C#/Db** → D → **D#/Eb** → E → F → **F#/Gb** → G → **G#/Ab** → A → **A#/Bb** → B → C\n\nNotice two important gaps: there is **no sharp between E and F**, and **no sharp between B and C**. These pairs are naturally only a half step apart.\n\nA **sharp (#)** raises a note by one half step. A **flat (b)** lowers it by one half step. So C# and Db are the same pitch — they are called **enharmonic equivalents**.`,
      },
      {
        type: 'quiz',
        question: 'Which pair of notes does NOT have a sharp or flat between them?',
        options: ['C and D', 'E and F', 'G and A', 'A and B'],
        correctIndex: 1,
        explanation: 'E and F are naturally a half step apart — there is no note between them. The same is true for B and C.',
      },
      {
        type: 'text',
        title: 'Half Steps and Whole Steps',
        content: `The distance between two adjacent notes is called a **half step** (also called a semitone). On a piano, a half step is the distance from any key to the very next key, whether black or white.\n\nA **whole step** (also called a whole tone) equals two half steps. For example, C to D is a whole step because there is a note (C#) in between. But E to F is a half step because there is nothing in between.\n\n[staff-notes:C4,C#4,D4|Half step then whole step from C]\n\nThese building blocks — half steps and whole steps — are used to construct every scale, chord, and melody in Western music.`,
      },
      {
        type: 'exercise',
        instruction: 'Play the first five notes of the musical alphabet starting from C: C4, D4, E4, F4, G4',
        expectedNotes: ['C4', 'D4', 'E4', 'F4', 'G4'],
      },
    ],
  },

  {
    id: 'reading-the-staff',
    title: 'Reading the Staff',
    module: 'Foundations',
    level: 'BEGINNER',
    concepts: ['treble clef', 'staff', 'lines and spaces'],
    xpReward: 20,
    order: 2,
    prerequisites: ['musical-alphabet'],
    steps: [
      {
        type: 'text',
        title: 'The Musical Staff',
        content: `Written music uses a set of **five horizontal lines** called the **staff** (or stave). Notes are placed either on a line or in a space between lines.\n\nThe higher a note sits on the staff, the higher its pitch. The lower it sits, the lower the pitch. This gives us a visual map of melody — you can literally see the music go up and down.\n\nAt the beginning of each staff, you will see a special symbol called a **clef**, which tells you which notes correspond to which lines and spaces.`,
      },
      {
        type: 'text',
        title: 'The Treble Clef',
        content: `The most common clef is the **treble clef** (also called the G clef because it curls around the G line). In treble clef, the five lines from bottom to top are:\n\n**E  G  B  D  F** — remember with "**E**very **G**ood **B**oy **D**oes **F**ine"\n\n[staff-notes:E4,G4,B4,D5,F5|Lines: every good boy does fine]\n\nThe four spaces from bottom to top spell:\n\n**F  A  C  E** — which conveniently spells the word "FACE"\n\n[staff-notes:F4,A4,C5,E5|Spaces spell FACE]\n\nTogether, the lines and spaces give you the notes from E4 up to F5 without any extra markings.`,
      },
      {
        type: 'quiz',
        question: 'The lines of the treble clef from bottom to top are:',
        options: ['C E G B D', 'E G B D F', 'F A C E G', 'D F A C E'],
        correctIndex: 1,
        explanation: 'The treble clef lines from bottom to top are E, G, B, D, F — "Every Good Boy Does Fine."',
      },
      {
        type: 'quiz',
        question: 'The spaces of the treble clef from bottom to top spell:',
        options: ['BEAD', 'FACE', 'CAGE', 'DEAD'],
        correctIndex: 1,
        explanation: 'The spaces in treble clef spell F-A-C-E from bottom to top.',
      },
      {
        type: 'text',
        title: 'Ledger Lines',
        content: `What happens when a note is too high or too low for the five-line staff? We add short extra lines called **ledger lines**.\n\nFor example, **Middle C** (C4) sits on a ledger line just below the treble clef staff.\n\n[staff-notes:C4,D4,E4,F4|Middle C and the notes just above]\n\nNotes can stack above or below the staff using as many ledger lines as needed, though more than three or four becomes hard to read.\n\nLedger lines are simply extensions of the staff, following the same pattern of lines and spaces.`,
      },
      {
        type: 'exercise',
        instruction: 'Play the notes on the lines of the treble clef: E4, G4, B4, D5, F5',
        expectedNotes: ['E4', 'G4', 'B4', 'D5', 'F5'],
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
    order: 3,
    prerequisites: ['musical-alphabet'],
    steps: [
      {
        type: 'text',
        title: 'What is a Scale?',
        content: `A **scale** is a set of notes arranged in ascending or descending order by pitch. Scales are the raw material of melody and harmony — almost every tune you have ever heard is built from a scale.\n\nThe most important scale in Western music is the **major scale**. It has a bright, happy sound that feels resolved and complete. When you sing "Do Re Mi Fa Sol La Ti Do," you are singing a major scale.\n\nThe major scale follows a specific pattern of **whole steps (W)** and **half steps (H)**: **W W H W W W H**`,
      },
      {
        type: 'text',
        title: 'C Major: The Easiest Example',
        content: `The easiest major scale is **C major** because it uses only the white keys on a piano:\n\n**C → D → E → F → G → A → B → C**\n\n[staff:c-major-scale]\n\nLet us verify the pattern:\n- C to D = Whole step\n- D to E = Whole step\n- E to F = Half step\n- F to G = Whole step\n- G to A = Whole step\n- A to B = Whole step\n- B to C = Half step\n\nThat gives us W-W-H-W-W-W-H — the major scale formula. You can start on any note and apply this same pattern to build a major scale in any key.`,
      },
      {
        type: 'quiz',
        question: 'What is the step pattern of the major scale?',
        options: ['W-W-W-H-W-W-H', 'W-W-H-W-W-W-H', 'H-W-W-W-H-W-W', 'W-H-W-W-W-H-W'],
        correctIndex: 1,
        explanation: 'The major scale pattern is: Whole, Whole, Half, Whole, Whole, Whole, Half.',
      },
      {
        type: 'quiz',
        question: 'How many notes are in a major scale (not counting the repeated root at the top)?',
        options: ['5', '6', '7', '8'],
        correctIndex: 2,
        explanation: 'A major scale has 7 distinct notes. The 8th note is the same as the 1st, just one octave higher.',
      },
      {
        type: 'exercise',
        instruction: 'Play the C major scale: C4, D4, E4, F4, G4, A4, B4, C5',
        expectedNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
      },
    ],
  },

  {
    id: 'key-signatures',
    title: 'Key Signatures',
    module: 'Foundations',
    level: 'BEGINNER',
    concepts: ['key signatures', 'circle of fifths', 'sharps', 'flats'],
    xpReward: 25,
    order: 4,
    prerequisites: ['major-scale'],
    steps: [
      {
        type: 'text',
        title: 'What is a Key Signature?',
        content: `When you build a major scale starting on a note other than C, you need sharps or flats to maintain the W-W-H-W-W-W-H pattern.\n\nFor example, the G major scale is: G A B C D E **F#** G. That F# is needed to keep the correct pattern.\n\n[staff:g-major-scale]\n\nRather than writing a sharp on every F in the music, composers place one sharp at the beginning of the staff. This is the **key signature**.\n\nA key signature tells the performer: "Every time you see this note, play it sharp (or flat) unless told otherwise." It saves space and makes the music cleaner to read.`,
      },
      {
        type: 'quiz',
        question: 'The key of G major has how many sharps?',
        options: ['0', '1', '2', '3'],
        correctIndex: 1,
        explanation: 'G major has one sharp: F#. This is needed to maintain the correct whole-step/half-step pattern.',
      },
      {
        type: 'text',
        title: 'The Circle of Fifths',
        content: `The **circle of fifths** is a diagram that arranges all 12 keys in a circle. Moving clockwise, each key is a fifth higher and adds one sharp:\n\nC (0) → G (1#) → D (2#) → A (3#) → E (4#) → B (5#) → F#/Gb (6#/6b)\n\nMoving counter-clockwise, each key is a fourth higher (or a fifth lower) and adds one flat:\n\nC (0) → F (1b) → Bb (2b) → Eb (3b) → Ab (4b) → Db (5b) → Gb/F# (6b/6#)\n\nThe circle of fifths is one of the most useful tools in music theory. It shows you which keys are closely related and helps you understand modulation, chord progressions, and key signatures at a glance.`,
      },
      {
        type: 'quiz',
        question: 'Moving clockwise around the circle of fifths, what happens to the key signature?',
        options: ['One flat is added', 'One sharp is added', 'One sharp is removed', 'Nothing changes'],
        correctIndex: 1,
        explanation: 'Each step clockwise adds one sharp: C (0#) → G (1#) → D (2#) → A (3#) and so on.',
      },
      {
        type: 'exercise',
        instruction: 'Play the G major scale (one sharp — F#): G4, A4, B4, C5, D5, E5, F#5, G5',
        expectedNotes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'],
      },
    ],
  },

  {
    id: 'intervals',
    title: 'Intervals',
    module: 'Foundations',
    level: 'BEGINNER',
    concepts: ['intervals', 'major', 'minor', 'perfect'],
    xpReward: 25,
    order: 5,
    prerequisites: ['major-scale'],
    steps: [
      {
        type: 'text',
        title: 'What is an Interval?',
        content: `An **interval** is the distance between two notes. Intervals are the building blocks of chords and melodies — every chord is a stack of intervals, and every melody is a sequence of intervals.\n\nWe name intervals by counting the letter names from the bottom note to the top note (inclusive). C to E is a **third** because C-D-E covers three letter names. C to G is a **fifth** because C-D-E-F-G covers five.\n\nBut the number alone is not enough — we also need a **quality** (major, minor, perfect, augmented, or diminished) to specify the exact size.`,
      },
      {
        type: 'text',
        title: 'Interval Qualities',
        content: `There are two families of intervals:\n\n**Perfect intervals:** Unison (1st), 4th, 5th, and octave (8th). These sound very stable and consonant.\n\n**Major/minor intervals:** 2nd, 3rd, 6th, and 7th. The major version is one half step larger than the minor version.\n\n[staff-notes:C4,D4,E4,F4,G4,A4,B4,C5|Intervals from C up the major scale]\n\nFrom C in the C major scale:\n- C to D = Major 2nd (2 half steps)\n- C to E = Major 3rd (4 half steps)\n- C to F = Perfect 4th (5 half steps)\n- C to G = Perfect 5th (7 half steps)\n- C to A = Major 6th (9 half steps)\n- C to B = Major 7th (11 half steps)\n- C to C = Perfect octave (12 half steps)`,
      },
      {
        type: 'quiz',
        question: 'What is the interval from C to G?',
        options: ['Major 3rd', 'Perfect 4th', 'Perfect 5th', 'Major 6th'],
        correctIndex: 2,
        explanation: 'C to G spans five letter names (C-D-E-F-G) and is 7 half steps, making it a perfect 5th.',
      },
      {
        type: 'quiz',
        question: 'Which intervals are called "perfect"?',
        options: ['2nds, 3rds, 6ths, 7ths', '1st, 4th, 5th, 8th', '3rds and 5ths only', 'All intervals'],
        correctIndex: 1,
        explanation: 'Unison (1st), 4th, 5th, and octave (8th) are the perfect intervals. They have a special, stable quality.',
      },
      {
        type: 'exercise',
        instruction: 'Play a perfect 5th starting on C, then a major 3rd: C4, G4, C4, E4',
        expectedNotes: ['C4', 'G4', 'C4', 'E4'],
      },
    ],
  },

  {
    id: 'first-chord',
    title: 'Your First Chord',
    module: 'Foundations',
    level: 'BEGINNER',
    concepts: ['chords', 'triads', 'C major chord'],
    xpReward: 25,
    order: 6,
    prerequisites: ['intervals'],
    steps: [
      {
        type: 'text',
        title: 'What is a Chord?',
        content: `A **chord** is three or more notes played at the same time. The most basic chord is a **triad** — three notes stacked in thirds.\n\nTo build a major triad, take the **1st, 3rd, and 5th** notes of the major scale:\n\nFor C major: C (1st) + E (3rd) + G (5th) = **C major chord**\n\n[chord:C]\n\nThe interval from the root to the 3rd is a major 3rd (4 half steps). The interval from the 3rd to the 5th is a minor 3rd (3 half steps). This specific stacking — major 3rd on the bottom, minor 3rd on top — is what creates the bright, happy sound of a major chord.`,
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
        title: 'Naming Chords',
        content: `Chords are named after their **root** — the note they are built on. The root is the foundation and gives the chord its letter name.\n\nA C major chord has C as its root, E as its third, and G as its fifth. We just call it "C" or "C major."\n\nYou can build a major triad starting on any note by applying the same formula: root + major 3rd + perfect 5th.\n\n[chords:G,F,D]\n\nFor example:\n- G major = G + B + D\n- F major = F + A + C\n- D major = D + F# + A`,
      },
      {
        type: 'quiz',
        question: 'What notes make up an F major chord?',
        options: ['F, A, C', 'F, Ab, C', 'F, G, A', 'F, Bb, C'],
        correctIndex: 0,
        explanation: 'F major = F (root) + A (major 3rd) + C (perfect 5th).',
      },
      {
        type: 'exercise',
        instruction: 'Play a C major chord: C4, E4, G4',
        expectedNotes: ['C4', 'E4', 'G4'],
      },
    ],
  },

  {
    id: 'major-minor-triads',
    title: 'Major and Minor Triads',
    module: 'Foundations',
    level: 'BEGINNER',
    concepts: ['major triad', 'minor triad', 'chord quality'],
    xpReward: 25,
    order: 7,
    prerequisites: ['first-chord'],
    steps: [
      {
        type: 'text',
        title: 'Major vs Minor',
        content: `If you **lower the 3rd by one half step**, a major chord becomes a **minor chord**.\n\n- C major = C, E, G (bright, happy)\n- C minor = C, **Eb**, G (dark, sad)\n\nThe only difference is that one note — the 3rd! A major triad has a major 3rd on the bottom and a minor 3rd on top. A minor triad flips this: minor 3rd on the bottom, major 3rd on top.\n\n[chords:Am,Em,Dm]\n\nThis tiny change completely transforms the emotional quality of the chord.`,
      },
      {
        type: 'quiz',
        question: 'What makes a chord minor instead of major?',
        options: ['Remove the 5th', 'Lower the 3rd by a half step', 'Add a 7th note', 'Raise the root by a half step'],
        correctIndex: 1,
        explanation: 'A minor chord has a lowered (flat) 3rd compared to major. That single half-step change is all it takes.',
      },
      {
        type: 'text',
        title: 'Building Minor Triads',
        content: `To build a minor triad from any root:\n\n1. Start with the root note\n2. Go up a **minor 3rd** (3 half steps) for the third\n3. Go up a **major 3rd** (4 half steps) from there for the fifth\n\nAlternatively, just take the major triad and lower the 3rd by one half step.\n\nCommon minor triads — here are the open shapes you'll use most on guitar:\n\n[chords:Am,Dm,Em]\n\n- A minor (Am) = A, C, E\n- D minor (Dm) = D, F, A\n- E minor (Em) = E, G, B\n\nMinor chords are written with a lowercase "m" after the letter: Am, Dm, Em.`,
      },
      {
        type: 'quiz',
        question: 'What notes make up an A minor chord?',
        options: ['A, C#, E', 'A, C, E', 'A, C, Eb', 'A, B, E'],
        correctIndex: 1,
        explanation: 'A minor = A (root) + C (minor 3rd, 3 half steps up) + E (perfect 5th). The C is natural, not C#.',
      },
      {
        type: 'exercise',
        instruction: 'Play a C minor chord: C4, Eb4, G4',
        expectedNotes: ['C4', 'Eb4', 'G4'],
      },
      {
        type: 'exercise',
        instruction: 'Play an A minor chord: A3, C4, E4',
        expectedNotes: ['A3', 'C4', 'E4'],
      },
    ],
  },

  {
    id: 'rhythm-basics',
    title: 'Rhythm Basics',
    module: 'Foundations',
    level: 'BEGINNER',
    concepts: ['rhythm', 'beats', 'time signatures', 'note values'],
    xpReward: 25,
    order: 8,
    prerequisites: ['musical-alphabet'],
    steps: [
      {
        type: 'text',
        title: 'The Beat',
        content: `Music happens in **time**. The basic unit is the **beat** — a steady pulse you can tap your foot to.\n\n**BPM** (Beats Per Minute) tells you how fast the beats go:\n- 60 BPM = one beat per second (slow ballad)\n- 120 BPM = two beats per second (typical pop/rock)\n- 180 BPM = three beats per second (fast punk)\n\nBeats are grouped into **measures** (also called bars). The number of beats per measure is determined by the time signature.`,
      },
      {
        type: 'text',
        title: 'Note Values',
        content: `Notes have different **durations** — how long they ring out:\n\n- **Whole note** = 4 beats\n- **Half note** = 2 beats\n- **Quarter note** = 1 beat (the most common)\n- **Eighth note** = 1/2 beat\n- **Sixteenth note** = 1/4 beat\n\nEach step cuts the duration in half. Every note value also has a corresponding **rest** — a silence of the same duration.`,
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
        content: `A **time signature** appears at the beginning of a piece and tells you two things:\n\n- **Top number:** how many beats per measure\n- **Bottom number:** which note value gets one beat\n\nThe most common is **4/4 time** (also called "common time"): 4 beats per measure, quarter note gets one beat. Most pop, rock, and jazz is in 4/4.\n\n**3/4 time** has 3 beats per measure — it is the time signature of waltzes. **2/4 time** has 2 beats per measure and is common in marches.`,
      },
      {
        type: 'quiz',
        question: 'In 4/4 time, how many quarter notes fit in one measure?',
        options: ['2', '3', '4', '8'],
        correctIndex: 2,
        explanation: 'In 4/4 time there are 4 beats per measure, and a quarter note gets one beat, so 4 quarter notes fill one measure.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 2: READING & RHYTHM (BEGINNER, lessons 9-14)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'quarter-eighth-notes',
    title: 'Quarter and Eighth Notes',
    module: 'Reading & Rhythm',
    level: 'BEGINNER',
    concepts: ['quarter notes', 'eighth notes', 'counting', 'subdivisions'],
    xpReward: 20,
    order: 9,
    prerequisites: ['rhythm-basics'],
    steps: [
      {
        type: 'text',
        title: 'The Quarter Note',
        content: `The **quarter note** is the heartbeat of most music. In 4/4 time, it gets exactly one beat. When you count "1, 2, 3, 4" in a measure, each count is one quarter note.\n\nQuarter notes look like a filled-in oval (the note head) with a stem going up or down. They are the most common note value and the foundation of rhythmic reading.\n\nWhen you tap your foot to a song, you are usually tapping quarter notes.`,
      },
      {
        type: 'text',
        title: 'The Eighth Note',
        content: `An **eighth note** is half the length of a quarter note — two eighth notes fit in one beat. Eighth notes have a flag on their stem (or are beamed together in groups).\n\nWe count eighth notes by adding "and" between the beats: **"1 and 2 and 3 and 4 and"**. The numbers fall on the beat (called the **downbeat**), and the "ands" fall between beats (called the **upbeat** or **offbeat**).\n\nThis subdivision doubles the rhythmic possibilities. Where quarter notes give you 4 attacks per measure in 4/4, eighth notes give you 8.`,
      },
      {
        type: 'quiz',
        question: 'How many eighth notes equal one quarter note?',
        options: ['1', '2', '4', '8'],
        correctIndex: 1,
        explanation: 'Two eighth notes equal one quarter note. Each eighth note lasts half a beat in 4/4 time.',
      },
      {
        type: 'quiz',
        question: 'When counting eighth notes, what word do we use for the offbeat?',
        options: ['two', 'and', 'rest', 'tap'],
        correctIndex: 1,
        explanation: 'We count eighth notes as "1 and 2 and 3 and 4 and." The "and" falls on the offbeat — between the main beats.',
      },
      {
        type: 'exercise',
        instruction: 'Play four quarter notes on C: C4, C4, C4, C4',
        expectedNotes: ['C4', 'C4', 'C4', 'C4'],
      },
    ],
  },

  {
    id: 'rests-and-ties',
    title: 'Rests and Ties',
    module: 'Reading & Rhythm',
    level: 'BEGINNER',
    concepts: ['rests', 'ties', 'silence', 'sustained notes'],
    xpReward: 20,
    order: 10,
    prerequisites: ['quarter-eighth-notes'],
    steps: [
      {
        type: 'text',
        title: 'Rests: The Sound of Silence',
        content: `**Rests** are just as important as notes — they tell you when NOT to play. Every note value has a matching rest:\n\n- **Whole rest** = 4 beats of silence\n- **Half rest** = 2 beats of silence\n- **Quarter rest** = 1 beat of silence\n- **Eighth rest** = 1/2 beat of silence\n\nSilence creates contrast, drama, and breathing room. A song made of all notes with no rests would feel suffocating. Great musicians pay as much attention to what they do not play as to what they do.`,
      },
      {
        type: 'text',
        title: 'Ties',
        content: `A **tie** is a curved line connecting two notes of the same pitch. When two notes are tied, you play the first note and hold it for the combined duration of both notes — you do not strike the second note.\n\nFor example, a half note tied to a quarter note lasts 3 beats total (2 + 1). Ties are essential for creating note durations that do not exist as a single symbol, and for sustaining notes across bar lines.\n\nDo not confuse ties with **slurs**, which connect notes of different pitches and indicate smooth, connected playing.`,
      },
      {
        type: 'quiz',
        question: 'A quarter rest tells you to:',
        options: ['Play softly for one beat', 'Be silent for one beat', 'Hold a note for one beat', 'Play any note for one beat'],
        correctIndex: 1,
        explanation: 'A quarter rest means one beat of silence — no sound at all.',
      },
      {
        type: 'quiz',
        question: 'What happens when two notes of the same pitch are tied together?',
        options: ['Play both notes separately', 'Play the first and hold through the second', 'Play only the second note', 'Play them louder'],
        correctIndex: 1,
        explanation: 'A tie means you play the first note and sustain it through the duration of the second — you do not re-strike.',
      },
      {
        type: 'exercise',
        instruction: 'Play C4 followed by a rest (silence), then E4, then G4: C4, E4, G4',
        expectedNotes: ['C4', 'E4', 'G4'],
      },
    ],
  },

  {
    id: 'dotted-notes',
    title: 'Dotted Notes',
    module: 'Reading & Rhythm',
    level: 'BEGINNER',
    concepts: ['dotted notes', 'dotted quarter', 'dotted half'],
    xpReward: 20,
    order: 11,
    prerequisites: ['rests-and-ties'],
    steps: [
      {
        type: 'text',
        title: 'What Does the Dot Do?',
        content: `A **dot** placed after a note increases its duration by **half its original value**.\n\n- Dotted half note = 2 beats + 1 beat = **3 beats**\n- Dotted quarter note = 1 beat + 1/2 beat = **1.5 beats**\n- Dotted eighth note = 1/2 beat + 1/4 beat = **3/4 beat**\n\nThe dot is a shorthand — instead of writing a half note tied to a quarter note, you simply write a dotted half note. It keeps the music cleaner and easier to read.`,
      },
      {
        type: 'quiz',
        question: 'A dotted half note lasts how many beats?',
        options: ['2 beats', '2.5 beats', '3 beats', '4 beats'],
        correctIndex: 2,
        explanation: 'A half note is 2 beats. The dot adds half of that (1 beat), so a dotted half note = 3 beats total.',
      },
      {
        type: 'text',
        title: 'The Dotted Quarter Note',
        content: `The **dotted quarter note** is extremely common in popular music. It lasts 1.5 beats — one beat plus half a beat.\n\nThis creates a lopsided, lilting rhythm. A very common pattern is: dotted quarter + eighth note, which fills exactly 2 beats (1.5 + 0.5). You hear this pattern constantly in folk music, pop ballads, and hymns.\n\nWhen you encounter dotted rhythms, it helps to subdivide into eighth notes mentally. A dotted quarter note spans 3 eighth notes, while a regular quarter note spans 2.`,
      },
      {
        type: 'quiz',
        question: 'A dotted quarter note is equivalent to how many eighth notes?',
        options: ['2', '3', '4', '6'],
        correctIndex: 1,
        explanation: 'A dotted quarter note = 1.5 beats = 3 eighth notes (since each eighth note is 0.5 beats).',
      },
      {
        type: 'exercise',
        instruction: 'Play a dotted-half-note feel: hold C4, then play G4: C4, G4',
        expectedNotes: ['C4', 'G4'],
      },
    ],
  },

  {
    id: 'three-four-six-eight',
    title: '3/4 and 6/8 Time',
    module: 'Reading & Rhythm',
    level: 'BEGINNER',
    concepts: ['waltz time', 'compound meter', '3/4', '6/8'],
    xpReward: 25,
    order: 12,
    prerequisites: ['dotted-notes'],
    steps: [
      {
        type: 'text',
        title: '3/4 Time: The Waltz',
        content: `**3/4 time** has 3 beats per measure, with the quarter note getting one beat. This is the time signature of the waltz, and it creates a characteristic "ONE two three, ONE two three" feel.\n\nThe first beat (the downbeat) is the strongest, giving the music a graceful, swaying quality. Famous pieces in 3/4 include "The Blue Danube" by Strauss, "My Favorite Things" from The Sound of Music, and many folk songs.\n\nIn 3/4 time, a whole rest still fills the entire measure (3 beats), even though a whole note technically lasts 4 beats.`,
      },
      {
        type: 'text',
        title: '6/8 Time: Compound Meter',
        content: `**6/8 time** has 6 eighth notes per measure, but it is NOT just 3/4 time with eighth notes. The key difference is how the beats are grouped.\n\nIn 6/8, the six eighth notes are grouped into **two groups of three**: "ONE two three FOUR five six." This means 6/8 actually has **two main beats** per measure, each subdivided into three. This is called **compound duple** time.\n\nCompare: 3/4 = three beats divided in two (simple triple). 6/8 = two beats divided in three (compound duple). "House of the Rising Sun" and many jigs are in 6/8.`,
      },
      {
        type: 'quiz',
        question: 'How many strong beats does a measure of 6/8 time have?',
        options: ['1', '2', '3', '6'],
        correctIndex: 1,
        explanation: '6/8 is compound duple — it has 2 main beats per measure, each subdivided into groups of 3 eighth notes.',
      },
      {
        type: 'quiz',
        question: 'Which time signature is associated with the waltz?',
        options: ['2/4', '3/4', '4/4', '6/8'],
        correctIndex: 1,
        explanation: '3/4 time (three quarter-note beats per measure) is the classic waltz time signature.',
      },
      {
        type: 'exercise',
        instruction: 'Play a waltz pattern in C major: C4, E4, G4, C4, E4, G4',
        expectedNotes: ['C4', 'E4', 'G4', 'C4', 'E4', 'G4'],
      },
    ],
  },

  {
    id: 'dynamics-expression',
    title: 'Dynamics and Expression',
    module: 'Reading & Rhythm',
    level: 'BEGINNER',
    concepts: ['dynamics', 'piano', 'forte', 'crescendo'],
    xpReward: 20,
    order: 13,
    prerequisites: ['rhythm-basics'],
    steps: [
      {
        type: 'text',
        title: 'What are Dynamics?',
        content: `**Dynamics** are the volume levels in music. They tell performers how loudly or softly to play. Italian terms are used universally:\n\n- **pp** (pianissimo) = very soft\n- **p** (piano) = soft\n- **mp** (mezzo piano) = moderately soft\n- **mf** (mezzo forte) = moderately loud\n- **f** (forte) = loud\n- **ff** (fortissimo) = very loud\n\nDynamics bring music to life. A piece played at one constant volume sounds flat and robotic. Varying the volume creates drama, emotion, and narrative.`,
      },
      {
        type: 'quiz',
        question: 'What does "forte" (f) mean?',
        options: ['Slow', 'Fast', 'Loud', 'Soft'],
        correctIndex: 2,
        explanation: 'Forte means loud. It comes from the Italian word for strong.',
      },
      {
        type: 'text',
        title: 'Changing Dynamics',
        content: `Music does not just jump between volume levels — it often transitions gradually:\n\n- **Crescendo** (cresc.) = gradually getting louder\n- **Decrescendo / Diminuendo** (decresc. / dim.) = gradually getting softer\n\nThese are shown in sheet music as long hairpin-shaped wedges: an opening wedge < means crescendo, and a closing wedge > means decrescendo.\n\nOther expressive marks include **accent (>)** which emphasizes a single note, and **sforzando (sfz)** which means a sudden strong accent.`,
      },
      {
        type: 'quiz',
        question: 'A crescendo means:',
        options: ['Getting faster', 'Getting slower', 'Getting louder', 'Getting softer'],
        correctIndex: 2,
        explanation: 'A crescendo is a gradual increase in volume — getting louder over time.',
      },
      {
        type: 'exercise',
        instruction: 'Play these notes imagining a crescendo from soft to loud: C4, D4, E4, F4, G4',
        expectedNotes: ['C4', 'D4', 'E4', 'F4', 'G4'],
      },
    ],
  },

  {
    id: 'tempo-markings',
    title: 'Tempo Markings',
    module: 'Reading & Rhythm',
    level: 'BEGINNER',
    concepts: ['tempo', 'allegro', 'andante', 'BPM'],
    xpReward: 20,
    order: 14,
    prerequisites: ['rhythm-basics'],
    steps: [
      {
        type: 'text',
        title: 'What is Tempo?',
        content: `**Tempo** is the speed of the music — how fast or slow the beats go. Like dynamics, tempo uses Italian terms:\n\n- **Largo** = very slow (40-60 BPM)\n- **Adagio** = slow and stately (66-76 BPM)\n- **Andante** = walking pace (76-108 BPM)\n- **Moderato** = moderate (108-120 BPM)\n- **Allegro** = fast and lively (120-156 BPM)\n- **Vivace** = very fast (156-176 BPM)\n- **Presto** = extremely fast (168-200 BPM)\n\nModern scores often include a specific BPM marking for precision, such as a quarter note = 120.`,
      },
      {
        type: 'quiz',
        question: 'Which tempo marking means a walking pace?',
        options: ['Allegro', 'Andante', 'Presto', 'Largo'],
        correctIndex: 1,
        explanation: 'Andante comes from the Italian word for walking. It indicates a moderate, walking tempo around 76-108 BPM.',
      },
      {
        type: 'text',
        title: 'Tempo Changes',
        content: `Just as dynamics can change, so can tempo:\n\n- **Accelerando (accel.)** = gradually getting faster\n- **Ritardando (rit.)** = gradually getting slower\n- **A tempo** = return to the original speed\n- **Rubato** = flexible tempo, speeding up and slowing down expressively\n\nTempo changes are a powerful expressive tool. A ritardando at the end of a piece creates a sense of winding down. An accelerando builds excitement. Rubato, used well, makes music feel deeply human and emotional.`,
      },
      {
        type: 'quiz',
        question: 'What does "ritardando" mean?',
        options: ['Getting louder', 'Getting softer', 'Getting faster', 'Getting slower'],
        correctIndex: 3,
        explanation: 'Ritardando (abbreviated rit.) means gradually slowing down.',
      },
      {
        type: 'exercise',
        instruction: 'Play five notes at a steady tempo: C4, D4, E4, F4, G4',
        expectedNotes: ['C4', 'D4', 'E4', 'F4', 'G4'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 3: CHORDS & HARMONY I (BEGINNER, lessons 15-20)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'power-chords',
    title: 'Power Chords',
    module: 'Chords & Harmony I',
    level: 'BEGINNER',
    concepts: ['power chords', 'root and fifth', 'rock'],
    xpReward: 20,
    order: 15,
    prerequisites: ['first-chord'],
    steps: [
      {
        type: 'text',
        title: 'What is a Power Chord?',
        content: `A **power chord** is the simplest chord in music — just two distinct notes: the **root** and the **fifth**. In chord symbols, it is written with a "5" (like C5, G5, A5).\n\nC5 = C + G\n\nBecause it has no 3rd, a power chord is neither major nor minor. It sounds **neutral, strong, and bold**. This ambiguity is exactly why it is so versatile — it works over major or minor contexts.\n\nPower chords are the backbone of rock, punk, metal, and grunge. They sound massive through a distorted guitar amp because the simple interval does not create the muddy clashing that full chords can.`,
      },
      {
        type: 'quiz',
        question: 'Why are power chords neither major nor minor?',
        options: ['They have no root', 'They have no 3rd', 'They have no 5th', 'They use only one note'],
        correctIndex: 1,
        explanation: 'The 3rd determines whether a chord is major or minor. Power chords skip the 3rd, using only the root and 5th.',
      },
      {
        type: 'text',
        title: 'Using Power Chords',
        content: `Power chords are usually played with the root doubled an octave higher: C + G + C. This thickens the sound without adding new harmonic information.\n\nOn guitar, a power chord has one of the simplest shapes — just two or three fingers in a fixed pattern that you slide up and down the neck to change keys.\n\n[chords:E5,A5,D5]\n\nClassic power chord songs include "Smells Like Teen Spirit" (Nirvana), "Iron Man" (Black Sabbath), and "Blitzkrieg Bop" (Ramones). The simplicity of the chord lets the rhythm and energy drive the music.`,
      },
      {
        type: 'quiz',
        question: 'What notes make up a G power chord (G5)?',
        options: ['G, B, D', 'G, D', 'G, Bb, D', 'G, C'],
        correctIndex: 1,
        explanation: 'A G power chord is G (root) + D (fifth). No third is included.',
      },
      {
        type: 'exercise',
        instruction: 'Play a C power chord: C4, G4',
        expectedNotes: ['C4', 'G4'],
      },
    ],
  },

  {
    id: 'suspended-chords',
    title: 'Suspended Chords',
    module: 'Chords & Harmony I',
    level: 'BEGINNER',
    concepts: ['sus2', 'sus4', 'tension', 'resolution'],
    xpReward: 25,
    order: 16,
    prerequisites: ['major-minor-triads'],
    steps: [
      {
        type: 'text',
        title: 'Suspending the Third',
        content: `A **suspended chord** replaces the 3rd with either the 2nd or the 4th. Because the defining note (the 3rd) is missing, the chord sounds unresolved — it wants to move somewhere.\n\n- **Sus4** = root + 4th + 5th (e.g., Csus4 = C, F, G)\n- **Sus2** = root + 2nd + 5th (e.g., Csus2 = C, D, G)\n\nThe word "suspended" comes from classical music where the 4th was literally a note "suspended" from the previous chord that eventually resolved down to the 3rd.`,
      },
      {
        type: 'quiz',
        question: 'What note does a sus4 chord replace?',
        options: ['The root', 'The 2nd', 'The 3rd', 'The 5th'],
        correctIndex: 2,
        explanation: 'Sus4 replaces the 3rd with the 4th. The "suspension" is the absence of the 3rd.',
      },
      {
        type: 'text',
        title: 'The Sound of Suspension',
        content: `Suspended chords have a distinctive "floating" or "open" quality. They create **tension** that expects **resolution** — usually to the regular major or minor chord.\n\n[chords:Dsus2,Dsus4,Asus2,Asus4]\n\nA classic move: Csus4 → C (the F resolves down to E). You hear this everywhere: the opening of "Pinball Wizard" by The Who, the intro of "Crazy Little Thing Called Love" by Queen, and countless worship songs.\n\nSus2 chords have a more modern, airy feel. They are favorites in folk, indie, and ambient music.`,
      },
      {
        type: 'quiz',
        question: 'What notes make up a Dsus4 chord?',
        options: ['D, F#, A', 'D, G, A', 'D, E, A', 'D, F, A'],
        correctIndex: 1,
        explanation: 'Dsus4 = D (root) + G (4th) + A (5th). The F# (3rd) is replaced by G (4th).',
      },
      {
        type: 'exercise',
        instruction: 'Play Csus4 then resolve to C major: C4, F4, G4, C4, E4, G4',
        expectedNotes: ['C4', 'F4', 'G4', 'C4', 'E4', 'G4'],
      },
    ],
  },

  {
    id: 'one-four-five',
    title: 'The I-IV-V Progression',
    module: 'Chords & Harmony I',
    level: 'BEGINNER',
    concepts: ['chord progressions', 'I-IV-V', 'Roman numerals', 'Nashville numbers'],
    xpReward: 25,
    order: 17,
    prerequisites: ['major-minor-triads'],
    steps: [
      {
        type: 'text',
        title: 'Roman Numeral Analysis',
        content: `In music theory, we label chords with **Roman numerals** based on their position in the scale:\n\n- **I** = chord built on the 1st note (the tonic — "home")\n- **ii** = chord on the 2nd note (naturally minor)\n- **iii** = chord on the 3rd note (naturally minor)\n- **IV** = chord on the 4th note (the subdominant)\n- **V** = chord on the 5th note (the dominant)\n- **vi** = chord on the 6th note (naturally minor)\n- **vii°** = chord on the 7th note (diminished)\n\nUppercase = major chord. Lowercase = minor chord. This system lets you talk about chord relationships in any key.`,
      },
      {
        type: 'text',
        title: 'The I-IV-V Progression',
        content: `The **I-IV-V** is the most common chord progression in all of Western music. In C major:\n\n**C (I) → F (IV) → G (V) → C (I)**\n\n[chords:C,F,G]\n\nThis progression powers thousands of songs across rock, pop, blues, country, and folk. "Twist and Shout," "La Bamba," "Wild Thing," and hundreds more use I-IV-V.\n\nWhy does it work? The V chord creates **tension** (it wants to go home), and the I chord provides **resolution**. The IV chord adds variety and momentum. Together they create a satisfying journey of departure and return.`,
      },
      {
        type: 'quiz',
        question: 'In the key of G major, what chord is the IV?',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 2,
        explanation: 'In G major (G-A-B-C-D-E-F#), the 4th note is C, so the IV chord is C major.',
      },
      {
        type: 'quiz',
        question: 'In the key of C major, what is the V chord?',
        options: ['C', 'D', 'F', 'G'],
        correctIndex: 3,
        explanation: 'G is the 5th note of the C major scale, making G the V chord.',
      },
      {
        type: 'exercise',
        instruction: 'Play the I-IV-V chords in C: C4-E4-G4 (I), F4-A4-C5 (IV), G4-B4-D5 (V)',
        expectedNotes: ['C4', 'E4', 'G4', 'F4', 'A4', 'C5', 'G4', 'B4', 'D5'],
      },
    ],
  },

  {
    id: 'minor-keys',
    title: 'Minor Keys',
    module: 'Chords & Harmony I',
    level: 'BEGINNER',
    concepts: ['minor keys', 'relative minor', 'natural minor scale'],
    xpReward: 25,
    order: 18,
    prerequisites: ['major-scale', 'major-minor-triads'],
    steps: [
      {
        type: 'text',
        title: 'The Natural Minor Scale',
        content: `Every major key has a **relative minor** — a minor key that uses the exact same notes but starts on a different note. The relative minor starts on the **6th degree** of the major scale.\n\nC major: C D E F G **A** B C\nA minor: **A** B C D E F G A\n\nSame notes, different starting point, completely different mood. The natural minor scale formula is: **W H W W H W W**\n\nThis is the foundation of songs that sound sad, dark, mysterious, or introspective.`,
      },
      {
        type: 'quiz',
        question: 'What is the relative minor of C major?',
        options: ['C minor', 'D minor', 'E minor', 'A minor'],
        correctIndex: 3,
        explanation: 'The relative minor starts on the 6th degree. In C major, the 6th note is A, so A minor is the relative minor.',
      },
      {
        type: 'text',
        title: 'Chords in a Minor Key',
        content: `Just as major keys have a predictable set of chords, so do minor keys. In A minor (natural):\n\n- **i** = Am (minor)\n- **ii°** = Bdim (diminished)\n- **III** = C (major)\n- **iv** = Dm (minor)\n- **v** = Em (minor)\n- **VI** = F (major)\n- **VII** = G (major)\n\n[chords:Am,Dm,Em,F,G]\n\nNotice the pattern is different from major: the i, iv, and v are minor, while III, VI, and VII are major. The most common minor progression is **i - iv - v** or **i - VI - VII**.`,
      },
      {
        type: 'quiz',
        question: 'In the key of A minor, what is the iv chord?',
        options: ['Am', 'C', 'Dm', 'Em'],
        correctIndex: 2,
        explanation: 'The 4th note of A minor is D, and it naturally forms a D minor chord (Dm).',
      },
      {
        type: 'exercise',
        instruction: 'Play the A natural minor scale: A3, B3, C4, D4, E4, F4, G4, A4',
        expectedNotes: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
      },
    ],
  },

  {
    id: 'the-vi-chord',
    title: 'The vi Chord',
    module: 'Chords & Harmony I',
    level: 'BEGINNER',
    concepts: ['vi chord', 'axis progression', 'I-V-vi-IV'],
    xpReward: 25,
    order: 19,
    prerequisites: ['one-four-five', 'minor-keys'],
    steps: [
      {
        type: 'text',
        title: 'Adding Emotion with the vi',
        content: `The **vi chord** is the relative minor chord within a major key. In C major, the vi chord is **A minor (Am)**. Adding this one chord to your vocabulary opens up an enormous range of emotional expression.\n\nThe vi chord brings a touch of sadness or longing into an otherwise bright major key. It is the most commonly used minor chord in pop music because it creates emotional contrast without leaving the key.\n\nWhen you move from a major chord to the vi, it feels like the music sighs — a shift from brightness to something more reflective.`,
      },
      {
        type: 'text',
        title: 'The I-V-vi-IV Progression',
        content: `The **I-V-vi-IV** progression (sometimes called the "axis progression" or the "four-chord song") is arguably the most used progression in modern pop music.\n\nIn C major: **C - G - Am - F**\n\n[chords:C,G,Am,F]\n\nSongs that use it include "Let It Be" (Beatles), "No Woman No Cry" (Bob Marley), "With or Without You" (U2), "Someone Like You" (Adele), "Despacito," and hundreds more.\n\nIt works because it creates a perfect emotional arc: confidence (I) → lift (V) → vulnerability (vi) → warmth (IV) → back to confidence.`,
      },
      {
        type: 'quiz',
        question: 'In the key of G major, what is the vi chord?',
        options: ['Bm', 'Cm', 'Dm', 'Em'],
        correctIndex: 3,
        explanation: 'In G major (G-A-B-C-D-E-F#), the 6th note is E, so the vi chord is E minor (Em).',
      },
      {
        type: 'quiz',
        question: 'The I-V-vi-IV progression in C major is:',
        options: ['C, F, Am, G', 'C, G, Am, F', 'C, Dm, G, F', 'C, Em, F, G'],
        correctIndex: 1,
        explanation: 'I=C, V=G, vi=Am, IV=F. This is one of the most popular progressions in pop music.',
      },
      {
        type: 'exercise',
        instruction: 'Play the I-V-vi-IV root notes in C: C4, G4, A4, F4',
        expectedNotes: ['C4', 'G4', 'A4', 'F4'],
      },
    ],
  },

  {
    id: 'strumming-patterns',
    title: 'Strumming Patterns',
    module: 'Chords & Harmony I',
    level: 'BEGINNER',
    concepts: ['strumming', 'downstrokes', 'upstrokes', 'rhythm patterns'],
    xpReward: 20,
    order: 20,
    prerequisites: ['quarter-eighth-notes', 'one-four-five'],
    steps: [
      {
        type: 'text',
        title: 'Downstrokes and Upstrokes',
        content: `When strumming a guitar or playing rhythmically on any instrument, there are two basic motions:\n\n- **Downstroke (↓):** Strumming from low strings to high (or attacking the beat on the downbeat)\n- **Upstroke (↑):** Strumming from high strings to low (or attacking on the upbeat)\n\nDownstrokes naturally fall on the beat (1, 2, 3, 4), while upstrokes fall on the "and" between beats. This creates the fundamental rhythm of most strummed music.\n\nThe simplest pattern is all downstrokes: ↓ ↓ ↓ ↓ (one per beat). This is how many beginners start.`,
      },
      {
        type: 'text',
        title: 'Common Strumming Patterns',
        content: `Here are three essential patterns in 4/4 time:\n\n**Pattern 1 (Basic):** ↓ ↓ ↓ ↓ — all downstrokes, one per beat. Simple and strong.\n\n**Pattern 2 (Folk/Pop):** ↓ ↓ ↑ ↑ ↓ ↑ — this is the most versatile pattern in acoustic music. It has a natural, rolling feel.\n\n**Pattern 3 (Driving):** ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ — alternating down and up on every eighth note. Creates constant motion and energy.\n\nThe key to good strumming is keeping your hand moving in a constant down-up motion, even when you skip a strum. Your hand is the metronome.`,
      },
      {
        type: 'quiz',
        question: 'Downstrokes naturally align with which part of the beat?',
        options: ['The offbeat (the "and")', 'The downbeat (the number)', 'They alternate randomly', 'Only the first beat'],
        correctIndex: 1,
        explanation: 'Downstrokes naturally fall on the main beats (1, 2, 3, 4), while upstrokes fall on the offbeats.',
      },
      {
        type: 'quiz',
        question: 'What is the most important tip for maintaining good strumming rhythm?',
        options: ['Play as fast as possible', 'Only use downstrokes', 'Keep your hand moving constantly in a down-up motion', 'Pause between each strum'],
        correctIndex: 2,
        explanation: 'The key to good strumming is keeping a constant down-up hand motion. You create patterns by choosing which strums to sound and which to skip.',
      },
      {
        type: 'exercise',
        instruction: 'Play a C chord four times (four downstrokes): C4, E4, G4, C4',
        expectedNotes: ['C4', 'E4', 'G4', 'C4'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 4: SCALES & MELODY (INTERMEDIATE, lessons 21-28)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'minor-scale-deep',
    title: 'The Minor Scale',
    module: 'Scales & Melody',
    level: 'INTERMEDIATE',
    concepts: ['natural minor', 'minor scale formula', 'A minor'],
    xpReward: 30,
    order: 21,
    prerequisites: ['minor-keys'],
    steps: [
      {
        type: 'text',
        title: 'The Natural Minor Formula',
        content: `The **natural minor scale** uses the pattern: **W H W W H W W**\n\nCompare this to the major scale (W W H W W W H) — the half steps have shifted. This shift is what creates the darker, more somber sound.\n\nYou can build a natural minor scale from any root note using this formula. For A minor:\nA → B (W) → C (H) → D (W) → E (W) → F (H) → G (W) → A\n\n[staff:a-minor-scale]\n\nThe natural minor scale is the most commonly used minor scale in rock, pop, and folk music. It is also called the **Aeolian mode** — we will explore modes in detail later.`,
      },
      {
        type: 'quiz',
        question: 'What is the step pattern of the natural minor scale?',
        options: ['W W H W W W H', 'W H W W H W W', 'H W W H W W W', 'W W W H W W H'],
        correctIndex: 1,
        explanation: 'The natural minor pattern is W-H-W-W-H-W-W. Compare to major (W-W-H-W-W-W-H).',
      },
      {
        type: 'text',
        title: 'Building Minor Scales in Other Keys',
        content: `Let us build D minor using the W-H-W-W-H-W-W formula:\n\nD → E (W) → F (H) → G (W) → A (W) → Bb (H) → C (W) → D\n\nD minor has one flat: Bb. Its relative major is F major (also one flat).\n\nE minor: E → F# (W) → G (H) → A (W) → B (W) → C (H) → D (W) → E\nE minor has one sharp: F#. Its relative major is G major.\n\nNotice the pattern: a minor key always has the same key signature as its relative major (the key starting a minor third — 3 half steps — higher).`,
      },
      {
        type: 'quiz',
        question: 'What is the relative major of D minor?',
        options: ['C major', 'D major', 'F major', 'G major'],
        correctIndex: 2,
        explanation: 'D minor and F major share the same key signature (one flat, Bb). F is a minor third above D.',
      },
      {
        type: 'exercise',
        instruction: 'Play the D natural minor scale: D4, E4, F4, G4, A4, Bb4, C5, D5',
        expectedNotes: ['D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5'],
      },
    ],
  },

  {
    id: 'pentatonic-scales',
    title: 'Pentatonic Scales',
    module: 'Scales & Melody',
    level: 'INTERMEDIATE',
    concepts: ['major pentatonic', 'minor pentatonic', 'five-note scales'],
    xpReward: 30,
    order: 22,
    prerequisites: ['minor-scale-deep'],
    steps: [
      {
        type: 'text',
        title: 'Why Five Notes?',
        content: `The **pentatonic scale** uses only 5 notes instead of the usual 7. By removing the two notes that create the most tension (the half steps), you get a scale that sounds good over almost anything.\n\nThe **major pentatonic** removes the 4th and 7th from the major scale:\nC major pentatonic: **C D E G A** (no F, no B)\n\n[staff:c-major-pentatonic]\n\nThe **minor pentatonic** removes the 2nd and 6th from the natural minor:\nA minor pentatonic: **A C D E G** (no B, no F)\n\n[staff:a-minor-pentatonic]\n\nNotice these are the same five notes! C major pentatonic and A minor pentatonic are relatives, just like their full-scale counterparts.`,
      },
      {
        type: 'quiz',
        question: 'How many notes are in a pentatonic scale?',
        options: ['4', '5', '6', '7'],
        correctIndex: 1,
        explanation: 'Penta means five. A pentatonic scale has 5 notes, removing the two that create half steps.',
      },
      {
        type: 'text',
        title: 'The Universal Scale',
        content: `The pentatonic scale appears in virtually every musical culture on Earth — from Chinese folk music to Celtic melodies to African rhythms to American blues. It is considered the most natural and intuitive scale.\n\nFor improvisation, the minor pentatonic is the most popular starting point. It works beautifully over blues, rock, and pop. Guitar solos by everyone from B.B. King to Jimi Hendrix to John Mayer rely heavily on the minor pentatonic.\n\nA good exercise: put on any song in A minor and improvise using only A, C, D, E, and G. You will be amazed at how musical it sounds with just these five notes.`,
      },
      {
        type: 'quiz',
        question: 'Which two notes are removed from the natural minor scale to create the minor pentatonic?',
        options: ['1st and 5th', '2nd and 6th', '3rd and 7th', '4th and 7th'],
        correctIndex: 1,
        explanation: 'The minor pentatonic removes the 2nd and 6th degrees, eliminating the half-step intervals.',
      },
      {
        type: 'exercise',
        instruction: 'Play the A minor pentatonic scale: A3, C4, D4, E4, G4, A4',
        expectedNotes: ['A3', 'C4', 'D4', 'E4', 'G4', 'A4'],
      },
    ],
  },

  {
    id: 'blues-scale',
    title: 'The Blues Scale',
    module: 'Scales & Melody',
    level: 'INTERMEDIATE',
    concepts: ['blues scale', 'blue note', 'bending'],
    xpReward: 30,
    order: 23,
    prerequisites: ['pentatonic-scales'],
    steps: [
      {
        type: 'text',
        title: 'Adding the Blue Note',
        content: `The **blues scale** is the minor pentatonic with one crucial addition — the **flat 5th**, also called the **blue note**.\n\nA blues scale: **A C D Eb E G A**\n\nFormula: 1 b3 4 **b5** 5 b7\n\n[staff-notes:A4,C5,D5,Eb5,E5,G5,A5|A blues scale — Eb is the blue note]\n\nThat b5 (Eb in A blues) is the magic ingredient. It creates a gritty, expressive tension that immediately sounds "bluesy." This single note is arguably the most emotionally charged sound in American popular music.\n\nThe blue note sits right between the 4th and the 5th — an unstable, "in the cracks" place that begs to resolve.`,
      },
      {
        type: 'quiz',
        question: 'What makes the blues scale different from the minor pentatonic?',
        options: ['A raised 3rd', 'A flat 5th (blue note)', 'A major 7th', 'An extra root note'],
        correctIndex: 1,
        explanation: 'The blues scale adds the b5 (the "blue note") to the minor pentatonic. This one note gives it the signature blues sound.',
      },
      {
        type: 'text',
        title: 'Playing the Blues',
        content: `The blues scale is not just about the notes — it is about **how** you play them. Blues musicians use techniques like:\n\n- **Bending:** Pushing a string (or sliding on a key) to raise the pitch slightly — especially bending the blue note up toward the 5th\n- **Vibrato:** Wiggling the note back and forth for expression\n- **Slides:** Approaching a target note from above or below\n- **Call and response:** Playing a phrase (call) then answering it (response)\n\nThe blues scale is the foundation for blues, rock, jazz, funk, and soul improvisation. Master it in one key, then learn it in all 12.`,
      },
      {
        type: 'quiz',
        question: 'In the A blues scale, what is the blue note?',
        options: ['C', 'D', 'Eb', 'G'],
        correctIndex: 2,
        explanation: 'In A blues, the blue note is Eb (the flat 5th). It sits between D (the 4th) and E (the 5th).',
      },
      {
        type: 'exercise',
        instruction: 'Play the A blues scale: A3, C4, D4, Eb4, E4, G4, A4',
        expectedNotes: ['A3', 'C4', 'D4', 'Eb4', 'E4', 'G4', 'A4'],
      },
    ],
  },

  {
    id: 'scale-degrees',
    title: 'Scale Degrees',
    module: 'Scales & Melody',
    level: 'INTERMEDIATE',
    concepts: ['tonic', 'dominant', 'leading tone', 'scale degree function'],
    xpReward: 30,
    order: 24,
    prerequisites: ['major-scale', 'minor-scale-deep'],
    steps: [
      {
        type: 'text',
        title: 'Names for Every Degree',
        content: `Each note in a scale has a name that describes its **function** — what role it plays in creating tension or stability:\n\n1. **Tonic** — Home base, the most stable note\n2. **Supertonic** — One step above the tonic\n3. **Mediant** — Halfway between tonic and dominant\n4. **Subdominant** — Below the dominant; has moderate pull\n5. **Dominant** — The second most important note; creates strong pull to tonic\n6. **Submediant** — Below the mediant (counting from the top)\n7. **Leading Tone** — One half step below tonic; has the strongest pull to resolve upward\n\nThese names apply in every key. The tonic is always "home" no matter what note it is.`,
      },
      {
        type: 'quiz',
        question: 'Which scale degree has the strongest pull back to the tonic?',
        options: ['The supertonic (2nd)', 'The mediant (3rd)', 'The dominant (5th)', 'The leading tone (7th)'],
        correctIndex: 3,
        explanation: 'The leading tone (7th degree) is only a half step below the tonic, creating an intense pull upward to resolve.',
      },
      {
        type: 'text',
        title: 'Stable vs Unstable Degrees',
        content: `Scale degrees can be grouped by their stability:\n\n**Stable (tendency to stay):** 1 (tonic), 3 (mediant), 5 (dominant) — these are the notes of the tonic triad. Melodies can comfortably rest on them.\n\n**Unstable (tendency to move):** 2 (wants to go to 1 or 3), 4 (wants to go to 3), 6 (wants to go to 5), 7 (wants to go to 1).\n\nThis push and pull between stability and instability is what gives melodies their sense of motion and direction. A melody that ends on the 7th degree sounds unfinished because the leading tone desperately wants to resolve up to the tonic.`,
      },
      {
        type: 'quiz',
        question: 'Which three scale degrees form the tonic triad and feel most stable?',
        options: ['1, 2, 3', '1, 3, 5', '1, 4, 5', '2, 4, 6'],
        correctIndex: 1,
        explanation: 'The 1st, 3rd, and 5th scale degrees form the tonic triad — the most stable notes in any key.',
      },
      {
        type: 'exercise',
        instruction: 'Play the tonic triad of C major (scale degrees 1, 3, 5): C4, E4, G4',
        expectedNotes: ['C4', 'E4', 'G4'],
      },
    ],
  },

  {
    id: 'melodic-intervals',
    title: 'Melodic Intervals',
    module: 'Scales & Melody',
    level: 'INTERMEDIATE',
    concepts: ['ear training', 'interval recognition', 'reference songs'],
    xpReward: 35,
    order: 25,
    prerequisites: ['intervals', 'scale-degrees'],
    steps: [
      {
        type: 'text',
        title: 'Hearing Intervals',
        content: `Being able to **hear** intervals — not just calculate them on paper — is one of the most valuable skills a musician can develop. It is the foundation of ear training.\n\nThe trick is to associate each interval with the opening of a well-known song:\n\n- **Minor 2nd** (1 half step): "Jaws" theme\n- **Major 2nd** (2): "Happy Birthday"\n- **Minor 3rd** (3): "Greensleeves" / Smoke on the Water\n- **Major 3rd** (4): "Oh When the Saints"\n- **Perfect 4th** (5): "Here Comes the Bride"\n- **Tritone** (6): "The Simpsons" theme\n- **Perfect 5th** (7): "Star Wars" main theme\n- **Octave** (12): "Somewhere Over the Rainbow"`,
      },
      {
        type: 'quiz',
        question: 'The opening interval of "Here Comes the Bride" is a:',
        options: ['Major 3rd', 'Perfect 4th', 'Perfect 5th', 'Octave'],
        correctIndex: 1,
        explanation: 'The first two notes of "Here Comes the Bride" form a perfect 4th (5 half steps).',
      },
      {
        type: 'text',
        title: 'Practice Strategy',
        content: `Here is how to build your interval recognition skills:\n\n1. **Start with just two intervals** — learn to distinguish a major 3rd from a perfect 5th\n2. **Add one new interval at a time** once you can reliably identify the previous ones\n3. **Practice in both directions** — ascending intervals (going up) and descending intervals (going down) sound different\n4. **Sing them** — if you can sing an interval, you truly know it\n\nThe goal is to eventually hear any two notes and instantly know the interval between them. This skill transforms your ability to learn songs by ear, transcribe music, and improvise.`,
      },
      {
        type: 'quiz',
        question: 'The opening of "Star Wars" (main theme) uses which interval?',
        options: ['Major 3rd', 'Perfect 4th', 'Perfect 5th', 'Octave'],
        correctIndex: 2,
        explanation: 'The first two notes of the Star Wars main theme form a perfect 5th.',
      },
      {
        type: 'exercise',
        instruction: 'Play a perfect 4th (C to F), then a perfect 5th (C to G): C4, F4, C4, G4',
        expectedNotes: ['C4', 'F4', 'C4', 'G4'],
      },
    ],
  },

  {
    id: 'building-melodies',
    title: 'Building Melodies',
    module: 'Scales & Melody',
    level: 'INTERMEDIATE',
    concepts: ['motifs', 'repetition', 'variation', 'melody construction'],
    xpReward: 35,
    order: 26,
    prerequisites: ['melodic-intervals', 'scale-degrees'],
    steps: [
      {
        type: 'text',
        title: 'The Motif',
        content: `A **motif** is a short musical idea — typically 2 to 5 notes — that serves as the seed for an entire melody. Think of Beethoven's 5th Symphony: that entire first movement grows from just four notes (da-da-da-DUM).\n\nGreat melodies do not use random notes. They take a small idea and develop it through **repetition** (playing it again), **variation** (playing it with changes), and **contrast** (introducing something new).\n\nThe balance of familiar and new is what makes a melody memorable. Too much repetition is boring. Too much new material is confusing. The sweet spot is in between.`,
      },
      {
        type: 'text',
        title: 'Melodic Contour',
        content: `**Contour** is the overall shape of a melody — its rises and falls. Common melodic shapes include:\n\n- **Arch:** rises to a peak then falls (the most common shape)\n- **Inverted arch:** dips down then comes back up\n- **Ascending:** builds energy by climbing upward\n- **Descending:** releases energy by stepping down\n\nMost effective melodies combine **stepwise motion** (moving to adjacent notes) with occasional **leaps** (jumping to a distant note) for drama. The rule of thumb: after a leap, return by step in the opposite direction.`,
      },
      {
        type: 'quiz',
        question: 'What is a motif?',
        options: ['A full chord progression', 'A short musical idea that a melody is built from', 'A type of rhythm', 'A dynamic marking'],
        correctIndex: 1,
        explanation: 'A motif is a short, memorable musical idea (2-5 notes) that serves as the building block for a larger melody.',
      },
      {
        type: 'quiz',
        question: 'After a melodic leap, what should you typically do?',
        options: ['Leap again in the same direction', 'Return by step in the opposite direction', 'Repeat the same note', 'Rest for a full measure'],
        correctIndex: 1,
        explanation: 'After a leap, return by step in the opposite direction. This "balances" the melody and makes it singable.',
      },
      {
        type: 'exercise',
        instruction: 'Play a simple arch-shaped melody in C: C4, D4, E4, F4, E4, D4, C4',
        expectedNotes: ['C4', 'D4', 'E4', 'F4', 'E4', 'D4', 'C4'],
      },
    ],
  },

  {
    id: 'phrasing',
    title: 'Phrasing',
    module: 'Scales & Melody',
    level: 'INTERMEDIATE',
    concepts: ['musical phrases', 'breathing', 'tension', 'release'],
    xpReward: 30,
    order: 27,
    prerequisites: ['building-melodies'],
    steps: [
      {
        type: 'text',
        title: 'Musical Sentences',
        content: `A **phrase** is a musical sentence — a complete thought that feels like it has a beginning, middle, and end. Just as speech is divided into sentences, music is divided into phrases.\n\nMost phrases are **4 or 8 bars long** in popular music. They often come in pairs:\n\n- **Antecedent phrase** (the question): ends on an unstable note, feels incomplete\n- **Consequent phrase** (the answer): ends on a stable note, feels resolved\n\nThis question-and-answer structure is called a **period** and is one of the most fundamental structures in all of music.`,
      },
      {
        type: 'text',
        title: 'Breathing and Space',
        content: `Great phrasing requires **space**. Just as a speaker pauses between sentences, musicians leave small gaps between phrases. These breaths:\n\n- Separate musical ideas so the listener can process them\n- Create anticipation for what comes next\n- Allow the performer and listener to "breathe" together\n\n**Tension and release** drives phrasing forward. Within a phrase, notes build tension by moving away from stable tones, and then release by returning. The end of a phrase resolves this tension — or deliberately leaves it unresolved to create momentum into the next phrase.`,
      },
      {
        type: 'quiz',
        question: 'An antecedent-consequent pair is called a:',
        options: ['Motif', 'Period', 'Cadenza', 'Riff'],
        correctIndex: 1,
        explanation: 'A period consists of two phrases: an antecedent (question) and a consequent (answer).',
      },
      {
        type: 'quiz',
        question: 'How long is a typical phrase in popular music?',
        options: ['1-2 bars', '4 or 8 bars', '12 bars', '32 bars'],
        correctIndex: 1,
        explanation: 'Most phrases in pop, rock, and jazz are 4 or 8 bars long. This feels natural to our ears.',
      },
      {
        type: 'exercise',
        instruction: 'Play a question phrase ending on the 5th, then an answer ending on the root: C4, D4, E4, G4, E4, D4, C4',
        expectedNotes: ['C4', 'D4', 'E4', 'G4', 'E4', 'D4', 'C4'],
      },
    ],
  },

  {
    id: 'transposition',
    title: 'Transposition',
    module: 'Scales & Melody',
    level: 'INTERMEDIATE',
    concepts: ['transposition', 'key change', 'intervals'],
    xpReward: 35,
    order: 28,
    prerequisites: ['key-signatures', 'intervals'],
    steps: [
      {
        type: 'text',
        title: 'What is Transposition?',
        content: `**Transposition** means moving a piece of music to a different key while keeping all the intervals (and therefore the melody) exactly the same. The song sounds the same — just higher or lower.\n\nWhy transpose? Common reasons include:\n- Matching a singer's vocal range\n- Making a piece easier to play on a particular instrument\n- Accommodating transposing instruments (like Bb trumpet or Eb alto sax)\n\nWhen you transpose, every note moves by the same interval. If you transpose up a whole step, C becomes D, E becomes F#, G becomes A, and so on.`,
      },
      {
        type: 'quiz',
        question: 'If you transpose a melody from C major up a perfect 5th, what key are you in?',
        options: ['D major', 'E major', 'F major', 'G major'],
        correctIndex: 3,
        explanation: 'A perfect 5th above C is G. Transposing up a perfect 5th from C major puts you in G major.',
      },
      {
        type: 'text',
        title: 'How to Transpose',
        content: `There are two methods for transposition:\n\n**Method 1 — By interval:** Move every note up or down by the same interval. To transpose from C to G (up a 5th), raise every note by a 5th.\n\n**Method 2 — By scale degree:** Think of each note as a scale degree in the original key, then find the same degree in the new key. If a note is the 3rd in C major (E), it becomes the 3rd in G major (B).\n\nMethod 2 is often easier because you just need to know both scales. For chord progressions, you can simply apply the same Roman numerals in the new key: I-IV-V in C (C-F-G) becomes I-IV-V in G (G-C-D).`,
      },
      {
        type: 'quiz',
        question: 'When transposing I-IV-V from C major to D major, the chords become:',
        options: ['D, E, A', 'D, G, A', 'D, F, G', 'D, G, B'],
        correctIndex: 1,
        explanation: 'In D major, I=D, IV=G, V=A. The Roman numeral relationships stay the same in every key.',
      },
      {
        type: 'exercise',
        instruction: 'Transpose C-E-G up to the key of G: G4, B4, D5',
        expectedNotes: ['G4', 'B4', 'D5'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 5: CHORDS & HARMONY II (INTERMEDIATE, lessons 29-36)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'seventh-chords',
    title: 'Seventh Chords',
    module: 'Chords & Harmony II',
    level: 'INTERMEDIATE',
    concepts: ['maj7', 'min7', 'dom7', 'dim7'],
    xpReward: 35,
    order: 29,
    prerequisites: ['major-minor-triads', 'intervals'],
    steps: [
      {
        type: 'text',
        title: 'Beyond Triads',
        content: `Triads use 3 notes (1st, 3rd, 5th). **Seventh chords** add a 4th note — the **7th degree** of the scale. This extra note adds richness, color, and harmonic depth.\n\nThere are four main types:\n\n- **Major 7th (maj7):** Major triad + major 7th → dreamy, sophisticated\n- **Dominant 7th (7):** Major triad + minor 7th → bluesy, wants to resolve\n- **Minor 7th (m7):** Minor triad + minor 7th → smooth, mellow\n- **Diminished 7th (dim7):** Diminished triad + diminished 7th → tense, dramatic\n\nSeventh chords are essential in jazz, R&B, soul, and sophisticated pop.`,
      },
      {
        type: 'quiz',
        question: 'What note do you add to a triad to make a 7th chord?',
        options: ['The 2nd', 'The 4th', 'The 6th', 'The 7th'],
        correctIndex: 3,
        explanation: 'Seventh chords add the 7th scale degree on top of a triad, creating a four-note chord (1-3-5-7).',
      },
      {
        type: 'text',
        title: 'Cmaj7 vs C7',
        content: `These look similar but sound very different:\n\n**Cmaj7** = C, E, G, **B** (major 7th = 11 half steps above root)\nSmooth, stable, sophisticated — used in jazz, bossa nova, and R&B.\n\n**C7** = C, E, G, **Bb** (minor/flat 7th = 10 half steps above root)\nBluesy, tense, demands resolution — used in blues, rock, and jazz.\n\n[chords:Cmaj7,C7,G7,Am7,Em7,Dm7]\n\nThe difference is just one half step (B vs Bb), but it completely changes the character. Cmaj7 can sit peacefully. C7 wants to move — specifically to F (the IV chord). This "pull" is the engine of tonal music.`,
      },
      {
        type: 'quiz',
        question: 'A dominant 7th chord (like G7) uses which type of 7th?',
        options: ['Major 7th', 'Minor (flat) 7th', 'Augmented 7th', 'Diminished 7th'],
        correctIndex: 1,
        explanation: 'A dominant 7th uses a minor (flat) 7th. This interval creates the characteristic tension that wants to resolve.',
      },
      {
        type: 'exercise',
        instruction: 'Play a Cmaj7 chord: C4, E4, G4, B4',
        expectedNotes: ['C4', 'E4', 'G4', 'B4'],
      },
      {
        type: 'exercise',
        instruction: 'Play a C7 chord: C4, E4, G4, Bb4',
        expectedNotes: ['C4', 'E4', 'G4', 'Bb4'],
      },
    ],
  },

  {
    id: 'chord-inversions',
    title: 'Chord Inversions',
    module: 'Chords & Harmony II',
    level: 'INTERMEDIATE',
    concepts: ['inversions', 'root position', 'voice leading'],
    xpReward: 35,
    order: 30,
    prerequisites: ['seventh-chords'],
    steps: [
      {
        type: 'text',
        title: 'Same Notes, Different Order',
        content: `A **chord inversion** is the same chord with a different note on the bottom (the bass note).\n\nC major = C, E, G. All three of these arrangements are C major:\n\n- **Root position:** C-E-G (root on the bottom)\n- **1st inversion:** E-G-C (3rd on the bottom)\n- **2nd inversion:** G-C-E (5th on the bottom)\n\nWith 7th chords, there is also a **3rd inversion** with the 7th on the bottom. Each inversion has a different character — root position is strongest, 1st inversion is smooth, 2nd inversion has a suspended quality.`,
      },
      {
        type: 'quiz',
        question: 'In first inversion of C major, which note is on the bottom?',
        options: ['C', 'E', 'G', 'B'],
        correctIndex: 1,
        explanation: 'First inversion puts the 3rd (E) on the bottom. Root position has the root (C), 2nd inversion has the 5th (G).',
      },
      {
        type: 'text',
        title: 'Voice Leading',
        content: `Inversions are the key to **voice leading** — making chord changes sound smooth instead of jumpy.\n\nWithout inversions, every chord change means large jumps. With inversions, you can keep common notes in place and move the others by small steps.\n\nExample: C to F\n- Root position to root position: C-E-G → F-A-C (everything jumps)\n- C root position → F 2nd inversion: C-E-G → C-F-A (C stays, E and G move by step)\n\nSmooth voice leading is what makes professional arrangements, piano accompaniment, and orchestration sound polished.`,
      },
      {
        type: 'quiz',
        question: 'Voice leading means:',
        options: ['Playing as loud as possible', 'Moving smoothly between chords with minimal note movement', 'Singing while playing', 'Playing only root position chords'],
        correctIndex: 1,
        explanation: 'Voice leading is about smooth, minimal movement between chords. Each "voice" (note) should move as little as possible.',
      },
      {
        type: 'exercise',
        instruction: 'Play C major in root position then 1st inversion: C4, E4, G4, E4, G4, C5',
        expectedNotes: ['C4', 'E4', 'G4', 'E4', 'G4', 'C5'],
      },
    ],
  },

  {
    id: 'ii-v-i',
    title: 'The ii-V-I Progression',
    module: 'Chords & Harmony II',
    level: 'INTERMEDIATE',
    concepts: ['ii-V-I', 'jazz harmony', 'tension and resolution'],
    xpReward: 40,
    order: 31,
    prerequisites: ['seventh-chords', 'one-four-five'],
    steps: [
      {
        type: 'text',
        title: 'The Most Important Jazz Progression',
        content: `The **ii-V-I** (two-five-one) is the backbone of jazz and appears constantly in pop, R&B, and film music.\n\nIn C major:\n- **ii** = Dm7 (D minor 7th)\n- **V** = G7 (G dominant 7th)\n- **I** = Cmaj7 (C major 7th)\n\n[chords:Dm7,G7,Cmaj7]\n\nIt creates a beautiful arc: **preparation → tension → resolution**. The ii chord sets up the motion, the V chord creates maximum tension (the dominant wants to resolve), and the I chord brings it home with satisfaction.`,
      },
      {
        type: 'quiz',
        question: 'In the key of C, what is the ii chord?',
        options: ['C', 'Dm', 'Em', 'F'],
        correctIndex: 1,
        explanation: 'The ii chord is built on the 2nd degree of the scale. In C major, that is D, and it is naturally minor.',
      },
      {
        type: 'text',
        title: 'Why ii-V-I Works',
        content: `Each chord moves to the next by the strongest harmonic motion: **root movement by a 4th/5th**.\n\n- D → G (up a 4th)\n- G → C (up a 4th)\n\nThis "cycle of fourths" motion is the most satisfying harmonic movement to our ears. It is the gravity of tonal music.\n\nOnce you can hear ii-V-I, you will recognize it everywhere — "Autumn Leaves," "Fly Me to the Moon," "All The Things You Are," and countless standards. Even pop songs like "I Will Always Love You" use the progression.`,
      },
      {
        type: 'quiz',
        question: 'What type of chord is the V in a ii-V-I?',
        options: ['Major 7th', 'Minor 7th', 'Dominant 7th', 'Diminished'],
        correctIndex: 2,
        explanation: 'The V chord is a dominant 7th. The flat 7th creates the tension that demands resolution to the I chord.',
      },
      {
        type: 'exercise',
        instruction: 'Play the ii-V-I root notes in C: D4, G4, C4',
        expectedNotes: ['D4', 'G4', 'C4'],
      },
    ],
  },

  {
    id: 'secondary-dominants',
    title: 'Secondary Dominants',
    module: 'Chords & Harmony II',
    level: 'INTERMEDIATE',
    concepts: ['secondary dominants', 'V/V', 'tonicization'],
    xpReward: 40,
    order: 32,
    prerequisites: ['ii-v-i'],
    steps: [
      {
        type: 'text',
        title: 'Borrowing Tension',
        content: `In the key of C major, G7 is the only naturally occurring dominant chord. But what if we could create that same urgent "pull" toward any chord in the key?\n\nA **secondary dominant** is a temporary dominant chord that resolves to a chord other than I. It is written as **V/x** — "five of x."\n\n- **V/V** = D7 → G (D7 pulls to G, just like G7 pulls to C)\n- **V/ii** = A7 → Dm\n- **V/vi** = E7 → Am\n\nEach one briefly **tonicizes** its target chord — making it feel momentarily like home.`,
      },
      {
        type: 'quiz',
        question: 'In the key of C, what is V/V (the secondary dominant of V)?',
        options: ['C7', 'D7', 'E7', 'F7'],
        correctIndex: 1,
        explanation: 'V in C major is G. The dominant (V) of G is D7. So V/V in C major = D7.',
      },
      {
        type: 'text',
        title: 'Recognizing Secondary Dominants',
        content: `Whenever you hear a dominant 7th chord that is NOT the V of the key, it is likely a secondary dominant.\n\n**Classic example:** C → E7 → Am → G\n\nThat E7 is not from C major — it is V/vi (five of A minor). It creates dramatic tension before Am.\n\nSecondary dominants are everywhere in popular music:\n- "Yesterday" (Beatles) — uses V/ii\n- "Hey Jude" — V/IV in the verse\n- "Autumn Leaves" — packed with secondary dominants\n\nThey add chromatic color and surprise without actually changing key.`,
      },
      {
        type: 'quiz',
        question: 'A secondary dominant creates:',
        options: ['A permanent modulation to a new key', 'A brief tonicization of a non-I chord', 'A diminished sound', 'A suspended chord'],
        correctIndex: 1,
        explanation: 'Secondary dominants briefly tonicize their target chord without permanently changing key.',
      },
      {
        type: 'exercise',
        instruction: 'Play C major then E7 (V/vi): C4, E4, G4, E4, G#4, B4',
        expectedNotes: ['C4', 'E4', 'G4', 'E4', 'G#4', 'B4'],
      },
    ],
  },

  {
    id: 'diminished-chords',
    title: 'Diminished Chords',
    module: 'Chords & Harmony II',
    level: 'INTERMEDIATE',
    concepts: ['diminished triad', 'diminished 7th', 'passing chords'],
    xpReward: 35,
    order: 33,
    prerequisites: ['seventh-chords'],
    steps: [
      {
        type: 'text',
        title: 'The Diminished Triad',
        content: `A **diminished triad** is built from a root, minor 3rd, and diminished 5th (tritone). It sounds tense, unstable, and slightly sinister.\n\nB diminished: B, D, F\n\nThis chord occurs naturally as the **vii°** chord in major keys. In C major, the chord built on B is B-D-F — all natural notes, yet it sounds completely different from any other chord in the key.\n\nThe defining feature is the **tritone** (B to F = 6 half steps), which is the most unstable interval in music. It creates a powerful desire to resolve.`,
      },
      {
        type: 'quiz',
        question: 'What interval gives the diminished chord its tense, unstable quality?',
        options: ['Perfect 5th', 'Major 3rd', 'Tritone (diminished 5th)', 'Minor 2nd'],
        correctIndex: 2,
        explanation: 'The tritone (diminished 5th, 6 half steps) between the root and 5th creates the characteristic tension.',
      },
      {
        type: 'text',
        title: 'Diminished 7th Chords and Passing Chords',
        content: `A **diminished 7th chord** stacks another minor 3rd on top: root, m3, dim5, dim7. Every note is a minor 3rd apart.\n\nC dim7 = C, Eb, Gb, Bbb (A)\n\n[chords:Bdim,Adim]\n\nA remarkable property: because the notes are equally spaced, there are only 3 distinct diminished 7th chords. C°7 = Eb°7 = Gb°7 = A°7 (same notes, different spellings).\n\nDiminished chords are often used as **passing chords** — connecting two diatonic chords by chromatic step. Example: C → C#dim → Dm. The diminished chord "passes" smoothly between C and Dm.`,
      },
      {
        type: 'quiz',
        question: 'How many truly distinct diminished 7th chords exist?',
        options: ['3', '4', '6', '12'],
        correctIndex: 0,
        explanation: 'Because each diminished 7th chord divides the octave into equal minor 3rds, there are only 3 unique ones.',
      },
      {
        type: 'exercise',
        instruction: 'Play a B diminished triad: B3, D4, F4',
        expectedNotes: ['B3', 'D4', 'F4'],
      },
    ],
  },

  {
    id: 'augmented-chords',
    title: 'Augmented Chords',
    module: 'Chords & Harmony II',
    level: 'INTERMEDIATE',
    concepts: ['augmented triad', 'whole-tone scale', 'symmetry'],
    xpReward: 35,
    order: 34,
    prerequisites: ['seventh-chords'],
    steps: [
      {
        type: 'text',
        title: 'The Augmented Triad',
        content: `An **augmented triad** is built from a root, major 3rd, and augmented 5th (raised 5th). Both intervals are major 3rds.\n\nC augmented (C+): C, E, G#\n\nIt has a dreamy, floating, slightly unsettling quality — like something is expanding outward. The raised 5th creates an upward pull.\n\nLike diminished 7th chords, augmented triads are **symmetrical** — they divide the octave into three equal major 3rds. This means there are only 4 distinct augmented triads: C+ = E+ = G#+.`,
      },
      {
        type: 'quiz',
        question: 'What makes an augmented chord different from a major chord?',
        options: ['Lowered 3rd', 'Raised 3rd', 'Raised 5th', 'Lowered 5th'],
        correctIndex: 2,
        explanation: 'An augmented chord raises the 5th by a half step compared to a major chord. C major = C-E-G, C augmented = C-E-G#.',
      },
      {
        type: 'text',
        title: 'Using Augmented Chords',
        content: `Augmented chords appear in several musical contexts:\n\n[chords:Caug,Eaug]\n\n- **As a dominant substitution:** C+ can resolve to F (the G# pulls up to A, the 3rd of F)\n- **In ascending bass lines:** C → C+ → F (the bass walks C → E → F)\n- **In the whole-tone scale:** The whole-tone scale (all whole steps) generates augmented chords naturally\n\nYou hear augmented chords in "Oh Darling" (Beatles), James Bond themes, and classical music by Debussy and Liszt. They are less common than diminished chords but add a unique, mysterious color.`,
      },
      {
        type: 'quiz',
        question: 'How many truly distinct augmented triads exist?',
        options: ['3', '4', '6', '12'],
        correctIndex: 1,
        explanation: 'Because augmented triads divide the octave into 3 equal major 3rds, there are only 4 unique ones.',
      },
      {
        type: 'exercise',
        instruction: 'Play a C augmented chord: C4, E4, G#4',
        expectedNotes: ['C4', 'E4', 'G#4'],
      },
    ],
  },

  {
    id: 'add-extended-chords',
    title: 'Add and Extended Chords',
    module: 'Chords & Harmony II',
    level: 'INTERMEDIATE',
    concepts: ['add9', 'add11', 'extended chords', '9th chords'],
    xpReward: 35,
    order: 35,
    prerequisites: ['seventh-chords', 'suspended-chords'],
    steps: [
      {
        type: 'text',
        title: 'Add Chords',
        content: `**Add chords** include an extra note without adding the 7th. This is different from extended chords (9th, 11th, 13th) which imply the 7th is present.\n\n- **Cadd9** = C, E, G, D (adds the 9th/2nd, NO 7th)\n- **Cadd11** = C, E, G, F (adds the 11th/4th, NO 7th)\n\n[chords:Cadd9,Gadd9,Dadd9]\n\nCompare:\n- Cadd9 = C, E, G, D (no 7th — open, jangly)\n- C9 = C, E, G, Bb, D (includes dom7 — jazzy, bluesy)\n\nAdd9 chords are extremely popular in pop and rock. "Every Breath You Take" (The Police), "Wonderwall" (Oasis), and many acoustic songs use add9 chords for their sparkling, open quality.`,
      },
      {
        type: 'quiz',
        question: 'What is the difference between Cadd9 and C9?',
        options: ['No difference', 'Cadd9 has no 7th; C9 includes the 7th', 'C9 is an inversion of Cadd9', 'Cadd9 is minor'],
        correctIndex: 1,
        explanation: 'Cadd9 = 1-3-5-9 (no 7th). C9 = 1-3-5-b7-9 (includes the dominant 7th).',
      },
      {
        type: 'text',
        title: 'Extended Chords: 9th, 11th, 13th',
        content: `**Extended chords** keep stacking 3rds beyond the 7th:\n\n- **9th chord:** 1-3-5-7-9 (the 9th = the 2nd, up an octave)\n- **11th chord:** 1-3-5-7-9-11 (the 11th = the 4th, up an octave)\n- **13th chord:** 1-3-5-7-9-11-13 (all 7 notes of the scale!)\n\nIn practice, you omit some notes to keep things playable. The 5th is usually dropped first. For 11th chords, the 3rd is often omitted (it clashes with the 11th).\n\nCommon voicings:\n- Cmaj9 = C, E, B, D (root, 3rd, 7th, 9th — skip the 5th)\n- C13 = C, E, Bb, A (root, 3rd, 7th, 13th — very common in funk)`,
      },
      {
        type: 'quiz',
        question: 'In an extended chord, which note is typically the first to be omitted?',
        options: ['The root', 'The 3rd', 'The 5th', 'The 7th'],
        correctIndex: 2,
        explanation: 'The 5th is usually the first note omitted because it adds the least harmonic color.',
      },
      {
        type: 'exercise',
        instruction: 'Play a Cadd9 chord: C4, E4, G4, D5',
        expectedNotes: ['C4', 'E4', 'G4', 'D5'],
      },
    ],
  },

  {
    id: 'slash-chords-bass-lines',
    title: 'Slash Chords and Bass Lines',
    module: 'Chords & Harmony II',
    level: 'INTERMEDIATE',
    concepts: ['slash chords', 'walking bass', 'pedal tones'],
    xpReward: 35,
    order: 36,
    prerequisites: ['chord-inversions'],
    steps: [
      {
        type: 'text',
        title: 'What is a Slash Chord?',
        content: `A **slash chord** is written as two letters separated by a slash: **C/E** means "C major chord with E in the bass."\n\nThe letter before the slash is the chord. The letter after is the bass note. Sometimes the bass note is part of the chord (making it an inversion), and sometimes it is a note from outside the chord.\n\n- C/E = C major, 1st inversion (E is the 3rd)\n- C/G = C major, 2nd inversion (G is the 5th)\n- C/Bb = C major with Bb in the bass (Bb is not in the chord — this implies C7)\n\nSlash chords give the composer precise control over the bass line.`,
      },
      {
        type: 'quiz',
        question: 'What does C/E mean?',
        options: ['Play C then E', 'C major with E in the bass', 'C and E together only', 'E major chord'],
        correctIndex: 1,
        explanation: 'C/E means play a C major chord with E as the lowest note — this is C major in first inversion.',
      },
      {
        type: 'text',
        title: 'Walking Bass Lines',
        content: `Slash chords are often used to create smooth, **stepwise bass lines** that move independently from the chords above.\n\n[chords:G/B,C/G,D/F#]\n\n**Descending bass line:** C → C/B → Am → Am/G → F\nBass: C → B → A → G → F (smooth chromatic/stepwise descent)\n\nThis is one of the most beautiful sounds in music. You hear it in "A Whiter Shade of Pale," "Stairway to Heaven," and countless ballads.\n\n**Pedal tones** are the opposite concept: the bass note stays on one pitch while the chords change above. For example: C/G → Dm/G → G → G7 — the bass holds G throughout, creating harmonic tension that resolves dramatically.`,
      },
      {
        type: 'quiz',
        question: 'A pedal tone is:',
        options: ['A bass note that changes every beat', 'A sustained bass note held while chords change above', 'A very low note', 'A bass drum pattern'],
        correctIndex: 1,
        explanation: 'A pedal tone is a bass note that stays constant while the harmony changes above it, creating tension.',
      },
      {
        type: 'exercise',
        instruction: 'Play a descending bass line under C major: C4 (with G4), B3 (with G4), A3 (with E4)',
        expectedNotes: ['C4', 'G4', 'B3', 'G4', 'A3', 'E4'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 6: RHYTHM & FEEL II (INTERMEDIATE, lessons 37-42)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'syncopation',
    title: 'Syncopation',
    module: 'Rhythm & Feel II',
    level: 'INTERMEDIATE',
    concepts: ['syncopation', 'offbeat', 'anticipation'],
    xpReward: 35,
    order: 37,
    prerequisites: ['quarter-eighth-notes', 'rests-and-ties'],
    steps: [
      {
        type: 'text',
        title: 'Playing Off the Beat',
        content: `**Syncopation** means placing accents or notes where they are not expected — typically on the offbeats (the "ands") rather than the main beats.\n\nNormal emphasis: **1** and **2** and **3** and **4** and\nSyncopated emphasis: 1 **and** 2 **and** 3 **and** 4 **and**\n\nSyncopation creates rhythmic surprise and energy. It makes music feel alive, groovy, and unpredictable. Without syncopation, music tends to sound stiff and march-like.\n\nVirtually all popular music genres use syncopation: jazz, funk, rock, reggae, Latin, hip-hop, and R&B all rely heavily on off-beat rhythms.`,
      },
      {
        type: 'quiz',
        question: 'Syncopation is:',
        options: ['Playing louder', 'Accenting unexpected beats (typically offbeats)', 'Playing faster', 'Using only whole notes'],
        correctIndex: 1,
        explanation: 'Syncopation places emphasis on unexpected beats — typically the offbeats or weak beats.',
      },
      {
        type: 'text',
        title: 'Anticipation',
        content: `One of the most common syncopation techniques is **anticipation** — playing a note slightly before the beat where you would expect it.\n\nInstead of changing chords right on beat 1, you hit the new chord on the "and" of beat 4 in the previous measure. This creates a sense of forward momentum, as if the music is leaning into the next bar.\n\nAnticipation is used constantly in pop, rock, and funk:\n- Chord changes that land on the "and of 4" instead of beat 1\n- Melody notes that arrive a half beat early\n- Drum accents that push ahead of the beat\n\nThis "pushing" feeling is a huge part of what makes music feel energetic.`,
      },
      {
        type: 'quiz',
        question: 'An anticipation is a note that:',
        options: ['Arrives late', 'Arrives early (before the expected beat)', 'Is held for a long time', 'Is played very softly'],
        correctIndex: 1,
        explanation: 'An anticipation plays a note slightly before the beat where it is expected, creating forward momentum.',
      },
      {
        type: 'exercise',
        instruction: 'Play a syncopated rhythm on C: off-beat accents C4, C4, C4, C4',
        expectedNotes: ['C4', 'C4', 'C4', 'C4'],
      },
    ],
  },

  {
    id: 'swing-feel',
    title: 'Swing Feel',
    module: 'Rhythm & Feel II',
    level: 'INTERMEDIATE',
    concepts: ['swing', 'shuffle', 'triplet feel'],
    xpReward: 35,
    order: 38,
    prerequisites: ['syncopation'],
    steps: [
      {
        type: 'text',
        title: 'Straight vs Swing',
        content: `In **straight** eighth notes, each eighth note is exactly half a beat — the downbeat and upbeat are evenly spaced.\n\nIn **swing** (also called **shuffle**), the eighth notes are played unevenly: the first one is longer and the second is shorter. It sounds like a "long-short, long-short" pattern.\n\nMathematically, swing eighth notes are closer to a triplet feel — the beat is divided into three, and the first eighth note takes about 2/3 of the beat while the second takes 1/3.\n\nSwing is the rhythmic foundation of jazz, blues, early rock and roll, and big band music. It is what makes jazz sound like jazz.`,
      },
      {
        type: 'quiz',
        question: 'In swing feel, eighth notes are played:',
        options: ['Evenly (straight)', 'Long-short (uneven)', 'Short-long (reversed)', 'All on downbeats'],
        correctIndex: 1,
        explanation: 'Swing eighth notes are uneven: the first is longer (about 2/3 of the beat) and the second is shorter (about 1/3).',
      },
      {
        type: 'text',
        title: 'The Spectrum of Swing',
        content: `Swing is not binary — it exists on a **spectrum**:\n\n- **Straight:** Exactly even eighths. Used in classical, most rock, pop, and electronic music.\n- **Light swing:** Slightly uneven. Used in some pop and R&B grooves.\n- **Medium swing:** Clear long-short feel. Standard jazz swing.\n- **Hard swing / shuffle:** Very pronounced long-short, nearly dotted-eighth + sixteenth. Used in blues and boogie-woogie.\n\nThe amount of swing can also vary by tempo. At fast tempos, swing tends to flatten out toward straight eighths because there is less time to create the lopsided feel.`,
      },
      {
        type: 'quiz',
        question: 'Which genre most characteristically uses swing eighth notes?',
        options: ['Classical', 'Electronic dance', 'Jazz', 'Punk rock'],
        correctIndex: 2,
        explanation: 'Jazz is the genre most defined by swing feel. It is the rhythmic foundation of the entire jazz tradition.',
      },
      {
        type: 'exercise',
        instruction: 'Play a simple swing melody: C4, E4, G4, E4, C4',
        expectedNotes: ['C4', 'E4', 'G4', 'E4', 'C4'],
      },
    ],
  },

  {
    id: 'sixteenth-note-patterns',
    title: '16th Note Patterns',
    module: 'Rhythm & Feel II',
    level: 'INTERMEDIATE',
    concepts: ['sixteenth notes', 'funk rhythms', 'subdivisions'],
    xpReward: 35,
    order: 39,
    prerequisites: ['syncopation'],
    steps: [
      {
        type: 'text',
        title: 'Dividing the Beat into Four',
        content: `**Sixteenth notes** divide each beat into four equal parts. In 4/4 time, that gives you 16 sixteenth notes per measure.\n\nWe count them: **"1 e and a 2 e and a 3 e and a 4 e and a"**\n\nThe "1" is the downbeat, "e" is the first subdivision, "and" is the second (same as the eighth note offbeat), and "a" is the third subdivision.\n\nSixteenth notes are the foundation of funk, hip-hop, Latin music, and many modern pop grooves. They create a fine-grained rhythmic grid that allows for incredibly precise and intricate patterns.`,
      },
      {
        type: 'quiz',
        question: 'How many sixteenth notes fit in one beat?',
        options: ['2', '3', '4', '8'],
        correctIndex: 2,
        explanation: 'Four sixteenth notes equal one beat (one quarter note). They divide the beat into four equal parts.',
      },
      {
        type: 'text',
        title: 'Funk and 16th-Note Grooves',
        content: `Funk music lives in the sixteenth notes. Classic funk patterns accent unexpected sixteenths, creating complex, danceable grooves.\n\nThe key to a good 16th-note groove is deciding which of the 16 subdivisions to play and which to leave silent. The combination of notes and rests creates the pattern.\n\nFamous 16th-note grooves:\n- "Superstition" (Stevie Wonder) — the clavinet riff\n- "Get Up (I Feel Like Being a) Sex Machine" (James Brown)\n- "Give It Away" (Red Hot Chili Peppers)\n\nStart by playing straight 16th notes, then remove notes one at a time to create different patterns. Each combination has a different feel.`,
      },
      {
        type: 'quiz',
        question: 'How do we count sixteenth notes within one beat?',
        options: ['1 and 2 and', '1 e and a', '1 2 3 4', '1 and uh'],
        correctIndex: 1,
        explanation: 'One beat of sixteenth notes is counted "1 e and a" — four evenly spaced subdivisions.',
      },
      {
        type: 'exercise',
        instruction: 'Play four notes (one beat of 16ths) on E: E4, E4, E4, E4',
        expectedNotes: ['E4', 'E4', 'E4', 'E4'],
      },
    ],
  },

  {
    id: 'polyrhythm-basics',
    title: 'Polyrhythm Basics',
    module: 'Rhythm & Feel II',
    level: 'INTERMEDIATE',
    concepts: ['polyrhythm', '3 against 2', 'cross-rhythm'],
    xpReward: 40,
    order: 40,
    prerequisites: ['sixteenth-note-patterns'],
    steps: [
      {
        type: 'text',
        title: 'What is a Polyrhythm?',
        content: `A **polyrhythm** is two or more conflicting rhythms played simultaneously. The most common polyrhythm is **3 against 2** (also called a hemiola) — one part plays 3 evenly spaced notes while another plays 2.\n\nImagine tapping your left hand 3 times evenly while your right hand taps 2 times in the same span. The two patterns create a mesmerizing interlocking texture.\n\nPolyrhythms are fundamental to African drumming traditions and have deeply influenced jazz, Latin music, funk, and progressive rock. They add rhythmic complexity and depth that keeps the listener engaged.`,
      },
      {
        type: 'quiz',
        question: 'A "3 against 2" polyrhythm means:',
        options: ['Playing in 3/4 then 2/4', 'One part plays 3 notes while another plays 2 in the same time', 'Repeating a pattern 3 times then 2', 'Playing 3 notes followed by 2 rests'],
        correctIndex: 1,
        explanation: 'In 3 against 2, one voice plays 3 evenly spaced notes in the same time span that another plays 2.',
      },
      {
        type: 'text',
        title: 'Feeling Polyrhythms',
        content: `A helpful mnemonic for 3 against 2: say the phrase "**NICE CUP of TEA**" where the capitalized syllables are one rhythm and the underlined are another:\n\nRight hand (2): NICE . . CUP . .\nLeft hand (3): NICE CUP of TEA . .\n\nOr think of "**pass the god-damn but-ter**" — 2 against 3.\n\n**2 against 3** is everywhere: the clave pattern in Latin music, the relationship between a waltz feel and a duple feel, and the rhythmic tension in much of jazz.\n\nMore complex polyrhythms include 4 against 3, 5 against 4, and beyond. These appear in progressive rock, Indian classical music, and contemporary classical.`,
      },
      {
        type: 'quiz',
        question: 'Which musical tradition is most associated with complex polyrhythms?',
        options: ['European classical', 'West African drumming', 'American country', 'Japanese traditional'],
        correctIndex: 1,
        explanation: 'West African drumming traditions are built on layers of polyrhythm and have influenced jazz, funk, Latin, and many other genres.',
      },
      {
        type: 'exercise',
        instruction: 'Play 3 evenly spaced notes against a span of 2 beats: C4, E4, G4',
        expectedNotes: ['C4', 'E4', 'G4'],
      },
    ],
  },

  {
    id: 'groove-and-feel',
    title: 'Groove and Feel',
    module: 'Rhythm & Feel II',
    level: 'INTERMEDIATE',
    concepts: ['groove', 'pocket', 'feel', 'micro-timing'],
    xpReward: 35,
    order: 41,
    prerequisites: ['swing-feel', 'syncopation'],
    steps: [
      {
        type: 'text',
        title: 'What Makes Music Groove?',
        content: `**Groove** is the quality that makes music feel good and makes you want to move. It is more than just playing the right notes at the right time — it is about the tiny timing nuances that give music its character.\n\nMusicians talk about playing "in the pocket" — being perfectly locked in with the rhythmic feel. But the pocket is not a single exact spot. It involves:\n\n- **Micro-timing:** Placing notes slightly before or after the mathematical beat\n- **Dynamics:** Varying the volume of individual notes within a pattern\n- **Note length:** How long you let each note ring before dampening it\n- **Consistency:** Repeating these subtle variations reliably`,
      },
      {
        type: 'text',
        title: 'Laying Back and Pushing',
        content: `Two key concepts in feel:\n\n**Laying back:** Playing notes very slightly after the beat. This creates a relaxed, heavy feel. Common in blues, reggae, hip-hop, and R&B. Think of the laid-back groove of a D'Angelo record.\n\n**Pushing (or playing on top):** Playing notes very slightly before the beat. This creates urgency and excitement. Common in punk, some rock, and high-energy jazz.\n\nThese are extremely subtle timing differences — often just 10-30 milliseconds. But they dramatically change how the music feels. Great rhythm sections develop a shared sense of where the pocket sits.`,
      },
      {
        type: 'quiz',
        question: '"Playing in the pocket" means:',
        options: ['Playing very fast', 'Being perfectly locked into the rhythmic feel', 'Playing softly', 'Improvising freely'],
        correctIndex: 1,
        explanation: 'Playing in the pocket means being deeply locked into the groove — the rhythmic feel is solid, consistent, and feels effortless.',
      },
      {
        type: 'quiz',
        question: 'What does "laying back" mean in terms of rhythm?',
        options: ['Playing ahead of the beat', 'Playing slightly behind the beat for a relaxed feel', 'Playing louder', 'Playing fewer notes'],
        correctIndex: 1,
        explanation: 'Laying back means placing notes slightly after the mathematical beat, creating a relaxed, heavy feel.',
      },
      {
        type: 'exercise',
        instruction: 'Play a steady groove on the root and 5th: C4, G4, C4, G4',
        expectedNotes: ['C4', 'G4', 'C4', 'G4'],
      },
    ],
  },

  {
    id: 'odd-time-signatures',
    title: 'Odd Time Signatures',
    module: 'Rhythm & Feel II',
    level: 'INTERMEDIATE',
    concepts: ['5/4', '7/8', 'asymmetric meter'],
    xpReward: 40,
    order: 42,
    prerequisites: ['three-four-six-eight', 'syncopation'],
    steps: [
      {
        type: 'text',
        title: 'Beyond 4/4 and 3/4',
        content: `Most popular music sits comfortably in 4/4 or 3/4 time. But **odd time signatures** break free of these familiar patterns, creating music that feels asymmetric, unusual, and compelling.\n\n**5/4 time** has 5 beats per measure, typically grouped as 3+2 or 2+3:\n- "Take Five" (Dave Brubeck) — the most famous 5/4 piece\n- "Mission: Impossible" theme — 5/4 throughout\n\n**7/8 time** has 7 eighth notes per measure, often grouped as 2+2+3 or 3+2+2:\n- "Money" (Pink Floyd) — 7/4 verse\n- Common in Balkan folk music`,
      },
      {
        type: 'quiz',
        question: '"Take Five" by Dave Brubeck is in what time signature?',
        options: ['3/4', '4/4', '5/4', '6/8'],
        correctIndex: 2,
        explanation: '"Take Five" is in 5/4 time — five beats per measure — which is what gives it that distinctive, unusual feel.',
      },
      {
        type: 'text',
        title: 'Feeling Odd Meters',
        content: `The key to playing in odd meters is to feel them as **groupings of 2s and 3s**, not as a string of individual beats.\n\n- 5/4 = 3+2 (ONE two three FOUR five) or 2+3 (ONE two THREE four five)\n- 7/8 = 2+2+3 or 3+2+2 or 2+3+2\n- 9/8 = 2+2+2+3 or 3+3+3 (when grouped as 3+3+3, it sounds like 3/4)\n\nProgressive rock bands like Tool, Rush, Dream Theater, and King Crimson frequently use complex and changing meters. Radiohead's "15 Step" is in 5/4, and "Paranoid Android" shifts between meters.\n\nThe trick is to internalize the grouping so it stops feeling "odd" and starts feeling natural.`,
      },
      {
        type: 'quiz',
        question: '7/8 is typically felt as groups of:',
        options: ['7 individual beats', 'Groups of 2s and 3s (like 2+2+3)', '3+4', 'It is the same as 7/4'],
        correctIndex: 1,
        explanation: '7/8 is typically divided into groups of 2s and 3s: 2+2+3, 3+2+2, or 2+3+2, depending on the feel.',
      },
      {
        type: 'exercise',
        instruction: 'Play a 5-note grouping (feel the 3+2): C4, D4, E4, G4, A4',
        expectedNotes: ['C4', 'D4', 'E4', 'G4', 'A4'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 7: MODES & ADVANCED SCALES (INTERMEDIATE, lessons 43-48)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'intro-to-modes',
    title: 'Introduction to Modes',
    module: 'Modes & Advanced Scales',
    level: 'INTERMEDIATE',
    concepts: ['modes', 'parent scale', 'modal playing'],
    xpReward: 35,
    order: 43,
    prerequisites: ['major-scale', 'minor-scale-deep'],
    steps: [
      {
        type: 'text',
        title: 'What Are Modes?',
        content: `**Modes** are scales built by starting on different notes of the major scale. Take C major: C D E F G A B. Now play the same notes, but start on D:\n\n**D E F G A B C D** — this is **D Dorian**.\n\nSame notes as C major, but it sounds completely different because D is now "home." The intervals relative to the new root create a new mood.\n\nThere are 7 modes, one starting on each degree of the major scale. Each has a unique character and has been used for centuries in folk, classical, jazz, and popular music.`,
      },
      {
        type: 'text',
        title: 'The Seven Modes',
        content: `Starting from each degree of the major scale:\n\n1. **Ionian** (1st) — The major scale itself. Bright, happy.\n2. **Dorian** (2nd) — Minor with a bright 6th. Jazzy, groovy.\n3. **Phrygian** (3rd) — Dark with a flat 2nd. Spanish, exotic.\n4. **Lydian** (4th) — Major with a raised 4th. Dreamy, floating.\n5. **Mixolydian** (5th) — Major with a flat 7th. Bluesy, rock.\n6. **Aeolian** (6th) — Natural minor. Sad, dark.\n7. **Locrian** (7th) — Very unstable with a flat 5th. Tense, rarely used.\n\nThe practical way to learn modes: understand the "parent scale" and the characteristic note that makes each mode unique.`,
      },
      {
        type: 'quiz',
        question: 'D Dorian uses the same notes as which major scale?',
        options: ['D major', 'C major', 'G major', 'F major'],
        correctIndex: 1,
        explanation: 'D Dorian starts on the 2nd degree of C major, so it uses all the same notes: D E F G A B C.',
      },
      {
        type: 'quiz',
        question: 'How many modes can be derived from a single major scale?',
        options: ['5', '6', '7', '12'],
        correctIndex: 2,
        explanation: 'There are 7 modes — one starting on each degree of the major scale.',
      },
      {
        type: 'exercise',
        instruction: 'Play D Dorian: D4, E4, F4, G4, A4, B4, C5, D5',
        expectedNotes: ['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5'],
      },
    ],
  },

  {
    id: 'ionian-mixolydian',
    title: 'Ionian and Mixolydian',
    module: 'Modes & Advanced Scales',
    level: 'INTERMEDIATE',
    concepts: ['Ionian', 'Mixolydian', 'major modes', 'flat 7'],
    xpReward: 35,
    order: 44,
    prerequisites: ['intro-to-modes'],
    steps: [
      {
        type: 'text',
        title: 'Ionian: The Major Scale',
        content: `**Ionian mode** is simply the major scale — W W H W W W H. It is the "default" mode and the reference point for understanding all others.\n\nFormula: 1 2 3 4 5 6 7\n\nIonian sounds bright, resolved, and complete. It is the sound of "happiness" in Western music. When you hear a simple major key melody — "Happy Birthday," "Twinkle Twinkle Little Star" — that is Ionian.\n\nSince it is the standard major scale, you already know it. The real question is: what happens when we change just one note?`,
      },
      {
        type: 'text',
        title: 'Mixolydian: The Dominant Mode',
        content: `**Mixolydian mode** is the major scale with a **flat 7th** — that is the only difference from Ionian.\n\nFormula: 1 2 3 4 5 6 **b7**\n\nG Mixolydian: G A B C D E **F** G (same notes as C major, starting on G)\n\nMixolydian sounds major but with a bluesy, rock edge. It is the sound of dominant 7th chords and is the mode of choice for:\n- Classic rock ("Sweet Home Alabama," "Sympathy for the Devil")\n- Blues and blues-rock\n- Folk and Celtic music (fiddle tunes)\n- Funk guitar riffs\n\nIf a song uses a major chord with a flat 7th (like G7 or C7 as a tonic), it is likely Mixolydian.`,
      },
      {
        type: 'quiz',
        question: 'What is the only difference between Ionian and Mixolydian?',
        options: ['Mixolydian has a flat 3rd', 'Mixolydian has a flat 7th', 'Mixolydian has a sharp 4th', 'Mixolydian has a flat 2nd'],
        correctIndex: 1,
        explanation: 'Mixolydian is identical to the major scale (Ionian) except for one note: the 7th is lowered by a half step.',
      },
      {
        type: 'quiz',
        question: 'Which song is a famous example of Mixolydian mode?',
        options: ['Yesterday (Beatles)', 'Sweet Home Alabama (Lynyrd Skynyrd)', 'Stairway to Heaven (Led Zeppelin)', 'Bohemian Rhapsody (Queen)'],
        correctIndex: 1,
        explanation: '"Sweet Home Alabama" prominently uses the Mixolydian sound — major chords with a flat 7th.',
      },
      {
        type: 'exercise',
        instruction: 'Play G Mixolydian: G4, A4, B4, C5, D5, E5, F5, G5',
        expectedNotes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'],
      },
    ],
  },

  {
    id: 'dorian-aeolian',
    title: 'Dorian and Aeolian',
    module: 'Modes & Advanced Scales',
    level: 'INTERMEDIATE',
    concepts: ['Dorian', 'Aeolian', 'minor modes'],
    xpReward: 35,
    order: 45,
    prerequisites: ['intro-to-modes'],
    steps: [
      {
        type: 'text',
        title: 'Aeolian: Natural Minor',
        content: `**Aeolian mode** is the natural minor scale — the 6th mode of major. You already know it well.\n\nFormula: 1 2 **b3** 4 5 **b6 b7**\n\nA Aeolian: A B C D E F G A\n\nThis is the "default" minor sound — dark, melancholic, introspective. It is the minor scale used in most rock, pop, and folk songs in minor keys.\n\nThe two flat notes that distinguish it from major are the b3 (which makes it minor) and the b6 (which gives it a darker quality compared to Dorian).`,
      },
      {
        type: 'text',
        title: 'Dorian: The Bright Minor',
        content: `**Dorian mode** is a minor scale with a **natural 6th** (raised compared to Aeolian). It is the 2nd mode of the major scale.\n\nFormula: 1 2 **b3** 4 5 **6** b7\n\nD Dorian: D E F G A B C D\n\nThat natural 6th makes Dorian brighter and warmer than Aeolian. It sounds minor but not sad — more cool, groovy, and sophisticated.\n\nDorian is used heavily in:\n- Jazz ("So What" by Miles Davis — the quintessential Dorian piece)\n- Funk and soul ("Oye Como Va" by Santana)\n- Folk ("Scarborough Fair")\n- Video game music\n\nWhenever you hear a minor key that feels warm rather than bleak, it is likely Dorian.`,
      },
      {
        type: 'quiz',
        question: 'What is the key difference between Dorian and Aeolian?',
        options: ['Dorian has a natural 6th; Aeolian has a flat 6th', 'Dorian has a flat 3rd; Aeolian does not', 'Dorian has a sharp 7th', 'They are identical'],
        correctIndex: 0,
        explanation: 'Dorian has a natural (raised) 6th compared to Aeolian. This one note makes Dorian sound brighter and warmer.',
      },
      {
        type: 'quiz',
        question: '"So What" by Miles Davis prominently uses which mode?',
        options: ['Ionian', 'Mixolydian', 'Dorian', 'Phrygian'],
        correctIndex: 2,
        explanation: '"So What" is the most famous Dorian piece in jazz. The entire tune sits on D Dorian.',
      },
      {
        type: 'exercise',
        instruction: 'Play A Aeolian then A Dorian — hear the difference in the 6th: A3, B3, C4, D4, E4, F4, A3, B3, C4, D4, E4, F#4',
        expectedNotes: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4'],
      },
    ],
  },

  {
    id: 'phrygian-locrian',
    title: 'Phrygian and Locrian',
    module: 'Modes & Advanced Scales',
    level: 'INTERMEDIATE',
    concepts: ['Phrygian', 'Locrian', 'dark modes'],
    xpReward: 35,
    order: 46,
    prerequisites: ['intro-to-modes'],
    steps: [
      {
        type: 'text',
        title: 'Phrygian: The Exotic Mode',
        content: `**Phrygian mode** is the 3rd mode of the major scale. Its defining feature is the **flat 2nd** — a half step above the root that creates an exotic, Spanish, or Middle Eastern flavor.\n\nFormula: 1 **b2 b3** 4 5 **b6 b7**\n\nE Phrygian: E F G A B C D E (same notes as C major)\n\nThat semitone between the 1st and 2nd degrees is what gives Phrygian its intense, brooding character. It is used in:\n- Flamenco and Spanish guitar\n- Heavy metal (Metallica, Slayer)\n- Middle Eastern and North African music\n- Film scores for tense or exotic scenes`,
      },
      {
        type: 'text',
        title: 'Locrian: The Unstable Mode',
        content: `**Locrian mode** is the 7th mode — the darkest and most unstable of all. Its defining feature is the **flat 5th** (diminished 5th), which means the tonic chord is diminished.\n\nFormula: 1 **b2 b3** 4 **b5 b6 b7**\n\nB Locrian: B C D E F G A B\n\nLocrian is rarely used as a key center in traditional music because the diminished tonic chord is too unstable to feel like "home." However, it appears in:\n- Heavy metal riffs (briefly, for maximum darkness)\n- Jazz improvisation over half-diminished chords\n- Experimental and avant-garde music\n\nThink of Locrian as a theoretical endpoint — the darkest possible mode — rather than a practical key.`,
      },
      {
        type: 'quiz',
        question: 'What is the characteristic note of Phrygian mode?',
        options: ['Natural 6th', 'Sharp 4th', 'Flat 2nd', 'Flat 5th'],
        correctIndex: 2,
        explanation: 'The flat 2nd is what gives Phrygian its distinctive exotic, Spanish character.',
      },
      {
        type: 'quiz',
        question: 'Why is Locrian rarely used as a key center?',
        options: ['It sounds too happy', 'The tonic chord is diminished (unstable)', 'It has too many sharps', 'It is the same as major'],
        correctIndex: 1,
        explanation: 'Locrian has a flat 5th, making the tonic chord diminished — too unstable to serve as a convincing home.',
      },
      {
        type: 'exercise',
        instruction: 'Play E Phrygian — hear the exotic flat 2nd: E4, F4, G4, A4, B4, C5, D5, E5',
        expectedNotes: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'],
      },
    ],
  },

  {
    id: 'lydian-mode',
    title: 'Lydian Mode',
    module: 'Modes & Advanced Scales',
    level: 'INTERMEDIATE',
    concepts: ['Lydian', 'raised 4th', 'film music'],
    xpReward: 35,
    order: 47,
    prerequisites: ['intro-to-modes'],
    steps: [
      {
        type: 'text',
        title: 'Lydian: The Dreamy Mode',
        content: `**Lydian mode** is the 4th mode of the major scale. Its defining feature is the **raised 4th** (sharp 4th), which is a half step higher than the regular major scale.\n\nFormula: 1 2 3 **#4** 5 6 7\n\nF Lydian: F G A B C D E F (same notes as C major, starting on F)\n\nThat raised 4th eliminates the only "dark" interval in the major scale (the perfect 4th's slight tension), creating the brightest, most open-sounding mode. It sounds **dreamy, floating, ethereal, and magical**.\n\nLydian has been described as "more major than major" because every interval from the root is either major or augmented.`,
      },
      {
        type: 'text',
        title: 'Lydian in Practice',
        content: `Lydian appears frequently in:\n\n- **Film music:** John Williams uses Lydian extensively ("E.T." flying theme, "Jurassic Park" wonder moments). It is the go-to mode for awe, wonder, and magic.\n- **Jazz:** Lydian works beautifully over major 7th chords, especially maj7#11. George Russell's "Lydian Chromatic Concept" proposed Lydian as the most consonant mode.\n- **Pop/Rock:** "Dreams" by Fleetwood Mac has a Lydian flavor. Joe Satriani's "Flying in a Blue Dream" is pure Lydian.\n- **Video games:** The floating, magical quality suits fantasy and adventure.\n\nTo find Lydian quickly: play a major scale but raise the 4th note by one half step.`,
      },
      {
        type: 'quiz',
        question: 'What is the characteristic note of Lydian mode?',
        options: ['Flat 3rd', 'Flat 7th', 'Sharp 4th (raised 4th)', 'Flat 2nd'],
        correctIndex: 2,
        explanation: 'The sharp/raised 4th is what gives Lydian its characteristic floating, dreamy quality.',
      },
      {
        type: 'quiz',
        question: 'Which composer frequently uses Lydian mode in film scores?',
        options: ['Hans Zimmer', 'John Williams', 'Ennio Morricone', 'Danny Elfman'],
        correctIndex: 1,
        explanation: 'John Williams uses Lydian mode frequently for scenes of wonder and awe, especially in E.T. and Jurassic Park.',
      },
      {
        type: 'exercise',
        instruction: 'Play F Lydian — hear the raised 4th (B natural): F4, G4, A4, B4, C5, D5, E5, F5',
        expectedNotes: ['F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'],
      },
    ],
  },

  {
    id: 'harmonic-melodic-minor',
    title: 'Harmonic and Melodic Minor',
    module: 'Modes & Advanced Scales',
    level: 'INTERMEDIATE',
    concepts: ['harmonic minor', 'melodic minor', 'leading tone'],
    xpReward: 40,
    order: 48,
    prerequisites: ['minor-scale-deep', 'scale-degrees'],
    steps: [
      {
        type: 'text',
        title: 'Harmonic Minor',
        content: `The **harmonic minor** scale raises the 7th degree of the natural minor by one half step, creating a **leading tone** that strongly pulls up to the root.\n\nA harmonic minor: A B C D E F **G#** A\nFormula: 1 2 b3 4 5 b6 **7**\n\nThis raised 7th creates a distinctive 1.5-step gap between the 6th and 7th (F to G# = 3 half steps). This gap gives harmonic minor its exotic, classical, or Middle Eastern sound.\n\nThe name "harmonic" comes from the fact that this scale produces the harmonies (chords) used in minor key classical music — specifically the major V chord (E major in A minor) with its strong pull to the tonic.`,
      },
      {
        type: 'quiz',
        question: 'What is raised in harmonic minor compared to natural minor?',
        options: ['The 3rd', 'The 5th', 'The 6th', 'The 7th'],
        correctIndex: 3,
        explanation: 'Harmonic minor raises the 7th by a half step to create a leading tone with a strong pull to the root.',
      },
      {
        type: 'text',
        title: 'Melodic Minor',
        content: `**Melodic minor** solves the awkward 1.5-step gap in harmonic minor by also raising the 6th:\n\nA melodic minor (ascending): A B C D E **F# G#** A\nA melodic minor (descending): A G F E D C B A (reverts to natural minor)\n\nFormula (ascending): 1 2 b3 4 5 **6 7**\n\nIn classical music, melodic minor changes direction — raised 6th and 7th ascending, natural descending. In jazz, the ascending form is used in both directions and is called the **jazz minor scale**.\n\nMelodic minor is incredibly important in jazz because it generates several useful modes, including the altered scale and the Lydian dominant scale.`,
      },
      {
        type: 'quiz',
        question: 'Melodic minor raises which degrees compared to natural minor?',
        options: ['3rd and 5th', '6th and 7th', '2nd and 4th', '5th and 7th'],
        correctIndex: 1,
        explanation: 'Melodic minor raises both the 6th and 7th ascending, smoothing out the gap in harmonic minor.',
      },
      {
        type: 'exercise',
        instruction: 'Play A harmonic minor: A3, B3, C4, D4, E4, F4, G#4, A4',
        expectedNotes: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G#4', 'A4'],
      },
      {
        type: 'exercise',
        instruction: 'Play A melodic minor ascending: A3, B3, C4, D4, E4, F#4, G#4, A4',
        expectedNotes: ['A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G#4', 'A4'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 8: JAZZ FOUNDATIONS (ADVANCED, lessons 49-54)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'jazz-chord-voicings',
    title: 'Jazz Chord Voicings',
    module: 'Jazz Foundations',
    level: 'ADVANCED',
    concepts: ['shell voicings', 'drop 2', 'rootless voicings'],
    xpReward: 45,
    order: 49,
    prerequisites: ['seventh-chords', 'chord-inversions'],
    steps: [
      {
        type: 'text',
        title: 'Shell Voicings',
        content: `Jazz pianists do not play big block chords. They use **voicings** — specific arrangements of chord tones that are sparse but rich.\n\n**Shell voicings** use only 3 notes: **Root + 3rd + 7th**\n\nFor Cmaj7: C + E + B\nFor Dm7: D + F + C\nFor G7: G + B + F\n\nWhy skip the 5th? It does not add much harmonic character. The 3rd tells you major or minor, and the 7th tells you the chord quality. That is all you need.\n\nShell voicings sound clean, professional, and leave space for the bass player, horns, and other instruments.`,
      },
      {
        type: 'quiz',
        question: 'A shell voicing consists of:',
        options: ['Root + 3rd + 5th', 'Root + 3rd + 7th', '3rd + 7th + 9th', 'Root + 5th + 7th'],
        correctIndex: 1,
        explanation: 'Shell voicings = Root + 3rd + 7th. The 5th is omitted because it adds little harmonic character.',
      },
      {
        type: 'text',
        title: 'Rootless Voicings',
        content: `In a band context, the bass player covers the root. So jazz pianists often drop it entirely.\n\n**Rootless voicings** omit the root and build from the 3rd, 7th, and extensions:\n\nCmaj9 rootless (Type A): E + B + D (3rd + 7th + 9th)\nDm9 rootless (Type A): F + C + E (3rd + 7th + 9th)\nG13 rootless (Type A): B + F + A + E (3rd + 7th + 9th + 13th)\n\nThese sound incredibly sophisticated. The listener's ear fills in the root from context. This is what gives jazz piano its characteristic "adult" sound.`,
      },
      {
        type: 'text',
        title: 'Drop 2 Voicings',
        content: `**Drop 2 voicings** take a close-position chord and "drop" the second note from the top down an octave. This spreads the voicing out, creating a wider, more open sound.\n\nCmaj7 close position: B C E G (7th, root, 3rd, 5th)\nDrop 2: take the 2nd from top (E), drop it an octave → **E** B C G\n\nDrop 2 voicings are essential for jazz guitar (where close voicings are impractical) and are used extensively in big band arranging. They produce a rich, balanced sound with good voice separation.`,
      },
      {
        type: 'exercise',
        instruction: 'Play a Cmaj7 shell voicing: C4, E4, B4',
        expectedNotes: ['C4', 'E4', 'B4'],
      },
    ],
  },

  {
    id: 'jazz-ii-v-i',
    title: 'The Jazz ii-V-I',
    module: 'Jazz Foundations',
    level: 'ADVANCED',
    concepts: ['jazz ii-V-I', 'voice leading', 'guide tones'],
    xpReward: 45,
    order: 50,
    prerequisites: ['jazz-chord-voicings', 'ii-v-i'],
    steps: [
      {
        type: 'text',
        title: 'Voice Leading the ii-V-I',
        content: `The jazz ii-V-I is all about **smooth voice leading**. The 3rd and 7th of each chord (the "guide tones") move by step to the next chord:\n\nIn C major with rootless voicings:\n- Dm7: F, C (3rd, 7th)\n- G7: F → **F**, C → **B** (7th stays, 3rd drops a half step)\n- Cmaj7: **E**, **B** (3rd, 7th — both arrived by step)\n\nThe 7th of one chord resolves down by a half step to become the 3rd of the next chord. This creates an elegant, smooth connection between harmonies.\n\nThis voice leading principle is the engine of tonal music and the reason ii-V-I sounds so satisfying.`,
      },
      {
        type: 'quiz',
        question: 'In jazz voice leading, the 7th of one chord typically resolves to:',
        options: ['The root of the next chord', 'The 3rd of the next chord (down by half step)', 'The 5th of the next chord', 'It stays the same'],
        correctIndex: 1,
        explanation: 'The 7th resolves down by a half step to become the 3rd of the next chord — this is the core of jazz voice leading.',
      },
      {
        type: 'text',
        title: 'Guide Tone Lines',
        content: `A **guide tone line** traces the movement of the 3rds and 7ths through a chord progression. It creates a smooth melody that outlines the harmony.\n\nii-V-I in C, guide tones:\n- Dm7: **F** (3rd) and **C** (7th)\n- G7: **B** (3rd) and **F** (7th) — the F stayed, the C moved to B\n- Cmaj7: **E** (3rd) and **B** (7th) — the B stayed, the F moved to E\n\nNotice how everything moves by step or stays put. If you play just these guide tones over a bass player walking through the changes, it sounds completely like jazz.\n\nPractice playing guide tone lines through jazz standards — it is one of the most efficient ways to learn jazz harmony.`,
      },
      {
        type: 'quiz',
        question: 'Guide tones are:',
        options: ['The root and 5th', 'The 3rd and 7th', 'The 9th and 13th', 'The bass notes'],
        correctIndex: 1,
        explanation: 'Guide tones are the 3rd and 7th of each chord — they define the chord quality and lead smoothly from one chord to the next.',
      },
      {
        type: 'exercise',
        instruction: 'Play guide tones through ii-V-I in C: F4, C5, B4, F4, E4, B4',
        expectedNotes: ['F4', 'C5', 'B4', 'F4', 'E4', 'B4'],
      },
    ],
  },

  {
    id: 'jazz-scales',
    title: 'Jazz Scales',
    module: 'Jazz Foundations',
    level: 'ADVANCED',
    concepts: ['bebop scale', 'altered scale', 'diminished scale'],
    xpReward: 45,
    order: 51,
    prerequisites: ['jazz-ii-v-i', 'harmonic-melodic-minor'],
    steps: [
      {
        type: 'text',
        title: 'The Bebop Scale',
        content: `The **bebop scale** adds a chromatic passing tone to a 7-note scale, creating an 8-note scale where chord tones consistently land on downbeats.\n\nThe most common is the **bebop dominant scale** — a Mixolydian scale with an added natural 7th:\n\nC bebop dominant: C D E F G A **Bb B** C\n\nWith 8 notes per octave (in 4/4 time playing eighth notes), the chord tones (C, E, G, Bb) land on the strong beats. Without the extra note, they would alternate between strong and weak beats.\n\nThis was the insight of bebop pioneers like Charlie Parker and Dizzy Gillespie: adding one note solves a rhythmic alignment problem.`,
      },
      {
        type: 'quiz',
        question: 'Why does the bebop scale have 8 notes instead of 7?',
        options: ['To include more chord tones', 'So chord tones land on strong beats when playing eighth notes', 'To cover a wider range', 'It is just tradition'],
        correctIndex: 1,
        explanation: 'The extra chromatic note ensures that the 4 chord tones land on the 4 strong beats in a measure of 4/4 playing eighth notes.',
      },
      {
        type: 'text',
        title: 'The Altered Scale and Diminished Scale',
        content: `**The Altered Scale** (7th mode of melodic minor) is used over dominant 7th chords for maximum tension:\n\nG altered: G Ab Bb B Db Eb F G\nFormula: 1 b9 #9 3 b5 #5 b7\n\nIt contains ALL the altered tensions (b9, #9, b5/#11, #5/b13). It is the most "outside" scale commonly used in jazz.\n\n**The Diminished Scale** (also called octatonic) alternates whole and half steps:\n\nC diminished (half-whole): C Db Eb E F# G A Bb C\n\nIt is symmetrical — the same pattern every minor 3rd. It works over diminished chords and dominant 7th chords (whole-half variant).`,
      },
      {
        type: 'quiz',
        question: 'The altered scale is the 7th mode of which scale?',
        options: ['Major scale', 'Harmonic minor', 'Melodic minor', 'Pentatonic'],
        correctIndex: 2,
        explanation: 'The altered scale is the 7th mode of the ascending melodic minor scale. It produces all possible altered tensions on a dominant chord.',
      },
      {
        type: 'exercise',
        instruction: 'Play the C bebop dominant scale: C4, D4, E4, F4, G4, A4, Bb4, B4, C5',
        expectedNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'B4', 'C5'],
      },
    ],
  },

  {
    id: 'chord-scale-theory',
    title: 'Chord-Scale Theory',
    module: 'Jazz Foundations',
    level: 'ADVANCED',
    concepts: ['chord-scale', 'available tensions', 'avoid notes'],
    xpReward: 45,
    order: 52,
    prerequisites: ['jazz-scales', 'intro-to-modes'],
    steps: [
      {
        type: 'text',
        title: 'Matching Scales to Chords',
        content: `**Chord-scale theory** assigns a scale to each chord, giving you a pool of notes to improvise with. The basic principle: use a scale that contains all the chord tones plus compatible extensions.\n\nIn a ii-V-I in C major:\n- **Dm7** → D Dorian (D E F G A B C)\n- **G7** → G Mixolydian (G A B C D E F)\n- **Cmaj7** → C Ionian or C Lydian (C D E F G A B or C D E F# G A B)\n\nIn a ii-V-i in C minor:\n- **Dm7b5** → D Locrian or D Locrian #2\n- **G7alt** → G Altered scale\n- **Cm(maj7)** → C Melodic minor\n\nThis system gives you a systematic approach to improvisation over any chord.`,
      },
      {
        type: 'quiz',
        question: 'Over a Dm7 chord in C major, the most common scale choice is:',
        options: ['D major', 'D Dorian', 'D Mixolydian', 'D Phrygian'],
        correctIndex: 1,
        explanation: 'D Dorian is the standard chord-scale choice for a ii chord (Dm7) in C major.',
      },
      {
        type: 'text',
        title: 'Avoid Notes and Available Tensions',
        content: `Not every note in the chord-scale is equal. There are:\n\n**Chord tones** (1, 3, 5, 7): The safest notes. You can land on these and sustain them.\n\n**Available tensions** (9, 11, 13): These add color and can be used freely but are less stable than chord tones.\n\n**Avoid notes:** Notes that clash with a chord tone (usually a half step above). For example, F over Cmaj7 — the F clashes with E (the 3rd). You can pass through avoid notes but should not rest on them.\n\nIonian has one avoid note (4th over maj7). Dorian has no avoid notes (which is one reason it is so improviser-friendly).`,
      },
      {
        type: 'quiz',
        question: 'What is an "avoid note"?',
        options: ['A wrong note', 'A note a half step above a chord tone that clashes', 'Any note not in the scale', 'The root'],
        correctIndex: 1,
        explanation: 'An avoid note is a scale tone that sits a half step above a chord tone, creating a dissonant clash if sustained.',
      },
      {
        type: 'exercise',
        instruction: 'Play D Dorian chord tones over Dm7: D4, F4, A4, C5',
        expectedNotes: ['D4', 'F4', 'A4', 'C5'],
      },
    ],
  },

  {
    id: 'tritone-substitution',
    title: 'Tritone Substitution',
    module: 'Jazz Foundations',
    level: 'ADVANCED',
    concepts: ['tritone sub', 'reharmonization', 'chromatic bass'],
    xpReward: 45,
    order: 53,
    prerequisites: ['jazz-ii-v-i', 'diminished-chords'],
    steps: [
      {
        type: 'text',
        title: 'What is a Tritone Substitution?',
        content: `A **tritone substitution** replaces a dominant 7th chord with another dominant 7th chord whose root is a **tritone** (6 half steps) away.\n\nG7 can be replaced by **Db7** (G to Db = tritone).\n\nWhy does this work? Because G7 and Db7 share the same guide tones (the 3rd and 7th are swapped):\n- G7: B (3rd) and F (7th)\n- Db7: F (3rd) and B/Cb (7th)\n\nThe same two notes that create the tension and resolution are present in both chords. The resolution to Cmaj7 works equally well from either one.`,
      },
      {
        type: 'quiz',
        question: 'A tritone substitution for G7 is:',
        options: ['C7', 'D7', 'Db7', 'Eb7'],
        correctIndex: 2,
        explanation: 'The tritone sub for G7 is Db7. G to Db is a tritone (6 half steps), and they share the same guide tones.',
      },
      {
        type: 'text',
        title: 'Tritone Subs in Action',
        content: `The classic application is in a ii-V-I progression:\n\nOriginal: Dm7 → G7 → Cmaj7\nWith tritone sub: Dm7 → **Db7** → Cmaj7\n\nNotice the bass line: D → Db → C — a beautiful **chromatic descent** (all half steps). This smooth bass motion is one of the main reasons tritone subs sound so good.\n\nYou can also apply tritone subs to secondary dominants:\n- A7 → Dm becomes Eb7 → Dm (bass: Eb → D, half step)\n- E7 → Am becomes Bb7 → Am (bass: Bb → A, half step)\n\nTritone substitution is one of the most powerful reharmonization tools in jazz.`,
      },
      {
        type: 'quiz',
        question: 'When using a tritone sub in ii-V-I, the bass line becomes:',
        options: ['All whole steps', 'A chromatic descent (half steps)', 'A circle of fifths', 'It stays on one note'],
        correctIndex: 1,
        explanation: 'Dm7 → Db7 → Cmaj7 creates a bass line D → Db → C — a smooth chromatic descent.',
      },
      {
        type: 'exercise',
        instruction: 'Play the tritone sub ii-V-I bass line: D4, Db4, C4',
        expectedNotes: ['D4', 'Db4', 'C4'],
      },
    ],
  },

  {
    id: 'modal-jazz',
    title: 'Modal Jazz',
    module: 'Jazz Foundations',
    level: 'ADVANCED',
    concepts: ['modal jazz', 'vamps', 'Miles Davis'],
    xpReward: 45,
    order: 54,
    prerequisites: ['chord-scale-theory', 'dorian-aeolian'],
    steps: [
      {
        type: 'text',
        title: 'What is Modal Jazz?',
        content: `**Modal jazz** emerged in the late 1950s as a reaction to the rapid chord changes of bebop. Instead of navigating a new chord every beat or two, modal jazz stays on one chord (or mode) for extended periods — sometimes 8 or 16 bars.\n\nThe landmark album was **"Kind of Blue"** (1959) by Miles Davis, featuring the tune "So What" — 16 bars of D Dorian, then 8 bars of Eb Dorian, then 8 bars of D Dorian.\n\nThis approach shifts the improviser's focus from playing changes (negotiating rapid chord movements) to exploring **color, texture, and melodic development** within a single harmonic environment.`,
      },
      {
        type: 'quiz',
        question: 'Which album is considered the landmark of modal jazz?',
        options: ['A Love Supreme', 'Kind of Blue', 'Bitches Brew', 'Head Hunters'],
        correctIndex: 1,
        explanation: '"Kind of Blue" by Miles Davis (1959) is widely considered the definitive modal jazz album.',
      },
      {
        type: 'text',
        title: 'Modal Jazz Techniques',
        content: `When improvising over a modal vamp, the techniques differ from chord-based jazz:\n\n- **Horizontal thinking:** Build long melodic lines exploring the mode, rather than outlining chord changes vertically\n- **Space:** Use silence and sustained notes — there is no rush to spell out changes\n- **Motivic development:** State a short idea and develop it through repetition, transposition, and variation\n- **Tension through density:** Build intensity by gradually increasing rhythmic activity and range\n\nKey modal jazz recordings to study:\n- "So What" and "Flamenco Sketches" (Miles Davis)\n- "Impressions" (John Coltrane)\n- "Maiden Voyage" (Herbie Hancock)`,
      },
      {
        type: 'quiz',
        question: 'How does modal jazz differ from bebop?',
        options: ['Modal jazz uses more chords', 'Modal jazz stays on one chord/mode for longer periods', 'Modal jazz is faster', 'Modal jazz uses only major scales'],
        correctIndex: 1,
        explanation: 'Modal jazz stays on one chord or mode for extended periods, while bebop features rapid chord changes.',
      },
      {
        type: 'exercise',
        instruction: 'Improvise in D Dorian — play some notes from the mode: D4, F4, A4, C5, B4, G4, D4',
        expectedNotes: ['D4', 'F4', 'A4', 'C5', 'B4', 'G4', 'D4'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 9: ADVANCED HARMONY (ADVANCED, lessons 55-60)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'borrowed-chords',
    title: 'Borrowed Chords',
    module: 'Advanced Harmony',
    level: 'ADVANCED',
    concepts: ['modal interchange', 'borrowed chords', 'minor plagal'],
    xpReward: 45,
    order: 55,
    prerequisites: ['secondary-dominants', 'minor-keys'],
    steps: [
      {
        type: 'text',
        title: 'What Are Borrowed Chords?',
        content: `**Borrowed chords** (also called **modal interchange**) are chords taken from the parallel minor (or another parallel mode) and used in a major key context.\n\nIn C major, the parallel minor is C minor. We can "borrow" chords from C minor:\n- **bVII:** Bb major (from C natural minor)\n- **iv:** F minor (from C minor)\n- **bVI:** Ab major (from C minor)\n- **bIII:** Eb major (from C minor)\n\nThese chords sound surprising but not wrong — they add darkness, drama, or bittersweetness to an otherwise bright major key.`,
      },
      {
        type: 'quiz',
        question: 'Borrowed chords come from:',
        options: ['A different key entirely', 'The parallel minor (or other parallel mode)', 'The relative minor', 'The dominant key'],
        correctIndex: 1,
        explanation: 'Borrowed chords come from the parallel key — same root, different mode. C major borrows from C minor.',
      },
      {
        type: 'text',
        title: 'Common Borrowed Chord Uses',
        content: `The most popular borrowed chord is the **iv chord** (minor four). In C major, that is Fm. The progression:\n\nC → F → **Fm** → C\n\nThis is called the **minor plagal cadence** (iv → I). It has a wistful, bittersweet quality and appears in "Creep" (Radiohead), "Space Oddity" (Bowie), and countless ballads.\n\nOther common uses:\n- **bVII → I:** Bb → C (the "rock cadence" — very common in rock and pop)\n- **bVI → bVII → I:** Ab → Bb → C (epic, cinematic — think movie trailer music)\n- **I → bIII → IV:** C → Eb → F (Beatles used this progression frequently)\n\nBorrowed chords are one of the most effective tools for adding emotional depth to songwriting.`,
      },
      {
        type: 'quiz',
        question: 'The "minor plagal cadence" is:',
        options: ['V → I', 'iv → I', 'ii → V', 'bVII → I'],
        correctIndex: 1,
        explanation: 'The minor plagal cadence (iv → I) uses the borrowed minor iv chord resolving to the major I. It has a bittersweet quality.',
      },
      {
        type: 'exercise',
        instruction: 'Play the minor plagal cadence: F4, Ab4, C5 (Fm) then C4, E4, G4 (C)',
        expectedNotes: ['F4', 'Ab4', 'C5', 'C4', 'E4', 'G4'],
      },
    ],
  },

  {
    id: 'neapolitan-augmented-sixth',
    title: 'Neapolitan and Augmented Sixth Chords',
    module: 'Advanced Harmony',
    level: 'ADVANCED',
    concepts: ['Neapolitan', 'augmented sixth', 'chromatic chords'],
    xpReward: 50,
    order: 56,
    prerequisites: ['borrowed-chords', 'chord-inversions'],
    steps: [
      {
        type: 'text',
        title: 'The Neapolitan Chord',
        content: `The **Neapolitan chord** (abbreviated N or bII) is a major triad built on the **lowered 2nd degree** of the scale, almost always in **first inversion**.\n\nIn C minor: the Neapolitan is **Db major** (Db, F, Ab), typically voiced as F-Ab-Db.\n\nIt typically resolves to the V chord: N6 → V → i (Db/F → G → Cm)\n\nThe Neapolitan sounds dramatic, dark, and unexpected. It was a favorite of Baroque and Classical composers (Beethoven, Mozart, Schubert), but also appears in film music and even some rock (Radiohead uses bII frequently).\n\nThe name comes from its association with the Neapolitan opera school of the 18th century.`,
      },
      {
        type: 'quiz',
        question: 'The Neapolitan chord is built on which scale degree?',
        options: ['Raised 2nd', 'Lowered 2nd (bII)', 'The 4th', 'The 7th'],
        correctIndex: 1,
        explanation: 'The Neapolitan chord is a major triad on the lowered 2nd degree (bII), usually in first inversion.',
      },
      {
        type: 'text',
        title: 'Augmented Sixth Chords',
        content: `**Augmented sixth chords** contain the interval of an augmented 6th — which enharmonically equals a minor 7th but resolves differently. They strongly resolve outward to an octave on the dominant.\n\nIn C major/minor, the augmented 6th interval is Ab to F#. There are three types:\n\n- **Italian (It+6):** Ab, C, F# — the simplest\n- **French (Fr+6):** Ab, C, D, F# — adds the 2nd\n- **German (Ger+6):** Ab, C, Eb, F# — adds the b3rd (sounds like a dominant 7th)\n\nAll three resolve to the V chord (G), with Ab moving down to G and F# moving up to G. This outward resolution to the dominant is their defining characteristic.`,
      },
      {
        type: 'quiz',
        question: 'Augmented sixth chords typically resolve to:',
        options: ['The I chord', 'The IV chord', 'The V chord', 'The vi chord'],
        correctIndex: 2,
        explanation: 'Augmented sixth chords resolve outward to an octave on the dominant (V), with the two notes of the augmented 6th moving outward by half step.',
      },
      {
        type: 'exercise',
        instruction: 'Play an Italian augmented 6th in C: Ab3, C4, F#4',
        expectedNotes: ['Ab3', 'C4', 'F#4'],
      },
    ],
  },

  {
    id: 'chromatic-harmony',
    title: 'Chromatic Harmony',
    module: 'Advanced Harmony',
    level: 'ADVANCED',
    concepts: ['chromatic mediants', 'planing', 'chromatic motion'],
    xpReward: 45,
    order: 57,
    prerequisites: ['borrowed-chords', 'secondary-dominants'],
    steps: [
      {
        type: 'text',
        title: 'Chromatic Mediants',
        content: `A **chromatic mediant** is a chord whose root is a major or minor 3rd away from the current chord, but it is not the expected diatonic chord at that distance.\n\nFrom C major, the diatonic mediants are Em (iii) and Am (vi). The **chromatic** mediants are the unexpected ones:\n- **E major** (a major 3rd up, but major instead of minor)\n- **Ab major** (a minor 3rd down, from the parallel minor)\n- **Eb major** (a minor 3rd up)\n- **A major** (a major 3rd down)\n\nChromatic mediants share one common tone with the original chord but change quality. C major to E major: the note E is shared, but everything else shifts. The effect is dramatic, cinematic, and colorful.`,
      },
      {
        type: 'quiz',
        question: 'What makes a mediant relationship "chromatic" rather than diatonic?',
        options: ['The root is a 5th away', 'The chord quality differs from what the key predicts', 'It uses 7th chords', 'It is the same chord in a different octave'],
        correctIndex: 1,
        explanation: 'Chromatic mediants have a root a 3rd away but an unexpected chord quality (e.g., E major instead of E minor in C major).',
      },
      {
        type: 'text',
        title: 'Planing (Parallel Harmony)',
        content: `**Planing** (also called parallel or slab harmony) moves a chord shape chromatically or diatonically, disregarding traditional voice leading rules.\n\nChromatic planing: Cmaj7 → Dbmaj7 → Dmaj7 → Ebmaj7 (the same shape slides up chromatically)\n\nDiatonic planing: Cmaj7 → Dm7 → Em7 → Fmaj7 (the shape follows the key)\n\nPlaning was pioneered by Impressionist composers like Debussy and Ravel and became a staple of jazz arranging (Thad Jones, Bill Evans). It creates a shimmering, dreamlike quality.\n\nIn film music and modern pop, chromatic planing appears frequently for its smooth, sophisticated sound.`,
      },
      {
        type: 'quiz',
        question: 'Planing is:',
        options: ['Moving a chord shape in parallel motion', 'Playing in two keys at once', 'Alternating major and minor', 'Playing only bass notes'],
        correctIndex: 0,
        explanation: 'Planing moves a fixed chord shape up or down chromatically or diatonically, creating parallel harmony.',
      },
      {
        type: 'exercise',
        instruction: 'Play chromatic mediant movement: C major, then E major: C4, E4, G4, E4, G#4, B4',
        expectedNotes: ['C4', 'E4', 'G4', 'E4', 'G#4', 'B4'],
      },
    ],
  },

  {
    id: 'reharmonization',
    title: 'Reharmonization Techniques',
    module: 'Advanced Harmony',
    level: 'ADVANCED',
    concepts: ['reharmonization', 'substitution', 'harmonic enrichment'],
    xpReward: 50,
    order: 58,
    prerequisites: ['tritone-substitution', 'borrowed-chords', 'chromatic-harmony'],
    steps: [
      {
        type: 'text',
        title: 'What is Reharmonization?',
        content: `**Reharmonization** means changing the chords under an existing melody to create a new harmonic interpretation. It is one of the most creative skills in arranging and jazz.\n\nThe melody stays the same, but the chords change — sometimes subtly, sometimes dramatically. A simple folk tune can become a jazz ballad, or a pop song can become a sophisticated harmonization.\n\nThe golden rule: the new chords must be compatible with the melody notes. Each melody note should be a chord tone or a valid tension of the new chord.`,
      },
      {
        type: 'text',
        title: 'Reharmonization Techniques',
        content: `Key techniques:\n\n**1. Substitution:** Replace a chord with one that shares common tones (tritone subs, diatonic subs, chromatic mediants).\n\n**2. Interpolation:** Insert extra chords between existing ones. Turn C → G into C → Em → Dm → G.\n\n**3. Tonicization:** Add a ii-V before any target chord. Going to Am? Insert Bm7b5 → E7 before it.\n\n**4. Pedal point reharmonization:** Keep the bass on one note while changing upper harmonies.\n\n**5. Quality change:** Change a major chord to minor (or vice versa), a dominant to diminished, etc.\n\n**6. Coltrane changes:** Substitute a single chord with a cycle of major thirds (explored by John Coltrane in "Giant Steps").`,
      },
      {
        type: 'quiz',
        question: 'When reharmonizing, the most important rule is:',
        options: ['Use only jazz chords', 'The melody must remain compatible with the new chords', 'Always make chords more complex', 'Change the melody to fit'],
        correctIndex: 1,
        explanation: 'The melody stays fixed. New chords must be compatible — each melody note should be a chord tone or available tension.',
      },
      {
        type: 'quiz',
        question: 'Interpolation in reharmonization means:',
        options: ['Removing chords', 'Inserting additional chords between existing ones', 'Playing chords louder', 'Changing the melody'],
        correctIndex: 1,
        explanation: 'Interpolation inserts extra chords between the original ones, enriching the harmonic rhythm.',
      },
      {
        type: 'exercise',
        instruction: 'Play a simple reharm: replace G7 with Db7 (tritone sub) before C: Db4, F4, Ab4, C4, E4, G4',
        expectedNotes: ['Db4', 'F4', 'Ab4', 'C4', 'E4', 'G4'],
      },
    ],
  },

  {
    id: 'modulation',
    title: 'Modulation',
    module: 'Advanced Harmony',
    level: 'ADVANCED',
    concepts: ['modulation', 'pivot chords', 'key changes'],
    xpReward: 45,
    order: 59,
    prerequisites: ['secondary-dominants', 'key-signatures'],
    steps: [
      {
        type: 'text',
        title: 'Changing Keys',
        content: `**Modulation** is the process of moving from one key to another within a piece. Unlike a brief tonicization, a modulation establishes the new key as the home base — you stay there.\n\nThere are several types of modulation:\n\n- **Pivot chord modulation:** Uses a chord common to both keys as a bridge\n- **Direct modulation:** Changes key abruptly without preparation\n- **Chromatic modulation:** Uses chromatic voice leading to slide into the new key\n- **Common tone modulation:** Holds one note while shifting the harmony around it\n\nModulation is used to create large-scale contrast and energy. A key change can inject new life into a song, raise excitement, or shift the emotional landscape.`,
      },
      {
        type: 'quiz',
        question: 'What is a pivot chord?',
        options: ['A chord that is very loud', 'A chord that belongs to both the old and new key', 'A diminished chord', 'The first chord in a piece'],
        correctIndex: 1,
        explanation: 'A pivot chord belongs to both the old key and the new key, serving as a smooth bridge between them.',
      },
      {
        type: 'text',
        title: 'The Truck Driver Modulation',
        content: `The **truck driver modulation** (also called a "pump-up") is a direct modulation up by a half step or whole step, usually occurring before the final chorus of a pop song.\n\nExamples:\n- "I Wanna Dance with Somebody" (Whitney Houston) — modulates up a half step\n- "Livin' On a Prayer" (Bon Jovi) — modulates up a whole step for the final chorus\n- "Man in the Mirror" (Michael Jackson) — multiple modulations upward\n\nWhile some consider it a cheap trick, it undeniably generates excitement. The sudden key change re-energizes the listener's ear and creates a sense of climactic lift.\n\nMore subtle modulations (via pivot chords) are favored in classical music, jazz, and art songs.`,
      },
      {
        type: 'quiz',
        question: 'A "truck driver modulation" typically:',
        options: ['Moves down by a 5th', 'Moves up by a half step or whole step before the final chorus', 'Uses a complex pivot chord', 'Changes time signature'],
        correctIndex: 1,
        explanation: 'The truck driver modulation abruptly shifts up a half or whole step, usually before the final chorus for added excitement.',
      },
      {
        type: 'exercise',
        instruction: 'Play a modulation from C to Db: C4, E4, G4, Db4, F4, Ab4',
        expectedNotes: ['C4', 'E4', 'G4', 'Db4', 'F4', 'Ab4'],
      },
    ],
  },

  {
    id: 'counterpoint-basics',
    title: 'Counterpoint Basics',
    module: 'Advanced Harmony',
    level: 'ADVANCED',
    concepts: ['counterpoint', 'independent lines', 'species counterpoint'],
    xpReward: 50,
    order: 60,
    prerequisites: ['chord-inversions', 'building-melodies'],
    steps: [
      {
        type: 'text',
        title: 'What is Counterpoint?',
        content: `**Counterpoint** is the art of combining two or more independent melodic lines that sound good together. Unlike homophonic music (melody + chord accompaniment), counterpoint treats each voice as a melody in its own right.\n\nThe word comes from Latin "punctus contra punctum" — "point against point" or "note against note."\n\nCounterpoint reached its peak in the Baroque era with J.S. Bach, whose fugues combine up to 5 independent voices in astonishing complexity. But counterpoint principles apply to all music — any time a bass line, vocal melody, and guitar riff all have their own melodic shape, counterpoint is at work.`,
      },
      {
        type: 'text',
        title: 'Basic Rules of Counterpoint',
        content: `The fundamental guidelines for two-part counterpoint:\n\n**1. Motion types:**\n- **Contrary motion:** Lines move in opposite directions (most desirable)\n- **Oblique motion:** One line stays still while the other moves\n- **Similar motion:** Both move in the same direction (use with care)\n- **Parallel motion:** Both move by the same interval (avoid with 5ths and octaves)\n\n**2. Consonant intervals:** 3rds, 6ths, 5ths, and octaves on strong beats.\n\n**3. Independence:** Each line should be interesting on its own — different rhythms, different contours.\n\n**4. No parallel 5ths or octaves:** This rule prevents the lines from losing independence.`,
      },
      {
        type: 'quiz',
        question: 'Which type of motion is most desirable in counterpoint?',
        options: ['Parallel motion', 'Similar motion', 'Contrary motion', 'No motion'],
        correctIndex: 2,
        explanation: 'Contrary motion (lines moving in opposite directions) is the most desirable because it maximizes independence.',
      },
      {
        type: 'quiz',
        question: 'Why are parallel 5ths and octaves avoided in counterpoint?',
        options: ['They sound bad', 'They make the lines lose their independence', 'They are too loud', 'They are physically impossible'],
        correctIndex: 1,
        explanation: 'Parallel 5ths/octaves cause the two lines to fuse together perceptually, losing their melodic independence.',
      },
      {
        type: 'exercise',
        instruction: 'Play two voices in contrary motion: top goes up (C4, D4, E4), bottom goes down (G4, F4, E4)',
        expectedNotes: ['C4', 'G4', 'D4', 'F4', 'E4', 'E4'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 10: COMPOSITION & MASTERY (ADVANCED, lessons 61-65)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'song-structure',
    title: 'Song Structure',
    module: 'Composition & Mastery',
    level: 'ADVANCED',
    concepts: ['verse', 'chorus', 'bridge', 'song forms'],
    xpReward: 40,
    order: 61,
    prerequisites: ['phrasing', 'one-four-five'],
    steps: [
      {
        type: 'text',
        title: 'Common Song Forms',
        content: `Most songs follow one of several established structures:\n\n**Verse-Chorus (ABAB):** Verse → Chorus → Verse → Chorus. The simplest and most common pop structure.\n\n**Verse-Chorus-Bridge (ABABCB):** Verse → Chorus → Verse → Chorus → Bridge → Chorus. The bridge provides contrast.\n\n**AABA (32-bar form):** A (8 bars) → A (8) → B (8, the bridge) → A (8). The form of jazz standards like "Over the Rainbow" and "I Got Rhythm."\n\n**Through-composed:** No repeating sections — the music continuously develops. Common in classical art songs and some progressive rock.\n\nThe **verse** tells the story (lyrics change each time). The **chorus** is the hook (lyrics stay the same). The **bridge** provides contrast and fresh energy.`,
      },
      {
        type: 'quiz',
        question: 'In a standard Verse-Chorus-Bridge form, what letter represents the bridge?',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 2,
        explanation: 'In ABABCB form, A = verse, B = chorus, C = bridge. The bridge is the contrasting third section.',
      },
      {
        type: 'text',
        title: 'Building Effective Sections',
        content: `Each section of a song serves a purpose:\n\n**Intro:** Sets the mood, establishes the groove. Can be instrumental or use elements from the verse/chorus.\n\n**Verse:** Lower energy, storytelling, builds toward the chorus. Often uses a narrower vocal range and simpler harmonies.\n\n**Pre-chorus:** Optional; creates a transition and builds anticipation. Often a short 2-4 bar section with rising melody or building dynamics.\n\n**Chorus:** The emotional peak, the hook, the most memorable part. Higher energy, fuller arrangement, catchiest melody.\n\n**Bridge:** Contrast in every way — different chords, different melody, different rhythm. Refreshes the listener's ear.\n\n**Outro:** Wraps the song. Can fade out, end abruptly, or return to intro material.`,
      },
      {
        type: 'quiz',
        question: 'What is the purpose of a bridge in a song?',
        options: ['To repeat the chorus', 'To provide contrast and refresh the listener', 'To introduce new instruments', 'To slow down the tempo'],
        correctIndex: 1,
        explanation: 'The bridge provides contrast — different chords, melody, and energy — to refresh the listener before the final chorus.',
      },
      {
        type: 'exercise',
        instruction: 'Play a verse-type progression (I-vi) then chorus-type (IV-V): C4, E4, G4, A4, C4, E4, F4, A4, C5, G4, B4, D5',
        expectedNotes: ['C4', 'E4', 'G4', 'A4', 'C4', 'E4', 'F4', 'A4', 'C5', 'G4', 'B4', 'D5'],
      },
    ],
  },

  {
    id: 'arranging-instruments',
    title: 'Arranging for Multiple Instruments',
    module: 'Composition & Mastery',
    level: 'ADVANCED',
    concepts: ['arranging', 'voicing', 'texture', 'orchestration'],
    xpReward: 50,
    order: 62,
    prerequisites: ['counterpoint-basics', 'song-structure'],
    steps: [
      {
        type: 'text',
        title: 'The Art of Arranging',
        content: `**Arranging** is the craft of deciding which instruments play what, when, and how. A great arrangement transforms a simple song into a rich, layered listening experience.\n\nKey principles:\n\n- **Register:** Assign parts to instruments in their comfortable range. Bass instruments play low, melody instruments play in a singable range.\n- **Doubling:** Having two instruments play the same part adds richness (e.g., violin + flute on the melody).\n- **Texture:** Vary between thick (many instruments playing) and thin (solo instrument) sections for contrast.\n- **Rhythm section vs. melodic instruments:** The rhythm section (drums, bass, piano/guitar) provides the foundation while melodic instruments (voice, horns, strings) deliver the melody and harmonies.`,
      },
      {
        type: 'text',
        title: 'Voicing for Ensembles',
        content: `When spreading a chord across multiple instruments, consider these voicing techniques:\n\n**Close voicing:** All notes within one octave. Sounds tight and punchy. Good for guitar, small combos.\n\n**Open voicing:** Notes spread across 2+ octaves. Sounds spacious and orchestral. Good for strings, full band.\n\n**Drop voicings:** Take a close voicing and drop one note down an octave. Drop 2, drop 3, and drop 2+4 are standard in jazz and big band arranging.\n\n**Unison and octaves:** Sometimes the most powerful arrangement choice is everyone playing the same melody in unison or octaves. Think of the horn hits in "Uptown Funk" or the opening of Beethoven's 5th.`,
      },
      {
        type: 'quiz',
        question: 'What is "doubling" in arranging?',
        options: ['Playing twice as fast', 'Having two instruments play the same part', 'Making the piece twice as long', 'Playing twice as loud'],
        correctIndex: 1,
        explanation: 'Doubling means two or more instruments play the same part (unison or octaves), adding richness and fullness.',
      },
      {
        type: 'quiz',
        question: 'To create contrast in an arrangement, you should vary:',
        options: ['Only the tempo', 'Only the key', 'Texture (thick vs. thin), dynamics, and instrumentation', 'Only the lyrics'],
        correctIndex: 2,
        explanation: 'Great arrangements vary texture, dynamics, and instrumentation to create contrast between sections.',
      },
      {
        type: 'exercise',
        instruction: 'Play a chord in close voicing (C-E-G-B) then open voicing (C-G-E-B): C4, E4, G4, B4, C4, G4, E5, B5',
        expectedNotes: ['C4', 'E4', 'G4', 'B4', 'C4', 'G4', 'E5', 'B5'],
      },
    ],
  },

  {
    id: 'analyzing-songs',
    title: 'Analyzing Songs',
    module: 'Composition & Mastery',
    level: 'ADVANCED',
    concepts: ['harmonic analysis', 'Roman numerals', 'form analysis'],
    xpReward: 45,
    order: 63,
    prerequisites: ['secondary-dominants', 'song-structure'],
    steps: [
      {
        type: 'text',
        title: 'How to Analyze a Song',
        content: `Song analysis breaks a piece into its component parts to understand how it works. Here is a systematic approach:\n\n**Step 1 — Determine the key:** Look at the key signature, the first and last chords, and the overall "home" note.\n\n**Step 2 — Label the chords with Roman numerals:** Assign I, ii, iii, IV, V, vi, vii° based on the key. Identify any chords outside the key (secondary dominants, borrowed chords, etc.).\n\n**Step 3 — Map the form:** Label sections (verse, chorus, bridge, intro, outro). Note how many bars each section is.\n\n**Step 4 — Analyze the melody:** Identify the scale, note the contour, find the climax, observe how the melody relates to the chords beneath it.`,
      },
      {
        type: 'text',
        title: 'Analysis Example: "Let It Be"',
        content: `**Key:** C major\n\n**Chord progression (verse + chorus):** C - G - Am - F | C - G - F - C\n\n**Roman numerals:** I - V - vi - IV | I - V - IV - I\n\nThis is the "axis progression" (I-V-vi-IV) — one of the most common in pop music. The second half reverses the direction: I-V-IV-I.\n\n**Form:** Intro → Verse → Verse → Chorus → Verse → Chorus → Solo → Verse → Chorus → Outro\n\n**Observations:**\n- The melody primarily uses chord tones and stepwise motion\n- The highest note appears at the emotional peak of the chorus\n- The harmonic rhythm is 2 beats per chord\n- Borrowed chords: none — the harmony stays entirely diatonic, which contributes to its timeless simplicity`,
      },
      {
        type: 'quiz',
        question: 'The first step in analyzing a song is:',
        options: ['Count the measures', 'Determine the key', 'Find the tempo', 'Name the instruments'],
        correctIndex: 1,
        explanation: 'Determining the key is the essential first step — everything else (Roman numerals, scale analysis) depends on knowing the key.',
      },
      {
        type: 'quiz',
        question: 'The progression I-V-vi-IV is notable because:',
        options: ['It is rarely used', 'It is one of the most common progressions in pop music', 'It only works in C major', 'It requires 7th chords'],
        correctIndex: 1,
        explanation: 'I-V-vi-IV is one of the most used progressions in pop music, appearing in hundreds of hits.',
      },
      {
        type: 'exercise',
        instruction: 'Play the "Let It Be" progression in C: C4, G4, A4, F4, C4',
        expectedNotes: ['C4', 'G4', 'A4', 'F4', 'C4'],
      },
    ],
  },

  {
    id: 'writing-your-own-song',
    title: 'Writing Your Own Song',
    module: 'Composition & Mastery',
    level: 'ADVANCED',
    concepts: ['songwriting', 'composition process', 'creativity'],
    xpReward: 50,
    order: 64,
    prerequisites: ['analyzing-songs', 'building-melodies'],
    steps: [
      {
        type: 'text',
        title: 'Starting Your Song',
        content: `There is no single "right" way to write a song, but here are proven starting points:\n\n**Chords first:** Pick a progression (I-V-vi-IV, ii-V-I, or something more adventurous). Play it on loop and hum melodies until something sticks. This is how most pop and rock songs are written.\n\n**Melody first:** Sing or play a melodic idea — even just a few notes. Then find chords that support it. This often produces more original, memorable melodies.\n\n**Lyrics first:** Start with words, a story, or an emotion. Find the natural rhythm of the words, then build a melody around them.\n\n**Riff first:** Write a catchy instrumental hook (guitar riff, bass line, synth pattern) and build the song around it.`,
      },
      {
        type: 'text',
        title: 'The Songwriting Process',
        content: `A practical songwriting workflow:\n\n**1. Generate ideas:** Record voice memos. Play random chords. Write word lists. Do not judge — just create.\n\n**2. Develop the hook:** Find the strongest 2-4 bar idea and make it the center of your chorus.\n\n**3. Build sections:** Write a verse that contrasts with the chorus (lower energy, different melody, story-telling). Write a bridge if needed (new chords, new perspective).\n\n**4. Arrange:** Decide on instrumentation, texture, and dynamics for each section.\n\n**5. Edit ruthlessly:** Remove anything that does not serve the song. Simplify. The best songs feel inevitable.\n\n**6. Get feedback:** Play it for someone. Notice where their attention drifts. Revise those moments.`,
      },
      {
        type: 'quiz',
        question: 'Which of these is NOT a common songwriting starting point?',
        options: ['Chords first', 'Melody first', 'Time signature first', 'Lyrics first'],
        correctIndex: 2,
        explanation: 'Chords-first, melody-first, and lyrics-first are the three most common approaches. Starting from a time signature is unusual.',
      },
      {
        type: 'quiz',
        question: 'What is the most important quality of a great chorus?',
        options: ['Complexity', 'Memorability (the hook)', 'Length', 'Quiet dynamics'],
        correctIndex: 1,
        explanation: 'The chorus needs to be memorable — the hook. It is the part people sing along to and remember.',
      },
      {
        type: 'exercise',
        instruction: 'Play a simple chord progression to start a song: C4, E4, G4, A4, C4, E4, F4, A4, C5, G4, B4, D5',
        expectedNotes: ['C4', 'E4', 'G4', 'A4', 'C4', 'E4', 'F4', 'A4', 'C5', 'G4', 'B4', 'D5'],
      },
    ],
  },

  {
    id: 'advanced-improvisation',
    title: 'Advanced Improvisation',
    module: 'Composition & Mastery',
    level: 'ADVANCED',
    concepts: ['target notes', 'enclosures', 'motivic development'],
    xpReward: 50,
    order: 65,
    prerequisites: ['chord-scale-theory', 'jazz-ii-v-i', 'building-melodies'],
    steps: [
      {
        type: 'text',
        title: 'Beyond Scale Running',
        content: `Beginning improvisers tend to run up and down scales. Advanced improvisers tell stories with their solos. Here are the techniques that separate amateur from professional:\n\n**Target notes:** Instead of noodling through a scale, aim for specific chord tones on strong beats. Plan your lines so that when the chord changes, you land on a strong note (the 3rd or 7th of the new chord). Everything in between is just a path to that target.\n\n**Guide tone lines:** Trace the 3rds and 7ths through the chord changes. This creates a smooth, melodic foundation that you can ornament.\n\n**Motivic development:** State a short rhythmic/melodic idea, then transform it — transpose it, invert it, augment it, fragment it. This creates coherent solos that sound composed rather than random.`,
      },
      {
        type: 'text',
        title: 'Enclosures and Chromaticism',
        content: `**Enclosures** approach a target note from both above and below before landing on it. They add chromaticism and sophistication:\n\n- **Diatonic enclosure:** Target C → approach from D above and B below: D, B, **C**\n- **Chromatic enclosure:** Target C → approach from Db above and B below: Db, B, **C**\n- **Double enclosure:** Two notes from each side: D, Db, B, **C**\n\nEnclosures are a hallmark of bebop and modern jazz. Charlie Parker, Dizzy Gillespie, and John Coltrane all used them extensively.\n\nOther advanced concepts:\n- **Digital patterns:** Sequences like 1-2-3-5 through chord changes\n- **Superimposition:** Implying a different chord over what the band is playing\n- **Rhythmic displacement:** Shifting a melodic pattern to start on a different beat`,
      },
      {
        type: 'quiz',
        question: 'A chromatic enclosure approaching C would be:',
        options: ['D, C, B', 'Db, B, C', 'E, D, C', 'C, B, A'],
        correctIndex: 1,
        explanation: 'A chromatic enclosure approaches the target from a half step above and a half step below: Db (above), B (below), C (target).',
      },
      {
        type: 'quiz',
        question: 'What distinguishes advanced improvisation from beginner improvisation?',
        options: ['Playing faster', 'Using only pentatonic scales', 'Using target notes, motivic development, and storytelling', 'Playing louder'],
        correctIndex: 2,
        explanation: 'Advanced improvisation uses target notes, motivic development, and musical storytelling rather than simply running scales.',
      },
      {
        type: 'exercise',
        instruction: 'Play a chromatic enclosure targeting E4: F4, D#4, E4, then targeting C4: Db4, B3, C4',
        expectedNotes: ['F4', 'D#4', 'E4', 'Db4', 'B3', 'C4'],
      },
      {
        type: 'exercise',
        instruction: 'Play a target-note line over ii-V-I in C — land on chord tones: F4, E4, B4, A4, G4, E4',
        expectedNotes: ['F4', 'E4', 'B4', 'A4', 'G4', 'E4'],
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
