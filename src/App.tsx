import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav, TopNav } from './components/Nav'
import { AudioBar } from './components/AudioBar'
import { ToastHost, Spinner } from './components/ui'
import { useApplySettings } from './lib/platform'
import { useMedia } from './lib/useMedia'
import { useAudio } from './lib/audio'
import { useSettings } from './store/settings'
import Home from './pages/Home'
import Reader from './pages/Reader'

const IndexPage = lazy(() => import('./pages/IndexPage'))
const Library = lazy(() => import('./pages/Library'))
const Saved = lazy(() => import('./pages/Saved'))
const Settings = lazy(() => import('./pages/Settings'))
const Search = lazy(() => import('./pages/Search'))
const Reciters = lazy(() => import('./pages/Reciters'))
const Radio = lazy(() => import('./pages/Radio'))
const Khatma = lazy(() => import('./pages/Khatma'))
const Prayer = lazy(() => import('./pages/Prayer'))
const Landing = lazy(() => import('./pages/Landing'))
const Onboarding = lazy(() => import('./pages/Onboarding'))

function Shell() {
  const loc = useLocation()
  const desktop = useMedia('(min-width: 960px)')
  const hasPlayer = useAudio((s) => !!s.mode)
  const onboarded = useSettings((s) => s.onboarded)
  useEffect(() => { window.scrollTo(0, 0) }, [loc.pathname])

  const bare = loc.pathname === '/about' || loc.pathname === '/welcome'
  if (!onboarded && !bare) return <Navigate to="/welcome" replace />

  const routes = (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/read" element={<Reader />} />
        <Route path="/read/:page" element={<Reader />} />
        <Route path="/index" element={<IndexPage />} />
        <Route path="/library" element={<Library />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<Search />} />
        <Route path="/reciters" element={<Reciters />} />
        <Route path="/radio" element={<Radio />} />
        <Route path="/khatma" element={<Khatma />} />
        <Route path="/prayer" element={<Prayer />} />
        <Route path="/about" element={<Landing />} />
        <Route path="/welcome" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )

  if (bare) return <>{routes}<ToastHost /></>

  const isReader = loc.pathname.startsWith('/read')
  return (
    <div className={`app ${hasPlayer ? 'has-player' : ''} ${isReader ? 'is-reader' : ''}`}>
      {desktop && <TopNav />}
      <main className="app-main">{routes}</main>
      <AudioBar />
      {!desktop && <BottomNav />}
      <ToastHost />
    </div>
  )
}

export default function App() {
  useApplySettings()
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}
