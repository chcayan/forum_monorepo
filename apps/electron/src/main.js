// @ts-check
const path = require('node:path')
const { session, app, BrowserWindow, ipcMain, Menu } = require('electron')

require('dotenv').config({
  path: path.resolve(
    __dirname,
    app.isPackaged
      ? path.resolve(process.resourcesPath, '.env.production')
      : path.join(__dirname, '../.env.development')
  ),
})

console.log('当前环境：', process.env.NODE_ENV)

const createWindow = () => {
  const win = new BrowserWindow({
    width: 600,
    height: 900,
    minWidth: 375,
    minHeight: 500,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
    },
  })

  Menu.setApplicationMenu(null)

  if (!app.isPackaged) {
    // development
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    // production
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.enableSandbox()
app.whenReady().then(() => {
  const isDev = !app.isPackaged

  const csp = isDev
    ? `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: ${process.env.NODE_API_ORIGIN}; connect-src 'self' ${process.env.NODE_API_ORIGIN} ${process.env.NODE_API_ORIGIN.replace('http', 'ws')}`
    : `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: ${process.env.NODE_API_ORIGIN}; connect-src 'self' ${process.env.NODE_API_ORIGIN} ${process.env.NODE_API_ORIGIN.replace('https', 'wss')}`

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      },
    })
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
