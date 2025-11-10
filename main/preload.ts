import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('site', {
  getPosts: (...args) => ipcRenderer.invoke('site:posts', ...args),
  getPostMonths: () => ipcRenderer.invoke('site:postMonth'),
  getCategories: (...args) => ipcRenderer.invoke('site:categories', ...args),
  getTags: (...args) => ipcRenderer.invoke('site:tags', ...args),
  getAssets: () => ipcRenderer.invoke('site:assets'),
  deleteAsset: (assetId: string) => ipcRenderer.invoke('site:assetDelete', assetId),
  getStats: () => ipcRenderer.invoke('site:stats'),
  getSiteInfo: () => ipcRenderer.invoke('site:info'),
  refreshSite: () => ipcRenderer.invoke('site:refresh'),
  getHeatMap: () => ipcRenderer.invoke('site:heatMap'),
  getHexoConfig: () => ipcRenderer.invoke('hexo:config'),
  openDirDialog: () => ipcRenderer.invoke('dialog:dir'),
  getContent: (sourcePath: string) => ipcRenderer.invoke('post:content', sourcePath),
  saveContent: (sourcePath: string, content: string) =>
    ipcRenderer.invoke('post:save', sourcePath, content),
  getPostMeta: (sourcePath: string) => ipcRenderer.invoke('post:getMeta', sourcePath),
  updatePostMeta: (sourcePath: string, meta: PostMeta) =>
    ipcRenderer.invoke('post:updateMeta', sourcePath, meta),
  getPostDocument: (sourcePath: string) => ipcRenderer.invoke('post:document', sourcePath),
  savePostDocument: (sourcePath: string, document: PostDocument) =>
    ipcRenderer.invoke('post:saveDocument', sourcePath, document),
  removeTagFromPost: (sourcePath: string, tagId: string) =>
    ipcRenderer.invoke('posts:remove-tag', sourcePath, tagId),
  createFile: (type, title: string, slug: string, content: string) =>
    ipcRenderer.invoke('post:create', type, title, slug, content),
  moveFile: (sourcePath: string, content: string) =>
    ipcRenderer.invoke('post:move', sourcePath, content),
  deleteFile: (sourcePath: string) => ipcRenderer.invoke('post:delete', sourcePath),
  replaceCategoryForPosts: (categoryId: string, sources: string[], replacements: string[][]) =>
    ipcRenderer.invoke('category:replaceAssignments', categoryId, sources, replacements),
  removeCategoryFromPosts: (categoryId: string, sources: string[]) =>
    ipcRenderer.invoke('category:bulkRemove', categoryId, sources),
  getSystemLocale: () => ipcRenderer.invoke('sys:locale'),
  openUrl: (url: string) => ipcRenderer.invoke('shell:openUrl', url),
  getReadDir: (path: string) => ipcRenderer.invoke('fs:readdir', path),
  mv: (from: string, to: string) => ipcRenderer.invoke('fs:mv', from, to),
  saveImage: (path: string, content: ArrayBuffer) =>
    ipcRenderer.invoke('fs:saveImage', path, content),
  getFileInfo: (path: string) => ipcRenderer.invoke('fs:fileInfo', path),
  getAssetReferences: (path: string) => ipcRenderer.invoke('fs:assetReferences', path),
  onVaultPathChanged: (callback) =>
    ipcRenderer.on('configChanged:vaultPath', (_, value) => callback(value)),
  initializeAgent: (path: string) => ipcRenderer.invoke('agent:init', path),
  getDarkMode: () => ipcRenderer.invoke('dark:get'),
  setDarkMode: (val: string) => ipcRenderer.invoke('dark:set', val),
})
