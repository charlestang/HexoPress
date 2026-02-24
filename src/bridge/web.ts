import type { SiteBridge } from './types'

// -- Response handlers --

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    window.location.hash = '#/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function handleVoidResponse(res: Response): Promise<void> {
  if (res.status === 401) {
    window.location.hash = '#/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`)
}

// -- Fetch helpers --

async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const url = new URL(path, window.location.origin)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  const res = await fetch(url.toString(), { credentials: 'same-origin' })
  return handleResponse<T>(res)
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const hasBody = body !== undefined
  const res = await fetch(new URL(path, window.location.origin).toString(), {
    method: 'POST',
    headers: hasBody ? { 'Content-Type': 'application/json' } : {},
    credentials: 'same-origin',
    body: hasBody ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(res)
}

async function apiPostVoid(path: string, body?: unknown): Promise<void> {
  const hasBody = body !== undefined
  const res = await fetch(new URL(path, window.location.origin).toString(), {
    method: 'POST',
    headers: hasBody ? { 'Content-Type': 'application/json' } : {},
    credentials: 'same-origin',
    body: hasBody ? JSON.stringify(body) : undefined,
  })
  return handleVoidResponse(res)
}

// -- Utility --

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

// -- Web bridge implementation --

export const site: SiteBridge = {
  // GET - read operations
  getPosts: (
    published,
    draft,
    limit,
    offset,
    categoryId,
    monthCode,
    keywords,
    tagId,
    orderBy,
    order,
  ) =>
    apiGet<PostsResults>('/api/site/posts', {
      published,
      draft,
      limit,
      offset,
      categoryId,
      monthCode,
      keywords,
      tagId,
      orderBy,
      order,
    }),

  getPostMonths: () => apiGet<string[]>('/api/site/postMonths'),

  getCategories: () => apiGet<Category[]>('/api/site/categories'),

  getTags: () => apiGet<Tag[]>('/api/site/tags'),

  getAssets: () => apiGet<Asset[]>('/api/site/assets'),

  getStats: () => apiGet<Stats>('/api/site/stats'),

  getSiteInfo: () => apiGet<SiteInfo>('/api/site/info'),

  getHeatMap: () => apiGet<DateEntry[]>('/api/site/heatMap'),

  getHexoConfig: () => apiGet<HexoConfig>('/api/site/hexoConfig'),

  getContent: async (path: string) => {
    const res = await apiGet<{ content: string }>('/api/post/content', { path })
    return res.content
  },

  getPostMeta: (sourcePath: string) => apiGet<PostMeta>('/api/post/meta', { path: sourcePath }),

  getPostDocument: (sourcePath: string) =>
    apiGet<PostDocument>('/api/post/document', { path: sourcePath }),

  getReadDir: (path: string) => apiGet<FileEntry[]>('/api/fs/readdir', { path }),

  getFileInfo: (path: string) => apiGet<AssetFileInfo | null>('/api/fs/fileInfo', { path }),

  getAssetReferences: (path: string) => apiGet<string[]>('/api/fs/assetReferences', { path }),

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initializeAgent: (_path: string) => apiPost<boolean>('/api/agent/init'),

  // POST - write operations
  refreshSite: () => apiPostVoid('/api/site/refresh'),

  deleteAsset: (assetId: string) => apiPostVoid('/api/site/assetDelete', { assetId }),

  saveContent: (path: string, content: string) => apiPostVoid('/api/post/save', { path, content }),

  createFile: async (type: string, title: string, slug: string, content: string) => {
    const res = await apiPost<{ path: string }>('/api/post/create', { type, title, slug, content })
    return res.path
  },

  moveFile: async (sourcePath: string, content: string) => {
    const res = await apiPost<{ path: string }>('/api/post/move', { sourcePath, content })
    return res.path
  },

  deleteFile: (path: string) => apiPostVoid('/api/post/delete', { path }),

  updatePostMeta: (sourcePath: string, meta: PostMeta) =>
    apiPostVoid('/api/post/updateMeta', { path: sourcePath, meta }),

  savePostDocument: (sourcePath: string, document: PostDocument) =>
    apiPostVoid('/api/post/saveDocument', { path: sourcePath, document }),

  removeTagFromPost: (sourcePath: string, tagId: string) =>
    apiPostVoid('/api/post/removeTag', { sourcePath, tagId }),

  replaceCategoryForPosts: (categoryId: string, sources: string[], replacements: string[][]) =>
    apiPost<BulkCategoryOperationResult>('/api/category/replaceAssignments', {
      categoryId,
      sources,
      replacements,
    }),

  removeCategoryFromPosts: (categoryId: string, sources: string[]) =>
    apiPost<BulkCategoryOperationResult>('/api/category/bulkRemove', {
      categoryId,
      sources,
    }),

  mv: (from: string, to: string) => apiPost<boolean>('/api/fs/mv', { from, to }),

  saveImage: (path: string, content: ArrayBuffer) =>
    apiPostVoid('/api/fs/saveImage', { path, content: arrayBufferToBase64(content) }),

  // Electron-specific APIs with web alternatives
  openDirDialog: () => Promise.resolve({ canceled: true, filePaths: [] }),

  openUrl: (url: string) => {
    window.open(url, '_blank')
    return Promise.resolve()
  },

  getSystemLocale: () => Promise.resolve(navigator.language),

  getDarkMode: () =>
    Promise.resolve(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),

  setDarkMode: () => Promise.resolve(),

}
