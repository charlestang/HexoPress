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
  // Agent lifecycle management
  ipcMain.handle('agent:init', async (_event, path) => {
    const check = HexoAgent.checkDir(path) && HexoAgent.checkHexoDir(path)
    if (check) {
      agent.init(path)
      fsAgent.init(path)
      await httpServer.init(path)
    }
    return check
  })

  // Category operations
  ipcMain.handle('category:bulkRemove', (_event, categoryId: string, sources: string[]) =>
    agent.removeCategoryFromPosts(categoryId, sources),
  )
  ipcMain.handle(
    'category:replaceAssignments',
    (_event, categoryId: string, sources: string[], replacements: string[][]) =>
      agent.replaceCategoryForPosts(categoryId, sources, replacements),
  )

  // Dark mode theme management
  ipcMain.handle('dark:get', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  })
  ipcMain.handle('dark:set', (_event, val) => {
    console.log('main.ts dark:set is called, new value is: ', val)
    nativeTheme.themeSource = val
  })

  // System dialogs
  ipcMain.handle('dialog:dir', () => dialog.showOpenDialog({ properties: ['openDirectory'] }))

  // File system operations
  ipcMain.handle('fs:assetReferences', (_event, path) => fsAgent.findAssetReferences(path))
  ipcMain.handle('fs:fileInfo', (_event, path) => fsAgent.getFileInfo(path))
  ipcMain.handle('fs:mv', (_event, from, to) => fsAgent.mv(from, to))
  ipcMain.handle('fs:readdir', (_event, path) => fsAgent.readdir(path))
  ipcMain.handle('fs:saveImage', async (_event, path, content) => {
    await fsAgent.saveImage(path, content)
    await agent.generate()
  })

  // Hexo configuration
  ipcMain.handle('hexo:config', () => agent.getHexoConfig())

  // Post operations
  ipcMain.handle('post:content', (_event, path) => agent.getContent(path))
  ipcMain.handle('post:create', (_event, type, title, slug, content) =>
    agent.createFile(type, title, slug, content),
  )
  ipcMain.handle('post:delete', (_event, path) => agent.deleteFile(path))
  ipcMain.handle('post:document', (_event, path) => agent.getPostDocument(path))
  ipcMain.handle('post:getMeta', (_event, path) => agent.getPostMeta(path))
  ipcMain.handle('post:move', (_event, sourcePath, content) => agent.moveFile(sourcePath, content))
  ipcMain.handle('post:save', (_event, path, content) => agent.saveContent(path, content))
  ipcMain.handle('post:saveDocument', (_event, path, document) =>
    agent.savePostDocument(path, document),
  )
  ipcMain.handle('post:updateMeta', (_event, path, meta) => agent.updatePostMeta(path, meta))

  // Batch post operations
  ipcMain.handle('posts:remove-tag', (_event, sourcePath: string, tagId: string) =>
    agent.removeTagFromPost(sourcePath, tagId),
  )

  // Shell operations
  ipcMain.handle('shell:openUrl', (_event, url) => shell.openExternal(url))

  // Site data queries
  ipcMain.handle('site:assetDelete', (_event, assetId: string) => agent.deleteAsset(assetId))
  ipcMain.handle('site:assets', () => agent.getAssets())
  ipcMain.handle('site:categories', () => agent.getCategories())
  ipcMain.handle('site:heatMap', () => agent.getHeatMap())
  ipcMain.handle('site:info', () => agent.getSiteInfo())
  ipcMain.handle('site:postMonth', () => agent.getPostMonths())
  ipcMain.handle('site:posts', (_event, ...args) => agent.getPosts(...args))
  ipcMain.handle('site:refresh', () => agent.updateCache())
  ipcMain.handle('site:stats', () => agent.getStats())
  ipcMain.handle('site:tags', () => agent.getTags())

  // System information
  ipcMain.handle('sys:locale', () => app.getSystemLocale())

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
