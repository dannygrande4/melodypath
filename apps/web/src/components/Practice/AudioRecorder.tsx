import { useState, useCallback, useRef } from 'react'

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      setRecording(true)
      setAudioUrl(null)
      setDuration(0)
      startTimeRef.current = Date.now()

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } catch {
      console.warn('Microphone access denied')
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-4">
      <h2 className="text-lg font-bold text-surface-900">Record Yourself</h2>
      <p className="text-sm text-surface-500">
        Record your practice and listen back to track your progress.
      </p>

      <div className="flex items-center gap-4">
        {/* Record button */}
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            recording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {recording ? (
            <div className="w-5 h-5 bg-white rounded-sm" />
          ) : (
            <div className="w-5 h-5 bg-white rounded-full" />
          )}
        </button>

        <div>
          {recording ? (
            <div className="text-red-600 font-bold">Recording... {formatTime(duration)}</div>
          ) : audioUrl ? (
            <div className="text-sm text-surface-600">Recording saved ({formatTime(duration)})</div>
          ) : (
            <div className="text-sm text-surface-400">Tap the button to start recording</div>
          )}
        </div>
      </div>

      {/* Playback */}
      {audioUrl && !recording && (
        <audio controls src={audioUrl} className="w-full mt-2" />
      )}
    </div>
  )
}
