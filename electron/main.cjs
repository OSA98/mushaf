// Electron desktop shell for the Mushaf app (Windows / macOS / Linux).
const { app, BrowserWindow, protocol, net, shell, Menu } = require('electron')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const DIST = path.join(__dirname, '..', 'dist')
const DEV_URL = process.env.ELECTRON_START_URL

// Serve the built web app from a secure custom scheme so fetch(), service workers
// and relative paths behave exactly like on the web.
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
])

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 380,
    minHeight: 600,
    title: 'مصحف الأزهر الشريف',
    backgroundColor: '#fffffd',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })
  win.loadURL(DEV_URL || 'app://mushaf/index.html')
  // open external links in the default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  protocol.handle('app', (req) => {
    const { pathname } = new URL(req.url)
    let file = path.normalize(path.join(DIST, decodeURIComponent(pathname)))
    if (!file.startsWith(DIST)) return new Response('Forbidden', { status: 403 })
    if (pathname === '/' || pathname === '') file = path.join(DIST, 'index.html')
    return net.fetch(pathToFileURL(file).toString())
  })
  if (process.platform !== 'darwin') Menu.setApplicationMenu(null)
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
