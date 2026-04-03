import { useCallback } from 'react'
import { useAudioStore } from '@/stores/audioStore'

/**
 * Returns a callback that initializes the audio engine.
 * Must be called from a user gesture (click/keydown) to satisfy
 * browser autoplay policy.
 */
export function useAudioInit() {
  const init = useAudioStore((s) => s.init)
  const initialized = useAudioStore((s) => s.initialized)

  const ensureAudio = useCallback(async () => {
    if (!initialized) {
      await init()
    }
  }, [init, initialized])

  return { ensureAudio, initialized }
}
