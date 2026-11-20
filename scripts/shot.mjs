import { chromium } from 'playwright'
const [,, url, out, w, h, setup] = process.argv
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 1 })
const logs = []
page.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()) })
page.on('pageerror', (e) => logs.push('PAGEERROR ' + e.message))
await page.addInitScript((s) => { if (s) { for (const [k, v] of Object.entries(JSON.parse(s))) localStorage.setItem(k, JSON.stringify(v)) } }, setup || '')
await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {})
await page.waitForTimeout(1500)
await page.screenshot({ path: out, fullPage: false })
console.log(JSON.stringify(logs.slice(0, 8)))
await browser.close()
