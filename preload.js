window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('site', {
  getPosts: (...args) => ipcRenderer.invoke('site:posts', ...args),
  getCategories: (...args) => ipcRenderer.invoke('site:categories', ...args),
  getTags: (...args) => ipcRenderer.invoke('site:tags', ...args),
  getStats: () => ipcRenderer.invoke('site:stats'),
  getSiteConfig: () => ipcRenderer.invoke('site:config'),
  getSiteInfo: () => ipcRenderer.invoke('site:info'),
  getHexoConfig: () => ipcRenderer.invoke('hexo:config'),
  getConfig: (key) => ipcRenderer.invoke('config:get', key),
  setConfig: (key, value) => ipcRenderer.invoke('config:set', [key, value]),
  openDirDialog: () => ipcRenderer.invoke('dialog:dir'),
  getContent: (sourcePath) => ipcRenderer.invoke('post:content', sourcePath),
  saveContent: (sourcePath, content) => ipcRenderer.invoke('post:save', sourcePath, content),
  createFile: (type, title, slug, content) =>
    ipcRenderer.invoke('post:create', type, title, slug, content),
  moveFile: (sourcePath, content) => ipcRenderer.invoke('post:move', sourcePath, content),
  deleteFile: (sourcePath) => ipcRenderer.invoke('post:delete', sourcePath),
  getSystemLocale: () => ipcRenderer.invoke('sys:locale')
})
