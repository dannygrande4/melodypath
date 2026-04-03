import { YIN } from 'pitchfinder'
import { noteToFrequency, midiToNote } from '@melodypath/music-theory'
import type { PitchResult } from '@melodypath/shared-types'

export type PitchCallback = (result: PitchResult | null) => void

/**
 * Real-time pitch detection from microphone using pitchfinder (YIN algorithm).
 * Emits detected pitch via callback when confidence is above threshold.
 */
export class PitchDetector {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private stream: MediaStream | null = null
  private animationFrame: number | null = null
  private detect: ((buffer: Float32Array) => number | null) | null = null
  private callback: PitchCallback | null = null
  private readonly confidenceThreshold = 0.8
  private readonly sampleRate = 44100

  async start(callback: PitchCallback): Promise<void> {
    this.callback = callback

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    this.audioContext = new AudioContext({ sampleRate: this.sampleRate })

    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 2048

    const source = this.audioContext.createMediaStreamSource(this.stream)
    source.connect(this.analyser)

    this.detect = YIN({ sampleRate: this.sampleRate })
    this.loop()
  }

  private loop(): void {
    if (!this.analyser || !this.detect) return

    const buffer = new Float32Array(this.analyser.fftSize)
    this.analyser.getFloatTimeDomainData(buffer)

    const frequency = this.detect(buffer)

    if (frequency && frequency > 50 && frequency < 5000) {
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
    // Convert frequency to MIDI note number
    const midiFloat = 69 + 12 * Math.log2(frequency / 440)
    const midiRounded = Math.round(midiFloat)
    const cents = Math.round((midiFloat - midiRounded) * 100)

    // Estimate confidence from how close to a semitone boundary we are
    const confidence = 1 - Math.abs(cents) / 50

    const note = midiToNote(midiRounded)

    // Verify with noteToFrequency for accuracy check
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
