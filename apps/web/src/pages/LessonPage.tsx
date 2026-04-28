import { useState, useCallback, useMemo, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getLessonById, LESSONS, isLessonUnlocked, type LessonStep } from '@/lib/lessons/lessonData'
import { useLessonStore } from '@/stores/lessonStore'
import { useUserStore } from '@/stores/userStore'
import { useAudioInit } from '@/hooks/useAudioInit'
import { useAudioStore } from '@/stores/audioStore'
import PianoKeyboard from '@/components/Piano/PianoKeyboard'
import LessonContent from '@/components/Learn/LessonContent'
import Mascot from '@/components/ui/Mascot'
import { useUIStore } from '@/stores/uiStore'
import { kidsify } from '@/lib/kidsMode'
import { buildGlossaryRegex } from '@/lib/glossary'
import { makeTokenizer, tokenizeBlocks, type ContentNode } from '@/lib/lessonRender'
import { useIsAdmin } from '@/hooks/useUnlocks'

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const lesson = getLessonById(lessonId ?? '')
  const markComplete = useLessonStore((s) => s.markComplete)
  const addXP = useUserStore((s) => s.addXP)
  const recordPractice = useUserStore((s) => s.recordPractice)
  const checkAndAwardBadges = useUserStore((s) => s.checkAndAwardBadges)
  const ageMode = useUIStore((s) => s.ageMode)
  const isKids = ageMode === 'kids'
  const { ensureAudio } = useAudioInit()
  const engine = useAudioStore((s) => s.engine)

  const [stepIdx, setStepIdx] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({}) // stepIdx → selected option
  const [exerciseNotes, setExerciseNotes] = useState<string[]>([])

  const pianoScrollRef = useRef<HTMLDivElement>(null)
  const scrollPiano = useCallback((direction: -1 | 1) => {
    const el = pianoScrollRef.current
    if (!el) return
    el.scrollBy({ left: direction * 240, behavior: 'smooth' })
  }, [])
  const [exerciseComplete, setExerciseComplete] = useState(false)
  const [finished, setFinished] = useState(false)

  if (!lesson) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-surface-900 mb-4">Lesson Not Found</h1>
        <Link to="/learn" className="text-primary-600 hover:underline">Back to Lessons</Link>
      </div>
    )
  }

  const completedLessons = useLessonStore((s) => s.completedLessons)
  const isAdmin = useIsAdmin()

  // Pre-tokenize the lesson once — bold and glossary highlights are deduped
  // across the whole lesson (first occurrence only), and any term whose
  // teaching lesson IS this lesson is left plain (we're introducing it).
  const renderedSteps = useMemo(() => {
    const completed = new Set(Object.keys(completedLessons))
    const { regex, entryFor } = buildGlossaryRegex(completed, { assumeAllUnlocked: isAdmin })
    const lessonOrderById: Record<string, number> = {}
    for (const l of LESSONS) lessonOrderById[l.id] = l.order
    const tokenizer = makeTokenizer(regex, entryFor, {
      currentLessonOrder: lesson.order,
      lessonOrderById,
    })
    return lesson.steps.map((step) => {
      if (step.type === 'text') {
        const content = isKids ? kidsify(step.content) : step.content
        return { step, contentBlocks: tokenizeBlocks(content, tokenizer) }
      }
      if (step.type === 'quiz') {
        return {
          step,
          questionBlocks: tokenizeBlocks(step.question, tokenizer),
          explanationBlocks: tokenizeBlocks(step.explanation, tokenizer),
        }
      }
      if (step.type === 'exercise') {
        return { step, instructionBlocks: tokenizeBlocks(step.instruction, tokenizer) }
      }
      return { step }
    })
  }, [lesson, completedLessons, isAdmin, isKids])

  const totalSteps = renderedSteps.length
  const currentRendered = renderedSteps[stepIdx] as
    | (typeof renderedSteps)[number]
    | undefined
  const currentStep = currentRendered?.step as LessonStep | undefined
  const progress = ((stepIdx + 1) / totalSteps) * 100

  // Count correct quiz answers
  const quizScore = useMemo(() => {
    let correct = 0
    let total = 0
    for (let i = 0; i < renderedSteps.length; i++) {
      const r = renderedSteps[i]
      if (r.step.type === 'quiz') {
        total++
        if (quizAnswers[i] === r.step.correctIndex) correct++
      }
    }
    return total > 0 ? Math.round((correct / total) * 100) : 100
  }, [quizAnswers, renderedSteps])

  // ─── Navigation ─────────────────────────────────────────────────────

  const canAdvance = useCallback(() => {
    if (!currentStep) return false
    if (currentStep.type === 'text') return true
    if (currentStep.type === 'quiz') return quizAnswers[stepIdx] !== undefined
    if (currentStep.type === 'exercise') return exerciseComplete
    return false
  }, [currentStep, stepIdx, quizAnswers, exerciseComplete])

  const nextStep = useCallback(() => {
    if (stepIdx < totalSteps - 1) {
      setStepIdx(stepIdx + 1)
      setExerciseNotes([])
      setExerciseComplete(false)
    } else {
      // Lesson complete
      markComplete(lesson.id, quizScore)
      addXP(lesson.xpReward)
      recordPractice()
      const lessonsCompleted = useLessonStore.getState().completedIds().size
      checkAndAwardBadges({ lessonsCompleted })
      setFinished(true)
    }
  }, [stepIdx, totalSteps, lesson, quizScore, markComplete, addXP, recordPractice, checkAndAwardBadges])

  // ─── Quiz handler ───────────────────────────────────────────────────

  const selectQuizAnswer = useCallback((optionIdx: number) => {
    if (quizAnswers[stepIdx] !== undefined) return // already answered
    setQuizAnswers((prev) => ({ ...prev, [stepIdx]: optionIdx }))
  }, [stepIdx, quizAnswers])

  // ─── Exercise handler ───────────────────────────────────────────────

  const handleExerciseNote = useCallback(async (note: string) => {
    await ensureAudio()
    engine.playNote(note, '8n')

    if (currentStep?.type !== 'exercise') return
    const expected = currentStep.expectedNotes

    setExerciseNotes((prev) => {
      const next = [...prev, note]
      // Check if the sequence matches so far
      const correct = next.every((n, i) => i < expected.length && n === expected[i])
      if (!correct) {
        // Reset on wrong note
        return [note]
      }
      if (next.length === expected.length) {
        setExerciseComplete(true)
      }
      return next
    })
  }, [ensureAudio, engine, currentStep])

  // ─── Finished screen ────────────────────────────────────────────────

  if (finished) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-2xl font-bold text-surface-900">Lesson Complete!</h1>
        <div className="text-lg text-surface-600">{lesson.title}</div>
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-primary-600">+{lesson.xpReward}</div>
            <div className="text-xs text-surface-400">XP Earned</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-extrabold text-timing-perfect">{quizScore}%</div>
            <div className="text-xs text-surface-400">Quiz Score</div>
          </div>
        </div>
        {/* Suggested next actions */}
        {(() => {
          const completed = useLessonStore.getState().completedIds()
          completed.add(lesson.id) // include the one we just finished
          const nextLesson = LESSONS.find((l) => l.id !== lesson.id && !completed.has(l.id) && isLessonUnlocked(l.id, completed))
          const relatedConcepts = lesson.concepts

          return (
            <div className="space-y-3 mt-4">
              {/* Next lesson */}
              {nextLesson ? (
                <Link
                  to={`/learn/${nextLesson.id}`}
                  className="w-full flex items-center justify-between px-5 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700"
                >
                  <span>Next: {nextLesson.title}</span>
                  <span>→</span>
                </Link>
              ) : (
                <Link
                  to="/learn"
                  className="w-full block text-center px-5 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700"
                >
                  All lessons complete! View progress
                </Link>
              )}

              {/* Related practice suggestions */}
              <div className="flex flex-wrap gap-2 justify-center">
                {relatedConcepts.some((c) => c.includes('chord')) && (
                  <Link to="/explore/chords" className="px-4 py-2 bg-surface-100 text-surface-700 text-sm rounded-lg hover:bg-surface-200">
                    Practice Chords →
                  </Link>
                )}
                {relatedConcepts.some((c) => c.includes('scale') || c.includes('minor') || c.includes('major')) && (
                  <Link to="/explore/scales" className="px-4 py-2 bg-surface-100 text-surface-700 text-sm rounded-lg hover:bg-surface-200">
                    Explore Scales →
                  </Link>
                )}
                <Link to="/challenges" className="px-4 py-2 bg-surface-100 text-surface-700 text-sm rounded-lg hover:bg-surface-200">
                  Test Yourself →
                </Link>
              </div>

              {/* Retry */}
              <button
                onClick={() => { setStepIdx(0); setQuizAnswers({}); setExerciseNotes([]); setExerciseComplete(false); setFinished(false) }}
                className="w-full px-5 py-2 text-sm text-surface-500 hover:text-surface-700"
              >
                Retry this lesson
              </button>
            </div>
          )
        })()}
      </div>
    )
  }

  // ─── Render step ────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-surface-400 uppercase tracking-wider">{lesson.module}</div>
          <h1 className="text-xl font-bold text-surface-900">{lesson.title}</h1>
        </div>
        <div className="text-sm text-surface-400">
          {stepIdx + 1} / {totalSteps}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-surface-100 rounded-full h-1.5">
        <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* Kids mascot */}
      <Mascot category="encouragement" size="sm" />

      {/* Step content */}
      <div className="bg-white rounded-xl border border-surface-200 p-6 min-h-[300px]">
        {currentStep?.type === 'text' && currentRendered && 'contentBlocks' in currentRendered && (
          <div>
            <h2 className="text-lg font-bold text-surface-900 mb-4">{currentStep.title}</h2>
            <LessonContent blocks={currentRendered.contentBlocks as ContentNode[][]} />
          </div>
        )}

        {currentStep?.type === 'quiz' && currentRendered && 'questionBlocks' in currentRendered && (() => {
          const answered = quizAnswers[stepIdx] !== undefined
          const selectedIdx = quizAnswers[stepIdx]
          const isCorrect = selectedIdx === currentStep.correctIndex

          return (
            <div>
              <h2 className="text-lg font-bold text-surface-900 mb-4">
                <LessonContent blocks={currentRendered.questionBlocks as ContentNode[][]} />
              </h2>
              <div className="space-y-2">
                {currentStep.options.map((opt, i) => {
                  let style = 'bg-white border-surface-200 hover:border-primary-300'
                  if (answered) {
                    if (i === currentStep.correctIndex) style = 'bg-green-50 border-green-400 text-green-800'
                    else if (i === selectedIdx) style = 'bg-red-50 border-red-400 text-red-800'
                    else style = 'bg-surface-50 border-surface-200 opacity-60'
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => selectQuizAnswer(i)}
                      disabled={answered}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${style}`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
              {answered && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <span className="mr-1">{isCorrect ? 'Correct!' : 'Not quite.'}</span>
                  <LessonContent blocks={(currentRendered as { explanationBlocks: ContentNode[][] }).explanationBlocks} />
                </div>
              )}
            </div>
          )
        })()}

        {currentStep?.type === 'exercise' && currentRendered && 'instructionBlocks' in currentRendered && (
          <div>
            <h2 className="text-lg font-bold text-surface-900 mb-2">Exercise</h2>
            <div className="text-surface-600 mb-4">
              <LessonContent blocks={currentRendered.instructionBlocks as ContentNode[][]} />
            </div>

            {/* Progress indicator */}
            <div className="flex gap-1 mb-4">
              {currentStep.expectedNotes.map((note, i) => {
                const played = i < exerciseNotes.length
                const isCurrent = i === exerciseNotes.length
                return (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded text-sm font-mono font-bold ${
                      played ? 'bg-timing-perfect text-white' :
                      isCurrent ? 'bg-primary-100 text-primary-700 border border-primary-300' :
                      'bg-surface-100 text-surface-400'
                    }`}
                  >
                    {note}
                  </span>
                )
              })}
            </div>

            {exerciseComplete && (
              <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm font-medium">
                Great job! You played it perfectly.
              </div>
            )}

            {/* Piano for exercise */}
            <div ref={pianoScrollRef} className="overflow-x-auto pb-2">
              <PianoKeyboard
                startOctave={3}
                octaves={3}
                onNotePlay={handleExerciseNote}
                activeNotes={exerciseNotes.slice(-1)}
                highlightedNotes={currentStep.expectedNotes.map((n, i) => ({
                  note: n,
                  role: i < exerciseNotes.length ? 'root' as const : 'other' as const,
                }))}
                showLabels
              />
            </div>
            {/* Mobile scroll arrows — avoids accidentally hitting keys when navigating */}
            <div className="flex justify-center gap-3 mt-2 sm:hidden">
              <button
                type="button"
                onClick={() => scrollPiano(-1)}
                className="w-12 h-10 rounded-lg bg-white border border-surface-200 text-surface-600 hover:bg-surface-50 active:bg-surface-100 font-bold text-lg"
                aria-label="Scroll piano left"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={() => scrollPiano(1)}
                className="w-12 h-10 rounded-lg bg-white border border-surface-200 text-surface-600 hover:bg-surface-50 active:bg-surface-100 font-bold text-lg"
                aria-label="Scroll piano right"
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/learn')}
          className="text-sm text-surface-500 hover:text-surface-700"
        >
          Exit Lesson
        </button>
        <button
          onClick={nextStep}
          disabled={!canAdvance()}
          className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {stepIdx === totalSteps - 1 ? 'Complete Lesson' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
