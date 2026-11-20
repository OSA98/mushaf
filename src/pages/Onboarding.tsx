import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useSettings } from '../store/settings'
import { RIWAYAT, BRAND } from '../config'
import { Logo, BrandName } from '../components/ui'
import { Icon, type IconName } from '../components/Icon'

export default function Onboarding() {
  const { t, lang } = useT()
  const s = useSettings()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const finish = () => { s.set({ onboarded: true }); nav('/', { replace: true }) }
  const ar = lang === 'ar'
  const slides: { icon: IconName; title: string; desc: string }[] = [
    { icon: 'bookOpen', title: ar ? 'اقرأ' : 'Read', desc: ar ? 'المصحف بالرسم العثماني بثماني روايات، مع التفسير والترجمة بجانب النص.' : 'The Uthmani Mushaf in eight narrations, with tafsir and translation side by side.' },
    { icon: 'voice', title: ar ? 'استمع' : 'Listen', desc: ar ? 'تلاوات كبار القراء مع تظليل الآية والتكرار للحفظ.' : 'Renowned reciters with verse highlighting and repetition for memorization.' },
    { icon: 'sparkle', title: ar ? 'تدبّر' : 'Reflect', desc: ar ? 'دوّن ملاحظاتك، وتابع ختمتك ووردك اليومي.' : 'Write reflections and follow your khatma and daily wird.' },
  ]

  return (
    <div className="onboarding">
      {step === 0 ? (
        <div className="ob-splash">
          <Logo size={168} />
          <h1 className="h1"><BrandName /></h1>
          <p className="muted ob-tag">{ar ? BRAND.taglineAr : BRAND.taglineEn}</p>
          <div className="segmented" style={{ width: 240 }}>
            <button className={lang === 'ar' ? 'active' : ''} onClick={() => s.set({ lang: 'ar' })}>العربية</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => s.set({ lang: 'en' })}>English</button>
          </div>
          <button className="btn lg" style={{ minWidth: 240 }} onClick={() => setStep(1)}>{t('next')}</button>
        </div>
      ) : step <= slides.length ? (
        <div className="ob-slide">
          <button className="btn ghost sm ob-skip" onClick={finish}>{t('skip')}</button>
          <span className="ob-icon"><Icon name={slides[step - 1].icon} size={56} /></span>
          <h2 className="h1">{slides[step - 1].title}</h2>
          <p className="muted">{slides[step - 1].desc}</p>
          <div className="ob-dots">{slides.map((_, i) => <span key={i} className={i === step - 1 ? 'on' : ''} />)}</div>
          <button className="btn lg block" onClick={() => setStep(step + 1)}>{t('next')}</button>
        </div>
      ) : (
        <div className="ob-slide">
          <h2 className="h2">{t('narration')}</h2>
          <div className="list card" style={{ width: '100%', padding: '0 12px' }}>
            {RIWAYAT.map((r) => (
              <button key={r.id} className="list-item" onClick={() => s.set({ riwaya: r.id })}>
                <span style={{ flex: 1 }}>{ar ? r.ar : r.en}</span>
                {s.riwaya === r.id && <Icon name="checkCircle" />}
              </button>
            ))}
          </div>
          <button className="btn lg block" onClick={finish}>{t('getStarted')}</button>
        </div>
      )}
    </div>
  )
}
