import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/userStore'
import { useUIStore } from '@/stores/uiStore'
import type { AgeGroup, InstrumentType, SkillLevel, AgeMode } from '@melodypath/shared-types'

type Step = 'age' | 'instrument' | 'skill' | 'done'

export default function Onboarding() {
  const navigate = useNavigate()
  const { setAgeGroup, setInstrument, setSkillLevel } = useUserStore()
  const { setAgeMode } = useUIStore()

  const [step, setStep] = useState<Step>('age')
  const [_age, setAge] = useState<AgeGroup | null>(null)
  const [_instrument, setInstrumentLocal] = useState<InstrumentType | null>(null)

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
    setStep('skill')
  }

  function handleSkill(level: SkillLevel) {
    setSkillLevel(level)
    setStep('done')
    setTimeout(() => navigate('/dashboard'), 800)
  }

  const btnClass =
    'flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-surface-200 bg-white hover:border-primary-400 hover:bg-primary-50 cursor-pointer transition-all text-center'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-500/10 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl">🎵</span>
          <h1 className="text-2xl font-bold text-primary-700 mt-2">MelodyPath</h1>
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

        {step === 'skill' && (
          <div>
            <h2 className="text-2xl font-bold text-center text-surface-900 mb-2">Where are you on your journey?</h2>
            <p className="text-surface-500 text-center mb-8">Be honest — there's no wrong answer!</p>
            <div className="space-y-4">
              <button className={`${btnClass} w-full flex-row justify-start gap-4 text-left`} onClick={() => handleSkill('BEGINNER')}>
                <span className="text-3xl">🌱</span>
                <div>
                  <div className="font-bold">Beginner</div>
                  <div className="text-sm text-surface-500">Just starting out, or haven't played in years</div>
                </div>
              </button>
              <button className={`${btnClass} w-full flex-row justify-start gap-4 text-left`} onClick={() => handleSkill('INTERMEDIATE')}>
                <span className="text-3xl">🌿</span>
                <div>
                  <div className="font-bold">Intermediate</div>
                  <div className="text-sm text-surface-500">I know some chords and can play basic songs</div>
                </div>
              </button>
              <button className={`${btnClass} w-full flex-row justify-start gap-4 text-left`} onClick={() => handleSkill('ADVANCED')}>
                <span className="text-3xl">🌳</span>
                <div>
                  <div className="font-bold">Advanced</div>
                  <div className="text-sm text-surface-500">Comfortable with scales, modes, and complex music</div>
                </div>
              </button>
            </div>
          </div>
        )}

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
