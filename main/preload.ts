import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '@shared/ipc-channels'

contextBridge.exposeInMainWorld('site', {
  getPosts: (...args) => ipcRenderer.invoke(IPC.sitePosts, ...args),
  getPostMonths: () => ipcRenderer.invoke(IPC.sitePostMonth),
  getCategories: (...args) => ipcRenderer.invoke(IPC.siteCategories, ...args),
  getTags: (...args) => ipcRenderer.invoke(IPC.siteTags, ...args),
  getAssets: () => ipcRenderer.invoke(IPC.siteAssets),
  deleteAsset: (assetId: string) => ipcRenderer.invoke(IPC.siteAssetDelete, assetId),
  getStats: () => ipcRenderer.invoke(IPC.siteStats),
  getSiteInfo: () => ipcRenderer.invoke(IPC.siteInfo),
  refreshSite: () => ipcRenderer.invoke(IPC.siteRefresh),
  getHeatMap: () => ipcRenderer.invoke(IPC.siteHeatMap),
  getHexoConfig: () => ipcRenderer.invoke(IPC.hexoConfig),
  openDirDialog: () => ipcRenderer.invoke(IPC.dialogDir),
  getContent: (sourcePath: string) => ipcRenderer.invoke(IPC.postContent, sourcePath),
  saveContent: (sourcePath: string, content: string) =>
    ipcRenderer.invoke(IPC.postSave, sourcePath, content),
  getPostMeta: (sourcePath: string) => ipcRenderer.invoke(IPC.postGetMeta, sourcePath),
  updatePostMeta: (sourcePath: string, meta: PostMeta) =>
    ipcRenderer.invoke(IPC.postUpdateMeta, sourcePath, meta),
  getPostDocument: (sourcePath: string) => ipcRenderer.invoke(IPC.postDocument, sourcePath),
  savePostDocument: (sourcePath: string, document: PostDocument) =>
    ipcRenderer.invoke(IPC.postSaveDocument, sourcePath, document),
  removeTagFromPost: (sourcePath: string, tagId: string) =>
    ipcRenderer.invoke(IPC.postsRemoveTag, sourcePath, tagId),
  createFile: (type, title: string, slug: string, content: string) =>
    ipcRenderer.invoke(IPC.postCreate, type, title, slug, content),
  moveFile: (sourcePath: string, content: string) =>
    ipcRenderer.invoke(IPC.postMove, sourcePath, content),
  deleteFile: (sourcePath: string) => ipcRenderer.invoke(IPC.postDelete, sourcePath),
  replaceCategoryForPosts: (categoryId: string, sources: string[], replacements: string[][]) =>
    ipcRenderer.invoke(IPC.categoryReplaceAssignments, categoryId, sources, replacements),
  removeCategoryFromPosts: (categoryId: string, sources: string[]) =>
    ipcRenderer.invoke(IPC.categoryBulkRemove, categoryId, sources),
  getSystemLocale: () => ipcRenderer.invoke(IPC.sysLocale),
  openUrl: (url: string) => ipcRenderer.invoke(IPC.shellOpenUrl, url),
  getReadDir: (path: string) => ipcRenderer.invoke(IPC.fsReaddir, path),
  mv: (from: string, to: string) => ipcRenderer.invoke(IPC.fsMv, from, to),
  saveImage: (path: string, content: ArrayBuffer) =>
    ipcRenderer.invoke(IPC.fsSaveImage, path, content),
  getFileInfo: (path: string) => ipcRenderer.invoke(IPC.fsFileInfo, path),
  getAssetReferences: (path: string) => ipcRenderer.invoke(IPC.fsAssetReferences, path),
  initializeAgent: (path: string) => ipcRenderer.invoke(IPC.agentInit, path),
  getDarkMode: () => ipcRenderer.invoke(IPC.darkGet),
  setDarkMode: (val: string) => ipcRenderer.invoke(IPC.darkSet, val),
})
