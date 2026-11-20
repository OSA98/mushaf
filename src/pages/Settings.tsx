import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { useSettings, type Layout, type Paper, type Theme } from '../store/settings'
import { useUser } from '../store/user'
import { RIWAYAT, TAFSIRS, TRANSLATIONS, VERSE_RECITERS, BRAND } from '../config'
import { Icon } from '../components/Icon'
import { Toggle, toast } from '../components/ui'

function Row({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="setting-row">
      <div>
        <div>{label}</div>
        {hint && <div className="text-xs muted">{hint}</div>}
      </div>
      <div className="setting-control">{children}</div>
    </div>
  )
}

export default function Settings() {
  const { t, lang, num } = useT()
  const s = useSettings()
  const user = useUser()
  const fileRef = useRef<HTMLInputElement>(null)

  const exportData = () => {
    const { bookmarks, notes, highlights, lastRead, khatma, khatmasCompleted, log, longestStreak } = useUser.getState()
    const blob = new Blob([JSON.stringify({ app: 'mushaf', v: 1, bookmarks, notes, highlights, lastRead, khatma, khatmasCompleted, log, longestStreak }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `mushaf-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }
  const importData = async (f: File) => {
    try {
      const d = JSON.parse(await f.text())
      if (d.app !== 'mushaf') throw new Error()
      user.importAll(d)
      toast('✓')
    } catch { toast(t('errorLoad')) }
  }

  return (
    <div className="page-narrow stack">
      <h1 className="h1">{t('settings')}</h1>

      <section className="card settings-group">
        <h2 className="h3">{t('appearance')}</h2>
        <Row label={t('language')}>
          <div className="segmented">
            <button className={lang === 'ar' ? 'active' : ''} onClick={() => s.set({ lang: 'ar' })}>العربية</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => s.set({ lang: 'en' })}>English</button>
          </div>
        </Row>
        <Row label={t('theme')}>
          <div className="segmented">
            {(['light', 'dark', 'auto'] as Theme[]).map((x) => (
              <button key={x} className={s.theme === x ? 'active' : ''} onClick={() => s.set({ theme: x })}>{t(x)}</button>
            ))}
          </div>
        </Row>
      </section>

      <section className="card settings-group">
        <h2 className="h3">{t('mushafAppearance')}</h2>
        <Row label={t('narration')}>
          <select className="input select" value={s.riwaya} onChange={(e) => s.set({ riwaya: e.target.value as typeof s.riwaya })}>
            {RIWAYAT.map((r) => <option key={r.id} value={r.id}>{lang === 'ar' ? r.ar : r.en}</option>)}
          </select>
        </Row>
        <Row label={t('layout')}>
          <div className="segmented">
            {([['auto', t('auto')], ['single', t('singlePage')], ['double', t('doublePage')]] as [Layout, string][]).map(([v, l]) => (
              <button key={v} className={s.layout === v ? 'active' : ''} onClick={() => s.set({ layout: v })}>{l}</button>
            ))}
          </div>
        </Row>
        <Row label={t('paper')}>
          <div className="segmented">
            {(['cream', 'white', 'sepia'] as Paper[]).map((x) => (
              <button key={x} className={s.paper === x ? 'active' : ''} onClick={() => s.set({ paper: x })}>{t(x)}</button>
            ))}
          </div>
        </Row>
        <Row label={`${t('fontSize')} (${num(s.quranSize)})`}>
          <input type="range" min={18} max={44} value={s.quranSize} onChange={(e) => s.set({ quranSize: Number(e.target.value) })} />
        </Row>
        <p className="quran font-preview" style={{ fontSize: s.quranSize }}>ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ ٢</p>
      </section>

      <section className="card settings-group">
        <h2 className="h3">{t('audioSettings')}</h2>
        <Row label={t('reciter')} hint={t('verseByVerse')}>
          <select className="input select" value={s.reciter} onChange={(e) => s.set({ reciter: e.target.value })}>
            {VERSE_RECITERS.map((r) => <option key={r.id} value={r.id}>{lang === 'ar' ? r.ar : r.en}</option>)}
          </select>
        </Row>
        <Row label={`${t('repeat')} (×${num(s.repeatCount)})`}>
          <input type="range" min={1} max={10} value={s.repeatCount} onChange={(e) => s.set({ repeatCount: Number(e.target.value) })} />
        </Row>
        <Row label={`${t('speed')} (${s.playbackRate}×)`}>
          <input type="range" min={0.5} max={2} step={0.25} value={s.playbackRate} onChange={(e) => s.set({ playbackRate: Number(e.target.value) })} />
        </Row>
        <Row label={t('autoNext')}><Toggle checked={s.autoNextPage} onChange={(v) => s.set({ autoNextPage: v })} label={t('autoNext')} /></Row>
        <Row label={t('sajdaNotify')}><Toggle checked={s.sajdaNotify} onChange={(v) => s.set({ sajdaNotify: v })} label={t('sajdaNotify')} /></Row>
      </section>

      <section className="card settings-group">
        <h2 className="h3">{t('tafsirTranslation')}</h2>
        <Row label={t('defaultTafsir')}>
          <select className="input select" value={s.tafsir} onChange={(e) => s.set({ tafsir: e.target.value })}>
            {TAFSIRS.map((x) => <option key={x.id} value={x.id}>{lang === 'ar' ? x.ar : x.en}</option>)}
          </select>
        </Row>
        <Row label={t('defaultTranslation')}>
          <select className="input select" value={s.translation} onChange={(e) => s.set({ translation: e.target.value })}>
            {TRANSLATIONS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </Row>
      </section>

      <section className="card settings-group">
        <h2 className="h3">{t('privacy')}</h2>
        <p className="text-sm muted" style={{ marginTop: 0 }}>
          {lang === 'ar'
            ? 'كل بياناتك (العلامات والملاحظات والتقدم) محفوظة على جهازك فقط، ولا نجمع أي بيانات.'
            : 'All your data (bookmarks, notes, progress) stays on your device. We collect nothing.'}
        </p>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="btn secondary sm" onClick={exportData}><Icon name="download" size={18} /> {t('exportData')}</button>
          <button className="btn secondary sm" onClick={() => fileRef.current?.click()}>{t('importData')}</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
          <button className="btn danger sm" onClick={() => confirm(t('resetConfirm')) && user.resetAll()}><Icon name="trash" size={18} /> {t('resetAll')}</button>
        </div>
      </section>

      <section className="card settings-group">
        <Link to="/about" className="spread">
          <span className="row"><Icon name="info" /> {t('about')} — {lang === 'ar' ? BRAND.nameAr : BRAND.nameEn}</span>
          <Icon name="chevronLeft" />
        </Link>
      </section>
    </div>
  )
}
