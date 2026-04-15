/**
 * Terminology map: replaces music jargon with kid-friendly language
 * when ageMode === 'kids'.
 */
export const KIDS_TERMINOLOGY: Record<string, string> = {
  // Chord types
  'major': 'happy',
  'minor': 'sad',
  'diminished': 'spooky',
  'augmented': 'mysterious',
  'dominant': 'bluesy',

  // Intervals
  'interval': 'distance between notes',
  'semitone': 'tiny step',
  'whole step': 'big step',
  'half step': 'tiny step',
  'octave': 'same note, higher up',

  // Scale stuff
  'scale': 'note ladder',
  'mode': 'special note ladder',
  'pentatonic': '5-note ladder',
  'chromatic': 'every-single-note ladder',

  // Chord concepts
  'triad': '3-note team',
  'root': 'home note',
  'chord progression': 'chord recipe',
  'inversion': 'same notes, different order',
  'voicing': 'different way to play it',
  'voice leading': 'smooth movement between chords',

  // Rhythm
  'BPM': 'speed',
  'tempo': 'speed',
  'time signature': 'beat pattern',
  'measure': 'group of beats',
  'bar': 'group of beats',
  'syncopation': 'off-beat surprise',

  // General
  'theory': 'music science',
  'harmony': 'notes that sound good together',
  'melody': 'the singable part',
  'dynamics': 'loud and soft',
  'resolution': 'coming home',
  'tension': 'feeling of wanting to go somewhere',
}

/**
 * Replace music terms with kid-friendly equivalents in a text string.
 */
export function kidsify(text: string): string {
  let result = text
  // Sort by length (longest first) to avoid partial replacements
  const terms = Object.entries(KIDS_TERMINOLOGY).sort((a, b) => b[0].length - a[0].length)
  for (const [term, replacement] of terms) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi')
    result = result.replace(regex, `${replacement}`)
  }
  return result
}

/**
 * Mascot messages - contextual encouragement and tips from the mascot character.
 */
export const MASCOT_MESSAGES: Record<string, string[]> = {
  welcome: [
    "Hi there! I'm Melody! Let's make some music! 🎵",
    "Ready to learn something awesome today?",
    "Music is like a superpower - let's unlock yours!",
  ],
  correct: [
    "You got it! Amazing! ⭐",
    "That's right! You're a natural!",
    "Woohoo! Keep going!",
    "Yes! Your brain is a music machine!",
  ],
  incorrect: [
    "Oops! That's okay - try again!",
    "Not quite, but you're learning! That's what matters!",
    "Hmm, close! Give it another shot!",
  ],
  encouragement: [
    "You're doing great! Don't give up!",
    "Every musician started just like you!",
    "Practice makes awesome!",
    "I believe in you! Let's keep going!",
  ],
  streak: [
    "You've been practicing every day! That's incredible!",
    "Your streak is on fire! 🔥",
    "Showing up every day is the real secret to music!",
  ],
  levelUp: [
    "LEVEL UP! You're getting so good!",
    "New level unlocked! You're a star! ⭐",
    "Look at you go! Higher and higher!",
  ],
}

export function getRandomMascotMessage(category: keyof typeof MASCOT_MESSAGES): string {
  const messages = MASCOT_MESSAGES[category]
  return messages[Math.floor(Math.random() * messages.length)]
}
