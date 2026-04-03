import { useState, useRef, useCallback, useEffect } from 'react'
import { PitchDetector } from '@melodypath/audio-engine'
import type { PitchResult } from '@melodypath/shared-types'

interface PitchListenerOptions {
  /** How long to hold a note before confirming (ms) */
  holdTime?: number
  /** Auto-start listening */
  autoStart?: boolean
}

interface PitchListenerState {
  listening: boolean
  currentPitch: PitchResult | null
  /** The confirmed note (held long enough) */
  confirmedNote: string | null
  /** How long the current note has been held (0-1 progress toward holdTime) */
  holdProgress: number
  start: () => Promise<void>
  stop: () => void
}

/**
 * Hook that listens to mic input and confirms a note once held steady.
 * Used for "play this note" challenges.
 */
export function usePitchListener(options: PitchListenerOptions = {}): PitchListenerState {
  const { holdTime = 600, autoStart = false } = options

  const [listening, setListening] = useState(false)
  const [currentPitch, setCurrentPitch] = useState<PitchResult | null>(null)
  const [confirmedNote, setConfirmedNote] = useState<string | null>(null)
  const [holdProgress, setHoldProgress] = useState(0)

  const detectorRef = useRef<PitchDetector | null>(null)
  const currentNoteRef = useRef<string | null>(null)
  const noteStartRef = useRef(0)
  const historyRef = useRef<PitchResult[]>([])

  const processResults = useCallback((result: PitchResult | null) => {
    if (!result) {
      currentNoteRef.current = null
      setHoldProgress(0)
      setCurrentPitch(null)
      return
    }

    // Rolling average for stability
    historyRef.current.push(result)
    if (historyRef.current.length > 6) historyRef.current.shift()

    const recent = historyRef.current.slice(-4)
    const counts: Record<string, number> = {}
    for (const r of recent) counts[r.note] = (counts[r.note] ?? 0) + 1

    let dominant: string | null = null
    let maxCount = 0
    for (const [note, count] of Object.entries(counts)) {
      if (count > maxCount) { dominant = note; maxCount = count }
    }

    if (!dominant || maxCount < 2) {
      currentNoteRef.current = null
      setHoldProgress(0)
      return
    }

    // Average the matching readings
    const matching = recent.filter((r) => r.note === dominant)
    const avgPitch: PitchResult = {
      note: dominant,
      frequency: matching.reduce((s, r) => s + r.frequency, 0) / matching.length,
      cents: Math.round(matching.reduce((s, r) => s + r.cents, 0) / matching.length),
      confidence: matching.reduce((s, r) => s + r.confidence, 0) / matching.length,
    }
    setCurrentPitch(avgPitch)

    // Track hold duration
    if (currentNoteRef.current !== dominant) {
      currentNoteRef.current = dominant
      noteStartRef.current = Date.now()
      setHoldProgress(0)
    } else {
      const elapsed = Date.now() - noteStartRef.current
      const progress = Math.min(1, elapsed / holdTime)
      setHoldProgress(progress)

      if (progress >= 1) {
        setConfirmedNote(dominant)
      }
    }
  }, [holdTime])

  const start = useCallback(async () => {
    if (detectorRef.current) detectorRef.current.stop()
    const detector = new PitchDetector()
    detectorRef.current = detector
    setListening(true)
    setConfirmedNote(null)
    setHoldProgress(0)
    historyRef.current = []
    currentNoteRef.current = null
    await detector.start(processResults)
  }, [processResults])

  const stop = useCallback(() => {
    detectorRef.current?.stop()
    detectorRef.current = null
    setListening(false)
    setCurrentPitch(null)
    setHoldProgress(0)
  }, [])

  // Reset confirmed note when caller reads it
  const resetConfirmed = useCallback(() => {
    setConfirmedNote(null)
    setHoldProgress(0)
    currentNoteRef.current = null
    noteStartRef.current = 0
  }, [])

  useEffect(() => {
    if (autoStart) start()
    return () => { detectorRef.current?.stop() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    listening,
    currentPitch,
    confirmedNote,
    holdProgress,
    start,
    stop,
  }
}
