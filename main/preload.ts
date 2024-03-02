import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('site', {
  getPosts: (...args) => ipcRenderer.invoke('site:posts', ...args),
  getPostMonths: () => ipcRenderer.invoke('site:postMonth'),
  getCategories: (...args) => ipcRenderer.invoke('site:categories', ...args),
  getTags: (...args) => ipcRenderer.invoke('site:tags', ...args),
  getAssets: () => ipcRenderer.invoke('site:assets'),
  getStats: () => ipcRenderer.invoke('site:stats'),
  getSiteInfo: () => ipcRenderer.invoke('site:info'),
  refreshSite: () => ipcRenderer.invoke('site:refresh'),
  getHexoConfig: () => ipcRenderer.invoke('hexo:config'),
  openDirDialog: () => ipcRenderer.invoke('dialog:dir'),
  getContent: (sourcePath: string) => ipcRenderer.invoke('post:content', sourcePath),
  saveContent: (sourcePath: string, content: string) =>
    ipcRenderer.invoke('post:save', sourcePath, content),
  createFile: (type, title: string, slug: string, content: string) =>
    ipcRenderer.invoke('post:create', type, title, slug, content),
  moveFile: (sourcePath: string, content: string) =>
    ipcRenderer.invoke('post:move', sourcePath, content),
  deleteFile: (sourcePath: string) => ipcRenderer.invoke('post:delete', sourcePath),
  getSystemLocale: () => ipcRenderer.invoke('sys:locale'),
  openUrl: (url: string) => ipcRenderer.invoke('shell:openUrl', url),
  getReadDir: (path: string) => ipcRenderer.invoke('fs:readdir', path),
  mv: (from: string, to: string) => ipcRenderer.invoke('fs:mv', from, to),
  onVaultPathChanged: (callback) =>
    ipcRenderer.on('configChanged:vaultPath', (_, value) => callback(value)),
  initializeAgent: (path: string) => ipcRenderer.invoke('agent:init', path),
  getDarkMode: () => ipcRenderer.invoke('dark:get'),
  setDarkMode: (val: string) => ipcRenderer.invoke('dark:set', val),
})
