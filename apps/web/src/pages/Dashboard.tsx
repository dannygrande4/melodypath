import { Link } from 'react-router-dom'
import { useUserStore, xpToNextLevel } from '@/stores/userStore'
import { useUIStore } from '@/stores/uiStore'
import Mascot from '@/components/ui/Mascot'

const SKILL_LABELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

const QUICK_ACTIONS = [
  { to: '/play', icon: '🎮', title: 'Play a Song', desc: 'Guitar Hero-style play mode' },
  { to: '/learn', icon: '📚', title: 'Start a Lesson', desc: 'Pick up where you left off' },
  { to: '/explore/chords', icon: '🎼', title: 'Explore Chords', desc: 'Visualize and hear any chord' },
  { to: '/explore/scales', icon: '🎹', title: 'Explore Scales', desc: 'Maps for piano and guitar' },
  { to: '/ear-training', icon: '👂', title: 'Train Your Ear', desc: 'Intervals, chords, melodies' },
  { to: '/practice', icon: '🎵', title: 'Practice', desc: 'Backing tracks and metronome' },
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

  const xpRemaining = xpToNextLevel(xp, level)
  const xpForLevel = xpRemaining + (xp % 100 || 100)
  const progress = Math.min(((xpForLevel - xpRemaining) / xpForLevel) * 100, 100)

  const tipIndex = new Date().getDate() % DAILY_TIPS.length
  const tip = DAILY_TIPS[tipIndex]

  const isKids = ageMode === 'kids'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
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

      {/* Daily Challenge */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-500/10 rounded-xl border border-primary-100 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Daily Challenge</div>
            <div className="text-lg font-bold text-surface-900">
              Play "Ode to Joy" and complete one ear training round
            </div>
            <div className="text-sm text-surface-500 mt-1">Complete both for +25 bonus XP</div>
          </div>
          <Link
            to="/play"
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
