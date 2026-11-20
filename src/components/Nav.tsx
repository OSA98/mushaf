import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useT, type TKey } from '../i18n'
import { Icon, type IconName } from './Icon'
import { Logo, BrandName, Sheet } from './ui'
import { useUser } from '../store/user'

const MOBILE: { to: string; key: TKey; icon: IconName | 'logo' }[] = [
  { to: '/', key: 'home', icon: 'logo' },
  { to: '/library', key: 'library', icon: 'library' },
  { to: '/index', key: 'mushaf', icon: 'bookOpen' },
  { to: '/saved', key: 'saved', icon: 'bookmark' },
  { to: '/settings', key: 'settings', icon: 'settings' },
]

export function BottomNav() {
  const { t } = useT()
  return (
    <nav className="bottom-nav" aria-label="main">
      {MOBILE.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}>
          {item.icon === 'logo' ? <Logo size={26} /> : <Icon name={item.icon} />}
          <span>{t(item.key)}</span>
        </NavLink>
      ))}
    </nav>
  )
}

const DESKTOP: { to: string; key: TKey; icon: IconName }[] = [
  { to: '/', key: 'home', icon: 'home' },
  { to: '/read', key: 'reading', icon: 'book' },
  { to: '/reciters', key: 'reciters', icon: 'voice' },
  { to: '/radio', key: 'radio', icon: 'radio' },
  { to: '/library', key: 'library', icon: 'library' },
  { to: '/read?panel=translation', key: 'translation', icon: 'translate' },
]

export function TopNav() {
  const { t } = useT()
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const isActive = (to: string) => {
    const [path, q] = to.split('?')
    if (path === '/') return loc.pathname === '/'
    if (q) return loc.pathname.startsWith(path) && loc.search.includes(q)
    return loc.pathname.startsWith(path) && !(path === '/read' && loc.search.includes('panel=translation'))
  }
  return (
    <>
      <header className="top-nav">
        <button className="tn-item" onClick={() => setOpen(true)}>
          <Icon name="menu" /> <span>{t('menu')}</span>
        </button>
        {DESKTOP.map((item) => (
          <Link key={item.to} to={item.to} className={`tn-item ${isActive(item.to) ? 'active' : ''}`}>
            <Icon name={item.icon} /> <span>{t(item.key)}</span>
          </Link>
        ))}
      </header>
      <MenuDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT()
  const nav = useNavigate()
  const go = (p: string) => { onClose(); nav(p) }
  const items: { p: string; k: TKey; i: IconName }[] = [
    { p: '/index', k: 'mushaf', i: 'bookOpen' },
    { p: '/search', k: 'search', i: 'search' },
    { p: '/saved', k: 'saved', i: 'bookmark' },
    { p: '/khatma', k: 'khatmaPlan', i: 'task' },
    { p: '/prayer', k: 'prayerTimes', i: 'mosque' },
    { p: '/settings', k: 'settings', i: 'settings' },
    { p: '/about', k: 'about', i: 'info' },
  ]
  return (
    <Sheet open={open} onClose={onClose} title={<span className="row"><Logo size={32} /> <BrandName /></span>}>
      <div className="list">
        {items.map((x) => (
          <button key={x.p} className="list-item" onClick={() => go(x.p)}>
            <Icon name={x.i} /> <span>{t(x.k)}</span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}

export function useLastReadPage() {
  return useUser((s) => s.lastRead?.page ?? 1)
}
