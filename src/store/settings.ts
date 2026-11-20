import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RiwayaId } from '../config'

export type Theme = 'light' | 'dark' | 'auto'
export type Paper = 'cream' | 'white' | 'sepia'
export type Layout = 'auto' | 'single' | 'double'

export interface SettingsState {
  lang: 'ar' | 'en'
  theme: Theme
  paper: Paper
  riwaya: RiwayaId
  quranSize: number // px
  layout: Layout
  reciter: string // verse-by-verse edition id
  tafsir: string
  translation: string
  showTranslation: boolean
  autoNextPage: boolean
  sajdaNotify: boolean
  playbackRate: number
  repeatCount: number // per-ayah repeat
  onboarded: boolean
  prayerMethod: string
  location?: { lat: number; lng: number; label?: string }
  set: (patch: Partial<SettingsState>) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: 'ar',
      theme: 'auto',
      paper: 'cream',
      riwaya: 'hafs',
      quranSize: 26,
      layout: 'auto',
      reciter: 'ar.abdulsamad',
      tafsir: 'ar.muyassar',
      translation: 'en.sahih',
      showTranslation: false,
      autoNextPage: true,
      sajdaNotify: true,
      playbackRate: 1,
      repeatCount: 1,
      onboarded: false,
      prayerMethod: 'Egyptian',
      set: (patch) => set(patch),
    }),
    { name: 'mushaf.settings', version: 1 },
  ),
)
