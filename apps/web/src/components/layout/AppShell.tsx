import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { useUnlockChecks } from '@/hooks/useUnlocks'
import { TAB_UNLOCKS, getLessonTitle } from '@/lib/unlocks'

const NAV_ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/learn', icon: '📚', label: 'Learn' },
  { to: '/practice', icon: '🎵', label: 'Practice' },
  { to: '/explore/chords', icon: '🎼', label: 'Chords' },
  { to: '/explore/scales', icon: '🎹', label: 'Scales' },
  { to: '/progressions', icon: '🔄', label: 'Progressions' },
  { to: '/challenges', icon: '🎯', label: 'Challenges' },
  { to: '/ear-training', icon: '👂', label: 'Ear Training' },
  { to: '/resources', icon: '📋', label: 'Resources' },
]

const ACCESSIBLE_NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Home' },
  { to: '/learn', icon: '📚', label: 'Learn' },
  { to: '/practice', icon: '🎵', label: 'Practice' },
  { to: '/explore/chords', icon: '🎼', label: 'Chords' },
  { to: '/challenges', icon: '🎯', label: 'Challenges' },
  { to: '/resources', icon: '📋', label: 'Resources' },
]

export default function AppShell() {
  const { ageMode, sidebarOpen, toggleSidebar } = useUIStore()
  const { xp, level, streak_days } = useUserStore()
  const { user, signOut } = useAuthStore()
  const checks = useUnlockChecks()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = ageMode === 'accessible' ? ACCESSIBLE_NAV : NAV_ITEMS

  const renderNavItem = (item: { to: string; icon: string; label: string }, onClick?: () => void, showLabel = true) => {
    const unlocked = checks.route(item.to)
    const gate = TAB_UNLOCKS[item.to]
    const tooltip = !unlocked && gate
      ? `Unlock by finishing "${getLessonTitle(gate.unlockedBy)}"`
      : undefined

    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClick}
        title={tooltip}
        className={({ isActive }) => `
          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isActive
            ? 'bg-primary-50 text-primary-700'
            : unlocked
              ? 'text-surface-800 hover:bg-surface-100'
              : 'text-surface-400 hover:bg-surface-50'
          }
        `}
      >
        <span className={`text-xl flex-shrink-0 ${unlocked ? '' : 'grayscale opacity-60'}`}>{item.icon}</span>
        {showLabel && (
          <span className="flex-1 flex items-center justify-between gap-2">
            <span>{item.label}</span>
            {!unlocked && <span className="text-[10px] opacity-70">🔒</span>}
          </span>
        )}
      </NavLink>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-surface-200 md:hidden">
        <div className="flex items-center gap-2">
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-surface-600 hover:text-surface-900 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-surface-200 transition-transform duration-200 md:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center gap-2 px-4 py-4 border-b border-surface-200">
          <span className="text-2xl">🎵</span>
          <span className="font-bold text-primary-600 text-lg tracking-tight">MoniqueMusic</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => renderNavItem(item, () => setMobileMenuOpen(false), true))}
        </nav>
        <div className="px-4 py-3 border-t border-surface-200 space-y-1">
          <div className="text-xs text-surface-600">Level {level}</div>
          <div className="w-full bg-surface-200 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full transition-all"
              style={{ width: `${(xp % 100)}%` }}
            />
          </div>
          <div className="text-xs text-surface-600">🔥 {streak_days} day streak</div>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden md:flex flex-col bg-white border-r border-surface-200 transition-all duration-200
          ${sidebarOpen ? 'w-56' : 'w-16'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-surface-200">
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => renderNavItem(item, undefined, sidebarOpen))}
        </nav>

        {/* Stats footer */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-surface-200 space-y-1">
            <div className="text-xs text-surface-600">
              {ageMode === 'kids'
                ? `${'⭐'.repeat(Math.min(level, 5))} Level ${level}`
                : `Level ${level}`}
            </div>
            <div className="w-full bg-surface-200 rounded-full h-1.5">
              <div
                className="bg-primary-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(xp % 100)}%` }}
              />
            </div>
            <div className="text-xs text-surface-600">
              {ageMode === 'kids'
                ? `🔥 ${streak_days} days in a row!`
                : `🔥 ${streak_days} day streak`}
            </div>
          </div>
        )}

        {/* Auth status */}
        {sidebarOpen && (
          <div className="px-4 py-2 border-t border-surface-200">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-500 truncate">{user.email}</span>
                <button
                  onClick={signOut}
                  className="text-xs text-surface-400 hover:text-red-500 ml-2 flex-shrink-0"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/auth" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Sign In / Sign Up
              </Link>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="p-3 text-surface-400 hover:text-surface-600 border-t border-surface-200 text-sm"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
