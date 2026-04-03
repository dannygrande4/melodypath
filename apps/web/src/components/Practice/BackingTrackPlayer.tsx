import { useState, useCallback, useRef, useEffect } from 'react'
import { useAudioInit } from '@/hooks/useAudioInit'
import { useAudioStore } from '@/stores/audioStore'
import InfoTooltip from '@/components/ui/InfoTooltip'

interface BackingTrack {
  id: string
  name: string
  key: string
  genre: string
  bpm: number
  chords: { chord: string; beats: number }[]
}

const BACKING_TRACKS: BackingTrack[] = [
  {
    id: 'blues-a',
    name: '12-Bar Blues in A',
    key: 'A',
    genre: 'Blues',
    bpm: 100,
    chords: [
      { chord: 'A3', beats: 4 }, { chord: 'A3', beats: 4 }, { chord: 'A3', beats: 4 }, { chord: 'A3', beats: 4 },
      { chord: 'D3', beats: 4 }, { chord: 'D3', beats: 4 }, { chord: 'A3', beats: 4 }, { chord: 'A3', beats: 4 },
      { chord: 'E3', beats: 4 }, { chord: 'D3', beats: 4 }, { chord: 'A3', beats: 4 }, { chord: 'E3', beats: 4 },
    ],
  },
  {
    id: 'pop-c',
    name: 'I-V-vi-IV in C',
    key: 'C',
    genre: 'Pop',
    bpm: 110,
    chords: [
      { chord: 'C3', beats: 4 }, { chord: 'G3', beats: 4 }, { chord: 'A3', beats: 4 }, { chord: 'F3', beats: 4 },
      { chord: 'C3', beats: 4 }, { chord: 'G3', beats: 4 }, { chord: 'A3', beats: 4 }, { chord: 'F3', beats: 4 },
    ],
  },
  {
    id: 'jazz-dm',
    name: 'ii-V-I in C (Jazz)',
    key: 'C',
    genre: 'Jazz',
    bpm: 120,
    chords: [
      { chord: 'D3', beats: 4 }, { chord: 'G3', beats: 4 }, { chord: 'C3', beats: 4 }, { chord: 'C3', beats: 4 },
      { chord: 'D3', beats: 4 }, { chord: 'G3', beats: 4 }, { chord: 'C3', beats: 4 }, { chord: 'C3', beats: 4 },
    ],
  },
  {
    id: 'rock-g',
    name: 'I-IV-V in G',
    key: 'G',
    genre: 'Rock',
    bpm: 130,
    chords: [
      { chord: 'G3', beats: 4 }, { chord: 'G3', beats: 4 }, { chord: 'C3', beats: 4 }, { chord: 'C3', beats: 4 },
      { chord: 'D3', beats: 4 }, { chord: 'D3', beats: 4 }, { chord: 'G3', beats: 4 }, { chord: 'G3', beats: 4 },
    ],
  },
  {
    id: 'folk-d',
    name: 'I-vi-IV-V in D',
    key: 'D',
    genre: 'Folk',
    bpm: 95,
    chords: [
      { chord: 'D3', beats: 4 }, { chord: 'B2', beats: 4 }, { chord: 'G3', beats: 4 }, { chord: 'A3', beats: 4 },
      { chord: 'D3', beats: 4 }, { chord: 'B2', beats: 4 }, { chord: 'G3', beats: 4 }, { chord: 'A3', beats: 4 },
    ],
  },
]

export default function BackingTrackPlayer() {
  const { ensureAudio } = useAudioInit()
  const engine = useAudioStore((s) => s.engine)

  const [selectedTrack, setSelectedTrack] = useState<BackingTrack | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentChordIdx, setCurrentChordIdx] = useState(0)
  const [loop, setLoop] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const beatCountRef = useRef(0)
  const chordIdxRef = useRef(0)

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setPlaying(false)
    setCurrentChordIdx(0)
    beatCountRef.current = 0
    chordIdxRef.current = 0
  }, [])

  const play = useCallback(async () => {
    if (!selectedTrack) return
    await ensureAudio()
    stop()

    setPlaying(true)
    const beatMs = (60 / selectedTrack.bpm) * 1000
    const chords = selectedTrack.chords
    let totalBeatsInTrack = chords.reduce((s, c) => s + c.beats, 0)

    chordIdxRef.current = 0
    beatCountRef.current = 0
    setCurrentChordIdx(0)

    // Play first chord immediately
    engine.playNote(chords[0].chord, '2n')

    intervalRef.current = setInterval(() => {
      beatCountRef.current++

      // Check if we've passed the current chord's beats
      let beatsUsed = 0
      let newIdx = 0
      for (let i = 0; i < chords.length; i++) {
        beatsUsed += chords[i].beats
        if (beatCountRef.current < beatsUsed) {
          newIdx = i
          break
        }
        if (i === chords.length - 1) {
          // End of track
          if (loop) {
            beatCountRef.current = 0
            newIdx = 0
          } else {
            stop()
            return
          }
        }
      }

      if (newIdx !== chordIdxRef.current) {
        chordIdxRef.current = newIdx
        setCurrentChordIdx(newIdx)
        engine.playNote(chords[newIdx].chord, '2n')
      }
    }, beatMs)
  }, [selectedTrack, ensureAudio, engine, stop, loop])

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
      <h2 className="flex items-center text-lg font-bold text-surface-900">
        Backing Tracks
        <InfoTooltip
          size="md"
          text="Play along with a chord progression loop. Pick a key and genre, then solo or practice over the chords. The highlighted chord shows what's currently playing."
        />
      </h2>

      {/* Track list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {BACKING_TRACKS.map((track) => (
          <button
            key={track.id}
            onClick={() => { stop(); setSelectedTrack(track) }}
            className={`text-left p-3 rounded-lg border transition-colors ${
              selectedTrack?.id === track.id
                ? 'border-primary-400 bg-primary-50'
                : 'border-surface-200 hover:bg-surface-50'
            }`}
          >
            <div className="font-medium text-sm text-surface-900">{track.name}</div>
            <div className="text-xs text-surface-400">{track.genre} · {track.bpm} BPM · Key of {track.key}</div>
          </button>
        ))}
      </div>

      {/* Player controls */}
      {selectedTrack && (
        <div className="space-y-4">
          {/* Current chord display */}
          <div className="flex gap-1.5 flex-wrap">
            {selectedTrack.chords.map((c, i) => (
              <div
                key={i}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                  playing && i === currentChordIdx
                    ? 'bg-primary-500 text-white scale-110 shadow'
                    : 'bg-surface-100 text-surface-600'
                }`}
              >
                {c.chord.replace(/\d/, '')}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={playing ? stop : play}
              className={`px-6 py-2.5 font-bold rounded-lg transition-colors ${
                playing
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {playing ? 'Stop' : 'Play'}
            </button>
            <label className="flex items-center gap-2 text-sm text-surface-600 cursor-pointer">
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
                className="accent-primary-500"
              />
              Loop
            </label>
            <span className="text-sm text-surface-400">
              {selectedTrack.bpm} BPM · Key of {selectedTrack.key}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
