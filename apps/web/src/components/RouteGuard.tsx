import { Link, useLocation } from 'react-router-dom'
import { TAB_UNLOCKS, getLessonTitle } from '@/lib/unlocks'
import { useUnlockChecks } from '@/hooks/useUnlocks'

interface Props {
  children: React.ReactNode
}

/**
 * Wraps a gated page. If the route is locked for the current user, renders a
 * teaser pointing to the lesson that unlocks it. Admins always pass through.
 */
export default function RouteGuard({ children }: Props) {
  const { pathname } = useLocation()
  const checks = useUnlockChecks()

  const gate = TAB_UNLOCKS[pathname]
  if (!gate) return <>{children}</>
  if (checks.route(pathname)) return <>{children}</>

  const lessonTitle = getLessonTitle(gate.unlockedBy)

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-surface-200 p-8 text-center space-y-5">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl font-bold text-surface-900">{gate.label} is locked</h1>
        <p className="text-surface-600">{gate.description}</p>
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-left">
          <div className="text-xs uppercase tracking-wider text-primary-600 font-semibold mb-1">
            Unlock by finishing
          </div>
          <div className="font-bold text-surface-900">{lessonTitle}</div>
        </div>
        <Link
          to={`/learn/${gate.unlockedBy}`}
          className="inline-block px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
        >
          Open the lesson →
        </Link>
        <div>
          <Link to="/dashboard" className="text-sm text-surface-500 hover:text-surface-700">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
