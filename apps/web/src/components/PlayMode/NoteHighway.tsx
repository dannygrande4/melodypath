import { useRef, useEffect, useCallback, useState } from 'react'
import type { NoteEvent, TimingGrade } from '@melodypath/shared-types'

// ─── Constants ───────────────────────────────────────────────────────────────

const NUM_LANES = 4
const LANE_COLORS = ['#4f6ef7', '#22c55e', '#f59e0b', '#a855f7']
const LANE_KEYS = ['d', 'f', 'j', 'k']
const HIT_LINE_Y_RATIO = 0.85  // 85% down the canvas
const TIMING = { PERFECT: 0.06, GOOD: 0.12, OK: 0.20 } // seconds — more forgiving

/**
 * Note travel time scales with BPM:
 * - Slow songs (80 BPM): notes fall slower (3s travel) — more time to react
 * - Fast songs (160 BPM): notes fall faster (1.5s travel) — less clutter
 */
function getTravelTime(bpm: number): number {
  return Math.max(1.2, Math.min(3.0, 240 / bpm))
}

interface NoteHighwayProps {
  notes: NoteEvent[]
  bpm: number
  isPlaying: boolean
  currentTime: number   // seconds into the song
  onNoteHit: (index: number, grade: TimingGrade) => void
  onNoteMiss: (index: number) => void
  width?: number
  height?: number
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NoteHighway({
  notes,
  isPlaying,
  currentTime,
  onNoteHit,
  onNoteMiss,
  width = 600,
  height = 500,
}: NoteHighwayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hitNotesRef = useRef<Set<number>>(new Set())
  const missedNotesRef = useRef<Set<number>>(new Set())
  const flashesRef = useRef<{ lane: number; grade: TimingGrade; time: number }[]>([])

  // ─── Hit detection ──────────────────────────────────────────────────

  const tryHitLane = useCallback(
    (lane: number) => {
      if (!isPlaying) return

      const hitLineTime = currentTime
      let bestIdx = -1
      let bestDelta = Infinity

      for (let i = 0; i < notes.length; i++) {
        if (hitNotesRef.current.has(i) || missedNotesRef.current.has(i)) continue
        if (notes[i].lane !== lane) continue

        const delta = Math.abs(notes[i].time - hitLineTime)
        if (delta < bestDelta && delta <= TIMING.OK) {
          bestDelta = delta
          bestIdx = i
        }
      }

      if (bestIdx === -1) return

      let grade: TimingGrade = 'MISS'
      if (bestDelta <= TIMING.PERFECT) grade = 'PERFECT'
      else if (bestDelta <= TIMING.GOOD) grade = 'GOOD'
      else if (bestDelta <= TIMING.OK) grade = 'OK'

      hitNotesRef.current.add(bestIdx)
      flashesRef.current.push({ lane, grade, time: performance.now() })
      onNoteHit(bestIdx, grade)
    },
    [isPlaying, currentTime, notes, onNoteHit],
  )

  // ─── Keyboard input ─────────────────────────────────────────────────

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const lane = LANE_KEYS.indexOf(e.key.toLowerCase())
      if (lane !== -1) {
        e.preventDefault()
        tryHitLane(lane)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tryHitLane])

  // ─── Miss detection ─────────────────────────────────────────────────

  useEffect(() => {
    if (!isPlaying) return
    for (let i = 0; i < notes.length; i++) {
      if (hitNotesRef.current.has(i) || missedNotesRef.current.has(i)) continue
      if (notes[i].time < currentTime - TIMING.OK - 0.05) {
        missedNotesRef.current.add(i)
        onNoteMiss(i)
      }
    }
  }, [isPlaying, currentTime, notes, onNoteMiss])

  // ─── Reset on new song ──────────────────────────────────────────────

  useEffect(() => {
    if (!isPlaying) {
      hitNotesRef.current.clear()
      missedNotesRef.current.clear()
      flashesRef.current = []
    }
  }, [isPlaying])

  // ─── Canvas rendering ───────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    ctx.scale(dpr, dpr)

    const laneWidth = displayWidth / NUM_LANES
    const hitLineY = displayHeight * HIT_LINE_Y_RATIO

