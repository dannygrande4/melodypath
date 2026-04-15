import { useState, useCallback } from 'react'
import { useAudioInit } from '@/hooks/useAudioInit'
import { useAudioStore } from '@/stores/audioStore'
import { getChordNotes, getProgressionChords } from '@moniquemusic/music-theory'
import InfoTooltip from '@/components/ui/InfoTooltip'

const MAJOR_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const MINOR_KEYS = ['Am', 'A#m', 'Bm', 'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m']

const NUMERALS_MAJOR = [
  { numeral: 'I', label: 'I', quality: 'Major' },
  { numeral: 'ii', label: 'ii', quality: 'Minor' },
  { numeral: 'iii', label: 'iii', quality: 'Minor' },
  { numeral: 'IV', label: 'IV', quality: 'Major' },
  { numeral: 'V', label: 'V', quality: 'Major' },
  { numeral: 'vi', label: 'vi', quality: 'Minor' },
  { numeral: 'vii°', label: 'vii°', quality: 'Dim' },
]

const NUMERALS_MINOR = [
  { numeral: 'i', label: 'i', quality: 'Minor' },
  { numeral: 'ii°', label: 'ii°', quality: 'Dim' },
  { numeral: 'III', label: 'III', quality: 'Major' },
  { numeral: 'iv', label: 'iv', quality: 'Minor' },
  { numeral: 'v', label: 'v', quality: 'Minor' },
  { numeral: 'VI', label: 'VI', quality: 'Major' },
  { numeral: 'VII', label: 'VII', quality: 'Major' },
]

