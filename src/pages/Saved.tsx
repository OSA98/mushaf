import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useUser } from '../store/user'
import { useSettings } from '../store/settings'
import { useQuran } from '../lib/quran'
import { Icon } from '../components/Icon'
import { RIWAYAT } from '../config'

type Tab = 'bookmarks' | 'notes' | 'highlights'

export default function Saved() {
  const { t, num, lang } = useT()
  const nav = useNavigate()
  const [tab, setTab] = useState<Tab>('bookmarks')
  const { bookmarks, notes, highlights, toggleBookmark, deleteNote, setHighlight } = useUser()
  const riwaya = useSettings((s) => s.riwaya)
  const setS = useSettings((s) => s.set)
  const { data } = useQuran(riwaya)

  const open = (r: typeof riwaya, page: number, s: number, a: number) => {
    if (r !== riwaya) setS({ riwaya: r })
    nav(`/read/${page}?s=${s}&a=${a}`)
  }
  const surahName = (s: number) => data?.surahs[s - 1]?.ar ?? s
  const textOf = (r: string, s: number, a: number) =>
    r === riwaya ? data?.bySurah.get(s)?.find((x) => x.a === a)?.text : undefined
  const rName = (r: string) => { const x = RIWAYAT.find((y) => y.id === r); return lang === 'ar' ? x?.ar : x?.en }

  const hl = Object.keys(highlights).map((k) => {
    const [r, sa] = k.split('|')
    const [s, a] = sa.split(':').map(Number)
    return { k, r: r as typeof riwaya, s, a }
  })

  return (
    <div className="page-narrow stack">
      <h1 className="h1">{t('saved')}</h1>
      <div className="segmented">
        {(['bookmarks', 'notes', 'highlights'] as Tab[]).map((x) => (
          <button key={x} className={tab === x ? 'active' : ''} onClick={() => setTab(x)}>
            {t(x)} ({num(x === 'bookmarks' ? bookmarks.length : x === 'notes' ? notes.length : hl.length)})
          </button>
        ))}
      </div>

      {tab === 'bookmarks' && (bookmarks.length === 0 ? (
        <div className="empty"><Icon name="bookmark" size={48} /><p>{t('noBookmarks')}</p></div>
      ) : (
        <div className="stack" style={{ gap: 12 }}>
          {bookmarks.map((b) => (
            <div key={b.key} className="card saved-item">
              <button className="saved-main" onClick={() => open(b.riwaya, b.page, b.surah, b.ayah)}>
                <div className="spread text-sm">
                  <strong>{t('surah')} {surahName(b.surah)} · {t('ayah')} {num(b.ayah)}</strong>
                  <span className="muted">{t('page')} {num(b.page)}</span>
                </div>
                {textOf(b.riwaya, b.surah, b.ayah) && <p className="quran saved-text">{textOf(b.riwaya, b.surah, b.ayah)}</p>}
                <span className="tag">{rName(b.riwaya)}</span>
              </button>
              <button className="icon-btn plain sm" onClick={() => toggleBookmark(b)} aria-label={t('delete')}><Icon name="trash" /></button>
            </div>
          ))}
        </div>
      ))}

      {tab === 'notes' && (notes.length === 0 ? (
        <div className="empty"><Icon name="note" size={48} /><p>{t('noNotes')}</p></div>
      ) : (
        <div className="stack" style={{ gap: 12 }}>
          {notes.map((n) => (
            <div key={n.key} className="card saved-item">
              <button className="saved-main" onClick={() => open(n.riwaya, n.page, n.surah, n.ayah)}>
                <div className="spread text-sm">
                  <strong>{t('surah')} {surahName(n.surah)} · {t('ayah')} {num(n.ayah)}</strong>
                  <span className="muted">{new Date(n.at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</span>
                </div>
                {textOf(n.riwaya, n.surah, n.ayah) && <p className="quran saved-text">{textOf(n.riwaya, n.surah, n.ayah)}</p>}
                <p className="note-body">{n.text}</p>
              </button>
              <button className="icon-btn plain sm" onClick={() => deleteNote(n.key)} aria-label={t('delete')}><Icon name="trash" /></button>
            </div>
          ))}
        </div>
      ))}

      {tab === 'highlights' && (hl.length === 0 ? (
        <div className="empty"><Icon name="highlighter" size={48} /><p>—</p></div>
      ) : (
        <div className="stack" style={{ gap: 12 }}>
          {hl.map((h) => {
            const ay = h.r === riwaya ? data?.bySurah.get(h.s)?.find((x) => x.a === h.a) : undefined
            return (
              <div key={h.k} className="card saved-item">
                <button className="saved-main" onClick={() => ay && open(h.r, ay.page, h.s, h.a)}>
                  <strong className="text-sm">{t('surah')} {surahName(h.s)} · {t('ayah')} {num(h.a)}</strong>
                  {ay && <p className="quran saved-text highlighted-bg">{ay.text}</p>}
                </button>
                <button className="icon-btn plain sm" onClick={() => setHighlight(h.k)} aria-label={t('delete')}><Icon name="trash" /></button>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
