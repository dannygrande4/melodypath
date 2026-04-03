import { Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useUIStore } from '@/stores/uiStore'
import AppShell from '@/components/layout/AppShell'
import LevelUpOverlay from '@/components/Gamification/LevelUpOverlay'

// ── Lazy-loaded pages (code-split per route) ─────────────────────────────────
const Landing = lazy(() => import('@/pages/Landing'))
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
const Resources = lazy(() => import('@/pages/Resources'))
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
  const { ageMode, highContrast, reducedMotion } = useUIStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-age-mode', ageMode)
    document.documentElement.setAttribute('data-high-contrast', String(highContrast))
    document.documentElement.setAttribute('data-reduced-motion', String(reducedMotion))
  }, [ageMode, highContrast, reducedMotion])

  return (
    <>
    <LevelUpOverlay />
    <Suspense fallback={<PageLoading />}>
    <Routes>
      {/* Public routes (no shell) */}
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* App routes (with shell) */}
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/play" element={<PlayBrowser />} />
        <Route path="/play/:songId" element={<PlayGame />} />
        <Route path="/learn" element={<LearnDashboard />} />
        <Route path="/learn/:lessonId" element={<LessonPage />} />
        <Route path="/explore/chords" element={<ChordExplorer />} />
        <Route path="/explore/scales" element={<ScaleExplorer />} />
        <Route path="/ear-training" element={<EarTraining />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/practice" element={<PracticeSandbox />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
    </Suspense>
    </>
  )
}
