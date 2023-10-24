const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const wrapper = require(path.join(__dirname, '/lib/api-wrapper.js'))
const settings = require(path.join(__dirname, '/lib/settings.js'))

wrapper.registerApis(settings.apis)

const Hexo = require('hexo')
const hexo = new Hexo('/Users/charles/Projects/charlestang.github.io', {
  safe: true
})
hexo.init().then(function () {
  hexo.load()
})

/**
 * 获取所有的文章
 *
 * @returns {[Object]}
 */
function getPosts(event, args) {
  var postList = []
  posts = hexo.locals.get('posts')
  posts.each(function (post) {
    var onePost = {
      title: post.title,
      date: post.date.format(),
      updated: post.updated.format(),
      source: post.source,
      status: post.published ? 'published' : 'draft',
      layout: post.layout,
      path: post.path,
      permalink: post.permalink,
      asset_dir: post.asset_dir,
      tags: post.tags.data.reduce(function (acc, tag) {
        if (acc === '') {
          return tag.name
        } else {
          return `${acc}, ${tag.name}`
        }
      }, ''),
      categories: post.categories.data.reduce(function (acc1, cat) {
        if (acc1 === '') {
          return cat.name
        } else {
          return `${acc1}, ${cat.name}`
        }
      }, '')
    }
    postList.push(onePost)
  })
  return postList
}

/**
 * 获取所有的分类
 * @returns {[Object]}
 */
function getCategories(event, args) {
  var categories = []
  hexo.locals.get('categories').each(function (category) {
    var cat = {
      id: category._id,
      parent: category.parent,
      name: category.name,
      slug: category.slug,
      path: category.path,
      permalink: category.permalink,
      length: category.length
    }
    categories.push(cat)
  })
  return categories
}

/**
 * 获取所有的标签
 * @param {*} event
 * @param {*} args
 * @returns
 */
function getTags(event, args) {
  var tags = []
  hexo.locals.get('tags').each(function (tag) {
    var t = {
      id: tag._id,
      name: tag.name,
      slug: tag.slug,
      path: tag.path,
      permalink: tag.permalink,
      length: tag.length
    }

    tags.push(t)
  })

  return tags
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
  ipcMain.handle('site:categories', getCategories)
  ipcMain.handle('site:tags', getTags)

  const apis = wrapper.getWrapper()

  for (let channel in apis) {
    ipcMain.handle(channel, function (event, ...args) {
      return apis[channel](...args)
    })
  }
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
