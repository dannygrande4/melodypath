import { useUserStore } from '@/stores/userStore'
import { useUIStore } from '@/stores/uiStore'
import { useAudioStore } from '@/stores/audioStore'
import InfoTooltip from '@/components/ui/InfoTooltip'
import type { AgeGroup, InstrumentType, AgeMode } from '@moniquemusic/shared-types'

const AGE_OPTIONS: { value: AgeGroup; label: string; desc: string }[] = [
  { value: 'KIDS', label: 'Junior (8–12)', desc: 'Colorful UI, simple language, shorter lessons' },
  { value: 'ADULT', label: 'Adult (13–59)', desc: 'Full terminology, standard layout' },
  { value: 'SENIOR', label: 'Senior (60+)', desc: 'Larger text, higher contrast, simplified nav' },
]

const INSTRUMENT_OPTIONS: { value: InstrumentType; icon: string; label: string }[] = [
  { value: 'GUITAR', icon: '🎸', label: 'Guitar' },
  { value: 'PIANO', icon: '🎹', label: 'Piano / Keyboard' },
  { value: 'GENERAL', icon: '🎼', label: 'Other / General' },
]

const MODE_OPTIONS: { value: AgeMode; label: string; desc: string }[] = [
  { value: 'kids', label: 'Kids', desc: 'Stars, mascot, simple words' },
  { value: 'adult', label: 'Adult', desc: 'Clean, professional' },
  { value: 'accessible', label: 'Accessible', desc: 'Large text, high contrast' },
]

export default function Settings() {
  const { age_group, instrument, skill_level, setAgeGroup, setInstrument, setSkillLevel } = useUserStore()
  const { ageMode, theme, highContrast, reducedMotion, setAgeMode, setTheme, setHighContrast, setReducedMotion } = useUIStore()
  const { volume, setVolume, midiInputs, activeMidiInput, connectMIDI, selectMidiInput, initialized } = useAudioStore()

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="text-surface-500 text-sm mt-1">Customize your MoniqueMusic experience</p>
      </div>

      {/* ─── Profile ──────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
        <h2 className="font-bold text-surface-900">Profile</h2>

        {/* Age group */}
        <div>
          <label className="flex items-center text-sm font-medium text-surface-700 mb-2">
            Age Group
            <InfoTooltip text="This determines which UI mode is suggested. You can override the UI mode separately below." />
          </label>
          <div className="grid grid-cols-3 gap-2">
            {AGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAgeGroup(opt.value)}
                className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                  age_group === opt.value
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-surface-200 hover:bg-surface-50'
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs text-surface-400 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Instrument */}
        <div>
          <label className="text-sm font-medium text-surface-700 mb-2 block">Primary Instrument</label>
          <div className="flex gap-2">
            {INSTRUMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setInstrument(opt.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                  instrument === opt.value
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-surface-200 hover:bg-surface-50'
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skill level */}
        <div>
          <label className="text-sm font-medium text-surface-700 mb-2 block">Skill Level</label>
          <div className="flex gap-2">
            {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSkillLevel(lvl)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                  skill_level === lvl
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-surface-200 hover:bg-surface-50 text-surface-600'
                }`}
              >
                {lvl.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Display ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
        <h2 className="font-bold text-surface-900">Display</h2>

        {/* Theme */}
        <div>
          <label className="text-sm font-medium text-surface-700 mb-2 block">Theme</label>
          <div className="flex gap-2">
            {([
              { value: 'light' as const, label: 'Light', icon: '☀️' },
              { value: 'dark' as const, label: 'Dark', icon: '🌙' },
              { value: 'system' as const, label: 'System', icon: '💻' },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  theme === opt.value
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-surface-200 hover:bg-surface-50 text-surface-600'
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* UI Mode */}
        <div>
          <label className="flex items-center text-sm font-medium text-surface-700 mb-2">
            UI Mode
            <InfoTooltip text="Controls the visual style. Kids = stars, mascot, simple words. Adult = clean, standard. Accessible = large text, high contrast, reduced motion." />
          </label>
          <div className="flex gap-2">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAgeMode(opt.value)}
                className={`flex-1 p-3 rounded-lg border text-sm text-left transition-colors ${
                  ageMode === opt.value
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-surface-200 hover:bg-surface-50'
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs text-surface-400 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* High contrast */}
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="text-sm font-medium text-surface-700">High Contrast</div>
            <div className="text-xs text-surface-400">Increase contrast for better readability</div>
          </div>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              highContrast ? 'bg-primary-600' : 'bg-surface-200'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              highContrast ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </label>

        {/* Reduced motion */}
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="text-sm font-medium text-surface-700">Reduced Motion</div>
            <div className="text-xs text-surface-400">Minimize animations throughout the app</div>
          </div>
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              reducedMotion ? 'bg-primary-600' : 'bg-surface-200'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              reducedMotion ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </label>
      </section>

      {/* ─── Audio ───────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
        <h2 className="font-bold text-surface-900">Audio</h2>

        {/* Volume */}
        <div>
          <label className="text-sm font-medium text-surface-700 mb-2 block">
            Volume ({volume > -30 ? `${volume} dB` : 'Muted'})
          </label>
          <input
            type="range"
            min={-40}
            max={0}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs text-surface-400 mt-1">
            <span>Quiet</span>
            <span>Full</span>
          </div>
        </div>

        {/* MIDI */}
        <div>
          <label className="flex items-center text-sm font-medium text-surface-700 mb-2">
            MIDI Controller
            <InfoTooltip text="Connect a MIDI keyboard or controller to play notes with a physical instrument. Works with any USB or Bluetooth MIDI device." />
          </label>
          {midiInputs.length > 0 ? (
            <div className="space-y-2">
              {midiInputs.map((name) => (
                <button
                  key={name}
                  onClick={() => selectMidiInput(name)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                    activeMidiInput === name
                      ? 'border-primary-400 bg-primary-50 text-primary-700 font-medium'
                      : 'border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  {name} {activeMidiInput === name && '✓'}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={connectMIDI}
              className="px-4 py-2.5 border border-surface-200 rounded-lg text-sm text-surface-600 hover:bg-surface-50 transition-colors"
            >
              {initialized ? 'Scan for MIDI Devices' : 'Initialize Audio & Scan MIDI'}
            </button>
          )}
        </div>
      </section>

      {/* ─── Data ────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-surface-200 p-6 space-y-3">
        <h2 className="font-bold text-surface-900">Data</h2>
        <p className="text-xs text-surface-400">
          Your progress is saved locally in your browser. Clearing browser data will reset everything.
        </p>
      </section>
    </div>
  )
}
