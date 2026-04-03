import * as Tone from 'tone'

export type SupportedInstrument = 'piano' | 'guitar' | 'synth'

interface ScheduledNote {
  note: string
  time: number
  duration: number
}

/**
 * Central audio engine — wraps Tone.js.
 * One instance should be created and shared across the app via audioStore.
 */
export class AudioEngine {
  private synth: Tone.PolySynth | null = null
  private metronome: Tone.Synth | null = null
  private metronomeLoop: Tone.Loop | null = null
  private _initialized = false

  /**
   * Must be called from a user gesture (click/keydown) to satisfy
   * browser autoplay policy.
   */
  async init(): Promise<void> {
    if (this._initialized) return
    await Tone.start()
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.8 },
    }).toDestination()
    this._initialized = true
  }

  get initialized(): boolean {
    return this._initialized
  }

  private ensureInit() {
    if (!this._initialized || !this.synth) {
      throw new Error('AudioEngine not initialized. Call init() first from a user gesture.')
    }
  }

  // ─── Note Playback ────────────────────────────────────────────────────────

  /**
   * Play a single note immediately.
   * @param note  e.g. "C4"
   * @param duration  Tone.js duration string: "8n", "4n", "1n", or seconds
   */
  playNote(note: string, duration: Tone.Unit.Time = '8n'): void {
    this.ensureInit()
    this.synth!.triggerAttackRelease(note, duration)
  }

  /**
   * Play multiple notes as a chord simultaneously.
   */
  playChord(notes: string[], duration: Tone.Unit.Time = '2n'): void {
    this.ensureInit()
    this.synth!.triggerAttackRelease(notes, duration)
  }

  /**
   * Schedule a sequence of notes against Tone.Transport.
   * Call Tone.Transport.start() after scheduling.
   */
  scheduleSequence(notes: ScheduledNote[], onComplete?: () => void): void {
    this.ensureInit()
    Tone.Transport.cancel()

    notes.forEach(({ note, time, duration }) => {
      Tone.Transport.schedule((audioTime) => {
        this.synth!.triggerAttackRelease(note, duration, audioTime)
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
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
      volume: -10,
    }).toDestination()

    let beat = 0
    this.metronomeLoop = new Tone.Loop((time) => {
      const isDownbeat = beat % 4 === 0
      this.metronome!.triggerAttackRelease(isDownbeat ? 'G5' : 'C5', '32n', time)
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
    this._initialized = false
  }
}
