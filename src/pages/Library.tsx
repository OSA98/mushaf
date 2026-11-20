import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useSettings } from '../store/settings'
import { RIWAYAT, TAFSIRS, TRANSLATIONS } from '../config'
import { Icon, type IconName } from '../components/Icon'

export default function Library() {
  const { t, lang } = useT()
  const nav = useNavigate()
  const s = useSettings()
  const page = 1
  const tiles: { icon: IconName; title: string; to: string }[] = [
    { icon: 'voice', title: t('reciters'), to: '/reciters' },
    { icon: 'radio', title: t('radio'), to: '/radio' },
    { icon: 'task', title: t('khatmaPlan'), to: '/khatma' },
    { icon: 'mosque', title: t('prayerTimes'), to: '/prayer' },
    { icon: 'search', title: t('search'), to: '/search' },
    { icon: 'bookmark', title: t('saved'), to: '/saved' },
  ]
  return (
    <div className="page-narrow stack">
      <h1 className="h1">{t('library')}</h1>
      <div className="tiles">
        {tiles.map((x) => (
          <button key={x.to} className="card gold tile" onClick={() => nav(x.to)}>
            <span className="sug-icon"><Icon name={x.icon} /></span>
            <strong>{x.title}</strong>
          </button>
        ))}
      </div>

      <section>
        <div className="section-title"><h2 className="h2">{t('narrations')}</h2></div>
        <div className="tiles">
          {RIWAYAT.map((r) => (
            <button key={r.id} className={`card tile riwaya-tile ${s.riwaya === r.id ? 'active' : ''}`} onClick={() => { s.set({ riwaya: r.id }); nav('/index') }}>
              <span className={`quran`} style={{ fontFamily: `'q-${r.id}'`, fontSize: 22 }}>بِسۡمِ ٱللَّهِ</span>
              <strong className="text-sm">{lang === 'ar' ? r.ar : r.en}</strong>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="section-title"><h2 className="h2">{t('tafsirLibrary')}</h2></div>
        <div className="list card" style={{ padding: '0 12px' }}>
          {TAFSIRS.map((x) => (
            <button key={x.id} className="list-item" onClick={() => { s.set({ tafsir: x.id }); nav(`/read/${page}?panel=tafsir`) }}>
              <Icon name="book" />
              <span style={{ flex: 1 }}>{lang === 'ar' ? x.ar : x.en}</span>
              {s.tafsir === x.id && <Icon name="check" />}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="section-title"><h2 className="h2">{t('translationsLibrary')}</h2></div>
        <div className="list card" style={{ padding: '0 12px' }}>
          {TRANSLATIONS.map((x) => (
            <button key={x.id} className="list-item" onClick={() => { s.set({ translation: x.id }); nav(`/read/${page}?panel=translation`) }}>
              <Icon name="translate" />
              <span style={{ flex: 1 }}>{x.name}</span>
              {s.translation === x.id && <Icon name="check" />}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
