import { BrowserWindow, app, dialog, ipcMain, nativeTheme, session } from 'electron'
import { homedir } from 'node:os'
import { join } from 'node:path'
import fsAgent from './lib/FsAgent'
import agent from './lib/HexoAgent'
import httpServer from './lib/HttpServer'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const win = new BrowserWindow({
    icon: join(__dirname, 'src/assets/icon.png'),
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 800,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#59524c',
      symbolColor: '#ffffff',
    },
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  })

  console.log('current env is: ', process.env.NODE_ENV)
  if (process.env.NODE_ENV === 'dev') {
    win.loadURL('http://localhost:5173/')

    win.webContents.openDevTools()
  } else {
    win.loadFile('dist/index.html')
  }

  ipcMain.handle('dark:get', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  })
  ipcMain.handle('dark:set', (event, val) => {
    console.log('main.mjs dark:set is called, new value is: ', val)
    nativeTheme.themeSource = val
  })
}

app.whenReady().then(async () => {
  ipcMain.handle('site:posts', (event, ...args) => agent.getPosts(...args))
  ipcMain.handle('site:postMonth', () => agent.getPostMonths())
  ipcMain.handle('site:categories', () => agent.getCategories())
  ipcMain.handle('site:tags', () => agent.getTags())
  ipcMain.handle('site:assets', () => agent.getAssets())
  ipcMain.handle('site:stats', () => agent.getStats())
  ipcMain.handle('site:config', () => agent.getConfig())
  ipcMain.handle('site:info', () => agent.getSiteInfo())
  ipcMain.handle('site:refresh', () => agent.updateCache())
  ipcMain.handle('hexo:config', () => agent.getHexoConfig())
  ipcMain.handle('dialog:dir', () => dialog.showOpenDialog({ properties: ['openDirectory'] }))
  ipcMain.handle('post:content', (event, path) => agent.getContent(path))
  ipcMain.handle('post:save', (event, path, content) => agent.saveContent(path, content))
  ipcMain.handle('post:create', (event, type, title, slug, content) =>
    agent.createFile(type, title, slug, content),
  )
  ipcMain.handle('post:move', (event, sourcePath, content) => agent.moveFile(sourcePath, content))
  ipcMain.handle('post:delete', (event, path) => agent.deleteFile(path))
  ipcMain.handle('sys:locale', () => app.getSystemLocale())
  ipcMain.handle('fs:readdir', (event, path) => fsAgent.readdir(path))
  ipcMain.handle('fs:mv', (event, from, to) => fsAgent.mv(from, to))
  ipcMain.handle('agent:init', (event, path) => {
    const check = agent.checkDir(path) && agent.checkHexoDir(path)
    if (check) {
      agent.init(path)
      fsAgent.init(path)
      httpServer.init(path)
    }
    return check
  })

  createWindow()

  if (process.env.NODE_ENV === 'dev') {
    const vueDevToolsPath = join(
      homedir(),
      '/Library/Application Support/Google/Chrome/Profile 1/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/6.5.1_0',
    )
    await session.defaultSession.loadExtension(vueDevToolsPath)
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
