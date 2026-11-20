import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import './styles/app.css'
import { RIWAYAT } from './config'

// KFGQPC Uthmanic fonts — one per narration (King Fahd Glorious Quran Printing Complex)
const fontCss = RIWAYAT.map(
  (r) => `@font-face{font-family:'q-${r.id}';src:url('${import.meta.env.BASE_URL}fonts/${r.id}.woff2') format('woff2');font-display:block}`,
).join('')
const style = document.createElement('style')
style.textContent = fontCss
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
