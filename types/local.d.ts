export {}

declare global {
  type HexoConfig = {
    title: string
    subtitle: string
    description: string
    keywords: string[]
    author: string
    language: string
    timezone: string
    url: string
    permalink: string
    date_format: string
    time_format: string
    theme: string
    source_dir: string
  } | null

  type SiteInfo = {
    basePath: string
    name: string
    version: string
    hexoVersion: string
  } | null

  type Category = {
    id: string
    parent: string | undefined
    name: string
    slug: string
    path: string
    permalink: string
    length: number
  }

  type NodeData = {
    id?: string
    parent?: string | undefined
    label: string
    children?: NodeData[]
    length?: number
    permalink?: string
    value: string
    path?: string
    disabled?: boolean
  }

  type FileEntry = {
    name: string
    relativePath: string
    type: string
  }

  type TagList = {
    [_id: string]: string
  }

  type PostCategory = {
    _id: string
    name: string
    parent?: string
  }

  type CategoryList = PostCategory[]

  type BulkCategoryOperationResult = {
    total: number
    success: number
    failure: number
    errors?: Array<{
      source: string
      message: string
    }>
  }

  type PostMeta = {
    title?: string
    layout?: string
    date?: string | Date
    updated?: string | Date
    permalink?: string
    excerpt?: string
    tags?: string[]
    categories?: string | string[] | string[][]
    comments?: boolean
    disableNunjucks?: boolean
    lang?: string
    published?: boolean
    [key: string]: unknown
  }

  type PostDocument = {
    meta: PostMeta
    content: string
  }

  type Post = {
    title: string
    date: string
    updated: string
    source: string
    status: string
    layout: string
    path: string
    permalink: string
    asset_dir: string
    tags: TagList
    categories: CategoryList
  }

  type PostsResults = {
    total: number
    posts: Post[]
  }

  type Tag = {
    id: string
    name: string
    slug: string
    path: string
    permalink: string
    length: number
  }

  type Asset = {
    id: string
    path: string
    modified: boolean
    renderable: boolean
    source: string
  }

  type AssetFileInfo = {
    size: number
    createdAt: string
    updatedAt: string
  }

  type Stats = {
    postCount: number
    postDraftCount: number
    pageCount: number
  }

  type DialogResult = {
    canceled: boolean
    filePaths: string[]
  }

  type DateEntry = {
    date: string
    count: number
  }

  type Heading = {
    id: string
    text: string
    level: number
    line: number
  }
  type AiProvider = {
    id: string
    name: string
    baseUrl: string
    apiKey: string
    provider: string
    modelId: string
  }

  type AiPreset = {
    id: string
    name: string
    icon: string
    systemPrompt: string
    userPrompt: string
    contextMode: 'full' | 'selection' | 'none'
  }

  type AiMessage = {
    role: 'user' | 'assistant'
    content: string
    contextLabel?: string
    presetLabel?: string
  }

  type SelectionRange = {
    from: number
    to: number
  }

  interface ISite {
    createFile: (type: string, title: string, slug: string, content: string) => Promise<string>
    deleteAsset: (assetId: string) => Promise<void>
    deleteFile: (path: string) => Promise<void>
    getAssetReferences: (path: string) => Promise<string[]>
    getAssets: () => Promise<Asset[]>
    getCategories: () => Promise<Category[]>
    getContent: (path: string) => Promise<string>
    getDarkMode: () => Promise<string>
    getFileInfo: (path: string) => Promise<AssetFileInfo | null>
    getHeatMap: () => Promise<DateEntry[]>
    getHexoConfig: () => Promise<HexoConfig>
    getPostDocument: (sourcePath: string) => Promise<PostDocument>
    getPostMeta: (sourcePath: string) => Promise<PostMeta>
    getPostMonths: () => Promise<string[]>
    getPosts: (
      published?: boolean,
      draft?: boolean,
      limit?: number,
      offset?: number,
      categoryId?: string,
      monthCode?: string,
      keywords?: string,
      tagId?: string,
      orderBy?: string,
      order?: string,
    ) => Promise<PostsResults>
    getReadDir: (path: string) => Promise<FileEntry[]>
    getSiteInfo: () => Promise<SiteInfo>
    getStats: () => Promise<Stats>
    getSystemLocale: () => Promise<string>
    getTags: () => Promise<Tag[]>
    initializeAgent: (path: string) => Promise<boolean>
    moveFile: (sourcePath: string, content: string) => Promise<string>
    mv: (from: string, to: string) => Promise<boolean>
    onVaultPathChanged: (callback: (newValue: string) => void) => void
    openDirDialog: () => Promise<DialogResult>
    openUrl: (url: string) => Promise<void>
    refreshSite: () => Promise<void>
    removeCategoryFromPosts: (
      categoryId: string,
      sources: string[],
    ) => Promise<BulkCategoryOperationResult>
    removeTagFromPost: (sourcePath: string, tagId: string) => Promise<void>
    replaceCategoryForPosts: (
      categoryId: string,
      sources: string[],
      replacements: string[][],
    ) => Promise<BulkCategoryOperationResult>
    saveContent: (path: string, content: string) => Promise<void>
    saveImage: (path: string, content: ArrayBuffer) => Promise<void>
    savePostDocument: (sourcePath: string, document: PostDocument) => Promise<void>
    setDarkMode: (darkMode: string) => Promise<void>
    updatePostMeta: (sourcePath: string, meta: PostMeta) => Promise<void>
  }

  interface Window {
    site: ISite
  }
}
