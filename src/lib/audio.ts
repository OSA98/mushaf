import { create } from 'zustand'
import { API, VERSE_RECITERS } from '../config'
import { hafsGlobal, type Ayah } from './quran'
import { useSettings } from '../store/settings'
import { surahAudioUrl } from './api'

export type PlayMode = 'verse' | 'surah' | 'radio'

interface QueueItem { s: number; a: number; hs: number; ha: number; page: number; sajda: boolean }

interface AudioState {
  mode: PlayMode | null
  playing: boolean
  loading: boolean
  title: string
  subtitle: string
  queue: QueueItem[]
  index: number
  currentKey: string | null // "s:a" in current narration
  currentPage: number | null
  repeatLeft: number
  loopRange: boolean
  position: number
  duration: number
  error: string | null
  surahMeta?: { server: string; surah: number; reciter: string; total: number[] }
  playVerses: (ayahs: Ayah[], startIndex: number, meta: { title: string; subtitle: string }) => void
  playSurah: (server: string, surah: number, reciter: string, surahName: string, available: number[]) => void
  playRadio: (url: string, name: string) => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (t: number) => void
  skip: (delta: number) => void
  stop: () => void
  setLoop: (v: boolean) => void
}

const audio = typeof Audio !== 'undefined' ? new Audio() : (null as unknown as HTMLAudioElement)
if (audio) audio.preload = 'auto'

const AUDIO_CACHE = 'mushaf-audio-v1'
const blobUrls = new Map<string, string>()

/** Return a playable URL, preferring a downloaded copy from Cache Storage. */
async function resolve(url: string) {
  if (blobUrls.has(url)) return blobUrls.get(url)!
  if ('caches' in window) {
    try {
      const hit = await (await caches.open(AUDIO_CACHE)).match(url)
      if (hit) {
        const u = URL.createObjectURL(await hit.blob())
        blobUrls.set(url, u)
        return u
      }
    } catch { /* ignore */ }
  }
  return url
}

export async function isCached(url: string) {
  if (!('caches' in window)) return false
  return !!(await (await caches.open(AUDIO_CACHE)).match(url))
}

