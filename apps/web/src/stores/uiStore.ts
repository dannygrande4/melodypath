import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgeMode } from '@melodypath/shared-types'

interface UIState {
  ageMode: AgeMode
  highContrast: boolean
  reducedMotion: boolean
  sidebarOpen: boolean

  // Actions
  setAgeMode: (mode: AgeMode) => void
  setHighContrast: (on: boolean) => void
  setReducedMotion: (on: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ageMode: 'adult',
      highContrast: false,
      reducedMotion: false,
      sidebarOpen: true,

      setAgeMode: (ageMode) => set({ ageMode }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: 'melodypath-ui',
      partialize: (state) => ({
        ageMode: state.ageMode,
        highContrast: state.highContrast,
        reducedMotion: state.reducedMotion,
      }),
    }
  )
)
