import { useEffect, useState } from 'react'
import { TAFSIRS, TRANSLATIONS } from '../config'
import { useT } from '../i18n'
import { getEditionSurah } from '../lib/api'
import type { Ayah, QuranData } from '../lib/quran'
import { useSettings } from '../store/settings'
import { Icon } from './Icon'
import { Spinner, ErrorBox } from './ui'

/** Tafsir / translation side panel (desktop design) — also used inside a sheet on mobile. */
export function StudyPanel({ data, ayahs, selected, tab, onTab, onSelect, embedded }: {
  data: QuranData
  ayahs: Ayah[]
  selected: Ayah
  tab: 'tafsir' | 'translation'
  onTab: (t: 'tafsir' | 'translation') => void
  onSelect: (a: Ayah) => void
  embedded?: boolean
}) {
  const { t, lang } = useT()
  const { tafsir, translation, set } = useSettings()
  const edition = tab === 'tafsir' ? tafsir : translation
  const [text, setText] = useState<string | null>(null)
  const [err, setErr] = useState(false)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let alive = true
    setText(null)
    setErr(false)
    getEditionSurah(edition, selected.hs)
      .then((m) => alive && setText(m.get(selected.ha) ?? ''))
      .catch(() => alive && setErr(true))
    return () => { alive = false }
  }, [edition, selected.hs, selected.ha, nonce])

  const i = ayahs.findIndex((a) => a.idx === selected.idx)
  const tr = TRANSLATIONS.find((x) => x.id === translation)
  const rtl = tab === 'tafsir' || ['ur', 'fa'].includes(tr?.lang ?? '')
  const surah = data.surahs[selected.s - 1]

  return (
    <aside className={`study-panel ${embedded ? 'embedded' : ''}`}>
      <div className="sp-tabs">
        <div className="segmented" style={{ flex: 1 }}>
          <button className={tab === 'tafsir' ? 'active' : ''} onClick={() => onTab('tafsir')}>{t('tafsir')}</button>
          <button className={tab === 'translation' ? 'active' : ''} onClick={() => onTab('translation')}>{t('translation')}</button>
        </div>
        <select
          className="input select sp-select"
          value={edition}
          onChange={(e) => set(tab === 'tafsir' ? { tafsir: e.target.value } : { translation: e.target.value })}
          aria-label={tab === 'tafsir' ? t('defaultTafsir') : t('defaultTranslation')}
        >
          {tab === 'tafsir'
            ? TAFSIRS.map((x) => <option key={x.id} value={x.id}>{lang === 'ar' ? x.ar : x.en}</option>)
            : TRANSLATIONS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </div>

      <div className="sp-ayah">
        <button className="icon-btn plain sm" disabled={i <= 0} onClick={() => onSelect(ayahs[i - 1])} aria-label={t('prev')}><Icon name="chevronRight" /></button>
        <p className="quran sp-ayah-text">{selected.text}</p>
        <button className="icon-btn plain sm" disabled={i >= ayahs.length - 1} onClick={() => onSelect(ayahs[i + 1])} aria-label={t('next')}><Icon name="chevronLeft" /></button>
      </div>
      <div className="sp-ref text-xs">{t('surah')} {surah.ar} · {t('ayah')} {selected.a}{data.id !== 'hafs' ? ` · (حفص ${selected.hs}:${selected.ha})` : ''}</div>
      <hr className="divider sp-divider" />

      <div className="sp-content" dir={rtl ? 'rtl' : 'ltr'}>
        {err ? <ErrorBox onRetry={() => setNonce((n) => n + 1)} /> : text === null ? <Spinner /> : (
          text.split(/\n+/).map((para, k) => <p key={k}>{para}</p>)
        )}
      </div>
    </aside>
  )
}
