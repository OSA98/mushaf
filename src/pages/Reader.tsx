import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useT } from '../i18n'
import { useSettings } from '../store/settings'
import { useUser, ayahKey } from '../store/user'
import { useAudio } from '../lib/audio'
import { useQuran, splitAyahText, hizbOfRub, quarterInHizb, needsBasmalaHeader, BASMALA, type Ayah, type QuranData } from '../lib/quran'
import { ayahRef, copyText, playFrom, shareText, stripMarks } from '../lib/actions'
import { Icon } from '../components/Icon'
import { Sheet, Spinner, ErrorBox, toast } from '../components/ui'
import { StudyPanel } from '../components/StudyPanel'
import { useMedia } from '../lib/useMedia'

export default function Reader() {
  const params = useParams()
  const [sp, setSp] = useSearchParams()
  const nav = useNavigate()
  const { t, lang, num } = useT()
  const settings = useSettings()
  const { data, error, retry } = useQuran(settings.riwaya)
  const isDesktop = useMedia('(min-width: 1100px)')
  const isWide = useMedia('(min-width: 960px)')
  const page = Math.min(Math.max(1, Number(params.page) || 1), data?.pages ?? 604)

  const [selected, setSelected] = useState<Ayah | null>(null)
  const [memorize, setMemorize] = useState(false)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [noteFor, setNoteFor] = useState<Ayah | null>(null)
  const [studyFor, setStudyFor] = useState<{ a: Ayah; tab: 'tafsir' | 'translation' } | null>(null)
  const [picker, setPicker] = useState(false)
  const panelParam = sp.get('panel') as 'tafsir' | 'translation' | null
  const [panelTab, setPanelTab] = useState<'tafsir' | 'translation'>(panelParam ?? 'tafsir')
  useEffect(() => { if (panelParam) setPanelTab(panelParam) }, [panelParam])

  const layout: 'double' | 'panel' | 'single' = settings.layout === 'double' && isWide ? 'double' : settings.layout === 'auto' && isDesktop ? 'panel' : 'single'
  const spread = layout === 'double' ? (page % 2 === 1 ? [page, page + 1] : [page - 1, page]).filter((p) => p >= 1 && p <= (data?.pages ?? 604)) : [page]
  const step = layout === 'double' ? 2 : 1

  const go = useCallback((p: number) => {
    if (!data) return
    const np = Math.min(Math.max(1, p), data.pages)
    setSelected(null)
    nav(`/read/${np}${panelParam ? `?panel=${panelParam}` : ''}`, { replace: true })
  }, [data, nav, panelParam])

  // focus an ayah from ?s=&a=
  useEffect(() => {
    if (!data) return
    const s = Number(sp.get('s')), a = Number(sp.get('a'))
    if (s && a) {
      const ay = data.bySurah.get(s)?.find((x) => x.a === a)
      if (ay) {
        if (ay.page !== page) nav(`/read/${ay.page}?s=${s}&a=${a}`, { replace: true })
        else setSelected(ay)
      }
    }
  }, [data, sp, page, nav])

  // keyboard navigation (RTL: left arrow = next page)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input,textarea,select')) return
      if (e.key === 'ArrowLeft') go(page + step)
      else if (e.key === 'ArrowRight') go(page - step)
      else if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, page, step])

  // reading log + last read + reading time
  const user = useUser()
  useEffect(() => {
    if (!data) return
    const first = data.byPage[page][0]
    if (first) user.setLastRead({ riwaya: data.id, page, surah: first.s, ayah: first.a, at: Date.now() })
    const timer = setTimeout(() => {
      for (const p of spread) user.logPage(p, data.byPage[p]?.length ?? 0)
    }, 6000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, page, layout])
  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === 'visible') useUser.getState().addSeconds(15) }, 15000)
    return () => clearInterval(id)
  }, [])

  // follow audio across pages
  const audioKey = useAudio((s) => s.currentKey)
  const audioPage = useAudio((s) => s.currentPage)
  const audioMode = useAudio((s) => s.mode)
  useEffect(() => {
    if (audioMode === 'verse' && audioPage && settings.autoNextPage && !spread.includes(audioPage)) go(audioPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioPage])
  useEffect(() => {
    if (!audioKey || !data || !settings.sajdaNotify) return
    const [s, a] = audioKey.split(':').map(Number)
    if (data.bySurah.get(s)?.find((x) => x.a === a)?.sajda) toast(`۩ ${t('sajdaAlert')}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioKey])

  // swipe
  const touch = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return
    const dx = e.changedTouches[0].clientX - touch.current.x
    const dy = e.changedTouches[0].clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx > 0 ? page + step : page - step)
  }

  if (error) return <ErrorBox onRetry={retry} />
  if (!data) return <Spinner />

  const firstAyah = data.byPage[spread[0]][0]
  const surah = data.surahs[(firstAyah?.s ?? 1) - 1]
  const isBookmarked = (a: Ayah) => user.bookmarks.some((b) => b.key === `${data.id}|${ayahKey(a.s, a.a)}`)

  const onAyahClick = (a: Ayah) => {
    const k = ayahKey(a.s, a.a)
    if (memorize && !revealed.has(k)) {
      setRevealed(new Set(revealed).add(k))
      return
    }
    setSelected(selected?.idx === a.idx ? null : a)
  }

  const actions = {
    tafsir: (a: Ayah) => { if (layout === 'panel') { setPanelTab('tafsir'); setSelected(a) } else setStudyFor({ a, tab: 'tafsir' }) },
    translation: (a: Ayah) => { if (layout === 'panel') { setPanelTab('translation'); setSelected(a) } else setStudyFor({ a, tab: 'translation' }) },
    play: async (a: Ayah) => {
      try {
        const mode = await playFrom(data, a, lang)
        if (mode === 'surah') toast(lang === 'ar' ? 'تشغيل السورة كاملة بالرواية المختارة' : 'Playing the full surah in this narration')
      } catch { toast(t('errorLoad')) }
      setSelected(null)
    },
    bookmark: (a: Ayah) => {
      const added = user.toggleBookmark({ riwaya: data.id, surah: a.s, ayah: a.a, page: a.page })
      toast(added ? t('bookmarked') : t('removed'))
    },
    note: (a: Ayah) => setNoteFor(a),
    copy: async (a: Ayah, plain = false) => {
      const text = `${plain ? stripMarks(splitAyahText(a.text).body) : a.text} ${ayahRef(data, a, lang)}`
      if (await copyText(text)) toast(t('copied'))
    },
    share: async (a: Ayah) => {
      const r = await shareText(`${a.text} ${ayahRef(data, a, lang)}`, ayahRef(data, a, lang))
      if (r === 'copied') toast(t('copied'))
    },
    highlight: (a: Ayah) => {
      const k = `${data.id}|${ayahKey(a.s, a.a)}`
      user.setHighlight(k, user.highlights[k] ? undefined : 'gold')
    },
  }

  return (
    <div className={`reader layout-${layout}`}>
      {/* Mobile / compact reader toolbar (design 05.2) */}
      <div className="reader-bar">
        <button className={`icon-btn ${firstAyah && isBookmarked(firstAyah) ? 'active' : ''}`} onClick={() => firstAyah && actions.bookmark(firstAyah)} aria-label={t('bookmark')}>
          <Icon name="bookmark" />
        </button>
        <button className={`icon-btn ${memorize ? 'active' : ''}`} onClick={() => { setMemorize(!memorize); setRevealed(new Set()); if (!memorize) toast(t('memorizeHint')) }} aria-label={t('memorize')} title={t('memorize')}>
          <Icon name={memorize ? 'eyeOff' : 'eye'} />
        </button>
        <button className="surah-picker" onClick={() => setPicker(true)}>
          <span className="sp-name quran">{surah?.ar}</span>
          <span className="sp-meta">{t('pageN')} {num(page)} · {t('juz')} {num(firstAyah?.juz ?? 1)} · {t('hizb')} {num(hizbOfRub(firstAyah?.rub ?? 1))}</span>
          <Icon name="chevronDown" size={18} />
        </button>
        <button className="icon-btn" onClick={() => nav('/search')} aria-label={t('search')}><Icon name="search" /></button>
        <button className="icon-btn" onClick={() => nav('/index')} aria-label={t('mushaf')}><Icon name="bookOpen" /></button>
      </div>

      <div className="reader-body">
        {layout === 'panel' && (
          <StudyPanel
            data={data}
            ayahs={data.byPage[page]}
            selected={selected ?? data.byPage[page][0]}
            tab={panelTab}
            onTab={(tab) => { setPanelTab(tab); setSp(tab === 'translation' ? { panel: 'translation' } : {}, { replace: true }) }}
            onSelect={setSelected}
          />
        )}
        <div className="pages" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <button className="page-nav prev" onClick={() => go(page - step)} disabled={page <= 1} aria-label={t('prev')}><Icon name="chevronRight" /></button>
          {spread.map((p) => (
            <MushafPage
              key={p}
              data={data}
              page={p}
              selected={selected}
              playingKey={audioMode === 'verse' ? audioKey : null}
              memorize={memorize}
              revealed={revealed}
              highlights={user.highlights}
              onAyah={onAyahClick}
              actions={actions}
              isBookmarked={isBookmarked}
            />
          ))}
          <button className="page-nav next" onClick={() => go(page + step)} disabled={page >= data.pages} aria-label={t('next')}><Icon name="chevronLeft" /></button>
        </div>
      </div>

      <Sheet open={picker} onClose={() => setPicker(false)} title={t('surahs')}>
        <GoTo data={data} onGo={(p) => { setPicker(false); go(p) }} />
      </Sheet>

      <NoteSheet data={data} ayah={noteFor} onClose={() => setNoteFor(null)} />

      <Sheet open={!!studyFor} onClose={() => setStudyFor(null)} wide>
        {studyFor && (
          <StudyPanel
            data={data}
            ayahs={data.byPage[studyFor.a.page]}
            selected={studyFor.a}
            tab={studyFor.tab}
            onTab={(tab) => setStudyFor({ ...studyFor, tab })}
            onSelect={(a) => setStudyFor({ ...studyFor, a })}
            embedded
          />
        )}
      </Sheet>
    </div>
  )
}

type Actions = {
  tafsir: (a: Ayah) => void
  translation: (a: Ayah) => void
  play: (a: Ayah) => void
  bookmark: (a: Ayah) => void
  note: (a: Ayah) => void
  copy: (a: Ayah, plain?: boolean) => void
  share: (a: Ayah) => void
  highlight: (a: Ayah) => void
}

function MushafPage({ data, page, selected, playingKey, memorize, revealed, highlights, onAyah, actions, isBookmarked }: {
  data: QuranData; page: number; selected: Ayah | null; playingKey: string | null; memorize: boolean; revealed: Set<string>
  highlights: Record<string, string>; onAyah: (a: Ayah) => void; actions: Actions; isBookmarked: (a: Ayah) => boolean
}) {
  const { t, num } = useT()
  const ayahs = data.byPage[page] ?? []
  const first = ayahs[0]
  const blocks = useMemo(() => {
    // group ayahs into runs separated by surah headers
    const out: { header?: number; basmala?: boolean; ayahs: Ayah[] }[] = []
    for (const a of ayahs) {
      if (a.a === 1) out.push({ header: a.s, basmala: needsBasmalaHeader(a), ayahs: [a] })
      else if (!out.length) out.push({ ayahs: [a] })
      else out[out.length - 1].ayahs.push(a)
    }
    return out
  }, [ayahs])
  const centered = page <= 2
  const rub = first?.rub ?? 1
  const quarterLabels = ['', '¼', '½', '¾']

  return (
    <article className={`mushaf-page ${page % 2 ? 'odd' : 'even'}`} aria-label={`${t('pageN')} ${page}`}>
      <header className="mp-head">
        <span>{t('juz')} {num(first?.juz ?? 1)}</span>
        <span className="quran mp-surah">{data.surahs[(first?.s ?? 1) - 1]?.ar}</span>
        <span>{quarterLabels[quarterInHizb(rub)]} {t('hizb')} {num(hizbOfRub(rub))}</span>
      </header>
      <div className="mp-frame">
        <div className={`mp-text quran ${centered ? 'centered' : ''}`}>
          {blocks.map((b, bi) => (
            <div key={bi} className="mp-block">
              {b.header && (
                <div className="surah-header">
                  <span className="quran">سُورَةُ {data.surahs[b.header - 1].ar}</span>
                </div>
              )}
              {b.basmala && <div className="basmala">{BASMALA}</div>}
              <p className="mp-flow">
                {b.ayahs.map((a) => {
                  const k = ayahKey(a.s, a.a)
                  const hk = `${data.id}|${k}`
                  const { body, num: n } = splitAyahText(a.text)
                  const hidden = memorize && !revealed.has(k)
                  const cls = [
                    'ayah',
                    selected?.idx === a.idx && 'selected',
                    playingKey === k && 'playing',
                    highlights[hk] && 'highlighted',
                    hidden && 'hidden',
                  ].filter(Boolean).join(' ')
                  return (
                    <span key={a.idx} className="ayah-wrap">
                      <span className={cls} onClick={() => onAyah(a)} role="button" tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onAyah(a)}
                        data-key={k}>
                        {body}
                      </span>
                      {' '}
                      <span className={`ayah-num ${isBookmarked(a) ? 'bm' : ''}`} onClick={() => onAyah(a)}>{n}</span>
                      {selected?.idx === a.idx && <AyahActions a={a} actions={actions} bookmarked={isBookmarked(a)} />}
                      {' '}
                    </span>
                  )
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
      <footer className="mp-foot">{num(page)}</footer>
    </article>
  )
}

function AyahActions({ a, actions, bookmarked }: { a: Ayah; actions: Actions; bookmarked: boolean }) {
  const { t } = useT()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [])
  const btn = (icon: Parameters<typeof Icon>[0]['name'], label: string, fn: () => void, active = false) => (
    <button className={`aa-btn ${active ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); fn() }} title={label} aria-label={label}>
      <Icon name={icon} size={22} />
    </button>
  )
  return (
    <span className="ayah-actions" ref={ref} onClick={(e) => e.stopPropagation()}>
      {btn('bookOpen', t('tafsir'), () => actions.tafsir(a))}
      {btn('translate', t('translation'), () => actions.translation(a))}
      {btn('play', t('play'), () => actions.play(a))}
      {btn(bookmarked ? 'bookmarkFill' : 'bookmarkAdd', t('bookmark'), () => actions.bookmark(a), bookmarked)}
      {btn('note', t('addNote'), () => actions.note(a))}
      {btn('highlighter', t('highlight'), () => actions.highlight(a))}
      {btn('copy', t('copy'), () => actions.copy(a))}
      {btn('share', t('share'), () => actions.share(a))}
    </span>
  )
}

