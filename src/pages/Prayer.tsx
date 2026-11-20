import { useEffect, useMemo, useState } from 'react'
import { CalculationMethod, Coordinates, PrayerTimes, Qibla } from 'adhan'
import { useT, type TKey } from '../i18n'
import { useSettings } from '../store/settings'
import { Icon } from '../components/Icon'
import { toast, useHijriDate } from '../components/ui'

const METHODS: { id: keyof typeof CalculationMethod; ar: string; en: string }[] = [
  { id: 'Egyptian', ar: 'الهيئة المصرية العامة للمساحة', en: 'Egyptian General Authority' },
  { id: 'UmmAlQura', ar: 'أم القرى (مكة المكرمة)', en: 'Umm al-Qura (Makkah)' },
  { id: 'MuslimWorldLeague', ar: 'رابطة العالم الإسلامي', en: 'Muslim World League' },
  { id: 'Karachi', ar: 'جامعة العلوم الإسلامية بكراتشي', en: 'Karachi' },
  { id: 'Dubai', ar: 'دبي', en: 'Dubai' },
  { id: 'Kuwait', ar: 'الكويت', en: 'Kuwait' },
  { id: 'Qatar', ar: 'قطر', en: 'Qatar' },
  { id: 'Turkey', ar: 'تركيا (ديانت)', en: 'Turkey (Diyanet)' },
  { id: 'Singapore', ar: 'سنغافورة', en: 'Singapore' },
  { id: 'NorthAmerica', ar: 'أمريكا الشمالية (ISNA)', en: 'North America (ISNA)' },
  { id: 'MoonsightingCommittee', ar: 'لجنة رؤية الهلال', en: 'Moonsighting Committee' },
  { id: 'Tehran', ar: 'طهران', en: 'Tehran' },
]
const KEYS: TKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']

export default function Prayer() {
  const { t, lang } = useT()
  const s = useSettings()
  const hijri = useHijriDate(lang)
  const [now, setNow] = useState(new Date())
  const [locating, setLocating] = useState(false)
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id) }, [])

  const locate = () => {
    if (!navigator.geolocation) return toast(t('locationDenied'))
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (p) => { s.set({ location: { lat: p.coords.latitude, lng: p.coords.longitude } }); setLocating(false) },
      () => { toast(t('locationDenied')); setLocating(false) },
      { enableHighAccuracy: false, timeout: 15000 },
    )
  }

  const info = useMemo(() => {
    if (!s.location) return null
    const coords = new Coordinates(s.location.lat, s.location.lng)
    const factory = CalculationMethod[s.prayerMethod as keyof typeof CalculationMethod] ?? CalculationMethod.Egyptian
    const params = (factory as () => ReturnType<typeof CalculationMethod.Egyptian>)()
    const pt = new PrayerTimes(coords, now, params)
    const times = [pt.fajr, pt.sunrise, pt.dhuhr, pt.asr, pt.maghrib, pt.isha]
    const nextIdx = times.findIndex((x) => x > now)
    return { times, nextIdx, qibla: Qibla(coords) }
  }, [s.location, s.prayerMethod, now])

  const fmt = (d: Date) => d.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: 'numeric', minute: '2-digit' })
  const until = (d: Date) => {
    const m = Math.max(0, Math.round((d.getTime() - now.getTime()) / 60000))
    const h = Math.floor(m / 60)
    return lang === 'ar' ? `بعد ${h ? h + ' س ' : ''}${m % 60} د` : `in ${h ? h + 'h ' : ''}${m % 60}m`
  }

  return (
    <div className="page-narrow stack">
      <h1 className="h1">{t('prayerTimes')}</h1>
      <div className="text-sm muted">{new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · {hijri}</div>

      {!s.location ? (
        <div className="card gold empty">
          <Icon name="location" size={44} />
          <p>{lang === 'ar' ? 'نحتاج موقعك لحساب مواقيت الصلاة بدقة. يتم الحساب على جهازك فقط.' : 'We need your location to calculate prayer times. Everything is computed on your device.'}</p>
          <button className="btn" onClick={locate} disabled={locating}>{locating ? t('loading') : t('detectLocation')}</button>
        </div>
      ) : info && (
        <>
          {info.nextIdx >= 0 && (
            <div className="card gold next-prayer">
              <span className="text-sm muted">{t('nextPrayer')}</span>
              <strong className="h1">{t(KEYS[info.nextIdx])}</strong>
              <span>{fmt(info.times[info.nextIdx])} · {until(info.times[info.nextIdx])}</span>
            </div>
          )}
          <div className="list card" style={{ padding: '0 16px' }}>
            {KEYS.map((k, i) => (
              <div key={k} className={`list-item prayer-row ${i === info.nextIdx ? 'active' : ''}`}>
                <span style={{ flex: 1 }}>{t(k)}</span>
                <strong>{fmt(info.times[i])}</strong>
              </div>
            ))}
          </div>
          <div className="card spread">
            <span className="row"><Icon name="target" /> {lang === 'ar' ? 'اتجاه القبلة' : 'Qibla direction'}</span>
            <span className="row">
              <span className="qibla" style={{ transform: `rotate(${info.qibla}deg)` }}>↑</span>
              <strong>{Math.round(info.qibla)}°</strong>
            </span>
          </div>
          <button className="btn secondary sm" onClick={locate}><Icon name="location" size={18} /> {t('detectLocation')}</button>
        </>
      )}

      <div className="card settings-group">
        <div className="setting-row">
          <span>{t('calcMethod')}</span>
          <select className="input select" value={s.prayerMethod} onChange={(e) => s.set({ prayerMethod: e.target.value })}>
            {METHODS.map((m) => <option key={m.id} value={m.id}>{lang === 'ar' ? m.ar : m.en}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
