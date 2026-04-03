import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseMidiToNoteEvents } from '@/lib/midiParser'
import { SONG_LIBRARY, type SongData } from '@/lib/songLibrary'
import type { NoteEvent } from '@melodypath/shared-types'

// Store custom songs in memory (persists only during session)
// TODO: persist to localStorage or IndexedDB for cross-session storage
const customSongs: SongData[] = []

export function getCustomSong(id: string): SongData | undefined {
  return customSongs.find((s) => s.id === id)
}

export default function SongImport() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{
    notes: NoteEvent[]
    duration: number
    tracks: number
  } | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [bpm, setBpm] = useState(120)
  const [key, setKey] = useState('C')
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(2)
  const [genre, setGenre] = useState('Custom')
  const [trackIndex, setTrackIndex] = useState(0)

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    if (!f.name.endsWith('.mid') && !f.name.endsWith('.midi')) {
      setError('Please select a .mid or .midi file')
      return
    }

    setFile(f)
    setError(null)
    setParsing(true)
    setTitle(f.name.replace(/\.(mid|midi)$/i, ''))

    try {
      const buffer = await f.arrayBuffer()
      // Try to detect number of tracks
      const { Midi } = await import('@tonejs/midi')
      const midi = new Midi(buffer)

      const notes = parseMidiToNoteEvents(buffer, 0, 4)
      const duration = notes.length > 0
        ? Math.max(...notes.map((n) => n.time + n.duration)) + 2
        : 0

      setPreview({ notes, duration, tracks: midi.tracks.length })

      // Try to detect BPM from MIDI
      if (midi.header.tempos.length > 0) {
        setBpm(Math.round(midi.header.tempos[0].bpm))
      }
    } catch (err) {
      setError('Failed to parse MIDI file. Make sure it\'s a valid .mid file.')
      console.error(err)
    } finally {
      setParsing(false)
    }
  }, [])

  const handleTrackChange = useCallback(async (idx: number) => {
    if (!file) return
    setTrackIndex(idx)
    setParsing(true)

    try {
      const buffer = await file.arrayBuffer()
      const notes = parseMidiToNoteEvents(buffer, idx, 4)
      const duration = notes.length > 0
        ? Math.max(...notes.map((n) => n.time + n.duration)) + 2
        : 0
      setPreview((prev) => prev ? { ...prev, notes, duration } : null)
    } catch {
      setError('Failed to parse this track')
    } finally {
      setParsing(false)
    }
  }, [file])

  const handleImport = useCallback(async () => {
    if (!file || !preview || preview.notes.length === 0) return

    const buffer = await file.arrayBuffer()
    const id = `custom-${Date.now()}`
    const capturedTrackIndex = trackIndex

    const songData: SongData = {
      id,
      title: title || 'Untitled',
      artist: artist || 'Unknown',
      bpm,
      key,
      difficulty,
      genre,
      concepts: ['custom', 'imported'],
      getNotes: () => {
        const notes = parseMidiToNoteEvents(buffer, capturedTrackIndex, 4)
        const duration = notes.length > 0
          ? Math.max(...notes.map((n) => n.time + n.duration)) + 2
          : 0
        return { notes, duration }
      },
    }

    customSongs.push(songData)
    SONG_LIBRARY.push(songData)

    navigate(`/play/${id}`)
  }, [file, preview, title, artist, bpm, key, difficulty, genre, trackIndex, navigate])

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Import MIDI Song</h1>
        <p className="text-surface-500 text-sm mt-1">
          Upload a .mid file to play it in Guitar Hero mode
        </p>
      </div>

      {/* File upload */}
      <div className="bg-white rounded-xl border-2 border-dashed border-surface-200 p-8 text-center">
        <input
          type="file"
          accept=".mid,.midi"
          onChange={handleFileSelect}
          className="hidden"
          id="midi-upload"
        />
        <label
          htmlFor="midi-upload"
          className="cursor-pointer space-y-3 block"
        >
          <div className="text-4xl">🎵</div>
          <div className="text-surface-600 font-medium">
            {file ? file.name : 'Click to select a MIDI file'}
          </div>
          <div className="text-xs text-surface-400">
            Supports .mid and .midi files
          </div>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {parsing && (
        <div className="text-center text-surface-400">Parsing MIDI file...</div>
      )}

      {/* Preview & settings */}
      {preview && !parsing && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="bg-surface-50 rounded-xl p-4 flex gap-6 text-sm">
            <div>
              <div className="text-xs text-surface-400">Notes</div>
              <div className="font-bold text-surface-900">{preview.notes.length}</div>
            </div>
            <div>
              <div className="text-xs text-surface-400">Duration</div>
              <div className="font-bold text-surface-900">{Math.round(preview.duration)}s</div>
            </div>
            <div>
              <div className="text-xs text-surface-400">Tracks</div>
              <div className="font-bold text-surface-900">{preview.tracks}</div>
            </div>
          </div>

          {/* Track selector */}
          {preview.tracks > 1 && (
            <div>
              <label className="text-sm font-medium text-surface-700 mb-1.5 block">Track</label>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: preview.tracks }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleTrackChange(i)}
                    className={`px-3 py-1.5 text-sm rounded-lg border ${
                      trackIndex === i
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-surface-200 hover:bg-surface-50'
                    }`}
                  >
                    Track {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Song details form */}
          <div className="bg-white rounded-xl border border-surface-200 p-5 space-y-4">
            <h2 className="font-bold text-surface-900">Song Details</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-surface-500 mb-1 block">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-500 mb-1 block">Artist</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-500 mb-1 block">BPM</label>
                <input
                  type="number"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-500 mb-1 block">Key</label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-500 mb-1 block">Difficulty</label>
                <div className="flex gap-1">
                  {([1, 2, 3, 4, 5] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`w-9 h-9 rounded-lg border text-sm font-bold ${
                        difficulty === d
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-surface-200 hover:bg-surface-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-surface-500 mb-1 block">Genre</label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Import button */}
          <button
            onClick={handleImport}
            disabled={preview.notes.length === 0}
            className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:opacity-40 transition-colors"
          >
            Import & Play ({preview.notes.length} notes)
          </button>
        </div>
      )}
    </div>
  )
}
