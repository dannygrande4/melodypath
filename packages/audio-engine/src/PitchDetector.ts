import { YIN } from 'pitchfinder'
import { noteToFrequency, midiToNote } from '@melodypath/music-theory'
import type { PitchResult } from '@melodypath/shared-types'

export type PitchCallback = (result: PitchResult | null) => void

export class PitchDetector {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private stream: MediaStream | null = null
  private animationFrame: number | null = null
  private detect: ((buffer: Float32Array) => number | null) | null = null
  private callback: PitchCallback | null = null
  private readonly sampleRate = 44100

  async start(callback: PitchCallback): Promise<void> {
    this.callback = callback

    // Use default audio constraints — let the browser/phone optimize
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    this.audioContext = new AudioContext({ sampleRate: this.sampleRate })

    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 2048

    const source = this.audioContext.createMediaStreamSource(this.stream)
    source.connect(this.analyser)

    // Default YIN settings — they worked before
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
      this.callback?.(result)
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

  getLevel(): number {
    if (!this.analyser) return 0
    const buffer = new Float32Array(this.analyser.fftSize)
    this.analyser.getFloatTimeDomainData(buffer)
    let sum = 0
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i]
    }
    const rms = Math.sqrt(sum / buffer.length)
    return Math.min(1, rms * 100)
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
