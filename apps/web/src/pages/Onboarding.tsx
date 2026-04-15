import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/userStore'
import { useUIStore } from '@/stores/uiStore'
import type { AgeGroup, InstrumentType, SkillLevel, AgeMode } from '@moniquemusic/shared-types'

type Step = 'age' | 'instrument' | 'quiz' | 'done'

// Skill assessment questions - each correct answer adds points
const QUIZ_QUESTIONS = [
  {
    question: 'How many notes are in a major scale?',
    options: ['5', '7', '12', 'I don\'t know'],
    points: [0, 2, 1, 0], // 7 is correct (2 pts), 12 shows some knowledge (1 pt)
  },
  {
    question: 'What notes make up a C major chord?',
    options: ['C, D, E', 'C, E, G', 'C, F, G', 'I don\'t know'],
    points: [0, 2, 1, 0],
  },
  {
    question: 'What does "BPM" stand for?',
    options: ['Beats Per Measure', 'Beats Per Minute', 'Bass Per Melody', 'I don\'t know'],
    points: [1, 2, 0, 0],
  },
  {
    question: 'What is a chord inversion?',
    options: ['Playing a chord backwards', 'Same chord with a different note on the bottom', 'A minor version of a major chord', 'I don\'t know'],
    points: [0, 2, 0, 0],
  },
  {
    question: 'What is a ii-V-I progression?',
    options: ['A blues riff', 'A common jazz chord progression', 'A scale pattern', 'I don\'t know'],
    points: [0, 2, 0, 0],
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { setAgeGroup, setInstrument, setSkillLevel } = useUserStore()
  const { setAgeMode } = useUIStore()

  const [step, setStep] = useState<Step>('age')
  const [_age, setAge] = useState<AgeGroup | null>(null)
  const [_instrument, setInstrumentLocal] = useState<InstrumentType | null>(null)
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizScore, setQuizScore] = useState(0)

  function handleAge(group: AgeGroup) {
    setAge(group)
    setAgeGroup(group)
    const mode: AgeMode = group === 'KIDS' ? 'kids' : group === 'SENIOR' ? 'accessible' : 'adult'
    setAgeMode(mode)
    setStep('instrument')
  }

  function handleInstrument(inst: InstrumentType) {
    setInstrumentLocal(inst)
    setInstrument(inst)
    setStep('quiz')
    setQuizIdx(0)
    setQuizScore(0)
  }

  function handleQuizAnswer(points: number) {
    const newScore = quizScore + points
    setQuizScore(newScore)

    if (quizIdx + 1 >= QUIZ_QUESTIONS.length) {
      // Calculate skill level from total score
      // Max possible: 10 points (5 questions × 2 pts each)
      const level: SkillLevel = newScore >= 7 ? 'ADVANCED' : newScore >= 3 ? 'INTERMEDIATE' : 'BEGINNER'
      setSkillLevel(level)
      setStep('done')
      setTimeout(() => navigate('/dashboard'), 800)
    } else {
      setQuizIdx(quizIdx + 1)
    }
  }

  const btnClass =
    'flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-surface-200 bg-white hover:border-primary-400 hover:bg-primary-50 cursor-pointer transition-all text-center'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-500/10 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl">🎵</span>
          <h1 className="text-2xl font-bold text-primary-700 mt-2">MoniqueMusic</h1>
        </div>

        {step === 'age' && (
          <div>
            <h2 className="text-2xl font-bold text-center text-surface-900 mb-2">How old are you?</h2>
            <p className="text-surface-500 text-center mb-8">We'll tailor the experience just for you.</p>
            <div className="grid grid-cols-3 gap-4">
              <button className={btnClass} onClick={() => handleAge('KIDS')}>
                <span className="text-4xl">🧒</span>
                <span className="font-bold">8–12</span>
                <span className="text-xs text-surface-500">Junior</span>
              </button>
              <button className={btnClass} onClick={() => handleAge('ADULT')}>
                <span className="text-4xl">🧑</span>
                <span className="font-bold">13–59</span>
                <span className="text-xs text-surface-500">Adult</span>
              </button>
              <button className={btnClass} onClick={() => handleAge('SENIOR')}>
                <span className="text-4xl">👴</span>
                <span className="font-bold">60+</span>
                <span className="text-xs text-surface-500">Senior</span>
              </button>
            </div>
          </div>
        )}

        {step === 'instrument' && (
          <div>
            <h2 className="text-2xl font-bold text-center text-surface-900 mb-2">Pick your instrument</h2>
            <p className="text-surface-500 text-center mb-8">You can change this later in Settings.</p>
            <div className="grid grid-cols-3 gap-4">
              <button className={btnClass} onClick={() => handleInstrument('PIANO')}>
                <span className="text-4xl">🎹</span>
                <span className="font-bold">Piano</span>
              </button>
              <button className={btnClass} onClick={() => handleInstrument('GUITAR')}>
                <span className="text-4xl">🎸</span>
                <span className="font-bold">Guitar</span>
              </button>
              <button className={btnClass} onClick={() => handleInstrument('GENERAL')}>
                <span className="text-4xl">🎼</span>
                <span className="font-bold">Other</span>
              </button>
            </div>
          </div>
        )}

        {step === 'quiz' && (() => {
          const q = QUIZ_QUESTIONS[quizIdx]
          return (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-surface-900">Quick Assessment</h2>
                <span className="text-sm text-surface-400">{quizIdx + 1}/{QUIZ_QUESTIONS.length}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-surface-100 rounded-full h-1.5 mb-6">
                <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${(quizIdx / QUIZ_QUESTIONS.length) * 100}%` }} />
              </div>
              <p className="text-lg font-medium text-surface-900 mb-6">{q.question}</p>
              <div className="space-y-3">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(q.points[i])}
                    className={`${btnClass} w-full text-left`}
                  >
                    <span className="font-medium">{opt}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-surface-400 text-center mt-6">
                No wrong answers - this just helps us personalize your experience
              </p>
            </div>
          )
        })()}

        {step === 'done' && (
          <div className="text-center">
            <span className="text-6xl">🎉</span>
            <h2 className="text-2xl font-bold text-surface-900 mt-4">You're all set!</h2>
            <p className="text-surface-500 mt-2">Taking you to your dashboard…</p>
          </div>
        )}
      </div>
    </div>
  )
}
