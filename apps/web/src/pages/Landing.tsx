import { Link } from 'react-router-dom'
import { useMemo } from 'react'

const CONFETTI_COLORS = [
  '#ff3b6b', '#ffb703', '#06d6a0', '#118ab2', '#8338ec', '#ff70a6', '#70d6ff', '#ffd166',
]

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 4,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 200,
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size * 0.4}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ['--rotate' as string]: `${p.rotate}deg`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-500/10 flex flex-col">
      {/* Nav */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 bg-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2">
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

      {/* Birthday top fold */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse at top, #fff1f8 0%, #fef3c7 45%, #e0e7ff 100%)',
        }}
      >
        <Confetti />
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-6xl sm:text-7xl mb-6 animate-bounce-slow">🎉🎂🎈</div>
          <h1
            className="font-extrabold tracking-tight leading-[0.95] text-[15vw] sm:text-[11vw] lg:text-[9rem]"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #ec4899 0%, #d946ef 50%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              textShadow: '0 4px 24px rgba(236, 72, 153, 0.25)',
            }}
          >
            HAPPY 12<span style={{ fontSize: '0.6em', verticalAlign: 'super' }}>TH</span><br />BIRTHDAY<br />MONIQUE
          </h1>
          <p className="mt-8 text-lg sm:text-2xl max-w-2xl italic" style={{ color: '#4c1d95' }}>
            With love, from Uncle Danny, Uncle Ben & Auntie Jordan 💛
          </p>
          <Link
            to="/onboarding"
            className="mt-10 px-10 py-5 bg-primary-600 text-white rounded-2xl font-bold text-xl hover:bg-primary-700 transition-colors shadow-xl hover:scale-105 transform duration-200"
          >
            🎁 Open Your Gift
          </Link>
          <div className="mt-12 text-sm animate-bounce" style={{ color: '#6d28d9' }}>↓ scroll for your music world ↓</div>
        </div>
      </section>

      {/* About / features fold */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h2 className="text-4xl md:text-6xl font-extrabold text-surface-900 leading-tight mb-6">
          A little world of music,<br />
          <span className="text-primary-600">made just for you.</span>
        </h2>
        <p className="text-lg sm:text-xl text-surface-600 max-w-2xl mb-4">
          This is your very own place to play songs, learn chords, train your ear,
          and have fun making music - at your own pace, your own way.
        </p>
        <p className="text-base sm:text-lg text-surface-600 max-w-2xl mb-10">
          Ever wanted to play <span className="font-semibold text-primary-700">"Island in the Sun"</span> or
          jam along to <span className="font-semibold text-primary-700">"Feel Good Inc."</span>? Weezer riffs,
          Gorillaz basslines - they all start with one note. Let's go. 🎸🎹
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            to="/onboarding"
            className="px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg"
          >
            Start Learning
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
          {[
            { icon: '📚', title: 'Guided Lessons', desc: 'From your first chord to Gorillaz grooves, step by step' },
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
