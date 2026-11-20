import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useUser, computeStreak } from '../store/user'
import { Icon } from '../components/Icon'

const TOTAL = 604

function khatmaInfo(k: NonNullable<ReturnType<typeof useUser.getState>['khatma']>) {
  const perDay = Math.ceil(TOTAL / k.days)
  const dayIdx = Math.floor((Date.now() - k.startedAt) / 86400000) // 0-based
  const goal = Math.min(TOTAL, perDay * (dayIdx + 1))
  const done = k.donePages.length
  // next unread page in order, starting from startPage
  let next = k.startPage
  const set = new Set(k.donePages)
  for (let i = 0; i < TOTAL; i++) {
    const p = ((k.startPage - 1 + i) % TOTAL) + 1
    if (!set.has(p)) { next = p; break }
  }
  const todayEnd = Math.min(TOTAL, next + Math.max(0, goal - done) - 1)
  return { perDay, goal, done, next, todayEnd: Math.max(next, todayEnd), pct: Math.round((done / TOTAL) * 100) }
}

export function KhatmaCard({ compact }: { compact?: boolean }) {
  const { t, num } = useT()
  const nav = useNavigate()
  const k = useUser((s) => s.khatma)
  if (!k) {
    return (
      <button className="btn block lg" onClick={() => nav('/khatma')}>
        {t('newChallenge')}
      </button>
    )
  }
  const i = khatmaInfo(k)
  return (
    <div className="card gold khatma-card">
      <div className="h3">{t('khatmaProgress')}</div>
      <div className="spread text-sm" style={{ margin: '6px 0 14px' }}>
        <span>{t('completedOf', { p: num(i.pct), n: num(k.number) })}</span>
        <span className="muted row"><Icon name="book" size={16} /> {t('remaining', { n: num(TOTAL - i.done) })}</span>
      </div>
      <div className="progress"><span style={{ width: `${Math.max(2, i.pct)}%` }} /></div>
      <div className="spread text-xs" style={{ marginTop: 8 }}>
        <span>{t('done', { n: num(i.done) })}</span>
        <span className="muted">{t('goal', { n: num(i.goal) })}</span>
      </div>
      {!compact && (
        <>
          <hr className="divider" style={{ margin: '14px 0' }} />
          <div className="text-sm">{t('pagesPerDay', { n: num(i.perDay) })}</div>
          <div className="text-sm muted">{t('todayWird', { a: num(i.next), b: num(i.todayEnd) })}</div>
        </>
      )}
      <button className="btn block" style={{ marginTop: 14 }} onClick={() => nav(`/read/${i.next}`)}>
        {t('continueReading')}
      </button>
    </div>
  )
}

type Range = 'week' | 'month' | 'year' | 'allTime'

export function StatsCard() {
  const { t, num } = useT()
  const log = useUser((s) => s.log)
  const khatmas = useUser((s) => s.khatmasCompleted)
  const [range, setRange] = useState<Range>('week')
  const s = useMemo(() => {
    const days = range === 'week' ? 7 : range === 'month' ? 30 : range === 'year' ? 365 : 100000
    const since = new Date()
    since.setDate(since.getDate() - days + 1)
    const sinceKey = since.toISOString().slice(0, 10)
    let pages = 0, seconds = 0, ayahs = 0
    for (const [d, e] of Object.entries(log)) {
      if (d >= sinceKey) { pages += e.pages.length; seconds += e.seconds; ayahs += e.ayahs }
    }
    return { pages, minutes: Math.round(seconds / 60), ayahs }
  }, [log, range])
  return (
    <section>
      <div className="section-title"><h2 className="h2">{t('stats')}</h2></div>
      <div className="card gold">
        <div className="segmented" role="tablist">
          {(['week', 'month', 'year', 'allTime'] as Range[]).map((r) => (
            <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)} role="tab" aria-selected={range === r}>{t(r)}</button>
          ))}
        </div>
        <div className="stats-grid">
          <Stat icon="sparkle" value={num(khatmas)} label={t('khatmas')} />
          <Stat icon="clock" value={`${num(s.minutes)} ${t('minutes')}`} label={t('readingTime')} />
          <Stat icon="list" value={`${num(s.ayahs)} ${t('ayah')}`} label={t('ayahsRead')} />
          <Stat icon="book" value={num(s.pages)} label={t('pagesRead')} />
        </div>
      </div>
    </section>
  )
}

function Stat({ icon, value, label }: { icon: Parameters<typeof Icon>[0]['name']; value: string; label: string }) {
  return (
    <div className="stat">
      <span className="row" style={{ gap: 6 }}><Icon name={icon} size={18} /> <strong>{value}</strong></span>
      <span className="text-sm muted">{label}</span>
    </div>
  )
}

export default function KhatmaPage() {
  const { t, num } = useT()
  const k = useUser((s) => s.khatma)
  const start = useUser((s) => s.startKhatma)
  const lastPage = useUser((s) => s.lastRead?.page ?? 1)
  const log = useUser((s) => s.log)
  const longest = useUser((s) => s.longestStreak)
  const [days, setDays] = useState(30)
  const [fromCurrent, setFromCurrent] = useState(false)
  return (
    <div className="page-narrow stack">
      <h1 className="h1">{t('khatmaPlan')}</h1>
      <div className="streak-row">
        <div><div className="row h3"><Icon name="fire" /> {num(computeStreak(log))} {t('day')}</div><div className="text-sm muted">{t('streak')}</div></div>
        <div style={{ textAlign: 'end' }}><div className="row h3" style={{ justifyContent: 'flex-end' }}><Icon name="calendar" /> {num(longest)} {t('day')}</div><div className="text-sm muted">{t('longestStreak')}</div></div>
      </div>
      {k && <KhatmaCard />}
      <div className="card gold stack">
        <h2 className="h3">{k ? t('newChallenge') : t('khatmaPlanDesc')}</h2>
        <label className="text-sm muted">{t('planDays')}</label>
        <div className="scroll-x">
          {[3, 7, 10, 15, 20, 30, 60, 90, 180, 365].map((d) => (
            <button key={d} className={`chip ${days === d ? 'active' : ''}`} onClick={() => setDays(d)}>{num(d)} {t('day')}</button>
          ))}
        </div>
        <input className="input" type="number" min={1} max={1000} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))} />
        <div className="text-sm">{t('pagesPerDay', { n: num(Math.ceil(TOTAL / days)) })}</div>
        <label className="spread text-sm">
          <span>{t('continueReading')} ({t('page')} {num(lastPage)})</span>
          <input type="checkbox" checked={fromCurrent} onChange={(e) => setFromCurrent(e.target.checked)} />
        </label>
        <button className="btn block lg" onClick={() => start(days, fromCurrent ? lastPage : 1)}>{t('createPlan')}</button>
      </div>
      <StatsCard />
    </div>
  )
}
