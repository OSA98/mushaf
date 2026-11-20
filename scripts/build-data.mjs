// Builds compact per-narration Quran data from the KFGQPC dataset
// (https://github.com/thetruetruth/quran-data-kfgqpc — source: King Fahd Glorious Quran Printing Complex)
// Usage: KFGQPC_DIR=/path/to/quran-data-kfgqpc node scripts/build-data.mjs
import fs from 'node:fs'
import path from 'node:path'
import { convertAyah } from 'quran-meta'

const SRC = process.env.KFGQPC_DIR || path.resolve('../ext/quran-data-kfgqpc')
const OUT = path.resolve('public/data')
const FONTS = path.resolve('public/fonts')

const RIWAYAT = [
  { id: 'hafs', dir: 'hafs', meta: 'hafs', name: 'Hafs' },
  { id: 'shuba', dir: 'shouba', meta: 'shuba', name: 'Shuba' },
  { id: 'warsh', dir: 'warsh', meta: 'warsh', name: 'Warsh' },
  { id: 'qalun', dir: 'qaloon', meta: 'qalun', name: 'Qalun' },
  { id: 'douri', dir: 'doori', meta: 'douri', name: 'Douri' },
  { id: 'sousi', dir: 'soosi', meta: 'sousi', name: 'Sousi' },
  { id: 'bazzi', dir: 'bazzi', meta: 'bazzi', name: 'Bazzi' },
  { id: 'qunbul', dir: 'qumbul', meta: 'qunbul', name: 'Qunbul' },
]

const firstFile = (dir, ext) => {
  const f = fs.readdirSync(dir).find((x) => x.endsWith(ext))
  if (!f) throw new Error(`No ${ext} in ${dir}`)
  return path.join(dir, f)
}

const index = []
for (const r of RIWAYAT) {
  const raw = JSON.parse(fs.readFileSync(firstFile(path.join(SRC, r.dir, 'data'), '.json'), 'utf8'))
  const M = await import(`quran-meta/${r.meta}`)
  const surahs = []
  const ayahs = []
  let maxPage = 0
  for (const row of raw) {
    const s = Number(row.sora ?? row.sura_no)
    const a = Number(row.aya_no)
    const page = parseInt(String(row.page), 10)
    const juz = Number(row.jozz)
    maxPage = Math.max(maxPage, page)
    let rub = 0
    let sajda = 0
    try { rub = M.findRubAlHizb(s, a) } catch {}
    try {
      const id = M.findAyahIdBySurah(s, a)
      sajda = M.getAyahMeta(id).isSajdahAyah ? 1 : 0
    } catch {}
    let hs = s, ha = a
    if (r.meta !== 'hafs') {
      try { [hs, ha] = convertAyah(s, a, r.name, 'Hafs') } catch {}
    }
    const text = String(row.aya_text).trim()
    ayahs.push([s, a, page, juz, rub, sajda, hs, ha, text])
    if (!surahs[s - 1]) {
      surahs[s - 1] = {
        n: s,
        ar: String(row.sora_name_ar ?? row.sura_name_ar).trim(),
        en: String(row.sora_name_en ?? row.sura_name_en).trim(),
        ayahs: 0,
        page,
        meccan: (() => { try { return M.getSurahMeta(s).isMeccan ? 1 : 0 } catch { return 1 } })(),
      }
    }
    surahs[s - 1].ayahs = Math.max(surahs[s - 1].ayahs, a)
  }
  const out = { id: r.id, pages: maxPage, surahs, ayahs }
  fs.writeFileSync(path.join(OUT, `${r.id}.json`), JSON.stringify(out))
  fs.copyFileSync(firstFile(path.join(SRC, r.dir, 'font'), '.woff2'), path.join(FONTS, `${r.id}.woff2`))
  index.push({ id: r.id, pages: maxPage, ayahs: ayahs.length })
  console.log(r.id, 'ayahs', ayahs.length, 'pages', maxPage, 'rub0', ayahs.filter((x) => !x[4]).length, 'sajdas', ayahs.filter((x) => x[5]).length)

  if (r.id === 'hafs') {
    const plain = raw.map((row) => [Number(row.sora), Number(row.aya_no), String(row.aya_text_emlaey)])
    fs.writeFileSync(path.join(OUT, 'search-hafs.json'), JSON.stringify(plain))
  }
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index))
