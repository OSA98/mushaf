import { useEffect, useState } from 'react'
import type { RiwayaId } from '../config'

export interface SurahInfo { n: number; ar: string; en: string; ayahs: number; page: number; meccan: 0 | 1 }
export interface Ayah {
  s: number // surah
  a: number // ayah number (in this narration)
  page: number
  juz: number
  rub: number // rub' al-hizb 1..240
  sajda: boolean
  hs: number // equivalent Hafs surah (for tafsir/audio/translation APIs)
  ha: number // equivalent Hafs ayah
  text: string // Uthmanic text incl. trailing ayah number
  idx: number // index in narration
}
export interface QuranData {
  id: RiwayaId
  pages: number
  surahs: SurahInfo[]
  ayahs: Ayah[]
  byPage: Ayah[][] // 1-based index
  bySurah: Map<number, Ayah[]>
}

type RawRow = [number, number, number, number, number, number, number, number, string]

const cache = new Map<RiwayaId, Promise<QuranData>>()
const BASE = import.meta.env.BASE_URL

export function loadQuran(id: RiwayaId): Promise<QuranData> {
  let p = cache.get(id)
  if (!p) {
    p = fetch(`${BASE}data/${id}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((raw: { id: RiwayaId; pages: number; surahs: SurahInfo[]; ayahs: RawRow[] }) => {
        const ayahs: Ayah[] = raw.ayahs.map((r, idx) => ({
          s: r[0], a: r[1], page: r[2], juz: r[3], rub: r[4], sajda: r[5] === 1, hs: r[6], ha: r[7], text: r[8], idx,
        }))
        const byPage: Ayah[][] = Array.from({ length: raw.pages + 1 }, () => [])
        const bySurah = new Map<number, Ayah[]>()
        for (const a of ayahs) {
          byPage[a.page].push(a)
          if (!bySurah.has(a.s)) bySurah.set(a.s, [])
          bySurah.get(a.s)!.push(a)
        }
        return { id: raw.id, pages: raw.pages, surahs: raw.surahs, ayahs, byPage, bySurah }
      })
      .catch((e) => {
        cache.delete(id)
        throw e
      })
    cache.set(id, p)
  }
  return p
}

export function useQuran(id: RiwayaId) {
  const [data, setData] = useState<QuranData | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [nonce, setNonce] = useState(0)
  useEffect(() => {
    let alive = true
    setError(null)
    loadQuran(id).then((d) => alive && setData(d)).catch((e) => alive && setError(e))
    return () => { alive = false }
  }, [id, nonce])
  return { data: data?.id === id ? data : null, error, retry: () => setNonce((n) => n + 1) }
}

/** Global Hafs ayah number (1..6236) used by verse-by-verse audio CDNs. */
let hafsOffsets: number[] | null = null
export async function hafsGlobal(surah: number, ayah: number) {
  if (!hafsOffsets) {
    const d = await loadQuran('hafs')
    hafsOffsets = [0]
    let acc = 0
    for (const s of d.surahs) { hafsOffsets[s.n] = acc; acc += s.ayahs }
  }
  return hafsOffsets[surah] + ayah
}

export const toArabicDigits = (n: number | string) =>
  String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])

/** Split Uthmanic text into body + trailing ayah-number. */
export function splitAyahText(text: string) {
  const m = text.match(/^(.*?)[\s ]*([٠-٩۰-۹]+)$/su)
  return m ? { body: m[1], num: m[2] } : { body: text, num: '' }
}

/** Remove Arabic diacritics & normalize letters, for search. */
export function normalizeArabic(s: string) {
  return s
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣿ]/g, '')
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ـ/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export const hizbOfRub = (rub: number) => Math.ceil(rub / 4)
export const quarterInHizb = (rub: number) => ((rub - 1) % 4) // 0..3

export const BASMALA = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ'

/** Does this narration count the basmala as ayah 1 of Al-Fatihah? */
export function needsBasmalaHeader(first: Ayah) {
  if (first.a !== 1 || first.s === 9) return false
  const plain = normalizeArabic(first.text)
  return !plain.startsWith('بسم الله الرحمن الرحيم')
}

export function dailyIndex(len: number, seed = new Date()) {
  const day = Math.floor(seed.getTime() / 86400000)
  return (day * 2654435761) % len
}
