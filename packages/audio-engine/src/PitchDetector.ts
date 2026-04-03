import { YIN } from 'pitchfinder'
import { noteToFrequency, midiToNote } from '@melodypath/music-theory'
import type { PitchResult } from '@melodypath/shared-types'

export type PitchCallback = (result: PitchResult | null) => void

/**
 * Real-time pitch detection from microphone using pitchfinder (YIN algorithm).
 * Tuned for guitar: handles low E (82 Hz) through high frets.
 */
export class PitchDetector {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private stream: MediaStream | null = null
  private animationFrame: number | null = null
  private detect: ((buffer: Float32Array) => number | null) | null = null
  private callback: PitchCallback | null = null
  private readonly confidenceThreshold = 0.3  // very low for phone mic pickup
  private readonly sampleRate = 44100

  async start(callback: PitchCallback): Promise<void> {
    this.callback = callback

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,   // disable — interferes with pitch detection
        noiseSuppression: false,   // disable — can filter out guitar signal
        autoGainControl: true,     // keep — helps with quiet acoustic guitars
      },
      video: false,
    })
    this.audioContext = new AudioContext({ sampleRate: this.sampleRate })

    this.analyser = this.audioContext.createAnalyser()
    // Larger FFT for better low-frequency resolution
    // 4096 at 44100 Hz gives us resolution down to ~10 Hz
    this.analyser.fftSize = 4096
    this.analyser.smoothingTimeConstant = 0.3

    const source = this.audioContext.createMediaStreamSource(this.stream)
    source.connect(this.analyser)

    this.detect = YIN({
      sampleRate: this.sampleRate,
      threshold: 0.15,  // more sensitive (default is 0.2)
    })
    this.loop()
  }

  private loop(): void {
    if (!this.analyser || !this.detect) return

    const buffer = new Float32Array(this.analyser.fftSize)
    this.analyser.getFloatTimeDomainData(buffer)

    const frequency = this.detect(buffer)

    // Guitar range: low E2 = 82 Hz, high E6 = 1318 Hz
    // Allow down to 60 Hz to catch slightly flat low E
    if (frequency && frequency > 60 && frequency < 2000) {
      const result = this.frequencyToPitchResult(frequency)
      if (result.confidence >= this.confidenceThreshold) {
        this.callback?.(result)
      } else {
        this.callback?.(null)
      }
    } else {
      this.callback?.(null)
    }

    this.animationFrame = requestAnimationFrame(() => this.loop())
  }

  private frequencyToPitchResult(frequency: number): PitchResult {
    const midiFloat = 69 + 12 * Math.log2(frequency / 440)
    const midiRounded = Math.round(midiFloat)
    const cents = Math.round((midiFloat - midiRounded) * 100)

    const confidence = 1 - Math.abs(cents) / 50

    const note = midiToNote(midiRounded)

    const expectedFreq = noteToFrequency(note)
    const freqConfidence = expectedFreq
      ? 1 - Math.abs(frequency - expectedFreq) / expectedFreq
      : 0

    return {
      note,
      frequency,
      confidence: Math.min(confidence, freqConfidence > 0 ? freqConfidence + 0.1 : 1),
      cents,
    }
  }

  /**
   * Get the current audio input level (0-1).
   * Useful for showing a mic level meter.
   */
  getLevel(): number {
    if (!this.analyser) return 0
    const buffer = new Float32Array(this.analyser.fftSize)
    this.analyser.getFloatTimeDomainData(buffer)
    let sum = 0
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i]
    }
    const rms = Math.sqrt(sum / buffer.length)
    // Amplify heavily — phone mics have very low raw levels
    return Math.min(1, rms * 30)
  }

  stop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    this.stream?.getTracks().forEach((t) => t.stop())
    this.audioContext?.close()
    this.audioContext = null
    this.analyser = null
    this.stream = null
    this.detect = null
    this.callback = null
  }
}
