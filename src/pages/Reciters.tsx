import { useEffect, useMemo, useState } from 'react'
import { useT } from '../i18n'
import { useSettings } from '../store/settings'
import { RIWAYAT, VERSE_RECITERS } from '../config'
import { getMp3Reciters, surahAudioUrl, type Mp3Reciter } from '../lib/api'
import { useAudio, downloadToCache, isCached } from '../lib/audio'
import { useQuran } from '../lib/quran'
import { Icon } from '../components/Icon'
import { Sheet, Spinner, ErrorBox, toast } from '../components/ui'

export default function Reciters() {
  const { t, lang, num } = useT()
  const s = useSettings()
  const [list, setList] = useState<Mp3Reciter[] | null>(null)
  const [err, setErr] = useState(false)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<{ r: Mp3Reciter; m: Mp3Reciter['moshaf'][0] } | null>(null)
  const [nonce, setNonce] = useState(0)
  const kw = RIWAYAT.find((r) => r.id === s.riwaya)!.keyword

  useEffect(() => {
    setErr(false)
    getMp3Reciters('ar').then(setList).catch(() => setErr(true))
  }, [nonce])

  const filtered = useMemo(() => {
    if (!list) return []
    const out: { r: Mp3Reciter; m: Mp3Reciter['moshaf'][0] }[] = []
    for (const r of list) {
      if (q && !r.name.includes(q)) continue
      for (const m of r.moshaf) if (m.name.includes(kw)) out.push({ r, m })
    }
    return out
  }, [list, q, kw])

  return (
    <div className="page-narrow stack">
      <h1 className="h1">{t('reciters')}</h1>

      {s.riwaya === 'hafs' && (
        <section>
          <div className="section-title"><h2 className="h3">{t('verseByVerse')}</h2></div>
          <div className="scroll-x">
            {VERSE_RECITERS.map((r) => (
              <button key={r.id} className={`chip ${s.reciter === r.id ? 'active' : ''}`} onClick={() => { s.set({ reciter: r.id }); toast(lang === 'ar' ? r.ar : r.en) }}>
                {lang === 'ar' ? r.ar : r.en}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="stack" style={{ gap: 12 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>
          <h2 className="h3">{t('fullSurahs')}</h2>
          <select className="input select" style={{ width: 'auto', height: 40 }} value={s.riwaya} onChange={(e) => s.set({ riwaya: e.target.value as typeof s.riwaya })}>
            {RIWAYAT.map((r) => <option key={r.id} value={r.id}>{lang === 'ar' ? r.ar : r.en}</option>)}
          </select>
        </div>
        <input className="input" placeholder={t('search')} value={q} onChange={(e) => setQ(e.target.value)} />
        {err ? <ErrorBox onRetry={() => setNonce((n) => n + 1)} /> : !list ? <Spinner /> : (
          <>
            <div className="text-sm muted">{num(filtered.length)} {t('reciter')}</div>
            <div className="list card" style={{ padding: '0 12px' }}>
              {filtered.map(({ r, m }) => (
                <button key={`${r.id}-${m.id}`} className="list-item" onClick={() => setOpen({ r, m })}>
                  <span className="avatar">{r.letter}</span>
                  <span style={{ flex: 1 }}>
                    <strong>{r.name}</strong>
                    <span className="text-xs muted" style={{ display: 'block' }}>{m.name} · {num(m.surah_total)} {t('surahs')}</span>
                  </span>
                  <Icon name="chevronLeft" />
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.r.name}>
        {open && <SurahList r={open.r} m={open.m} />}
      </Sheet>
    </div>
  )
}

function SurahList({ r, m }: { r: Mp3Reciter; m: Mp3Reciter['moshaf'][0] }) {
  const { t, num } = useT()
  const riwaya = useSettings((s) => s.riwaya)
  const { data } = useQuran(riwaya)
  const play = useAudio((s) => s.playSurah)
  const list = m.surah_list.split(',').map(Number)
  const [cached, setCached] = useState<Set<number>>(new Set())
  const [busy, setBusy] = useState<number | null>(null)
  useEffect(() => {
    Promise.all(list.map(async (n) => ((await isCached(surahAudioUrl(m.server, n))) ? n : 0))).then((x) => setCached(new Set(x.filter(Boolean))))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.server])
  const name = (n: number) => data?.surahs[n - 1]?.ar ?? String(n)
  return (
    <div className="list" style={{ maxHeight: '60vh', overflow: 'auto' }}>
      <div className="text-sm muted" style={{ marginBottom: 8 }}>{m.name}</div>
      {list.map((n) => (
        <div key={n} className="list-item">
          <span className="num-badge">{num(n)}</span>
          <button style={{ flex: 1, textAlign: 'start', background: 'none', border: 0 }} onClick={() => play(m.server, n, r.name, `${t('surah')} ${name(n)}`, list)}>
            <span className="quran" style={{ fontSize: 20 }}>{name(n)}</span>
          </button>
          <button className="icon-btn plain sm" onClick={() => play(m.server, n, r.name, `${t('surah')} ${name(n)}`, list)} aria-label={t('play')}><Icon name="play" size={20} /></button>
          <button
            className={`icon-btn plain sm ${cached.has(n) ? 'active' : ''}`}
            disabled={busy === n}
            title={t('downloadSurah')}
            aria-label={t('download')}
            onClick={async () => {
              setBusy(n)
              try { await downloadToCache([surahAudioUrl(m.server, n)]); setCached(new Set(cached).add(n)); toast(t('downloaded')) }
              catch { toast(t('errorLoad')) }
              setBusy(null)
            }}
          >
            {busy === n ? <span className="spinner" style={{ width: 18, height: 18, margin: 0, borderWidth: 2 }} /> : <Icon name={cached.has(n) ? 'checkCircle' : 'download'} size={20} />}
          </button>
        </div>
      ))}
    </div>
  )
}
