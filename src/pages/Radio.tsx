import { useEffect, useState } from 'react'
import { useT } from '../i18n'
import { getRadios, type Radio as R } from '../lib/api'
import { useAudio } from '../lib/audio'
import { Icon } from '../components/Icon'
import { Spinner, ErrorBox } from '../components/ui'

export default function Radio() {
  const { t, lang } = useT()
  const [list, setList] = useState<R[] | null>(null)
  const [err, setErr] = useState(false)
  const [q, setQ] = useState('')
  const [nonce, setNonce] = useState(0)
  const { playRadio, mode, title, playing } = useAudio()
  useEffect(() => { setErr(false); getRadios(lang).then(setList).catch(() => setErr(true)) }, [lang, nonce])
  const filtered = (list ?? []).filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="page-narrow stack">
      <h1 className="h1">{t('quranRadio')}</h1>
      <input className="input" placeholder={t('search')} value={q} onChange={(e) => setQ(e.target.value)} />
      {err ? <ErrorBox onRetry={() => setNonce((n) => n + 1)} /> : !list ? <Spinner /> : (
        <div className="list card" style={{ padding: '0 12px' }}>
          {filtered.map((r) => {
            const active = mode === 'radio' && title === r.name
            return (
              <button key={r.id} className="list-item" onClick={() => (active ? useAudio.getState().toggle() : playRadio(r.url, r.name))}>
                <span className={`avatar ${active && playing ? 'live' : ''}`}><Icon name="radio" size={20} /></span>
                <span style={{ flex: 1 }}>{r.name}</span>
                <Icon name={active && playing ? 'pause' : 'play'} size={20} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
