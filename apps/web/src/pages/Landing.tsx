import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-500/10 flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎵</span>
          <span className="text-xl font-bold text-primary-700">MelodyPath</span>
        </div>
        <Link
          to="/onboarding"
          className="px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Get Started
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20">
        <h1 className="text-5xl md:text-7xl font-extrabold text-surface-900 leading-tight mb-6">
          Learn music<br />
          <span className="text-primary-600">your way.</span>
        </h1>
        <p className="text-lg sm:text-xl text-surface-600 max-w-2xl mb-10">
          From your very first chord to jazz improvisation — MelodyPath meets you
          where you are. Play songs, train your ear, and grow at your own pace.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            to="/onboarding"
            className="px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg"
          >
            Start Learning Free
          </Link>
          <Link
            to="/play"
            className="px-8 py-4 bg-white text-primary-700 border-2 border-primary-200 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors"
          >
            🎮 Play a Song
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
          {[
            { icon: '🎸', title: 'Play Mode', desc: 'Guitar Hero-style note highway for any instrument' },
            { icon: '📚', title: 'Guided Lessons', desc: 'Adaptive curriculum from beginner to advanced' },
            { icon: '👂', title: 'Ear Training', desc: 'Develop your musical ear with interactive exercises' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-surface-100 text-left">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-surface-900 mb-1">{f.title}</h3>
              <p className="text-sm text-surface-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
