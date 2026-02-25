export const IPC = {
  // Agent lifecycle
  agentInit: 'agent:init',

  // Category operations
  categoryBulkRemove: 'category:bulkRemove',
  categoryReplaceAssignments: 'category:replaceAssignments',

  // Dark mode
  darkGet: 'dark:get',
  darkSet: 'dark:set',

  // System dialogs
  dialogDir: 'dialog:dir',

  // File system operations
  fsAssetReferences: 'fs:assetReferences',
  fsFileInfo: 'fs:fileInfo',
  fsMv: 'fs:mv',
  fsReaddir: 'fs:readdir',
  fsSaveImage: 'fs:saveImage',

  // Hexo configuration
  hexoConfig: 'hexo:config',

  // Post operations
  postContent: 'post:content',
  postCreate: 'post:create',
  postDelete: 'post:delete',
  postDocument: 'post:document',
  postGetMeta: 'post:getMeta',
  postMove: 'post:move',
  postSave: 'post:save',
  postSaveDocument: 'post:saveDocument',
  postUpdateMeta: 'post:updateMeta',

  // Batch post operations
  postsRemoveTag: 'posts:remove-tag',

  // Shell operations
  shellOpenUrl: 'shell:openUrl',

  // Site data queries
  siteAssetDelete: 'site:assetDelete',
  siteAssets: 'site:assets',
  siteCategories: 'site:categories',
  siteHeatMap: 'site:heatMap',
  siteInfo: 'site:info',
  sitePostMonth: 'site:postMonth',
  sitePosts: 'site:posts',
  siteRefresh: 'site:refresh',
  siteStats: 'site:stats',
  siteTags: 'site:tags',

  // System information
  sysLocale: 'sys:locale',
} as const
