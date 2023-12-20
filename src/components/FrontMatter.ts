import { parse, stringify as yStringify } from 'hexo-front-matter'
export interface FrontMatter {
  layout?: string
  title?: string
  date?: Date 
  updated?: Date
  comments?: boolean
  tags: string[]
  categories: string | string[] | string[][]
  permalink?: string
  excerpt?: string
  disableNunjucks?: boolean
  lang?: string
  published?: boolean
  [key: string]: any
}

export type MDDocument = {
  data: FrontMatter
  content: string
}

export function parseFrontMatter(content: string): MDDocument {
  const mdDocument = {} as MDDocument
  // use hexo-front-matter to parse the document's content
  const data = parse(content)
  // assign the content to the mdDocument's content
  mdDocument.content = data._content
  delete data._content
  // rest of the fields are treated as front-matter information
  mdDocument.data = data as FrontMatter
  return mdDocument
}

export function stringify(data: FrontMatter, content: string): string {
  data._content = content
  const options = {
    prefixSeparator: true
  }
  return yStringify(data, options) as string
}
