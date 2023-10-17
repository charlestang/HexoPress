export type Post = {
  title: string
  date: string
  source: string
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
}

declare global {
  interface Window {
    site: ISite
  }
}
