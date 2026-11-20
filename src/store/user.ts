import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RiwayaId } from '../config'

export interface Bookmark { key: string; riwaya: RiwayaId; surah: number; ayah: number; page: number; at: number }
export interface Note { key: string; riwaya: RiwayaId; surah: number; ayah: number; page: number; text: string; at: number }
export interface Khatma { startedAt: number; days: number; startPage: number; number: number; donePages: number[] }

export const ayahKey = (surah: number, ayah: number) => `${surah}:${ayah}`
const today = () => new Date().toISOString().slice(0, 10)

interface UserState {
  bookmarks: Bookmark[]
  notes: Note[]
  highlights: Record<string, string> // key -> color
  lastRead?: { riwaya: RiwayaId; page: number; surah: number; ayah: number; at: number }
  khatma?: Khatma
  khatmasCompleted: number
  // reading log: date (YYYY-MM-DD) -> stats
  log: Record<string, { pages: number[]; seconds: number; ayahs: number }>
  longestStreak: number

  toggleBookmark: (b: Omit<Bookmark, 'key' | 'at'>) => boolean
  saveNote: (n: Omit<Note, 'key' | 'at'>) => void
  deleteNote: (key: string) => void
  setHighlight: (key: string, color?: string) => void
  setLastRead: (r: NonNullable<UserState['lastRead']>) => void
  logPage: (page: number, ayahs: number) => void
  addSeconds: (s: number) => void
  startKhatma: (days: number, startPage?: number) => void
  markKhatmaPages: (pages: number[]) => void
  importAll: (data: Partial<UserState>) => void
  resetAll: () => void
}

export function computeStreak(log: UserState['log']) {
  let streak = 0
  const d = new Date()
  // today counts if read; otherwise start from yesterday
  const key = (x: Date) => x.toISOString().slice(0, 10)
  if (!log[key(d)]?.pages.length) d.setDate(d.getDate() - 1)
  while (log[key(d)]?.pages.length) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

const initial = {
  bookmarks: [] as Bookmark[],
  notes: [] as Note[],
  highlights: {} as Record<string, string>,
  lastRead: undefined,
  khatma: undefined,
  khatmasCompleted: 0,
  log: {} as UserState['log'],
  longestStreak: 0,
}

export const useUser = create<UserState>()(
  persist(
    (set, get) => ({
      ...initial,
      toggleBookmark: (b) => {
        const key = `${b.riwaya}|${ayahKey(b.surah, b.ayah)}`
        const exists = get().bookmarks.some((x) => x.key === key)
        set({
          bookmarks: exists
            ? get().bookmarks.filter((x) => x.key !== key)
            : [{ ...b, key, at: Date.now() }, ...get().bookmarks],
        })
        return !exists
      },
      saveNote: (n) => {
        const key = `${n.riwaya}|${ayahKey(n.surah, n.ayah)}`
        const rest = get().notes.filter((x) => x.key !== key)
        set({ notes: n.text.trim() ? [{ ...n, key, at: Date.now() }, ...rest] : rest })
      },
      deleteNote: (key) => set({ notes: get().notes.filter((x) => x.key !== key) }),
      setHighlight: (key, color) => {
        const h = { ...get().highlights }
        if (color) h[key] = color
        else delete h[key]
        set({ highlights: h })
      },
      setLastRead: (r) => set({ lastRead: r }),
      logPage: (page, ayahs) => {
        const d = today()
        const log = { ...get().log }
        const entry = log[d] ?? { pages: [], seconds: 0, ayahs: 0 }
        if (!entry.pages.includes(page)) {
          log[d] = { ...entry, pages: [...entry.pages, page], ayahs: entry.ayahs + ayahs }
          const streak = computeStreak(log)
          set({ log, longestStreak: Math.max(get().longestStreak, streak) })
          const k = get().khatma
          if (k && !k.donePages.includes(page)) get().markKhatmaPages([page])
        }
      },
      addSeconds: (s) => {
        const d = today()
        const log = { ...get().log }
        const entry = log[d] ?? { pages: [], seconds: 0, ayahs: 0 }
        log[d] = { ...entry, seconds: entry.seconds + s }
        set({ log })
      },
      startKhatma: (days, startPage = 1) =>
        set({
          khatma: {
            startedAt: Date.now(),
            days,
            startPage,
            number: get().khatmasCompleted + 1,
            donePages: [],
          },
        }),
      markKhatmaPages: (pages) => {
        const k = get().khatma
        if (!k) return
        const done = Array.from(new Set([...k.donePages, ...pages]))
        if (done.length >= 604) {
          set({ khatma: undefined, khatmasCompleted: get().khatmasCompleted + 1 })
        } else set({ khatma: { ...k, donePages: done } })
      },
      importAll: (data) => set({ ...data }),
      resetAll: () => set({ ...initial }),
    }),
    { name: 'mushaf.user', version: 1 },
  ),
)
