const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const config = require(path.join(__dirname, '/lib/config.js'))
const agent = require(path.join(__dirname, '/lib/hexo-agent.js'))

console.log('vaultPath is: ', config.get('vaultPath'))
if (config.get('vaultPath') !== null && config.get('vaultPath') !== '') {
  console.log('init agent with vaultPath: ', config.get('vaultPath'))
  agent.init(config.get('vaultPath'))
  console.log('after init agent')
}

config.on('config:changed', async (key, value) => {
  if (key === 'vaultPath') {
    await agent.init(value)
  }
})

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 800,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  //win.loadFile('dist/index.html')
  win.loadURL('http://localhost:5173/Users/charles/Projects/HexoPress/dist')

  win.webContents.openDevTools()
}

app.whenReady().then(() => {
  ipcMain.handle('site:posts', (event, ...args) => agent.getPosts(...args))
  ipcMain.handle('site:categories', () => agent.getCategories())
  ipcMain.handle('site:tags', () => agent.getTags())
  ipcMain.handle('site:stats', () => agent.getStats())
  ipcMain.handle('config:get', (event, key) => config.get(key))
  ipcMain.handle('config:set', (event, kv) => config.set(kv[0], kv[1]))
  ipcMain.handle('dialog:dir', () => dialog.showOpenDialog({ properties: ['openDirectory'] }))
  ipcMain.handle('post:content', (event, path) => agent.getContent(path))

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