export async function downloadToCache(urls: string[], onProgress?: (done: number, total: number) => void) {
  const cache = await caches.open(AUDIO_CACHE)
  let done = 0
  for (const u of urls) {
    if (!(await cache.match(u))) {
      const res = await fetch(u, { mode: 'cors' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await cache.put(u, res)
    }
    onProgress?.(++done, urls.length)
  }
}

export function verseUrl(reciterId: string, globalAyah: number) {
  const r = VERSE_RECITERS.find((x) => x.id === reciterId) ?? VERSE_RECITERS[0]
  return API.verseAudio(r.id, r.bitrate, globalAyah)
}

export async function verseUrlsForSurahHafs(reciterId: string, surah: number, count: number) {
  const first = await hafsGlobal(surah, 1)
  return Array.from({ length: count }, (_, i) => verseUrl(reciterId, first + i))
}

export const useAudio = create<AudioState>()((set, get) => {
  const loadIndex = async (i: number) => {
    const { queue } = get()
    const item = queue[i]
    if (!item) return set({ playing: false })
    const { reciter, repeatCount, playbackRate } = useSettings.getState()
    const g = await hafsGlobal(item.hs, item.ha)
    set({
      index: i,
      currentKey: `${item.s}:${item.a}`,
      currentPage: item.page,
      repeatLeft: Math.max(0, repeatCount - 1),
      loading: true,
      error: null,
    })
    audio.src = await resolve(verseUrl(reciter, g))
    audio.playbackRate = playbackRate
    try { await audio.play() } catch (e) { set({ playing: false, loading: false, error: String(e) }) }
  }

  if (audio) {
    audio.addEventListener('playing', () => set({ playing: true, loading: false }))
    audio.addEventListener('pause', () => set({ playing: false }))
    audio.addEventListener('waiting', () => set({ loading: true }))
    audio.addEventListener('timeupdate', () => set({ position: audio.currentTime, duration: audio.duration || 0 }))
    audio.addEventListener('error', () => set({ loading: false, playing: false, error: 'audio-error' }))
    audio.addEventListener('ended', () => {
      const s = get()
      if (s.mode === 'verse') {
        if (s.repeatLeft > 0) {
          set({ repeatLeft: s.repeatLeft - 1 })
          audio.currentTime = 0
          audio.play()
          return
        }
        if (s.index + 1 < s.queue.length) loadIndex(s.index + 1)
        else if (s.loopRange) loadIndex(0)
        else set({ playing: false, currentKey: null })
      } else if (s.mode === 'surah' && s.surahMeta) {
        const { server, surah, total, reciter } = s.surahMeta
        const nextS = total.find((x) => x > surah)
        if (s.loopRange) { audio.currentTime = 0; audio.play() }
        else if (nextS) get().playSurah(server, nextS, reciter, String(nextS), total)
      }
    })
  }

  return {
    mode: null, playing: false, loading: false, title: '', subtitle: '', queue: [], index: 0,
    currentKey: null, currentPage: null, repeatLeft: 0, loopRange: false, position: 0, duration: 0, error: null,

    playVerses: (ayahs, startIndex, meta) => {
      set({
        mode: 'verse', title: meta.title, subtitle: meta.subtitle,
        queue: ayahs.map((a) => ({ s: a.s, a: a.a, hs: a.hs, ha: a.ha, page: a.page, sajda: a.sajda })),
      })
      loadIndex(startIndex)
      updateMediaSession(meta.title, meta.subtitle)
    },
    playSurah: async (server, surah, reciter, surahName, available) => {
      const url = surahAudioUrl(server, surah)
      set({
        mode: 'surah', title: reciter, subtitle: surahName, queue: [], currentKey: null, loading: true, error: null,
        surahMeta: { server, surah, reciter, total: available },
      })
      audio.src = await resolve(url)
      audio.playbackRate = useSettings.getState().playbackRate
      audio.play().catch((e) => set({ error: String(e), loading: false }))
      updateMediaSession(reciter, surahName)
    },
    playRadio: (url, name) => {
      set({ mode: 'radio', title: name, subtitle: '', queue: [], currentKey: null, loading: true, error: null })
      audio.src = url
      audio.playbackRate = 1
      audio.play().catch((e) => set({ error: String(e), loading: false }))
      updateMediaSession(name, '')
    },
    toggle: () => {
      if (!audio.src) return
      if (audio.paused) audio.play().catch(() => {})
      else audio.pause()
    },
    next: () => {
      const s = get()
      if (s.mode === 'verse' && s.index + 1 < s.queue.length) loadIndex(s.index + 1)
      if (s.mode === 'surah' && s.surahMeta) {
        const n = s.surahMeta.total.find((x) => x > s.surahMeta!.surah)
        if (n) get().playSurah(s.surahMeta.server, n, s.surahMeta.reciter, String(n), s.surahMeta.total)
      }
    },
    prev: () => {
      const s = get()
      if (s.mode === 'verse' && s.index > 0) loadIndex(s.index - 1)
      if (s.mode === 'surah' && s.surahMeta) {
        const p = [...s.surahMeta.total].reverse().find((x) => x < s.surahMeta!.surah)
        if (p) get().playSurah(s.surahMeta.server, p, s.surahMeta.reciter, String(p), s.surahMeta.total)
      }
    },
    seek: (t) => { audio.currentTime = t },
    skip: (d) => { audio.currentTime = Math.max(0, Math.min((audio.duration || 0), audio.currentTime + d)) },
    stop: () => {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      set({ mode: null, playing: false, currentKey: null, queue: [], loading: false })
    },
    setLoop: (v) => set({ loopRange: v }),
  }
})

// keep playback rate in sync with settings
useSettings.subscribe((s) => { if (audio) audio.playbackRate = s.playbackRate })

function updateMediaSession(title: string, artist: string) {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = new MediaMetadata({ title, artist, album: 'Quran' })
  const st = useAudio.getState
  navigator.mediaSession.setActionHandler('play', () => st().toggle())
  navigator.mediaSession.setActionHandler('pause', () => st().toggle())
  navigator.mediaSession.setActionHandler('nexttrack', () => st().next())
  navigator.mediaSession.setActionHandler('previoustrack', () => st().prev())
}