function GoTo({ data, onGo }: { data: QuranData; onGo: (p: number) => void }) {
  const { t, num, lang } = useT()
  const [q, setQ] = useState('')
  const [pg, setPg] = useState('')
  const list = data.surahs.filter((s) => !q || s.ar.replace(/[ً-ٰٟ]/g, '').includes(q) || s.en.toLowerCase().includes(q.toLowerCase()) || String(s.n) === q)
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="row">
        <input className="input" placeholder={t('search')} value={q} onChange={(e) => setQ(e.target.value)} />
        <form className="row" onSubmit={(e) => { e.preventDefault(); if (Number(pg)) onGo(Number(pg)) }}>
          <input className="input" style={{ width: 110 }} inputMode="numeric" placeholder={t('page')} value={pg} onChange={(e) => setPg(e.target.value)} />
          <button className="btn sm" type="submit">{t('goToPage')}</button>
        </form>
      </div>
      <div className="list" style={{ maxHeight: '55vh', overflow: 'auto' }}>
        {list.map((s) => (
          <button key={s.n} className="list-item" onClick={() => onGo(s.page)}>
            <span className="num-badge">{num(s.n)}</span>
            <span style={{ flex: 1 }}>
              <span className="quran" style={{ fontSize: 20 }}>{s.ar}</span>
              <span className="text-xs muted" style={{ display: 'block' }}>{lang === 'en' ? s.en + ' · ' : ''}{s.meccan ? t('makki') : t('madani')} · {num(s.ayahs)} {t('ayahs')}</span>
            </span>
            <span className="text-sm muted">{t('page')} {num(s.page)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function NoteSheet({ data, ayah, onClose }: { data: QuranData; ayah: Ayah | null; onClose: () => void }) {
  const { t, lang } = useT()
  const notes = useUser((s) => s.notes)
  const save = useUser((s) => s.saveNote)
  const existing = ayah ? notes.find((n) => n.key === `${data.id}|${ayahKey(ayah.s, ayah.a)}`) : undefined
  const [text, setText] = useState('')
  useEffect(() => setText(existing?.text ?? ''), [ayah, existing?.text])
  if (!ayah) return null
  return (
    <Sheet open onClose={onClose} title={existing ? t('editNote') : t('addNote')}>
      <p className="quran note-ayah">{ayah.text} <span className="text-xs muted">{ayahRef(data, ayah, lang)}</span></p>
      <textarea className="input" autoFocus placeholder={t('notePlaceholder')} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="row" style={{ marginTop: 12, justifyContent: 'flex-end' }}>
        {existing && <button className="btn danger sm" onClick={() => { save({ riwaya: data.id, surah: ayah.s, ayah: ayah.a, page: ayah.page, text: '' }); onClose() }}>{t('delete')}</button>}
        <button className="btn secondary sm" onClick={onClose}>{t('cancel')}</button>
        <button className="btn sm" onClick={() => { save({ riwaya: data.id, surah: ayah.s, ayah: ayah.a, page: ayah.page, text }); toast(t('save')); onClose() }}>{t('save')}</button>
      </div>
    </Sheet>
  )
}
