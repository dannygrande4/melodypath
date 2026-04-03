import { useState, useRef, useCallback, useEffect } from 'react'
import { PitchDetector } from '@melodypath/audio-engine'
import type { PitchResult } from '@melodypath/shared-types'

interface PitchListenerOptions {
  holdTime?: number
  autoStart?: boolean
}

interface PitchListenerState {
  listening: boolean
  currentPitch: PitchResult | null
  confirmedNote: string | null
  holdProgress: number
  /** Mic input level 0-1 */
  micLevel: number
  start: () => Promise<void>
  stop: () => void
}

export function usePitchListener(options: PitchListenerOptions = {}): PitchListenerState {
  const { holdTime = 600, autoStart = false } = options

  const [listening, setListening] = useState(false)
  const [currentPitch, setCurrentPitch] = useState<PitchResult | null>(null)
  const [confirmedNote, setConfirmedNote] = useState<string | null>(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const [micLevel, setMicLevel] = useState(0)

  const detectorRef = useRef<PitchDetector | null>(null)
  const currentNoteRef = useRef<string | null>(null)
  const noteStartRef = useRef(0)
  const historyRef = useRef<PitchResult[]>([])
  const levelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const processResults = useCallback((result: PitchResult | null) => {
    if (!result) {
      currentNoteRef.current = null
      setHoldProgress(0)
      setCurrentPitch(null)
      return
    }

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

    const matching = recent.filter((r) => r.note === dominant)
    const avgPitch: PitchResult = {
      note: dominant,
      frequency: matching.reduce((s, r) => s + r.frequency, 0) / matching.length,
      cents: Math.round(matching.reduce((s, r) => s + r.cents, 0) / matching.length),
      confidence: matching.reduce((s, r) => s + r.confidence, 0) / matching.length,
    }
    setCurrentPitch(avgPitch)

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
    setMicLevel(0)
    historyRef.current = []
    currentNoteRef.current = null
    await detector.start(processResults)

    // Poll mic level every 100ms
    levelIntervalRef.current = setInterval(() => {
      if (detectorRef.current) {
        setMicLevel(detectorRef.current.getLevel())
      }
    }, 100)
  }, [processResults])

  const stop = useCallback(() => {
    detectorRef.current?.stop()
    detectorRef.current = null
    if (levelIntervalRef.current) {
      clearInterval(levelIntervalRef.current)
      levelIntervalRef.current = null
    }
    setListening(false)
    setCurrentPitch(null)
    setHoldProgress(0)
    setMicLevel(0)
  }, [])

  useEffect(() => {
    if (autoStart) start()
    return () => {
      detectorRef.current?.stop()
      if (levelIntervalRef.current) clearInterval(levelIntervalRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    listening,
    currentPitch,
    confirmedNote,
    holdProgress,
    micLevel,
    start,
    stop,
  }
}
