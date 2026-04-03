import * as Tone from 'tone'
import Soundfont from 'soundfont-player'

export type SupportedInstrument = 'piano' | 'guitar' | 'synth'

interface ScheduledNote {
  note: string
  time: number
  duration: number
}

// Map our instrument names to soundfont instrument names
const SOUNDFONT_INSTRUMENTS: Record<SupportedInstrument, string> = {
  piano: 'acoustic_grand_piano',
  guitar: 'acoustic_guitar_nylon',
  synth: 'synth_strings_1',
}

/**
 * Central audio engine — uses Soundfont for realistic instruments,
 * Tone.js for synthesis fallback, metronome, and transport.
 */
export class AudioEngine {
  private synth: Tone.PolySynth | null = null
  private metronome: Tone.Synth | null = null
  private metronomeLoop: Tone.Loop | null = null
  private _initialized = false

  // Soundfont instruments
  private audioContext: AudioContext | null = null
  private sfInstruments: Map<string, Soundfont.Player> = new Map()
  private currentInstrument: SupportedInstrument = 'piano'
  private _loadingInstrument = false

  // Sustain: track currently held notes for release
  private activeNodes: Map<string, Soundfont.Player> = new Map()

  async init(): Promise<void> {
    if (this._initialized) return
    await Tone.start()

    // Tone.js synth as fallback
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0.4, release: 1.2 },
    }).toDestination()

    // Web Audio context for soundfont
    this.audioContext = new AudioContext()

    this._initialized = true

    // Start loading the default instrument in the background
    this.loadInstrument(this.currentInstrument)
  }

  get initialized(): boolean {
    return this._initialized
  }

  private ensureInit() {
    if (!this._initialized) {
      throw new Error('AudioEngine not initialized. Call init() first from a user gesture.')
    }
  }

  // ─── Instrument Loading ───────────────────────────────────────────────────

  /**
   * Load a soundfont instrument. Returns when ready.
   */
  async loadInstrument(instrument: SupportedInstrument): Promise<void> {
    if (this._loadingInstrument) return
    if (this.sfInstruments.has(instrument)) {
      this.currentInstrument = instrument
      return
    }

    if (!this.audioContext) return
    this._loadingInstrument = true

    try {
      const sfName = SOUNDFONT_INSTRUMENTS[instrument]
      const player = await Soundfont.instrument(this.audioContext, sfName as any, {
        gain: 2,
        decay: 1.5,
      })
      this.sfInstruments.set(instrument, player)
      this.currentInstrument = instrument
    } catch (e) {
      console.warn(`Failed to load soundfont for ${instrument}, using synth fallback`, e)
    } finally {
      this._loadingInstrument = false
    }
  }

  setInstrument(instrument: SupportedInstrument): void {
    this.currentInstrument = instrument
    if (!this.sfInstruments.has(instrument)) {
      this.loadInstrument(instrument)
    }
  }

  private getSoundfont(): Soundfont.Player | null {
    return this.sfInstruments.get(this.currentInstrument) ?? null
  }

  // ─── Note Playback ────────────────────────────────────────────────────────

  /**
   * Play a single note. Uses soundfont if loaded, Tone.js synth as fallback.
   */
  playNote(note: string, duration: Tone.Unit.Time = '8n'): void {
    this.ensureInit()
    const sf = this.getSoundfont()
    if (sf && this.audioContext) {
      sf.play(note, this.audioContext.currentTime, {
        duration: typeof duration === 'number' ? duration : 0.5,
        gain: 1.5,
      })
    } else {
      this.synth!.triggerAttackRelease(note, duration)
    }
  }

  /**
   * Start playing a note (sustain until noteOff is called).
   * Used for press-and-hold behavior on the piano.
   */
  noteOn(note: string): void {
    this.ensureInit()
    const sf = this.getSoundfont()
    if (sf && this.audioContext) {
      // Stop any existing instance of this note
      this.noteOff(note)
      sf.play(note, this.audioContext.currentTime, {
        duration: 10, // long duration, will be cut by noteOff
        gain: 1.5,
      })
      // Store a reference (soundfont-player doesn't return node directly,
      // so we track it to call stop() on the instrument for this note)
      this.activeNodes.set(note, sf)
    } else {
      this.synth!.triggerAttack(note)
    }
  }

  /**
   * Stop a sustained note.
   */
  noteOff(note: string): void {
    this.ensureInit()
    const sf = this.activeNodes.get(note)
    if (sf) {
      sf.stop(this.audioContext?.currentTime)
      this.activeNodes.delete(note)
    } else {
      try {
        this.synth?.triggerRelease(note)
      } catch {
        // Note wasn't playing
      }
    }
  }

  /**
   * Play multiple notes as a chord.
   */
  playChord(notes: string[], duration: Tone.Unit.Time = '2n'): void {
    this.ensureInit()
    const sf = this.getSoundfont()
    if (sf && this.audioContext) {
      const dur = typeof duration === 'number' ? duration : 1
      for (const note of notes) {
        sf.play(note, this.audioContext.currentTime, { duration: dur, gain: 1.2 })
      }
    } else {
      this.synth!.triggerAttackRelease(notes, duration)
    }
  }

  /**
   * Schedule a sequence of notes against Tone.Transport.
   */
  scheduleSequence(notes: ScheduledNote[], onComplete?: () => void): void {
    this.ensureInit()
    Tone.Transport.cancel()

    notes.forEach(({ note, time, duration }) => {
      Tone.Transport.schedule(() => {
        this.playNote(note, duration)
      }, time)
    })

    if (onComplete) {
      const lastNote = notes[notes.length - 1]
      if (lastNote) {
        const endTime = lastNote.time + (typeof lastNote.duration === 'number' ? lastNote.duration : 1)
        Tone.Transport.schedule(() => onComplete(), endTime)
      }
    }
  }

  // ─── Metronome ────────────────────────────────────────────────────────────

  startMetronome(bpm: number): void {
    this.ensureInit()
    this.stopMetronome()

    Tone.Transport.bpm.value = bpm
    this.metronome = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.08 },
      volume: -6,
    }).toDestination()

    let beat = 0
    this.metronomeLoop = new Tone.Loop((time) => {
      const isDownbeat = beat % 4 === 0
      this.metronome!.triggerAttackRelease(isDownbeat ? 'G5' : 'D5', '32n', time)
      beat++
    }, '4n')

    this.metronomeLoop.start(0)
    Tone.Transport.start()
  }

  stopMetronome(): void {
    this.metronomeLoop?.stop()
    this.metronomeLoop?.dispose()
    this.metronomeLoop = null
    this.metronome?.dispose()
    this.metronome = null

    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop()
    }
  }

  setBpm(bpm: number): void {
    Tone.Transport.bpm.value = bpm
  }

  // ─── Transport ────────────────────────────────────────────────────────────

  startTransport(): void {
    Tone.Transport.start()
  }

  stopTransport(): void {
    Tone.Transport.stop()
    Tone.Transport.cancel()
  }

  get transportTime(): number {
    return Tone.Transport.seconds
  }

  // ─── Volume ───────────────────────────────────────────────────────────────

  setVolume(db: number): void {
    Tone.Destination.volume.value = db
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  dispose(): void {
    this.stopMetronome()
    this.synth?.dispose()
    this.synth = null
    for (const [, sf] of this.sfInstruments) {
      sf.stop()
    }
    this.sfInstruments.clear()
    this.activeNodes.clear()
    this.audioContext?.close()
    this.audioContext = null
    this._initialized = false
  }
}
