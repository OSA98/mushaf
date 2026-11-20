import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useSettings } from '../store/settings'
import { useQuran, normalizeArabic, loadQuran, type QuranData } from '../lib/quran'
import { Icon } from '../components/Icon'
import { Spinner } from '../components/ui'
import { convertAyah } from 'quran-meta'
import type { RiwayaId } from '../config'

const RIWAYA_NAMES: Record<RiwayaId, Parameters<typeof convertAyah>[2]> = {
  hafs: 'Hafs', shuba: 'Shuba', warsh: 'Warsh', qalun: 'Qalun', douri: 'Douri', sousi: 'Sousi', bazzi: 'Bazzi', qunbul: 'Qunbul',
}

let plainIndex: Promise<{ s: number; a: number; n: string }[]> | null = null
function loadPlain() {
  if (!plainIndex) {
    plainIndex = fetch(`${import.meta.env.BASE_URL}data/search-hafs.json`)
      .then((r) => r.json())
      .then((rows: [number, number, string][]) => rows.map(([s, a, p]) => ({ s, a, n: normalizeArabic(p) })))
  }
  return plainIndex
}

export default function Search() {
  const { t, num } = useT()
  const nav = useNavigate()
  const riwaya = useSettings((s) => s.riwaya)
  const { data } = useQuran(riwaya)
  const [hafs, setHafs] = useState<QuranData | null>(null)
  const [index, setIndex] = useState<{ s: number; a: number; n: string }[] | null>(null)
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    loadPlain().then(setIndex)
    loadQuran('hafs').then(setHafs)
  }, [])

  const nq = normalizeArabic(q)
  const results = useMemo(() => {
    if (!index || nq.length < 2) return []
    const out: { s: number; a: number }[] = []
    for (const r of index) {
      if (r.n.includes(nq)) { out.push(r); if (out.length >= 300) break }
    }
    return out
  }, [index, nq])

  const pageNum = /^\d{1,3}$/.test(q.trim()) ? Number(q.trim()) : 0
  const surahMatches = data && q.trim()
    ? data.surahs.filter((s) => normalizeArabic(s.ar).includes(nq) || s.en.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6)
    : []

  const openResult = (s: number, a: number) => {
    // results are in Hafs numbering; convert to the active narration
    let [ts, ta] = [s, a]
    if (riwaya !== 'hafs') {
      try { [ts, ta] = convertAyah(s as never, a as never, 'Hafs', RIWAYA_NAMES[riwaya]) as [number, number] } catch { /* keep */ }
    }
    const ay = data?.bySurah.get(ts)?.find((x) => x.a === ta)
    nav(ay ? `/read/${ay.page}?s=${ts}&a=${ta}` : '/read/1')
  }

  const highlight = (text: string) => text

  return (
    <div className="page-narrow stack">
      <div className="search-box">
        <Icon name="search" />
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('search')} />
        {q && <button className="icon-btn plain sm" onClick={() => setQ('')} aria-label={t('close')}><Icon name="close" /></button>}
      </div>
      {!q && <p className="muted text-sm">{t('searchHint')}</p>}

      {pageNum > 0 && pageNum <= 604 && (
        <button className="card list-item" onClick={() => nav(`/read/${pageNum}`)}>
          <Icon name="bookOpen" /> <span>{t('goToPage')} {num(pageNum)}</span>
        </button>
      )}

      {surahMatches.length > 0 && (
        <div className="scroll-x">
          {surahMatches.map((s) => (
            <button key={s.n} className="chip" onClick={() => nav(`/read/${s.page}`)}>{t('surah')} {s.ar}</button>
          ))}
        </div>
      )}

      {q && nq.length >= 2 && !index && <Spinner />}
      {index && nq.length >= 2 && (
        <>
          <div className="text-sm muted">{num(results.length)}{results.length >= 300 ? '+' : ''} {t('results')}</div>
          {results.length === 0 ? <div className="empty">{t('noResults')}</div> : (
            <div className="stack" style={{ gap: 10 }}>
              {results.map((r) => {
                const ay = hafs?.bySurah.get(r.s)?.find((x) => x.a === r.a)
                return (
                  <button key={`${r.s}:${r.a}`} className="card search-result" onClick={() => openResult(r.s, r.a)}>
                    <div className="spread text-sm">
                      <strong>{hafs?.surahs[r.s - 1]?.ar} · {num(r.a)}</strong>
                      {ay && <span className="muted">{t('page')} {num(ay.page)}</span>}
                    </div>
                    {ay && <p className="quran saved-text">{highlight(ay.text)}</p>}
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