    // ── Background ─────────────────────────────────────────────────
    ctx.fillStyle = '#18181b'
    ctx.fillRect(0, 0, displayWidth, displayHeight)

    // Lane dividers
    for (let i = 1; i < NUM_LANES; i++) {
      ctx.strokeStyle = '#27272a'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(i * laneWidth, 0)
      ctx.lineTo(i * laneWidth, displayHeight)
      ctx.stroke()
    }

    // Hit line
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, hitLineY)
    ctx.lineTo(displayWidth, hitLineY)
    ctx.stroke()

    // Hit zone glow
    const grad = ctx.createLinearGradient(0, hitLineY - 30, 0, hitLineY + 20)
    grad.addColorStop(0, 'rgba(255,255,255,0)')
    grad.addColorStop(0.5, 'rgba(255,255,255,0.05)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, hitLineY - 30, displayWidth, 50)

    // Lane key labels
    ctx.fillStyle = '#52525b'
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i < NUM_LANES; i++) {
      ctx.fillText(LANE_KEYS[i].toUpperCase(), (i + 0.5) * laneWidth, displayHeight - 12)
    }

    // ── Draw notes ─────────────────────────────────────────────────
    const now = performance.now()

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]
      const timeUntilHit = note.time - currentTime
      const travelTime = getTravelTime(bpm)
      const progress = 1 - timeUntilHit / travelTime

      // Only draw notes in view
      if (progress < -0.1 || progress > 1.3) continue

      const y = hitLineY * progress
      const cx = (note.lane + 0.5) * laneWidth
      const noteRadius = laneWidth * 0.3

      const isHit = hitNotesRef.current.has(i)
      const isMissed = missedNotesRef.current.has(i)

      if (isHit) {
        // Fade out hit notes
        ctx.globalAlpha = Math.max(0, 1 - (currentTime - note.time) * 4)
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(cx, hitLineY, noteRadius * 1.3, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      } else if (isMissed) {
        // Grey out missed notes
        ctx.globalAlpha = 0.3
        ctx.fillStyle = '#52525b'
        ctx.beginPath()
        ctx.arc(cx, y, noteRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      } else {
        // Normal note
        const color = LANE_COLORS[note.lane]

        // Glow
        ctx.shadowBlur = 12
        ctx.shadowColor = color
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(cx - noteRadius, y - noteRadius * 0.4, noteRadius * 2, noteRadius * 0.8, 6)
        ctx.fill()
        ctx.shadowBlur = 0

        // Border
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }

    // ── Hit flashes ────────────────────────────────────────────────
    for (const flash of flashesRef.current) {
      const age = (now - flash.time) / 1000
      if (age > 0.4) continue

      const cx = (flash.lane + 0.5) * laneWidth
      const radius = laneWidth * 0.4 + age * 80
      const alpha = 1 - age / 0.4

      const gradeColors: Record<TimingGrade, string> = {
        PERFECT: '#22c55e',
        GOOD: '#f59e0b',
        OK: '#f97316',
        MISS: '#ef4444',
      }

      ctx.globalAlpha = alpha * 0.6
      ctx.fillStyle = gradeColors[flash.grade]
      ctx.beginPath()
      ctx.arc(cx, hitLineY, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Clean old flashes
    flashesRef.current = flashesRef.current.filter((f) => (now - f.time) / 1000 < 0.5)
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(width)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setContainerWidth(Math.min(w, width))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [width])

  const displayWidth = containerWidth
  const displayHeight = Math.round((height / width) * displayWidth)

  return (
    <div ref={containerRef} className="relative w-full" style={{ maxWidth: width }}>
      <canvas
        ref={canvasRef}
        style={{ width: displayWidth, height: displayHeight }}
        className="rounded-xl"
      />
      {/* Lane tap buttons for touch/click */}
      <div className="absolute bottom-0 left-0 right-0 flex" style={{ height: displayHeight * 0.2 }}>
        {Array.from({ length: NUM_LANES }, (_, i) => (
          <button
            key={i}
            onPointerDown={() => tryHitLane(i)}
            className="flex-1 opacity-0 hover:opacity-10 active:opacity-20 transition-opacity"
            style={{ backgroundColor: LANE_COLORS[i] }}
            aria-label={`Lane ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
