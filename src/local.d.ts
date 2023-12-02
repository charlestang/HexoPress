export type TagOrCategoryList = {
  [_id: string]: string
}

export type Post = {
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

export type PostsResults = {
  total: number
  posts: Post[]
}

export type Category = {
  id: string
  parent: string | undefined
  name: string
  slug: string
  path: string
  permalink: string
  length: number
}

export type Tag = {
  id: string
  name: string
  slug: string
  path: string
  permalink: string
  length: number
}

export type Stats = {
  postCount: number
  postDraftCount: number
  pageCount: number
}

type DialogResult = {
  canceled: boolean
  filePaths: string[]
}

export type SiteInfo = {
  name: string
  version: string
  hexoVersion: string
}

export type HexoConfig = {
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
}

export interface ISite {
  getPosts: (
    published?: boolean,
    draft?: boolean,
    limit?: number,
    offset?: number,
    categoryId?: string,
    monthCode?: string,
    orderBy?: string,
    order?: string
  ) => Promise<PostsResults>
  getCategories: () => Promise<Category[]>
  getTags: () => Promise<Tag[]>
  getStats: () => Promise<Stats>
  getConfig: (key) => Promise<string | null | boolean | number | any[] | object>
  getSiteConfig: () => Promise<Object>
  getSiteInfo: () => Promise<SiteInfo>
  getHexoConfig: () => Promise<HexoConfig>
  setConfig: (key, value) => Promise<any>
  openDirDialog: () => Promise<DialogResult>
  getContent: (path: string) => Promise<string>
  saveContent: (path: string, content: string) => Promise<void>
  createFile: (type: string, content: string, filename?: string) => Promise<void>
  moveFile: (sourcePath: string, content: string) => Promise<void>
  deleteFile: (path: string) => Promise<void>
  getSystemLocale: () => Promise<string>
}

declare global {
  interface Window {
    site: ISite
  }
}
