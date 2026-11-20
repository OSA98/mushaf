import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useSettings } from '../store/settings'
import { useUser } from '../store/user'
import { useQuran, hizbOfRub, splitAyahText } from '../lib/quran'
import { Spinner, ErrorBox } from '../components/ui'
import { Icon } from '../components/Icon'
import { RIWAYAT } from '../config'

type Tab = 'surahs' | 'juzs' | 'hizbs'

export default function IndexPage() {
  const { t, num, lang } = useT()
  const nav = useNavigate()
  const riwaya = useSettings((s) => s.riwaya)
  const setS = useSettings((s) => s.set)
  const { data, error, retry } = useQuran(riwaya)
  const last = useUser((s) => s.lastRead)
  const [tab, setTab] = useState<Tab>('surahs')
  const [q, setQ] = useState('')

  const juzs = useMemo(() => {
    if (!data) return []
    const out: { n: number; first: typeof data.ayahs[0] }[] = []
    for (const a of data.ayahs) if (!out[a.juz - 1]) out[a.juz - 1] = { n: a.juz, first: a }
    return out
  }, [data])
  const hizbs = useMemo(() => {
    if (!data) return []
    const out: { n: number; first: typeof data.ayahs[0] }[] = []
    for (const a of data.ayahs) {
      if (!a.rub) continue
      if (!out[a.rub - 1]) out[a.rub - 1] = { n: a.rub, first: a }
    }
    return out.filter(Boolean)
  }, [data])

  if (error) return <ErrorBox onRetry={retry} />
  if (!data) return <Spinner />

  const surahs = data.surahs.filter((s) => {
    if (!q) return true
    const plain = s.ar.replace(/[ً-ٰٟ]/g, '')
    return plain.includes(q) || s.en.toLowerCase().includes(q.toLowerCase()) || String(s.n) === q
  })

  return (
    <div className="page-narrow stack">
      <div className="spread">
        <h1 className="h1">{t('mushaf')}</h1>
        <select className="input select" style={{ width: 'auto' }} value={riwaya} onChange={(e) => setS({ riwaya: e.target.value as typeof riwaya })} aria-label={t('narration')}>
          {RIWAYAT.map((r) => <option key={r.id} value={r.id}>{lang === 'ar' ? r.ar : r.en}</option>)}
        </select>
      </div>

      {last && last.riwaya === riwaya && (
        <button className="card gold continue-card" onClick={() => nav(`/read/${last.page}`)}>
          <Icon name="bookOpen" />
          <span style={{ flex: 1, textAlign: 'start' }}>
            <strong>{t('continueReading')}</strong>
            <span className="text-sm muted" style={{ display: 'block' }}>
              {t('surah')} {data.surahs[last.surah - 1]?.ar} · {t('page')} {num(last.page)}
            </span>
          </span>
          <Icon name="chevronLeft" />
        </button>
      )}

      <div className="segmented">
        {(['surahs', 'juzs', 'hizbs'] as Tab[]).map((x) => (
          <button key={x} className={tab === x ? 'active' : ''} onClick={() => setTab(x)}>{t(x)}</button>
        ))}
      </div>

      {tab === 'surahs' && (
        <>
          <input className="input" placeholder={t('search')} value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="list card" style={{ padding: '0 12px' }}>
            {surahs.map((s) => (
              <button key={s.n} className="list-item" onClick={() => nav(`/read/${s.page}`)}>
                <span className="num-badge">{num(s.n)}</span>
                <span style={{ flex: 1 }}>
                  <span className="quran" style={{ fontSize: 22 }}>{s.ar}</span>
                  <span className="text-xs muted" style={{ display: 'block' }}>
                    {s.en} · {s.meccan ? t('makki') : t('madani')} · {num(s.ayahs)} {t('ayahs')}
                  </span>
                </span>
                <span className="text-sm muted">{t('page')} {num(s.page)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'juzs' && (
        <div className="list card" style={{ padding: '0 12px' }}>
          {juzs.map((j) => (
            <button key={j.n} className="list-item" onClick={() => nav(`/read/${j.first.page}`)}>
              <span className="num-badge">{num(j.n)}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <strong>{t('juz')} {num(j.n)}</strong>
                <span className="quran text-ellipsis" style={{ display: 'block', fontSize: 18 }}>{splitAyahText(j.first.text).body.split(' ').slice(0, 6).join(' ')}…</span>
              </span>
              <span className="text-sm muted">{t('page')} {num(j.first.page)}</span>
            </button>
          ))}
        </div>
      )}

      {tab === 'hizbs' && (
        <div className="list card" style={{ padding: '0 12px' }}>
          {hizbs.map((h) => {
            const qi = (h.n - 1) % 4
            return (
              <button key={h.n} className="list-item" onClick={() => nav(`/read/${h.first.page}?s=${h.first.s}&a=${h.first.a}`)}>
                <span className="num-badge" style={{ opacity: qi ? 0.6 : 1 }}>{qi === 0 ? num(hizbOfRub(h.n)) : ['', '¼', '½', '¾'][qi]}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong>{qi === 0 ? `${t('hizb')} ${num(hizbOfRub(h.n))}` : `${['', '¼', '½', '¾'][qi]} ${t('hizb')} ${num(hizbOfRub(h.n))}`}</strong>
                  <span className="quran text-ellipsis" style={{ display: 'block', fontSize: 18 }}>{splitAyahText(h.first.text).body.split(' ').slice(0, 6).join(' ')}…</span>
                </span>
                <span className="text-sm muted">{data.surahs[h.first.s - 1].ar} · {num(h.first.page)}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
