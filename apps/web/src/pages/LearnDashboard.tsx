import { Link } from 'react-router-dom'
import { LESSONS, isLessonUnlocked } from '@/lib/lessons/lessonData'
import { useLessonStore } from '@/stores/lessonStore'

export default function LearnDashboard() {
  const { completedLessons, completedIds } = useLessonStore()
  const completed = completedIds()

  // Group by module
  const modules = new Map<string, typeof LESSONS>()
  for (const lesson of LESSONS) {
    const group = modules.get(lesson.module) ?? []
    group.push(lesson)
    modules.set(lesson.module, group)
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Learn</h1>
        <p className="text-surface-500 text-sm mt-1">
          Complete lessons in order to unlock new topics. Each lesson builds on the last.
        </p>
        <div className="mt-2 text-sm text-surface-400">
          {completed.size} / {LESSONS.length} lessons completed
        </div>
      </div>

      {Array.from(modules.entries()).map(([moduleName, lessons]) => (
        <div key={moduleName}>
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-3">
            {moduleName}
          </h2>
          <div className="space-y-2">
            {lessons.map((lesson, i) => {
              const isComplete = completed.has(lesson.id)
              const unlocked = isLessonUnlocked(lesson.id, completed)
              const score = completedLessons[lesson.id]?.score

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
                          : 'bg-white border-surface-200 hover:border-primary-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-surface-900">{lesson.title}</div>
                          <div className="text-xs text-surface-500 mt-0.5">
                            {lesson.concepts.join(' · ')} · +{lesson.xpReward} XP
                          </div>
                        </div>
                        {isComplete && score !== undefined && (
                          <div className="text-sm font-bold text-timing-perfect">{score}%</div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex-1 rounded-xl border border-surface-200 bg-surface-50 p-4 opacity-60">
                      <div className="font-bold text-surface-500">{lesson.title}</div>
                      <div className="text-xs text-surface-400 mt-0.5">
                        Complete "{LESSONS.find((l) => l.id === lesson.prerequisites[0])?.title}" to unlock
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
