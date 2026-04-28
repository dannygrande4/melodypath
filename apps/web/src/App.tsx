import { Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useAuthSync } from '@/hooks/useAuthSync'
import AppShell from '@/components/layout/AppShell'
import LevelUpOverlay from '@/components/Gamification/LevelUpOverlay'
import UnlockOverlay from '@/components/Gamification/UnlockOverlay'
import RouteGuard from '@/components/RouteGuard'

// ── Lazy-loaded pages (code-split per route) ─────────────────────────────────
const Landing = lazy(() => import('@/pages/Landing'))
const Auth = lazy(() => import('@/pages/Auth'))
const Onboarding = lazy(() => import('@/pages/Onboarding'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const PlayBrowser = lazy(() => import('@/pages/PlayBrowser'))
const PlayGame = lazy(() => import('@/pages/PlayGame'))
const LearnDashboard = lazy(() => import('@/pages/LearnDashboard'))
const LessonPage = lazy(() => import('@/pages/LessonPage'))
const ChordExplorer = lazy(() => import('@/pages/ChordExplorer'))
const ScaleExplorer = lazy(() => import('@/pages/ScaleExplorer'))
const EarTraining = lazy(() => import('@/pages/EarTraining'))
const PracticeSandbox = lazy(() => import('@/pages/PracticeSandbox'))
const FretboardQuiz = lazy(() => import('@/pages/FretboardQuiz'))
const Resources = lazy(() => import('@/pages/Resources'))
const SongImport = lazy(() => import('@/pages/SongImport'))
const Challenges = lazy(() => import('@/pages/Challenges'))
const ProgressionBuilder = lazy(() => import('@/pages/ProgressionBuilder'))
const Profile = lazy(() => import('@/pages/Profile'))
const Settings = lazy(() => import('@/pages/Settings'))

function PageLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-surface-400">
        <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        Loading...
      </div>
    </div>
  )
}

export default function App() {
  const { ageMode, theme, highContrast, reducedMotion } = useUIStore()
  const initAuth = useAuthStore((s) => s.initialize)

  // One-time: clear old anonymous progress on first load after this update
  useEffect(() => {
    const migrationKey = 'moniquemusic-auth-migration-v1'
    if (!localStorage.getItem(migrationKey)) {
      // Clear all old non-user-scoped data
      const keysToRemove = ['moniquemusic-user', 'moniquemusic-lessons', 'moniquemusic-leaderboard', 'moniquemusic-ear-training']
      for (const key of keysToRemove) localStorage.removeItem(key)
      localStorage.setItem(migrationKey, '1')
    }
  }, [])

  // Initialize Supabase auth session on mount
  useEffect(() => {
    initAuth()
  }, [initAuth])

  // Sync stores with authenticated user (reset on logout, load on login)
  useAuthSync()

  // Apply theme
  useEffect(() => {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.setAttribute('data-age-mode', ageMode)
    document.documentElement.setAttribute('data-high-contrast', String(highContrast))
    document.documentElement.setAttribute('data-reduced-motion', String(reducedMotion))

    // Listen for system theme changes
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => document.documentElement.classList.toggle('dark', e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [ageMode, theme, highContrast, reducedMotion])

  return (
    <>
    <LevelUpOverlay />
    <UnlockOverlay />
    <Suspense fallback={<PageLoading />}>
    <Routes>
      {/* Public routes (no shell) */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* App routes (with shell) */}
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/play" element={<PlayBrowser />} />
        <Route path="/play/import" element={<SongImport />} />
        <Route path="/play/:songId" element={<PlayGame />} />
        <Route path="/learn" element={<LearnDashboard />} />
        <Route path="/learn/:lessonId" element={<LessonPage />} />
        <Route path="/explore/chords" element={<ChordExplorer />} />
        <Route path="/explore/scales" element={<RouteGuard><ScaleExplorer /></RouteGuard>} />
        <Route path="/ear-training" element={<RouteGuard><EarTraining /></RouteGuard>} />
        <Route path="/challenges" element={<RouteGuard><Challenges /></RouteGuard>} />
        <Route path="/progressions" element={<RouteGuard><ProgressionBuilder /></RouteGuard>} />
        <Route path="/resources" element={<RouteGuard><Resources /></RouteGuard>} />
        <Route path="/practice" element={<PracticeSandbox />} />
        <Route path="/practice/fretboard-quiz" element={<RouteGuard><FretboardQuiz /></RouteGuard>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
    </Suspense>
    </>
  )
}
