import { useState, useCallback, useRef } from 'react'
import { PitchDetector } from '@moniquemusic/audio-engine'
import type { PitchResult } from '@moniquemusic/shared-types'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Standard guitar tuning reference
const GUITAR_STRINGS = [
  { string: 6, note: 'E2', freq: 82.41 },
  { string: 5, note: 'A2', freq: 110.0 },
  { string: 4, note: 'D3', freq: 146.83 },
  { string: 3, note: 'G3', freq: 196.0 },
  { string: 2, note: 'B3', freq: 246.94 },
  { string: 1, note: 'E4', freq: 329.63 },
]

function getMostCommonNote(results: PitchResult[]): string | null {
  const counts: Record<string, number> = {}
  for (const r of results) {
    counts[r.note] = (counts[r.note] ?? 0) + 1
  }
  let best: string | null = null
  let bestCount = 0
  for (const [note, count] of Object.entries(counts)) {
    if (count > bestCount) {
      best = note
      bestCount = count
    }
  }
  return best
}

export default function Tuner() {
  const [listening, setListening] = useState(false)
  const [pitch, setPitch] = useState<PitchResult | null>(null)
  const detectorRef = useRef<PitchDetector | null>(null)
  const historyRef = useRef<PitchResult[]>([])
  const lastUpdateRef = useRef(0)

  const startListening = useCallback(async () => {
    if (detectorRef.current) {
      detectorRef.current.stop()
    }
    const detector = new PitchDetector()
    detectorRef.current = detector
    setListening(true)
    historyRef.current = []

    await detector.start((result) => {
      const now = Date.now()

      if (!result) {
        // Only clear display after 800ms of silence
        if (now - lastUpdateRef.current > 800) {
          setPitch(null)
        }
        return
      }

      // Keep a rolling window of recent detections
      historyRef.current.push(result)
      if (historyRef.current.length > 8) historyRef.current.shift()

      // Only update display if we have consistent readings
      const recent = historyRef.current.slice(-5)
      const mostCommonNote = getMostCommonNote(recent)

      if (mostCommonNote && recent.filter((r) => r.note === mostCommonNote).length >= 3) {
        // Average the frequency and cents for the dominant note
        const matching = recent.filter((r) => r.note === mostCommonNote)
        const avgFreq = matching.reduce((s, r) => s + r.frequency, 0) / matching.length
        const avgCents = Math.round(matching.reduce((s, r) => s + r.cents, 0) / matching.length)
        const avgConfidence = matching.reduce((s, r) => s + r.confidence, 0) / matching.length

        setPitch({
          note: mostCommonNote,
          frequency: avgFreq,
          cents: avgCents,
          confidence: avgConfidence,
        })
        lastUpdateRef.current = now
      }
    })
  }, [])

  const stopListening = useCallback(() => {
    detectorRef.current?.stop()
    detectorRef.current = null
    setListening(false)
    setPitch(null)
  }, [])

  const cents = pitch?.cents ?? 0
  const inTune = Math.abs(cents) < 5
  const noteColor = !pitch
    ? 'text-surface-300'
    : inTune
      ? 'text-timing-perfect'
      : Math.abs(cents) < 15
        ? 'text-timing-good'
        : 'text-timing-miss'

  // Gauge: cents range -50 to +50 mapped to 0–100%
  const gaugePosition = pitch ? Math.max(0, Math.min(100, ((cents + 50) / 100) * 100)) : 50

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-surface-900">Tuner</h2>
        <button
          onClick={listening ? stopListening : startListening}
          className={`px-5 py-2 font-bold rounded-lg transition-colors text-sm ${
            listening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {listening ? 'Stop' : 'Start Tuner'}
        </button>
      </div>

      {/* Main display */}
      <div className="text-center space-y-3">
        {/* Note name */}
        <div className={`text-7xl font-extrabold transition-colors ${noteColor}`}>
          {pitch ? pitch.note.replace(/\d/, '') : '-'}
        </div>
        <div className="text-lg text-surface-400">
          {pitch ? `${pitch.note} · ${pitch.frequency.toFixed(1)} Hz` : 'Play a note...'}
        </div>

        {/* Cents gauge */}
        <div className="relative mx-auto max-w-xs">
          {/* Track */}
          <div className="h-3 bg-surface-100 rounded-full overflow-hidden relative">
            {/* Center marker */}
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-surface-300 -translate-x-1/2 z-10" />
            {/* Color zones */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-red-100" />
              <div className="flex-1 bg-yellow-100" />
              <div className="flex-1 bg-green-100" />
              <div className="flex-1 bg-green-100" />
              <div className="flex-1 bg-yellow-100" />
              <div className="flex-1 bg-red-100" />
            </div>
            {/* Needle */}
            {pitch && (
              <div
                className="absolute top-0 h-full w-2 rounded-full bg-surface-900 transition-all duration-100 -translate-x-1/2"
                style={{ left: `${gaugePosition}%` }}
              />
            )}
          </div>
          {/* Labels */}
          <div className="flex justify-between text-[10px] text-surface-400 mt-1">
            <span>Flat</span>
            <span>In Tune</span>
            <span>Sharp</span>
          </div>
        </div>

        {/* Cents readout */}
        {pitch && (
          <div className={`text-sm font-bold ${noteColor}`}>
            {inTune ? 'In Tune!' : `${cents > 0 ? '+' : ''}${cents} cents`}
          </div>
        )}
      </div>

      {/* Guitar string reference */}
      <div>
        <div className="text-xs font-medium text-surface-500 mb-2">Standard Guitar Tuning</div>
        <div className="flex gap-2 justify-center">
          {GUITAR_STRINGS.map((s) => {
            const isClosest =
              pitch &&
              pitch.note.replace(/\d/, '') === s.note.replace(/\d/, '') &&
              Math.abs(pitch.frequency - s.freq) < 20
            return (
              <div
                key={s.string}
                className={`w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold transition-colors ${
                  isClosest
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-surface-200 text-surface-500'
                }`}
              >
                <div>{s.note.replace(/\d/, '')}</div>
                <div className="text-[9px] font-normal text-surface-400">{s.string}</div>
              </div>
            )
          })}
        </div>
      </div>

      {!listening && (
        <p className="text-xs text-surface-400 text-center">
          Click "Start Tuner" and play a note on your instrument. The tuner uses your microphone to detect the pitch.
        </p>
      )}
    </div>
  )
}
