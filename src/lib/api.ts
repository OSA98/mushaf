import { API } from '../config'

const mem = new Map<string, Promise<unknown>>()
const CACHE = 'mushaf-api-v1'

/** fetch JSON with in-memory + Cache Storage fallback (works offline once fetched). */
export async function getJSON<T>(url: string): Promise<T> {
  if (mem.has(url)) return mem.get(url) as Promise<T>
  const p = (async () => {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const copy = res.clone()
      if ('caches' in window) caches.open(CACHE).then((c) => c.put(url, copy)).catch(() => {})
      return (await res.json()) as T
    } catch (e) {
      if ('caches' in window) {
        const hit = await caches.open(CACHE).then((c) => c.match(url)).catch(() => undefined)
        if (hit) return (await hit.json()) as T
      }
      throw e
    }
  })()
  mem.set(url, p)
  p.catch(() => mem.delete(url))
  return p
}

interface AlquranSurah { data: { ayahs: { numberInSurah: number; text: string }[] } }

/** Text edition (tafsir or translation) for a whole surah, in Hafs numbering. */
export async function getEditionSurah(edition: string, surah: number): Promise<Map<number, string>> {
  const res = await getJSON<AlquranSurah>(`${API.alquran}/surah/${surah}/${edition}`)
  return new Map(res.data.ayahs.map((a) => [a.numberInSurah, a.text]))
}

export async function getEditionAyah(edition: string, surah: number, ayah: number) {
  const m = await getEditionSurah(edition, surah)
  return m.get(ayah) ?? ''
}

export interface Mp3Reciter {
  id: number
  name: string
  letter: string
  moshaf: { id: number; name: string; rewaya_id?: number; server: string; surah_total: number; surah_list: string }[]
}
export async function getMp3Reciters(lang: 'ar' | 'en') {
  const res = await getJSON<{ reciters: Mp3Reciter[] }>(`${API.mp3quran}/reciters?language=${lang === 'ar' ? 'ar' : 'eng'}`)
  return res.reciters
}

export interface Radio { id: number; name: string; url: string }
export async function getRadios(lang: 'ar' | 'en') {
  const res = await getJSON<{ radios: Radio[] }>(`${API.mp3quran}/radios?language=${lang === 'ar' ? 'ar' : 'eng'}`)
  return res.radios
}

export const surahAudioUrl = (server: string, surah: number) =>
  `${server.endsWith('/') ? server : server + '/'}${String(surah).padStart(3, '0')}.mp3`
