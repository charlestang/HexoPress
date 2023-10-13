const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const Hexo = require('hexo')
const hexo = new Hexo('/Users/charles/Projects/charlestang.github.io', {
  drafts: true,
  safe: true
})
hexo.init().then(function() {
  hexo.load()
})

function getPosts () {
  var postList = []
  posts =  hexo.locals.get('posts')
  posts.each(function(post) {
    var onePost = {
      title: post.title,
      date: post.date.format(),
      source: post.source,
    }
    console.log(onePost)
    postList.push(onePost)
  })
  return postList
}


function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  //win.loadFile('dist/index.html')
  win.loadURL('http://localhost:5173/Users/charles/Projects/hexo-writer/dist')

  win.webContents.openDevTools()
}

app.whenReady().then(() => {
  ipcMain.handle('site:posts', getPosts)
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
