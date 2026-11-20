import { chromium } from 'playwright'
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const base = 'http://localhost:4173/#'
async function run(name, { w, h, path, settings = {}, act }) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  await page.addInitScript((s) => localStorage.setItem('mushaf.settings', JSON.stringify({ state: { onboarded: true, theme: 'light', ...s }, version: 1 })), settings)
  await page.goto(base + path, { waitUntil: 'networkidle' }).catch(() => {})
  await page.waitForTimeout(900)
  if (act) await act(page)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `/tmp/s_${name}.png` })
  console.log(name, JSON.stringify(errs))
  await page.close()
}
const which = process.argv.slice(2)
const S = {
  m_ayah: { w: 390, h: 844, path: '/read/3', act: (p) => p.locator('.ayah').nth(2).click() },
  d_double: { w: 1600, h: 900, path: '/read/4', settings: { layout: 'double' } },
  m_dark: { w: 390, h: 844, path: '/read/50', settings: { theme: 'dark' } },
  d_landing: { w: 1440, h: 900, path: '/about' },
  m_welcome: { w: 390, h: 844, path: '/welcome', settings: { onboarded: false } },
  m_index: { w: 390, h: 844, path: '/index' },
  m_settings: { w: 390, h: 844, path: '/settings' },
  m_search: { w: 390, h: 844, path: '/search', act: async (p) => { await p.fill('.search-box input', 'الرحمن الرحيم'); await p.waitForTimeout(1500) } },
  d_warsh: { w: 1600, h: 900, path: '/read/5', settings: { riwaya: 'warsh', layout: 'single' } },
  m_khatma: { w: 390, h: 844, path: '/khatma' },
  m_library: { w: 390, h: 844, path: '/library' },
}
for (const k of which.length ? which : Object.keys(S)) await run(k, S[k])
await browser.close()
