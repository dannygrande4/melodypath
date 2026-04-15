import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-500/10 flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎵</span>
          <span className="text-xl font-bold text-primary-700">MoniqueMusic</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="px-4 py-2 text-primary-600 font-medium hover:text-primary-700 transition-colors text-sm"
          >
            Log In
          </Link>
          <Link
            to="/onboarding"
            className="px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 text-accent-700 font-semibold text-sm mb-6">
          🎂 Happy Birthday, Monique!
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-surface-900 leading-tight mb-6">
          A little world of music,<br />
          <span className="text-primary-600">made just for you.</span>
        </h1>
        <p className="text-lg sm:text-xl text-surface-600 max-w-2xl mb-4">
          This is your very own place to play songs, learn chords, train your ear,
          and have fun making music — at your own pace, your own way.
        </p>
        <p className="text-base sm:text-lg text-surface-600 max-w-2xl mb-4">
          Ever wanted to play <span className="font-semibold text-primary-700">"Island in the Sun"</span> or
          jam along to <span className="font-semibold text-primary-700">"Feel Good Inc."</span>? Weezer riffs,
          Gorillaz basslines — they all start with one note. Let's go. 🎸🎹
        </p>
        <p className="text-base sm:text-lg text-surface-500 max-w-2xl mb-10 italic">
          With love, from Uncle Danny, Uncle Ben & Auntie Jordan 💛
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            to="/onboarding"
            className="px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg"
          >
            🎁 Open Your Gift
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
            { icon: '🎸', title: 'Play Mode', desc: 'Shred Weezer power chords on a Guitar Hero-style note highway' },
            { icon: '📚', title: 'Guided Lessons', desc: 'From your first chord to Gorillaz grooves — step by step' },
            { icon: '👂', title: 'Ear Training', desc: 'Learn to hear every hook, riff and melody you love' },
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
