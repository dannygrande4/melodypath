import { Link } from 'react-router-dom'
import { useUserStore, xpToNextLevel } from '@/stores/userStore'
import { useUIStore } from '@/stores/uiStore'
import { useLessonStore } from '@/stores/lessonStore'
import { LESSONS, isLessonUnlocked } from '@/lib/lessons/lessonData'
import { SONG_LIBRARY } from '@/lib/songLibrary'
import Mascot from '@/components/ui/Mascot'

const SKILL_LABELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

const QUICK_ACTIONS = [
  { to: '/play', icon: '🎮', title: 'Play a Song', desc: 'Hit notes in time — Guitar Hero style' },
  { to: '/challenges', icon: '🎯', title: 'Challenges', desc: 'Play what we ask — test your skills' },
  { to: '/explore/chords', icon: '🎼', title: 'Explore Chords', desc: 'See and hear any chord on piano + guitar' },
  { to: '/explore/scales', icon: '🎹', title: 'Explore Scales', desc: 'Visualize scales across the fretboard' },
  { to: '/ear-training', icon: '👂', title: 'Train Your Ear', desc: 'Identify intervals, chords, and melodies' },
  { to: '/progressions', icon: '🔄', title: 'Build Progressions', desc: 'Create chord progressions in any key' },
]

const DAILY_TIPS = [
  'Tip: Playing songs you love is the fastest way to learn.',
  'Tip: Try the Ear Training module — even 5 minutes a day builds real skill.',
  'Tip: Use the Scale Explorer to see how scales connect to chords.',
  'Tip: A streak is just showing up. Even one chord a day counts.',
  'Tip: Switch between piano and guitar views in the Chord Explorer.',
]

export default function Dashboard() {
  const { xp, level, streak_days, skill_level, instrument } = useUserStore()
  const { ageMode } = useUIStore()
  const { completedLessons } = useLessonStore()
  const completedIds = new Set(Object.keys(completedLessons))

  const xpRemaining = xpToNextLevel(xp, level)
  const xpForLevel = xpRemaining + (xp % 100 || 100)
  const progress = Math.min(((xpForLevel - xpRemaining) / xpForLevel) * 100, 100)

  const tipIndex = new Date().getDate() % DAILY_TIPS.length
  const tip = DAILY_TIPS[tipIndex]

  const isKids = ageMode === 'kids'

  // ─── Adaptive content based on user state ────────────────────────────
  const nextLesson = LESSONS.find((l) => !completedIds.has(l.id) && isLessonUnlocked(l.id, completedIds))
  const lessonsCompleted = completedIds.size
  const totalLessons = LESSONS.length

  // Recommend songs based on skill level
  const maxDifficulty = skill_level === 'ADVANCED' ? 5 : skill_level === 'INTERMEDIATE' ? 3 : 2
  const recommendedSongs = SONG_LIBRARY.filter((s) => s.difficulty <= maxDifficulty).slice(0, 3)

  // Dynamic daily challenge based on skill + day
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const dailySong = recommendedSongs[dayOfYear % recommendedSongs.length]
  const dailyChallenge = skill_level === 'BEGINNER'
    ? { text: `Play "${dailySong?.title}" and complete one lesson`, songId: dailySong?.id }
    : skill_level === 'INTERMEDIATE'
      ? { text: `Beat your high score on "${dailySong?.title}" and try an Interval challenge`, songId: dailySong?.id }
      : { text: `Get an S rank on "${dailySong?.title}" and complete a Progression challenge`, songId: dailySong?.id }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            {isKids ? 'Hey Superstar!' : 'Welcome back'}
          </h1>
          <p className="text-surface-500 text-sm mt-1">
            {SKILL_LABELS[skill_level]} · {instrument.charAt(0) + instrument.slice(1).toLowerCase()}
          </p>
        </div>
        <Link
          to="/profile"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View Profile
        </Link>
      </div>

      {/* Kids mascot */}
      <Mascot category={streak_days > 3 ? 'streak' : 'welcome'} size="md" />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Level card */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="text-xs text-surface-500 mb-1">{isKids ? 'Stars' : 'Level'}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-surface-900">{level}</span>
            {!isKids && <span className="text-surface-400 text-sm">/ 100</span>}
          </div>
          <div className="mt-3 w-full bg-surface-100 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-surface-400 mt-1">
            {isKids ? `${xpRemaining} more to go!` : `${xpRemaining} XP to level ${level + 1}`}
          </div>
        </div>

        {/* Streak card */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="text-xs text-surface-500 mb-1">Streak</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-surface-900">{streak_days}</span>
            <span className="text-surface-400 text-sm">days</span>
          </div>
          <div className="mt-2 text-2xl">
            {streak_days >= 30 ? '🔥🔥🔥' : streak_days >= 7 ? '🔥🔥' : streak_days >= 1 ? '🔥' : '💤'}
          </div>
          <div className="text-xs text-surface-400 mt-1">
            {streak_days === 0 ? 'Start a new streak today!' : 'Keep it going!'}
          </div>
        </div>

        {/* Total XP card */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="text-xs text-surface-500 mb-1">{isKids ? 'Total Points' : 'Total XP'}</div>
          <div className="text-3xl font-extrabold text-surface-900">{xp.toLocaleString()}</div>
          <div className="text-xs text-surface-400 mt-3">{tip}</div>
        </div>
      </div>

      {/* Continue learning — next lesson */}
      {nextLesson && (
        <Link
          to={`/learn/${nextLesson.id}`}
          className="block bg-white rounded-xl border border-surface-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">
                Continue Learning ({lessonsCompleted}/{totalLessons})
              </div>
              <div className="text-lg font-bold text-surface-900">{nextLesson.title}</div>
              <div className="text-sm text-surface-500 mt-0.5">{nextLesson.concepts.join(' · ')} · +{nextLesson.xpReward} XP</div>
            </div>
            <span className="text-2xl text-primary-500">→</span>
          </div>
          <div className="w-full bg-surface-100 rounded-full h-1.5 mt-3">
            <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${(lessonsCompleted / totalLessons) * 100}%` }} />
          </div>
        </Link>
      )}

      {/* Daily Challenge — personalized */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-500/10 rounded-xl border border-primary-100 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Daily Challenge</div>
            <div className="text-lg font-bold text-surface-900">{dailyChallenge.text}</div>
            <div className="text-sm text-surface-500 mt-1">Complete for +25 bonus XP</div>
          </div>
          <Link
            to={dailyChallenge.songId ? `/play/${dailyChallenge.songId}` : '/play'}
            className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Let's Go
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-surface-500 mb-3">What do you want to do?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white rounded-xl border border-surface-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all group"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="font-bold text-surface-900 group-hover:text-primary-700 transition-colors">
                {action.title}
              </div>
              <div className="text-sm text-surface-500 mt-0.5">{action.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
