import type { AudioEngine } from './AudioEngine.js'
import { midiToNote } from '@moniquemusic/music-theory'

export type MIDINoteCallback = (note: string, velocity: number) => void
export type MIDINoteOffCallback = (note: string) => void

/**
 * Manages Web MIDI API access and routes MIDI events to the AudioEngine
 * and any registered callbacks (e.g. to highlight keys on the Piano component).
 */
export class MIDIManager {
  private access: MIDIAccess | null = null
  private activeInput: MIDIInput | null = null
  private onNoteOn: MIDINoteCallback | null = null
  private onNoteOff: MIDINoteOffCallback | null = null
  private engine: AudioEngine

  constructor(engine: AudioEngine) {
    this.engine = engine
  }

  get isSupported(): boolean {
    return 'requestMIDIAccess' in navigator
  }

  async connect(): Promise<string[]> {
    if (!this.isSupported) {
      console.warn('Web MIDI API not supported in this browser.')
      return []
    }

    this.access = await navigator.requestMIDIAccess()
    return this.listInputs()
  }

  listInputs(): string[] {
    if (!this.access) return []
    return Array.from(this.access.inputs.values()).map((i) => i.name ?? 'Unknown')
  }

  /**
   * Select a MIDI input port by name (or the first available if name omitted).
   */
  selectInput(name?: string): boolean {
    if (!this.access) return false

    const inputs = Array.from(this.access.inputs.values())
    const input = name ? inputs.find((i) => i.name === name) : inputs[0]

    if (!input) return false

    this.activeInput?.removeEventListener('midimessage', this.handleMessage)
    this.activeInput = input
    this.activeInput.addEventListener('midimessage', this.handleMessage)
    return true
  }

  /**
   * Register callbacks for note events - used to highlight keys in the UI.
   */
  setCallbacks(onNoteOn: MIDINoteCallback, onNoteOff: MIDINoteOffCallback): void {
    this.onNoteOn = onNoteOn
    this.onNoteOff = onNoteOff
  }

  private handleMessage = (event: Event): void => {
    const msg = event as MIDIMessageEvent
    if (!msg.data) return

    const [status, midiNote, velocity] = msg.data
    const isNoteOn = (status & 0xf0) === 0x90 && velocity > 0
    const isNoteOff = (status & 0xf0) === 0x80 || ((status & 0xf0) === 0x90 && velocity === 0)

    const noteName = midiToNote(midiNote)

    if (isNoteOn) {
      this.engine.playNote(noteName, '8n')
      this.onNoteOn?.(noteName, velocity)
    } else if (isNoteOff) {
      this.onNoteOff?.(noteName)
    }
  }

  disconnect(): void {
    this.activeInput?.removeEventListener('midimessage', this.handleMessage)
    this.activeInput = null
  }
}
