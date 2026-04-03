import { create } from 'zustand'
import { AudioEngine, MIDIManager, type SupportedInstrument } from '@melodypath/audio-engine'

interface AudioState {
  engine: AudioEngine
  midiManager: MIDIManager | null
  initialized: boolean
  volume: number
  bpm: number
  instrument: SupportedInstrument
  midiInputs: string[]
  activeMidiInput: string | null

  init: () => Promise<void>
  setVolume: (db: number) => void
  setBpm: (bpm: number) => void
  setInstrument: (instrument: SupportedInstrument) => void
  connectMIDI: () => Promise<void>
  selectMidiInput: (name: string) => void
}

const engine = new AudioEngine()

export const useAudioStore = create<AudioState>()((set, get) => ({
  engine,
  midiManager: null,
  initialized: false,
  volume: 0,
  bpm: 120,
  instrument: 'piano',
  midiInputs: [],
  activeMidiInput: null,

  init: async () => {
    if (get().initialized) return
    await engine.init()
    set({ initialized: true })
  },

  setVolume: (db) => {
    engine.setVolume(db)
    set({ volume: db })
  },

  setBpm: (bpm) => {
    engine.setBpm(bpm)
    set({ bpm })
  },

  setInstrument: (instrument) => {
    engine.setInstrument(instrument)
    set({ instrument })
  },

  connectMIDI: async () => {
    const { engine } = get()
    const manager = new MIDIManager(engine)
    const inputs = await manager.connect()
    manager.selectInput()
    set({ midiManager: manager, midiInputs: inputs, activeMidiInput: inputs[0] ?? null })
  },

  selectMidiInput: (name) => {
    const { midiManager } = get()
    if (midiManager?.selectInput(name)) {
      set({ activeMidiInput: name })
    }
  },
}))
