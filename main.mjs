import { BrowserWindow, app, dialog, ipcMain, session } from 'electron'
import { homedir } from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import fsAgent from './lib/fs-agent.mjs'
import agent from './lib/hexo-agent.mjs'
import httpServer from './lib/http.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

function createWindow() {
  const win = new BrowserWindow({
    icon: join(__dirname, 'src/assets/icon.png'),
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 800,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, 'preload.js')
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

app.whenReady().then(async () => {
  ipcMain.handle('site:posts', (event, ...args) => agent.getPosts(...args))
  ipcMain.handle('site:categories', () => agent.getCategories())
  ipcMain.handle('site:tags', () => agent.getTags())
  ipcMain.handle('site:stats', () => agent.getStats())
  ipcMain.handle('site:config', () => agent.getConfig())
  ipcMain.handle('site:info', () => agent.getSiteInfo())
  ipcMain.handle('hexo:config', () => agent.getHexoConfig())
  ipcMain.handle('dialog:dir', () => dialog.showOpenDialog({ properties: ['openDirectory'] }))
  ipcMain.handle('post:content', (event, path) => agent.getContent(path))
  ipcMain.handle('post:save', (event, path, content) => agent.saveContent(path, content))
  ipcMain.handle('post:create', (event, type, title, slug, content) =>
    agent.createFile(type, title, slug, content)
  )
  ipcMain.handle('post:move', (event, sourcePath, content) => agent.moveFile(sourcePath, content))
  ipcMain.handle('post:delete', (event, path) => agent.deleteFile(path))
  ipcMain.handle('sys:locale', (event) => app.getSystemLocale())
  ipcMain.handle('fs:readdir', (event, path) => fsAgent.readdir(path))
  ipcMain.handle('agent:init', (event, path) => {
    let check = agent.checkDir(path) && agent.checkHexoDir(path)
    if (check) {
      agent.init(path)
      fsAgent.init(path)
      httpServer.init(path)
    }
    return check
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  if (process.env.NODE_ENV === 'dev') {
    const vueDevToolsPath = join(
      homedir(),
      '/Library/Application Support/Google/Chrome/Profile 1/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/6.5.1_0'
    )
    await session.defaultSession.loadExtension(vueDevToolsPath)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