const PRESETS_MAJOR = [
  { name: 'I-IV-V-I (Classic)', numerals: ['I', 'IV', 'V', 'I'] },
  { name: 'I-V-vi-IV (Pop)', numerals: ['I', 'V', 'vi', 'IV'] },
  { name: 'I-vi-IV-V (50s)', numerals: ['I', 'vi', 'IV', 'V'] },
  { name: 'ii-V-I (Jazz)', numerals: ['ii', 'V', 'I'] },
  { name: 'vi-IV-I-V', numerals: ['vi', 'IV', 'I', 'V'] },
  { name: '12-Bar Blues', numerals: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'] },
]

const PRESETS_MINOR = [
  { name: 'i-iv-v (Natural)', numerals: ['i', 'iv', 'v', 'i'] },
  { name: 'i-VI-III-VII (Andalusian)', numerals: ['i', 'VII', 'VI', 'v'] },
  { name: 'i-iv-V (Harmonic)', numerals: ['i', 'iv', 'V', 'i'] },
  { name: 'i-III-VII-VI', numerals: ['i', 'III', 'VII', 'VI'] },
]

const BPM_OPTIONS = [60, 80, 100, 120, 140, 160]

export default function ProgressionBuilder() {
  const { ensureAudio } = useAudioInit()
  const engine = useAudioStore((s) => s.engine)

  const [keyMode, setKeyMode] = useState<'major' | 'minor'>('major')
  const [key, setKey] = useState('C')
  const [numerals, setNumerals] = useState<string[]>(['I', 'IV', 'V', 'I'])
  const [bpm, setBpm] = useState(100)
  const [playing, setPlaying] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [looping, setLooping] = useState(true)

  const intervalRef = useState<ReturnType<typeof setInterval> | null>(null)

  const isMinor = keyMode === 'minor'
  const keyName = isMinor ? `${key}m` : key
  const availableNumerals = isMinor ? NUMERALS_MINOR : NUMERALS_MAJOR
  const availablePresets = isMinor ? PRESETS_MINOR : PRESETS_MAJOR
  const availableKeys = isMinor ? MINOR_KEYS : MAJOR_KEYS

  // Resolve numerals to actual chord names
  const chordNames = getProgressionChords(keyName, numerals)

  // ─── Add/remove chords ──────────────────────────────────────────────

  const addChord = useCallback((numeral: string) => {
    setNumerals((prev) => [...prev, numeral])
  }, [])

  const removeChord = useCallback((idx: number) => {
    setNumerals((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  const moveChord = useCallback((fromIdx: number, direction: -1 | 1) => {
    setNumerals((prev) => {
      const toIdx = fromIdx + direction
      if (toIdx < 0 || toIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]]
      return next
    })
  }, [])

  const loadPreset = useCallback((preset: typeof PRESETS[number]) => {
    setNumerals([...preset.numerals])
  }, [])

  // ─── Playback ───────────────────────────────────────────────────────

  const playProgression = useCallback(async () => {
    await ensureAudio()
    if (numerals.length === 0) return

    setPlaying(true)
    setCurrentIdx(0)

    const beatMs = (60 / bpm) * 1000 * 2 // 2 beats per chord

    // Play first chord
    if (chordNames[0]) {
      const root = chordNames[0].replace(/[^A-G#b]/g, '')
      const isMinor = chordNames[0].includes('m') && !chordNames[0].includes('maj')
      const notes = getChordNotes(root, isMinor ? 'minor' : 'major', 3)
      if (notes.length > 0) engine.playChord(notes, '2n')
    }

    let idx = 0
    const iv = setInterval(() => {
      idx++
      if (idx >= numerals.length) {
        if (looping) {
          idx = 0
        } else {
          clearInterval(iv)
          setPlaying(false)
          setCurrentIdx(-1)
          return
        }
      }
      setCurrentIdx(idx)

      // Play the actual chord
      const chordRoot = chordNames[idx]
      if (chordRoot) {
        const root = chordRoot.replace(/[^A-G#b]/g, '')
        const isMinor = /m(?!aj)/.test(chordRoot.replace(/^[A-G][#b]?/, '')) || chordRoot.endsWith('m')
        const chordType = isMinor ? 'minor' : 'major'
        const notes = getChordNotes(root, chordType, 3)
        if (notes.length > 0) {
          engine.playChord(notes, '2n')
        } else {
          engine.playNote(`${root}3`, '2n')
        }
      }
    }, beatMs)

    intervalRef[1](iv)
  }, [ensureAudio, engine, numerals, chordNames, key, bpm, looping])

  const stopProgression = useCallback(() => {
    if (intervalRef[0]) clearInterval(intervalRef[0])
    intervalRef[1](null)
    setPlaying(false)
    setCurrentIdx(-1)
  }, [])

  // ─── Play single chord ──────────────────────────────────────────────

  const playSingleChord = useCallback(async (idx: number) => {
    await ensureAudio()
    const chordRoot = chordNames[idx]
    if (chordRoot) {
      const root = chordRoot.replace(/[^A-G#b]/g, '')
      const isMinor = chordRoot.includes('m') && !chordRoot.includes('maj')
      const notes = getChordNotes(root, isMinor ? 'minor' : 'major', 3)
      if (notes.length > 0) {
        engine.playChord(notes, '4n')
      }
    }
  }, [ensureAudio, engine, chordNames])

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Progression Builder</h1>
        <p className="flex items-center text-surface-500 text-sm mt-1">
          Build and play chord progressions in any key
          <InfoTooltip text="A chord progression is a series of chords played in order - it's the backbone of every song. Roman numerals (I, IV, V) are shorthand that works in any key. Try a preset to hear what it sounds like!" />
        </p>
      </div>

      {/* Major / Minor toggle */}
      <div className="flex gap-2">
        <div className="flex bg-surface-100 rounded-lg p-1">
          <button
            onClick={() => { setKeyMode('major'); setNumerals(['I', 'IV', 'V', 'I']) }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              keyMode === 'major' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500'
            }`}
          >
            Major
          </button>
          <button
            onClick={() => { setKeyMode('minor'); setNumerals(['i', 'iv', 'v', 'i']) }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              keyMode === 'minor' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500'
            }`}
          >
            Minor
          </button>
        </div>
      </div>

      {/* Key selector */}
      <div>
        <label className="block text-xs font-medium text-surface-500 mb-1.5">Key</label>
        <div className="flex flex-wrap gap-1">
          {MAJOR_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => setKey(k)}
              className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                k === key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-surface-200 text-surface-700 hover:bg-surface-50'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-xs font-medium text-surface-500 mb-1.5">Presets</label>
        <div className="flex flex-wrap gap-1.5">
          {availablePresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-surface-200 rounded-lg hover:bg-surface-50 text-surface-700 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Current progression */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-surface-900">
            Your Progression in {key} {isMinor ? 'minor' : 'major'}
          </h2>
          <span className="text-xs text-surface-400">{numerals.length} chords</span>
        </div>

        {/* Chord slots */}
        {numerals.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {numerals.map((num, i) => (
              <div
                key={`${num}-${i}`}
                className={`relative group flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer min-w-[60px] ${
                  playing && i === currentIdx
                    ? 'border-primary-500 bg-primary-50 scale-105 shadow-md'
                    : 'border-surface-200 bg-white hover:border-surface-300'
                }`}
                onClick={() => playSingleChord(i)}
              >
                <div className="text-lg font-bold text-surface-900">{num}</div>
                <div className="text-[10px] text-surface-400">{chordNames[i] ?? '?'}</div>

                {/* Controls (show on hover) */}
                <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-0.5">
                  {i > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); moveChord(i, -1) }}
                      className="w-5 h-5 bg-surface-200 rounded-full text-[10px] text-surface-600 hover:bg-surface-300"
                    >←</button>
                  )}
                  {i < numerals.length - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); moveChord(i, 1) }}
                      className="w-5 h-5 bg-surface-200 rounded-full text-[10px] text-surface-600 hover:bg-surface-300"
                    >→</button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeChord(i) }}
                    className="w-5 h-5 bg-red-100 rounded-full text-[10px] text-red-600 hover:bg-red-200"
                  >×</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-surface-400 py-8">
            Add chords below or pick a preset
          </div>
        )}

        {/* Add chord buttons */}
        <div>
          <label className="block text-xs font-medium text-surface-500 mb-1.5">Add Chord</label>
          <div className="flex flex-wrap gap-1.5">
            {availableNumerals.map((n) => (
              <button
                key={n.numeral}
                onClick={() => addChord(n.numeral)}
                className="px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm hover:bg-surface-100 transition-colors"
              >
                <div className="font-bold text-surface-900">{n.label}</div>
                <div className="text-[9px] text-surface-400">{n.quality}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={playing ? stopProgression : playProgression}
          disabled={numerals.length === 0}
          className={`px-6 py-2.5 font-bold rounded-lg transition-colors disabled:opacity-40 ${
            playing
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {playing ? 'Stop' : 'Play'}
        </button>

        {/* BPM */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500">BPM:</span>
          {BPM_OPTIONS.map((b) => (
            <button
              key={b}
              onClick={() => setBpm(b)}
              className={`px-2 py-1 text-xs rounded ${
                bpm === b ? 'bg-primary-100 text-primary-700 font-bold' : 'text-surface-500 hover:bg-surface-50'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Loop toggle */}
        <label className="flex items-center gap-1.5 text-sm text-surface-600 cursor-pointer">
          <input
            type="checkbox"
            checked={looping}
            onChange={(e) => setLooping(e.target.checked)}
            className="accent-primary-500"
          />
          Loop
        </label>
      </div>

      {/* Notation display */}
      {numerals.length > 0 && (
        <div className="bg-surface-50 rounded-xl p-4">
          <div className="text-xs font-medium text-surface-500 mb-2">Roman Numerals</div>
          <div className="text-lg font-mono font-bold text-surface-900">
            {numerals.join(' → ')}
          </div>
          <div className="text-sm text-surface-500 mt-1">
            {chordNames.join(' → ')}
          </div>
        </div>
      )}
    </div>
  )
}
