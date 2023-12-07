const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const config = require(path.join(__dirname, 'lib/config.js'))
const agent = require(path.join(__dirname, 'lib/hexo-agent.js'))

if (config.get('vaultPath') !== null && config.get('vaultPath') !== '') {
  agent.init(config.get('vaultPath'))
}

config.on('config:changed', async (key, value) => {
  if (key === 'vaultPath') {
    agent.init(value)
  }
})

function createWindow() {
  const win = new BrowserWindow({
    icon: path.join(__dirname, 'src/assets/icon.png'),
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 800,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  console.log('current env is: ', process.env.NODE_ENV)
  if (process.env.NODE_ENV === 'dev') {
    win.loadURL('http://localhost:5173/Users/charles/Projects/HexoPress/dist')

    win.webContents.openDevTools()
  } else {
    win.loadFile('dist/index.html')
  }
}

app.whenReady().then(() => {
  ipcMain.handle('site:posts', (event, ...args) => agent.getPosts(...args))
  ipcMain.handle('site:categories', () => agent.getCategories())
  ipcMain.handle('site:tags', () => agent.getTags())
  ipcMain.handle('site:stats', () => agent.getStats())
  ipcMain.handle('site:config', () => agent.getConfig())
  ipcMain.handle('site:info', () => agent.getSiteInfo())
  ipcMain.handle('hexo:config', () => agent.getHexoConfig())
  ipcMain.handle('config:get', (event, key) => config.get(key))
  ipcMain.handle('config:set', (event, kv) => config.set(kv[0], kv[1]))
  ipcMain.handle('dialog:dir', () => dialog.showOpenDialog({ properties: ['openDirectory'] }))
  ipcMain.handle('post:content', (event, path) => agent.getContent(path))
  ipcMain.handle('post:save', (event, path, content) => agent.saveContent(path, content))
  ipcMain.handle('post:create', (event, type, title, slug, content) =>
    agent.createFile(type, title, slug, content)
  )
  ipcMain.handle('post:move', (event, sourcePath, content) => agent.moveFile(sourcePath, content))
  ipcMain.handle('post:delete', (event, path) => agent.deleteFile(path))
  ipcMain.handle('sys:locale', (event) => app.getSystemLocale())

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
