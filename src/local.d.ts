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

export interface ISite {
  getPosts: () => Promise<Post[]>
  getCategories: () => Promise<Category[]>
  getTags: () => Promise<Tag[]>
  getConfig: (key) => Promise<string | null | bool | number | array | object>
  setConfig: (key, value) => Promise<any>
}

declare global {
  interface Window {
    site: ISite
  }
}
