import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('site', {
  getPosts: (...args) => ipcRenderer.invoke('site:posts', ...args),
  getPostMonths: () => ipcRenderer.invoke('site:postMonth'),
  getCategories: (...args) => ipcRenderer.invoke('site:categories', ...args),
  getTags: (...args) => ipcRenderer.invoke('site:tags', ...args),
  getAssets: () => ipcRenderer.invoke('site:assets'),
  getStats: () => ipcRenderer.invoke('site:stats'),
  getSiteConfig: () => ipcRenderer.invoke('site:config'),
  getSiteInfo: () => ipcRenderer.invoke('site:info'),
  refreshSite: () => ipcRenderer.invoke('site:refresh'),
  getHexoConfig: () => ipcRenderer.invoke('hexo:config'),
  openDirDialog: () => ipcRenderer.invoke('dialog:dir'),
  getContent: sourcePath => ipcRenderer.invoke('post:content', sourcePath),
  saveContent: (sourcePath, content) => ipcRenderer.invoke('post:save', sourcePath, content),
  createFile: (type, title, slug, content) =>
    ipcRenderer.invoke('post:create', type, title, slug, content),
  moveFile: (sourcePath, content) => ipcRenderer.invoke('post:move', sourcePath, content),
  deleteFile: sourcePath => ipcRenderer.invoke('post:delete', sourcePath),
  getSystemLocale: () => ipcRenderer.invoke('sys:locale'),
  getReadDir: path => ipcRenderer.invoke('fs:readdir', path),
  mv: (from, to) => ipcRenderer.invoke('fs:mv', from, to),
  onVaultPathChanged: callback =>
    ipcRenderer.on('configChanged:vaultPath', (_, value) => callback(value)),
  initializeAgent: path => ipcRenderer.invoke('agent:init', path),
  getDarkMode: () => ipcRenderer.invoke('dark:get'),
  setDarkMode: val => ipcRenderer.invoke('dark:set', val),
})
