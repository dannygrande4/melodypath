import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import AppShell from '@/components/layout/AppShell'
import LevelUpOverlay from '@/components/Gamification/LevelUpOverlay'
import Landing from '@/pages/Landing'
import Onboarding from '@/pages/Onboarding'
import Dashboard from '@/pages/Dashboard'
import PlayBrowser from '@/pages/PlayBrowser'
import PlayGame from '@/pages/PlayGame'
import LearnDashboard from '@/pages/LearnDashboard'
import LessonPage from '@/pages/LessonPage'
import ChordExplorer from '@/pages/ChordExplorer'
import ScaleExplorer from '@/pages/ScaleExplorer'
import EarTraining from '@/pages/EarTraining'
import PracticeSandbox from '@/pages/PracticeSandbox'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'

export default function App() {
  const { ageMode, highContrast, reducedMotion } = useUIStore()

  // Apply age mode + accessibility as data attributes on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-age-mode', ageMode)
    document.documentElement.setAttribute('data-high-contrast', String(highContrast))
    document.documentElement.setAttribute('data-reduced-motion', String(reducedMotion))
  }, [ageMode, highContrast, reducedMotion])

  return (
    <>
    <LevelUpOverlay />
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
        <Route path="/practice" element={<PracticeSandbox />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
    </>
  )
}
