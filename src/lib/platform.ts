import { useEffect, useState } from 'react'
import { useSettings } from '../store/settings'

declare global {
  interface Window {
    Capacitor?: { isNativePlatform?: () => boolean }
    mushafDesktop?: { platform: string }
  }
}

export const isNativeApp = () =>
  !!window.Capacitor?.isNativePlatform?.() || !!window.mushafDesktop || window.matchMedia('(display-mode: standalone)').matches

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void> }
let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferred = e as BeforeInstallPromptEvent
  listeners.forEach((l) => l())
})

export function useInstallPrompt() {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    return () => { listeners.delete(l) }
  }, [])
  if (!deferred) return null
  return async () => { await deferred?.prompt(); deferred = null; force((n) => n + 1) }
}

/** Apply theme, paper, language direction and Quran font size to <html>. */
export function useApplySettings() {
  const { theme, paper, lang, quranSize, riwaya } = useSettings()
  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => root.setAttribute('data-theme', theme === 'auto' ? (mq.matches ? 'dark' : 'light') : theme)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-paper', paper)
    root.lang = lang
    root.dir = lang === 'ar' ? 'rtl' : 'ltr'
    root.style.setProperty('--quran-size', `${quranSize}px`)
    root.style.setProperty('--qfont', `'q-${riwaya}'`)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', root.getAttribute('data-theme') === 'dark' ? '#1f2125' : '#fffffd')
  }, [paper, lang, quranSize, riwaya, theme])
}
