import { useEffect, type ReactNode } from 'react'
import { create } from 'zustand'
import logoRaw from '../assets/logo.svg?raw'
import { BRAND } from '../config'
import { useT } from '../i18n'
import { Icon } from './Icon'

// Logo asset from the Figma file; the dome uses currentColor so it adapts to dark mode.
const logoSvg = logoRaw.replace(/fill="#341C02"/g, 'fill="currentColor"')

export function Logo({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`logo ${className}`}
      style={{ width: size * (164 / 168), height: size, display: 'inline-block', color: 'var(--logo-dome, #341c02)' }}
      dangerouslySetInnerHTML={{ __html: logoSvg.replace('<svg ', `<svg style="width:100%;height:100%" `) }}
      aria-hidden="true"
    />
  )
}

export function BrandName() {
  const { lang } = useT()
  return <>{lang === 'ar' ? BRAND.nameAr : BRAND.nameEn}</>
}

// ---------- toast ----------
const useToastStore = create<{ msg: string | null; show: (m: string) => void }>((set) => {
  let timer: ReturnType<typeof setTimeout>
  return {
    msg: null,
    show: (m) => {
      clearTimeout(timer)
      set({ msg: m })
      timer = setTimeout(() => set({ msg: null }), 2200)
    },
  }
})
export const toast = (m: string) => useToastStore.getState().show(m)
export function ToastHost() {
  const msg = useToastStore((s) => s.msg)
  return msg ? <div className="toast" role="status">{msg}</div> : null
}

// ---------- sheet / dialog ----------
export function Sheet({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; wide?: boolean }) {
  const { t } = useT()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" style={wide ? { maxWidth: 860 } : undefined} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        {title && (
          <div className="spread" style={{ marginBottom: 12 }}>
            <h2 className="h3">{title}</h2>
            <button className="icon-btn sm plain" onClick={onClose} aria-label={t('close')}><Icon name="close" /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function Spinner() { return <div className="spinner" aria-label="loading" /> }

export function ErrorBox({ onRetry }: { onRetry?: () => void }) {
  const { t } = useT()
  return (
    <div className="empty">
      <Icon name="info" size={40} />
      <p>{navigator.onLine ? t('errorLoad') : t('offline')}</p>
      {onRetry && <button className="btn secondary sm" onClick={onRetry}>{t('retry')}</button>}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="switch" aria-label={label}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span />
    </label>
  )
}

export function useHijriDate(lang: 'ar' | 'en') {
  try {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-ca-islamic-umalqura-nu-latn' : 'en-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date())
  } catch {
    return ''
  }
}
