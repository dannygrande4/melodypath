import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SONG_LIBRARY } from '@/lib/songLibrary'
import { useLeaderboardStore } from '@/stores/leaderboardStore'

const DIFFICULTY_LABELS = ['', 'Easy', 'Medium', 'Hard', 'Expert', 'Master']
const DIFFICULTY_COLORS = ['', 'text-timing-perfect', 'text-timing-good', 'text-timing-ok', 'text-timing-miss', 'text-accent-500']

export default function PlayBrowser() {
  const [filter, setFilter] = useState<number | null>(null)
  const getBestScore = useLeaderboardStore((s) => s.getBestScore)

  const songs = filter
    ? SONG_LIBRARY.filter((s) => s.difficulty === filter)
    : SONG_LIBRARY

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Play Mode</h1>
        <p className="text-surface-500 text-sm mt-1">
          Pick a song and play Guitar Hero-style — hit the falling notes in time!
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to="/play/import"
          className="px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 transition-colors"
        >
          Import MIDI File
        </Link>
      </div>

      {/* Difficulty filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            filter === null
              ? 'bg-primary-50 border-primary-400 text-primary-700 font-medium'
              : 'border-surface-200 text-surface-500 hover:bg-surface-50'
          }`}
        >
          All
        </button>
        {[1, 2, 3, 4, 5].map((d) => (
          <button
            key={d}
            onClick={() => setFilter(filter === d ? null : d)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === d
                ? 'bg-primary-50 border-primary-400 text-primary-700 font-medium'
                : 'border-surface-200 text-surface-500 hover:bg-surface-50'
            }`}
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
      </div>

      {/* Song list */}
      <div className="space-y-3">
        {songs.map((song) => (
          <Link
            key={song.id}
            to={`/play/${song.id}`}
            className="flex items-center gap-4 bg-white rounded-xl border border-surface-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all group"
          >
            {/* Difficulty badge */}
            <div className={`text-center w-16 flex-shrink-0 ${DIFFICULTY_COLORS[song.difficulty]}`}>
              <div className="text-lg font-extrabold">{song.difficulty}</div>
              <div className="text-[10px] font-medium">{DIFFICULTY_LABELS[song.difficulty]}</div>
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-surface-900 group-hover:text-primary-700 transition-colors truncate">
                {song.title}
              </div>
              <div className="text-sm text-surface-500">{song.artist}</div>
              <div className="flex gap-1.5 mt-1.5">
                {song.concepts.map((c) => (
                  <span key={c} className="px-1.5 py-0.5 bg-surface-100 rounded text-[10px] text-surface-500 font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Meta + best score */}
            <div className="text-right text-sm text-surface-400 flex-shrink-0">
              <div>{song.bpm} BPM</div>
              <div>Key: {song.key}</div>
              {(() => {
                const best = getBestScore(song.id)
                return best ? (
                  <div className={`text-xs font-bold mt-1 ${
                    best.grade === 'S' ? 'text-accent-500' :
                    best.grade === 'A' ? 'text-timing-perfect' :
                    'text-surface-400'
                  }`}>
                    Best: {best.grade} ({(best.accuracy * 100).toFixed(0)}%)
                  </div>
                ) : (
                  <div className="text-xs">{song.genre}</div>
                )
              })()}
            </div>

            {/* Play arrow */}
            <div className="text-surface-300 group-hover:text-primary-600 text-2xl flex-shrink-0">
              ▶
            </div>
          </Link>
        ))}
      </div>

      {songs.length === 0 && (
        <div className="text-center text-surface-400 py-12">
          No songs match this filter.
        </div>
      )}
    </div>
  )
}
