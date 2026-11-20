import { RIWAYAT, type RiwayaId } from '../config'
import { getMp3Reciters } from './api'
import { useAudio } from './audio'
import type { Ayah, QuranData } from './quran'
import { useSettings } from '../store/settings'
import { VERSE_RECITERS } from '../config'

export const stripMarks = (s: string) =>
  s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣿ]/g, '').replace(/ٱ/g, 'ا')

export function ayahRef(data: QuranData, a: Ayah, lang: 'ar' | 'en') {
  const s = data.surahs[a.s - 1]
  return lang === 'ar' ? `[${s.ar.replace(/[ً-ٟ]/g, '')}: ${a.a}]` : `[${s.en} ${a.s}:${a.a}]`
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

export async function shareText(text: string, title: string) {
  if (navigator.share) {
    try { await navigator.share({ title, text }); return 'shared' } catch { return 'cancel' }
  }
  return (await copyText(text)) ? 'copied' : 'fail'
}

/** Play recitation starting at an ayah. Hafs → verse-by-verse with highlighting; others → full surah in that narration. */
export async function playFrom(data: QuranData, a: Ayah, lang: 'ar' | 'en') {
  const st = useSettings.getState()
  if (data.id === 'hafs') {
    const rec = VERSE_RECITERS.find((r) => r.id === st.reciter) ?? VERSE_RECITERS[0]
    const surah = data.surahs[a.s - 1]
    useAudio.getState().playVerses(data.ayahs, a.idx, {
      title: lang === 'ar' ? rec.ar : rec.en,
      subtitle: `${lang === 'ar' ? 'سورة ' + surah.ar : surah.en} — ${lang === 'ar' ? RIWAYAT[0].ar : RIWAYAT[0].en}`,
    })
    return 'verse'
  }
  await playSurahInRiwaya(data.id, a.s, data.surahs[a.s - 1].ar, lang)
  return 'surah'
}

export async function playSurahInRiwaya(riwaya: RiwayaId, surah: number, surahName: string, _lang: 'ar' | 'en', reciterId?: number) {
  const reciters = await getMp3Reciters('ar') // Arabic names contain the narration keyword
  const kw = RIWAYAT.find((r) => r.id === riwaya)!.keyword
  for (const r of reciters) {
    if (reciterId && r.id !== reciterId) continue
    for (const m of r.moshaf) {
      const list = m.surah_list.split(',').map(Number)
      if (m.name.includes(kw) && list.includes(surah)) {
        useAudio.getState().playSurah(m.server, surah, r.name, `${surahName} — ${m.name}`, list)
        return true
      }
    }
  }
  throw new Error('no-reciter')
}
