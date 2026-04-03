import { useMemo } from 'react'
import { useUserStore, xpToNextLevel } from '@/stores/userStore'
import { useLessonStore } from '@/stores/lessonStore'
import { BADGES, type BadgeCheckStats } from '@/lib/badges'

const SKILL_LABELS = { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced' }
const INST_LABELS = { PIANO: 'Piano', GUITAR: 'Guitar', GENERAL: 'General' }

export default function Profile() {
  const { xp, level, streak_days, skill_level, instrument } = useUserStore()
  const { completedLessons } = useLessonStore()
  const lessonsCompleted = Object.keys(completedLessons).length

  const xpRemaining = xpToNextLevel(xp, level)

  // Compute earned badges
  const stats: BadgeCheckStats = useMemo(() => ({
    lessonsCompleted,
    songsPlayed: 0, // TODO: track from song attempts
    streakDays: streak_days,
    totalXP: xp,
    level,
    earTrainingCorrect: 0, // TODO: track
  }), [lessonsCompleted, streak_days, xp, level])

  const earnedBadges = useMemo(
    () => BADGES.filter((b) => b.condition(stats)),
    [stats],
  )

  const unearnedBadges = useMemo(
    () => BADGES.filter((b) => !b.condition(stats)),
    [stats],
  )

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 sm:space-y-8">
      {/* Header card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
            🎵
          </div>
          <div>
            <div className="text-2xl font-extrabold">Level {level}</div>
            <div className="text-primary-100 text-sm">
              {SKILL_LABELS[skill_level]} · {INST_LABELS[instrument]}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-primary-200 mb-1">
            <span>{xp.toLocaleString()} XP</span>
            <span>{xpRemaining} to level {level + 1}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div
              className="bg-white h-2.5 rounded-full transition-all"
              style={{ width: `${Math.max(5, 100 - (xpRemaining / (xpRemaining + 50)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total XP', value: xp.toLocaleString(), icon: '💎' },
          { label: 'Streak', value: `${streak_days} days`, icon: '🔥' },
          { label: 'Lessons', value: `${lessonsCompleted}`, icon: '📚' },
          { label: 'Badges', value: `${earnedBadges.length}/${BADGES.length}`, icon: '🏆' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-surface-200 p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-lg font-bold text-surface-900">{stat.value}</div>
            <div className="text-xs text-surface-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Earned badges */}
      <div>
        <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-3">
          Earned Badges ({earnedBadges.length})
        </h2>
        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {earnedBadges.map((badge) => (
              <div key={badge.id} className="bg-white rounded-xl border border-surface-200 p-4 text-center">
                <div className="text-3xl mb-1">{badge.icon}</div>
                <div className="text-sm font-bold text-surface-900">{badge.name}</div>
                <div className="text-[10px] text-surface-400 mt-0.5">{badge.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-50 rounded-xl border border-surface-200 p-8 text-center text-surface-400">
            Complete lessons and play songs to earn badges!
          </div>
        )}
      </div>

      {/* Locked badges */}
      <div>
        <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-3">
          Locked ({unearnedBadges.length})
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {unearnedBadges.map((badge) => (
            <div key={badge.id} className="bg-surface-50 rounded-xl border border-surface-200 p-4 text-center opacity-50">
              <div className="text-3xl mb-1 grayscale">{badge.icon}</div>
              <div className="text-sm font-bold text-surface-500">{badge.name}</div>
              <div className="text-[10px] text-surface-400 mt-0.5">{badge.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
