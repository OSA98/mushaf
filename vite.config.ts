import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// BASE_PATH lets the web build live under a sub-path (e.g. GitHub Pages: /repo-name/).
// Electron/Capacitor builds use a relative base ('./').
export default defineConfig(({ mode }) => ({
  base: process.env.BASE_PATH ?? (mode === 'native' ? './' : '/'),
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*', 'fonts/hafs.woff2'],
      manifest: {
        name: 'مصحف الأزهر الشريف',
        short_name: 'المصحف',
        description: 'اقرأ، استمع، تدبّر — المصحف الشريف بثماني روايات مع التفسير والترجمة والتلاوات',
        lang: 'ar',
        dir: 'rtl',
        theme_color: '#fffffd',
        background_color: '#fffffd',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          { urlPattern: /\/data\/.*\.json$/, handler: 'CacheFirst', options: { cacheName: 'quran-data', expiration: { maxEntries: 20 } } },
          { urlPattern: /\/fonts\/.*\.woff2$/, handler: 'CacheFirst', options: { cacheName: 'quran-fonts' } },
          { urlPattern: /^https:\/\/api\.alquran\.cloud\//, handler: 'StaleWhileRevalidate', options: { cacheName: 'alquran-api', expiration: { maxEntries: 400 } } },
          { urlPattern: /^https:\/\/mp3quran\.net\/api\//, handler: 'StaleWhileRevalidate', options: { cacheName: 'mp3quran-api' } },
        ],
      },
    }),
  ],
  build: { chunkSizeWarningLimit: 900 },
}))
