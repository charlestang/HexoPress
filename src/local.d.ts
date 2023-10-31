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
  tags: string
  categories: string
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

export interface ISite {
  getPosts: (
    published?: boolean,
    draft?: boolean,
    limit?: number,
    offset?: number,
    orderBy?: string,
    order?: string
  ) => Promise<Post[]>
  getCategories: () => Promise<Category[]>
  getTags: () => Promise<Tag[]>
  getStats: () => Promise<Stats>
  getConfig: (key) => Promise<string | null | bool | number | array | Object>
  getSiteConfig: () => Promise<Object>
  setConfig: (key, value) => Promise<any>
  openDirDialog: () => Promise<DialogResult>
  getContent: (path: string) => Promise<string>
  getSystemLocale: () => Promise<string>
}

declare global {
  interface Window {
    site: ISite
  }
}
