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
  }

  type FileEntry = {
    name: string
    relativePath: string
    type: string
  }

  type TagOrCategoryList = {
    [_id: string]: string
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
    tags: TagOrCategoryList
    categories: TagOrCategoryList
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

  type Stats = {
    postCount: number
    postDraftCount: number
    pageCount: number
  }

  type DialogResult = {
    canceled: boolean
    filePaths: string[]
  }

  interface ISite {
    getPosts: (
      published?: boolean,
      draft?: boolean,
      limit?: number,
      offset?: number,
      categoryId?: string,
      monthCode?: string,
      keywords?: string,
      orderBy?: string,
      order?: string,
    ) => Promise<PostsResults>
    getPostMonths: () => Promise<string[]>
    getCategories: () => Promise<Category[]>
    getTags: () => Promise<Tag[]>
    getAssets: () => Promise<Asset[]>
    getStats: () => Promise<Stats>
    getSiteInfo: () => Promise<SiteInfo>
    refreshSite: () => Promise<void>
    getHexoConfig: () => Promise<HexoConfig>
    openDirDialog: () => Promise<DialogResult>
    getContent: (path: string) => Promise<string>
    saveContent: (path: string, content: string) => Promise<void>
    createFile: (type: string, title: string, slug: string, content: string) => Promise<string>
    moveFile: (sourcePath: string, content: string) => Promise<string>
    deleteFile: (path: string) => Promise<void>
    getSystemLocale: () => Promise<string>
    openUrl: (url: string) => Promise<void>
    getReadDir: (path: string) => Promise<FileEntry[]>
    mv: (from: string, to: string) => Promise<boolean>
    saveImage: (path: string, content: ArrayBuffer) => Promise<void>
    onVaultPathChanged: (callback: (newValue: string) => void) => void
    initializeAgent: (path: string) => Promise<boolean>
    setDarkMode: (darkMode: string) => Promise<void>
    getDarkMode: () => Promise<string>
  }

  interface Window {
    site: ISite
  }
}
