import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useSettings } from '../store/settings'
import { useUser, computeStreak } from '../store/user'
import { useQuran, dailyIndex, toArabicDigits, hizbOfRub, splitAyahText } from '../lib/quran'
import { Icon, type IconName } from '../components/Icon'
import { Logo, BrandName, useHijriDate, Spinner } from '../components/ui'
import { KhatmaCard, StatsCard } from './Khatma'

export default function Home() {
  const { t, lang, num } = useT()
  const nav = useNavigate()
  const riwaya = useSettings((s) => s.riwaya)
  const { data } = useQuran(riwaya)
  const lastRead = useUser((s) => s.lastRead)
  const log = useUser((s) => s.log)
  const longest = useUser((s) => s.longestStreak)
  const hijri = useHijriDate(lang)
  const page = lastRead?.riwaya === riwaya ? lastRead.page : 1
  const streak = computeStreak(log)

  const daily = useMemo(() => (data ? data.ayahs[dailyIndex(data.ayahs.length)] : null), [data])
  const pageAyahs = data?.byPage[page] ?? []
  const first = pageAyahs[0]

  return (
    <div className="home">
      <header className="home-top">
        <div className="row" style={{ gap: 8 }}>
          <Logo size={48} />
          <div>
            <div className="h3" style={{ fontSize: 20 }}><BrandName /></div>
            <div className="text-sm muted">{t('hijriDate')} {hijri}</div>
          </div>
        </div>
        <div className="row">
          <Link to="/search" className="icon-btn" aria-label={t('search')}><Icon name="search" /></Link>
          <Link to={`/read/${page}`} className="icon-btn" aria-label={t('mushaf')}><Icon name="bookOpen" /></Link>
        </div>
      </header>

      <div className="home-grid">
        <div className="stack">
          {/* Verse of the day */}
          <button className="daily-ayah" onClick={() => daily && nav(`/read/${daily.page}?s=${daily.s}&a=${daily.a}`)}>
            <span className="da-label">{t('dailyAyah')}</span>
            {daily ? (
              <span className="da-text quran">{daily.text}</span>
            ) : <Spinner />}
            {daily && data && (
              <span className="da-ref">{t('surah')} {data.surahs[daily.s - 1]?.ar}</span>
            )}
          </button>

          {/* Daily wird */}
          <section>
            <div className="section-title">
              <h2 className="h2">{t('dailyWird')}</h2>
              {first && (
                <span className="text-xs muted">
                  {t('juz')} {num(first.juz)} – {t('hizb')} {num(hizbOfRub(first.rub))} - {t('page')} {num(page)}
                </span>
              )}
            </div>
            <div className="card gold wird-card">
              {data ? (
                <p className="wird-text quran">
                  {pageAyahs.slice(0, 4).map((a) => {
                    const { body, num: n } = splitAyahText(a.text)
                    return <span key={a.idx}>{body} <span className="ayah-num">{n || toArabicDigits(a.a)}</span> </span>
                  })}
                </p>
              ) : <Spinner />}
              <button className="btn block lg" onClick={() => nav(`/read/${page}`)}>
                {lastRead ? t('continueReading') : t('startReading')}
              </button>
            </div>
          </section>

          {/* Suggestions */}
          <section>
            <div className="section-title"><h2 className="h2">{t('suggestions')}</h2></div>
            <div className="scroll-x suggestions">
              <Suggestion icon="task" title={t('khatmaPlan')} desc={t('khatmaPlanDesc')} to="/khatma" />
              <Suggestion icon="bookOpen" title={t('startReading')} desc={t('startReadingDesc')} to="/read/1" />
              <Suggestion icon="voice" title={t('listen')} desc={t('listenDesc')} to="/reciters" />
              <Suggestion icon="mosque" title={t('prayerTimes')} desc={t('location')} to="/prayer" />
              <Suggestion icon="radio" title={t('radio')} desc={t('liveRadio')} to="/radio" />
            </div>
          </section>
        </div>

        <div className="stack">
          <div className="streak-row">
            <div>
              <div className="row h3"><Icon name="fire" /> {num(streak)} {t('day')}</div>
              <div className="text-sm muted">{t('streak')}</div>
            </div>
            <div style={{ textAlign: 'end' }}>
              <div className="row h3" style={{ justifyContent: 'flex-end' }}><Icon name="calendar" /> {num(longest)} {t('day')}</div>
              <div className="text-sm muted">{t('longestStreak')}</div>
            </div>
          </div>
          <KhatmaCard compact />
          <StatsCard />
        </div>
      </div>
    </div>
  )
}

function Suggestion({ icon, title, desc, to }: { icon: IconName; title: string; desc: string; to: string }) {
  const [hover, setHover] = useState(false)
  return (
    <Link to={to} className={`card gold suggestion ${hover ? 'hover' : ''}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <span className="sug-icon"><Icon name={icon} /></span>
      <strong className="h3">{title}</strong>
      <span className="text-sm muted">{desc}</span>
    </Link>
  )
}
