import { useNavigate } from 'react-router-dom'
import { useAudio } from '../lib/audio'
import { useSettings } from '../store/settings'
import { useT } from '../i18n'
import { Icon } from './Icon'
import { Logo } from './ui'

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  const ss = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}
const RATES = [0.75, 1, 1.25, 1.5, 2]

export function AudioBar() {
  const a = useAudio()
  const { t } = useT()
  const nav = useNavigate()
  const { playbackRate, repeatCount, set } = useSettings()
  if (!a.mode) return null
  const pct = a.duration ? (a.position / a.duration) * 100 : 0
  const live = a.mode === 'radio'
  return (
    <div className="audio-bar" role="region" aria-label="player">
      {!live && (
        <div className="ab-progress">
          <span className="ab-time">{fmt(a.position)}</span>
          <input
            type="range" min={0} max={a.duration || 0} step={0.1} value={a.position}
            onChange={(e) => a.seek(Number(e.target.value))}
            style={{ ['--pct' as string]: `${pct}%` }}
            aria-label="seek"
          />
          <span className="ab-time">-{fmt(a.duration - a.position)}</span>
        </div>
      )}
      <div className="ab-row">
        <button className="ab-info" onClick={() => a.currentPage && nav(`/read/${a.currentPage}`)}>
          <span className="ab-art"><Logo size={30} /></span>
          <span className="ab-text">
            <strong>{a.title}</strong>
            <small>{live ? t('liveRadio') : a.subtitle}</small>
          </span>
        </button>

        <div className="ab-controls">
          {!live && (
            <>
              <button className="icon-btn plain sm hide-sm" onClick={() => a.skip(-5)} aria-label="-5s"><Icon name="back5" /></button>
              <button className="icon-btn plain sm" onClick={a.prev} aria-label={t('prev')}><Icon name="prev" style={{ transform: 'scaleX(-1)' }} /></button>
            </>
          )}
          <button className="ab-play" onClick={a.toggle} aria-label={a.playing ? t('pause') : t('play')}>
            {a.loading ? <span className="spinner" style={{ width: 20, height: 20, margin: 0, borderWidth: 2 }} /> : <Icon name={a.playing ? 'pause' : 'play'} />}
          </button>
          {!live && (
            <>
              <button className="icon-btn plain sm" onClick={a.next} aria-label={t('next')}><Icon name="next" style={{ transform: 'scaleX(-1)' }} /></button>
              <button className="icon-btn plain sm hide-sm" onClick={() => a.skip(5)} aria-label="+5s"><Icon name="fwd5" /></button>
            </>
          )}
        </div>

        <div className="ab-extra">
          {a.mode === 'verse' && (
            <button
              className={`chip ${repeatCount > 1 ? 'active' : ''}`}
              onClick={() => set({ repeatCount: repeatCount >= 5 ? 1 : repeatCount + 1 })}
              title={t('repeat')}
            >
              <Icon name="repeat" size={18} /> ×{repeatCount}
            </button>
          )}
          {!live && (
            <button className="chip hide-sm" onClick={() => set({ playbackRate: RATES[(RATES.indexOf(playbackRate) + 1) % RATES.length] })} title={t('speed')}>
              {playbackRate}×
            </button>
          )}
          {!live && (
            <button className={`icon-btn plain sm hide-sm ${a.loopRange ? 'active' : ''}`} onClick={() => a.setLoop(!a.loopRange)} aria-label={t('repeat')}>
              <Icon name="repeat" />
            </button>
          )}
          <button className="icon-btn plain sm" onClick={a.stop} aria-label={t('close')}><Icon name="close" /></button>
        </div>
      </div>
    </div>
  )
}
