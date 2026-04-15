import { useState, useRef, useCallback, useEffect } from 'react'
import { PitchDetector } from '@moniquemusic/audio-engine'
import type { PitchResult } from '@moniquemusic/shared-types'

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
      // Only clear after a pause - don't clear on every null frame
      historyRef.current = []
      return
    }

    // Show ANY detection immediately - no smoothing filter
    setCurrentPitch(result)

    // Track history for hold confirmation only
    historyRef.current.push(result)
    if (historyRef.current.length > 10) historyRef.current.shift()

    // Use the most recent note for hold tracking
    const dominant = result.note

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
