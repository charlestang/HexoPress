import { BrowserWindow, app, dialog, ipcMain, nativeTheme, shell } from 'electron'
import { join } from 'node:path'
import fsAgent from './lib/FsAgent'
import agent, { HexoAgent } from './lib/HexoAgent'
import httpServer from './lib/HttpServer'
import electronSquirrelStartup from 'electron-squirrel-startup'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electronSquirrelStartup) {
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
  console.log('MAIN_WINDOW_VITE_DEV_SERVER_URL is: ', process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL)
  console.log('MAIN_WINDOW_VITE_NAME is: ', process.env.MAIN_WINDOW_VITE_NAME)

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }
}

app.whenReady().then(async () => {
  ipcMain.handle('site:posts', (event, ...args) => agent.getPosts(...args))
  ipcMain.handle('site:postMonth', () => agent.getPostMonths())
  ipcMain.handle('site:categories', () => agent.getCategories())
  ipcMain.handle('site:tags', () => agent.getTags())
  ipcMain.handle('site:assets', () => agent.getAssets())
  ipcMain.handle('site:assetDelete', (event, assetId: string) => agent.deleteAsset(assetId))
  ipcMain.handle('site:stats', () => agent.getStats())
  ipcMain.handle('site:info', () => agent.getSiteInfo())
  ipcMain.handle('site:refresh', () => agent.updateCache())
  ipcMain.handle('site:heatMap', () => agent.getHeatMap())
  ipcMain.handle('hexo:config', () => agent.getHexoConfig())
  ipcMain.handle('dialog:dir', () => dialog.showOpenDialog({ properties: ['openDirectory'] }))
  ipcMain.handle('post:content', (event, path) => agent.getContent(path))
  ipcMain.handle('post:save', (event, path, content) => agent.saveContent(path, content))
  ipcMain.handle('post:document', (event, path) => agent.getPostDocument(path))
  ipcMain.handle('post:saveDocument', (event, path, document) =>
    agent.savePostDocument(path, document),
  )
  ipcMain.handle('post:getMeta', (event, path) => agent.getPostMeta(path))
  ipcMain.handle('post:updateMeta', (event, path, meta) => agent.updatePostMeta(path, meta))
  ipcMain.handle('post:create', (event, type, title, slug, content) =>
    agent.createFile(type, title, slug, content),
  )
  ipcMain.handle('post:move', (event, sourcePath, content) => agent.moveFile(sourcePath, content))
  ipcMain.handle('post:delete', (event, path) => agent.deleteFile(path))
  ipcMain.handle(
    'category:replaceAssignments',
    (event, categoryId: string, sources: string[], replacements: string[][]) =>
      agent.replaceCategoryForPosts(categoryId, sources, replacements),
  )
  ipcMain.handle('category:bulkRemove', (event, categoryId: string, sources: string[]) =>
    agent.removeCategoryFromPosts(categoryId, sources),
  )
  ipcMain.handle('sys:locale', () => app.getSystemLocale())
  ipcMain.handle('shell:openUrl', (event, url) => shell.openExternal(url))
  ipcMain.handle('fs:readdir', (event, path) => fsAgent.readdir(path))
  ipcMain.handle('fs:mv', (event, from, to) => fsAgent.mv(from, to))
  ipcMain.handle('fs:saveImage', (event, path, content) => {
    fsAgent.saveImage(path, content)
    agent.generate()
  })
  ipcMain.handle('agent:init', async (event, path) => {
    const check = HexoAgent.checkDir(path) && HexoAgent.checkHexoDir(path)
    if (check) {
      agent.init(path)
      fsAgent.init(path)
      await httpServer.init(path)
    }
    return check
  })
  ipcMain.handle('dark:get', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  })
  ipcMain.handle('dark:set', (event, val) => {
    console.log('main.ts dark:set is called, new value is: ', val)
    nativeTheme.themeSource = val
  })

  createWindow()
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
