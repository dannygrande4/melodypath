import { Link } from 'react-router-dom'
import { LESSONS, isLessonUnlocked } from '@/lib/lessons/lessonData'
import { useLessonStore } from '@/stores/lessonStore'
import { useIsAdmin } from '@/hooks/useUnlocks'
import WhatIsThis from '@/components/ui/WhatIsThis'

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: '🌱 Start here - no experience needed',
  INTERMEDIATE: '🌿 You know the basics - time to go deeper',
  ADVANCED: '🌳 Ready for music theory and advanced concepts',
}

const TIME_ESTIMATES: Record<number, string> = {
  3: '~3 min', 4: '~4 min', 5: '~5 min',
}

export default function LearnDashboard() {
  const { completedLessons, completedIds } = useLessonStore()
  const completed = completedIds()
  const isAdmin = useIsAdmin()

  // Group by module
  const modules = new Map<string, typeof LESSONS>()
  for (const lesson of LESSONS) {
    const group = modules.get(lesson.module) ?? []
    group.push(lesson)
    modules.set(lesson.module, group)
  }

  // Find the next recommended lesson
  const nextLesson = LESSONS.find((l) => !completed.has(l.id) && isLessonUnlocked(l.id, completed))

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Learn</h1>
        <p className="text-surface-500 text-sm mt-1">
          Your path from first note to advanced theory. Complete lessons to unlock the next topic.
        </p>
        <div className="mt-2 text-sm text-surface-400">
          {completed.size} / {LESSONS.length} lessons completed
        </div>
      </div>

      {/* Beginner guidance */}
      {completed.size === 0 && (
        <WhatIsThis
          explanation="Each lesson teaches you one new concept with explanations, quizzes, and hands-on exercises. Start with Lesson 1 and work your way through - or if you already know a topic, tap 'Skip ahead' to test out of it."
        />
      )}

      {/* Next up callout */}
      {nextLesson && completed.size > 0 && (
        <Link
          to={`/learn/${nextLesson.id}`}
          className="block bg-primary-50 border border-primary-200 rounded-xl p-4 hover:bg-primary-100 transition-colors"
        >
          <div className="text-xs font-bold text-primary-600 uppercase mb-1">Up Next</div>
          <div className="font-bold text-surface-900">{nextLesson.title}</div>
          <div className="text-sm text-surface-500">{nextLesson.concepts.join(' · ')}</div>
        </Link>
      )}

      {Array.from(modules.entries()).map(([moduleName, lessons]) => {
        // Determine module level
        const moduleLevel = lessons[0]?.level ?? 'BEGINNER'

        return (
          <div key={moduleName}>
            <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-1">
              {moduleName}
            </h2>
            <p className="text-xs text-surface-400 mb-3">{LEVEL_LABELS[moduleLevel] ?? ''}</p>
            <div className="space-y-2">
              {lessons.map((lesson, i) => {
                const isComplete = completed.has(lesson.id)
                const unlocked = isAdmin || isLessonUnlocked(lesson.id, completed)
                const score = completedLessons[lesson.id]?.score
                const isNext = nextLesson?.id === lesson.id
                const stepCount = lesson.steps.length
                const timeEst = TIME_ESTIMATES[stepCount] ?? `~${stepCount * 1} min`

                return (
                  <div key={lesson.id} className="flex items-center gap-3">
                    {/* Connector line */}
                    {i > 0 && (
                      <div className="w-6 flex justify-center -mt-2">
                        <div className={`w-0.5 h-4 ${isComplete || unlocked ? 'bg-primary-300' : 'bg-surface-200'}`} />
                      </div>
                    )}
                    {i === 0 && <div className="w-6" />}

                    {/* Status icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                      isComplete
                        ? 'bg-timing-perfect text-white'
                        : isNext
                          ? 'bg-primary-500 text-white animate-pulse'
                          : unlocked
                            ? 'bg-primary-500 text-white'
                            : 'bg-surface-200 text-surface-400'
                    }`}>
                      {isComplete ? '✓' : unlocked ? lesson.order : '🔒'}
                    </div>

                    {/* Lesson card */}
                    {unlocked || isComplete ? (
                      <Link
                        to={`/learn/${lesson.id}`}
                        className={`flex-1 rounded-xl border p-4 transition-all ${
                          isComplete
                            ? 'bg-green-50 border-green-200 hover:border-green-300'
                            : isNext
                              ? 'bg-white border-primary-300 shadow-sm hover:shadow-md'
                              : 'bg-white border-surface-200 hover:border-primary-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-surface-900">
                              {lesson.title}
                              {isNext && !isComplete && (
                                <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-medium">
                                  Start here
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-surface-500 mt-0.5">
                              {lesson.concepts.join(' · ')} · {timeEst} · +{lesson.xpReward} XP
                            </div>
                          </div>
                          {isComplete && score !== undefined && (
                            <div className="text-sm font-bold text-timing-perfect">{score}%</div>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="flex-1 rounded-xl border border-surface-200 bg-surface-50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="opacity-60">
                            <div className="font-bold text-surface-500">{lesson.title}</div>
                            <div className="text-xs text-surface-400 mt-0.5">
                              {lesson.concepts.join(' · ')} · {timeEst}
                            </div>
                          </div>
                          <span className="text-surface-300 text-lg flex-shrink-0">🔒</span>
                        </div>
                        <div className="text-[10px] text-surface-400 mt-1">
                          Requires: {LESSONS.find((l) => l.id === lesson.prerequisites[0])?.title}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Cross-links */}
      <div className="border-t border-surface-200 pt-6">
        <h3 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-3">Practice What You've Learned</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Link to="/challenges" className="bg-white border border-surface-200 rounded-xl p-3 text-center hover:border-primary-300 transition-colors">
            <div className="text-xl mb-1">🎯</div>
            <div className="text-sm font-medium text-surface-700">Challenges</div>
            <div className="text-[10px] text-surface-400">Test your skills</div>
          </Link>
          <Link to="/explore/chords" className="bg-white border border-surface-200 rounded-xl p-3 text-center hover:border-primary-300 transition-colors">
            <div className="text-xl mb-1">🎼</div>
            <div className="text-sm font-medium text-surface-700">Chord Explorer</div>
            <div className="text-[10px] text-surface-400">See & hear any chord</div>
          </Link>
          <Link to="/ear-training" className="bg-white border border-surface-200 rounded-xl p-3 text-center hover:border-primary-300 transition-colors">
            <div className="text-xl mb-1">👂</div>
            <div className="text-sm font-medium text-surface-700">Ear Training</div>
            <div className="text-[10px] text-surface-400">Train your musical ear</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
