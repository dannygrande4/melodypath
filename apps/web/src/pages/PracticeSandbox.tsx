import { useState, useCallback, useRef } from 'react'
import { useAudioInit } from '@/hooks/useAudioInit'
import { useAudioStore } from '@/stores/audioStore'
import PianoKeyboard from '@/components/Piano/PianoKeyboard'
import GuitarFretboard from '@/components/Guitar/GuitarFretboard'
import Tuner from '@/components/Tuner/Tuner'
import AudioRecorder from '@/components/Practice/AudioRecorder'
import InfoTooltip from '@/components/ui/InfoTooltip'
import WhatIsThis from '@/components/ui/WhatIsThis'

const INSTRUMENTS = [
  { value: 'guitar' as const, icon: '🎸', label: 'Guitar' },
  { value: 'piano' as const, icon: '🎹', label: 'Piano' },
  { value: 'synth' as const, icon: '🎵', label: 'Synth' },
]

export default function PracticeSandbox() {
  const { ensureAudio } = useAudioInit()
  const engine = useAudioStore((s) => s.engine)
  const currentInstrument = useAudioStore((s) => s.instrument)
  const setInstrument = useAudioStore((s) => s.setInstrument)

  const [bpm, setBpm] = useState(120)
  const [metronomeOn, setMetronomeOn] = useState(false)
  const [activeNotes, setActiveNotes] = useState<string[]>([])
  const [beat, setBeat] = useState(0)
  const beatInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // ─── Metronome ──────────────────────────────────────────────────────────

  const toggleMetronome = useCallback(async () => {
    await ensureAudio()

    if (metronomeOn) {
      engine.stopMetronome()
      if (beatInterval.current) clearInterval(beatInterval.current)
      beatInterval.current = null
      setMetronomeOn(false)
      setBeat(0)
    } else {
      engine.startMetronome(bpm)
      setMetronomeOn(true)
      setBeat(0)

      // Visual beat counter
      const ms = (60 / bpm) * 1000
      let b = 0
      beatInterval.current = setInterval(() => {
        b = (b + 1) % 4
        setBeat(b)
      }, ms)
    }
  }, [ensureAudio, engine, bpm, metronomeOn])

  const handleBpmChange = useCallback(
    (newBpm: number) => {
      setBpm(newBpm)
      if (metronomeOn) {
        engine.setBpm(newBpm)
        // Restart visual counter with new interval
        if (beatInterval.current) clearInterval(beatInterval.current)
        const ms = (60 / newBpm) * 1000
        let b = 0
        beatInterval.current = setInterval(() => {
          b = (b + 1) % 4
          setBeat(b)
        }, ms)
      }
    },
    [engine, metronomeOn],
  )

  // Tap tempo
  const tapTimesRef = useRef<number[]>([])
  const handleTapTempo = useCallback(() => {
    const now = Date.now()
    tapTimesRef.current.push(now)
    if (tapTimesRef.current.length > 8) tapTimesRef.current.shift()
    if (tapTimesRef.current.length >= 2) {
      const taps = tapTimesRef.current
      const intervals = taps.slice(1).map((t, i) => t - taps[i])
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const detected = Math.round(60000 / avgMs)
      if (detected >= 40 && detected <= 240) {
        handleBpmChange(detected)
      }
    }
  }, [handleBpmChange])

  // ─── Piano ──────────────────────────────────────────────────────────────

  const handleNotePlay = useCallback(
    async (note: string) => {
      await ensureAudio()
      engine.noteOn(note)
      setActiveNotes((prev) => [...prev.filter((n) => n !== note), note])
    },
    [ensureAudio, engine],
  )

  const handleNoteRelease = useCallback(
    (note: string) => {
      engine.noteOff(note)
      setActiveNotes((prev) => prev.filter((n) => n !== note))
    },
    [engine],
  )

  // ─── Guitar ─────────────────────────────────────────────────────────────

  const handleGuitarPluck = useCallback(
    async (note: string) => {
      await ensureAudio()
      engine.playNote(note, '4n')
      setActiveNotes((prev) => [...prev.filter((n) => n !== note), note])
      setTimeout(() => {
        setActiveNotes((prev) => prev.filter((n) => n !== note))
      }, 350)
    },
    [ensureAudio, engine],
  )

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Practice</h1>
        <p className="text-surface-500 text-sm mt-1">
          Free play with a metronome and backing tools
        </p>
      </div>

      <WhatIsThis
        explanation="This is your practice space! Use the metronome to keep a steady beat, the tuner to check if your guitar is in tune, backing tracks to jam along with, or the piano to experiment with notes and chords. Record yourself to hear how you sound!"
        lessonId="rhythm-basics"
        lessonTitle="Rhythm & Time"
      />

      {/* Metronome section */}
      <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
        <h2 className="flex items-center text-lg font-bold text-surface-900">
          Metronome
          <InfoTooltip
            size="md"
            text="A metronome keeps a steady beat at a specific speed (BPM = Beats Per Minute). Practicing with a metronome helps you develop solid timing and rhythm."
            detail="The highlighted beat shows beat 1 (the downbeat) in amber - this is the strongest beat in each measure."
          />
        </h2>

        {/* Visual beat display */}
        <div className="flex items-center justify-center gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full border-2 transition-all duration-100 flex items-center justify-center font-bold text-sm ${
                metronomeOn && beat === i
                  ? i === 0
                    ? 'bg-accent-500 border-accent-500 text-white scale-110'
                    : 'bg-primary-500 border-primary-500 text-white scale-110'
                  : 'border-surface-200 text-surface-400'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* BPM display + control */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => handleBpmChange(Math.max(40, bpm - 5))}
            className="w-10 h-10 rounded-lg border border-surface-200 text-surface-600 font-bold hover:bg-surface-50"
          >
            -
          </button>
          <div className="text-center">
            <div className="text-4xl font-extrabold text-surface-900">{bpm}</div>
            <div className="text-xs text-surface-400">BPM</div>
          </div>
          <button
            onClick={() => handleBpmChange(Math.min(240, bpm + 5))}
            className="w-10 h-10 rounded-lg border border-surface-200 text-surface-600 font-bold hover:bg-surface-50"
          >
            +
          </button>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={40}
          max={240}
          value={bpm}
          onChange={(e) => handleBpmChange(Number(e.target.value))}
          className="w-full accent-primary-500"
        />

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleMetronome}
            className={`px-8 py-3 font-bold rounded-xl transition-colors ${
              metronomeOn
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {metronomeOn ? 'Stop' : 'Start'}
          </button>
          <button
            onClick={handleTapTempo}
            className="px-6 py-3 bg-white border border-surface-200 text-surface-700 font-medium rounded-xl hover:bg-surface-50"
          >
            Tap Tempo
          </button>
        </div>

        {/* Preset BPMs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[60, 80, 100, 120, 140, 160, 180].map((b) => (
            <button
              key={b}
              onClick={() => handleBpmChange(b)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                bpm === b
                  ? 'bg-primary-50 border-primary-400 text-primary-700 font-medium'
                  : 'border-surface-200 text-surface-500 hover:bg-surface-50'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Instrument selector */}
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h2 className="flex items-center text-lg font-bold text-surface-900 mb-3">
          Instrument Sound
          <InfoTooltip text="Choose which instrument sound to use. Piano uses realistic acoustic samples, Guitar uses nylon guitar, Synth uses a soft synthesizer." />
        </h2>
        <div className="flex gap-2">
          {INSTRUMENTS.map((inst) => (
            <button
              key={inst.value}
              onClick={async () => { await ensureAudio(); setInstrument(inst.value) }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                currentInstrument === inst.value
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-surface-200 hover:bg-surface-50 text-surface-600'
              }`}
            >
              <span className="text-xl">{inst.icon}</span>
              {inst.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tuner */}
      <Tuner />

      {/* Audio recorder */}
      <AudioRecorder />

      {/* Free play guitar */}
      <div>
        <h2 className="flex items-center text-lg font-bold text-surface-900 mb-3">
          Free Play Guitar
          <InfoTooltip
            size="md"
            text="Click any fret to pluck that note. Standard tuning (E A D G B E) from low to high."
            detail="Auto-switches the instrument sound to guitar when you play. Great for finding notes, trying riffs, or exploring the fretboard."
          />
        </h2>
        <div className="bg-white rounded-xl border border-surface-200 p-4 overflow-x-auto">
          <GuitarFretboard
            frets={24}
            freePlay
            onNotePlay={async (note) => {
              if (currentInstrument !== 'guitar') {
                await ensureAudio()
                setInstrument('guitar')
              }
              handleGuitarPluck(note)
            }}
            activeNotes={activeNotes}
            showFretNumbers
            showLabels={false}
          />
        </div>
      </div>

      {/* Free play piano */}
      <div>
        <h2 className="text-lg font-bold text-surface-900 mb-3">Free Play Piano</h2>
        <div className="overflow-x-auto pb-2 hidden sm:block">
          <PianoKeyboard
            startOctave={3}
            octaves={3}
            activeNotes={activeNotes}
            onNotePlay={handleNotePlay}
            onNoteRelease={handleNoteRelease}
            showLabels
          />
        </div>
        <div className="overflow-x-auto pb-2 sm:hidden">
          <PianoKeyboard
            startOctave={3}
            octaves={2}
            activeNotes={activeNotes}
            onNotePlay={handleNotePlay}
            onNoteRelease={handleNoteRelease}
            showLabels
            compact
          />
        </div>
      </div>
    </div>
  )
}
