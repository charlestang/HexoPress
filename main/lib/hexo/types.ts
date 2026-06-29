import { FrontMatterData } from '../postMetaUtils'

export type FrontMatterDocument = {
  data: FrontMatterData
  content: string
}

export type BulkCategoryOperationResult = {
  total: number
  success: number
  failure: number
  errors?: Array<{ source: string; message: string }>
}

export type MomentLike = {
  locale: (locale: string) => MomentLike
  format: (formatString?: string) => string
}

export type HexoTagRecord = {
  _id: string
  name: string
}

export type HexoCategoryRecord = {
  _id: string
  name: string
  parent?: string
}

export type HexoPostRecord = {
  title: string
  date: MomentLike
  updated: MomentLike
  source: string
  published: boolean
  layout: string
  path: string
  permalink: string
  asset_dir: string
  tags: { data: HexoTagRecord[] }
  categories: { data: HexoCategoryRecord[] }
}
