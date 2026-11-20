const { contextBridge } = require('electron')
contextBridge.exposeInMainWorld('mushafDesktop', { platform: process.platform })
