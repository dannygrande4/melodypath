import { Outlet, NavLink } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'

const NAV_ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/play', icon: '🎮', label: 'Play' },
  { to: '/learn', icon: '📚', label: 'Learn' },
  { to: '/practice', icon: '🎵', label: 'Practice' },
  { to: '/explore/chords', icon: '🎼', label: 'Chords' },
  { to: '/explore/scales', icon: '🎹', label: 'Scales' },
  { to: '/ear-training', icon: '👂', label: 'Ear Training' },
  { to: '/resources', icon: '📋', label: 'Resources' },
]

const ACCESSIBLE_NAV = [
  { to: '/play', icon: '🎮', label: 'Play' },
  { to: '/learn', icon: '📚', label: 'Learn' },
  { to: '/practice', icon: '🎵', label: 'Practice' },
]

export default function AppShell() {
  const { ageMode, sidebarOpen, toggleSidebar } = useUIStore()
  const { xp, level, streak_days } = useUserStore()

  const navItems = ageMode === 'accessible' ? ACCESSIBLE_NAV : NAV_ITEMS

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Sidebar */}
      <aside
        className={`
          flex flex-col bg-white border-r border-surface-200 transition-all duration-200
          ${sidebarOpen ? 'w-56' : 'w-16'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-surface-200">
          <span className="text-2xl">🎵</span>
          {sidebarOpen && (
            <span className="font-bold text-primary-600 text-lg tracking-tight">MelodyPath</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-800 hover:bg-surface-100'
                }
              `}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Stats footer */}
        {sidebarOpen && (
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
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
