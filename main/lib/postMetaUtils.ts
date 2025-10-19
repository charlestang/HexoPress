import { cloneValue, toDate, toStringArray } from '@shared/utils/value'

export type CategoryPath = string[]

export type FrontMatterData = Record<string, unknown> & {
  categories?: string | string[] | string[][]
  tags?: string | string[]
  date?: unknown
  updated?: unknown
}

function normalizeTags(value: unknown): string[] {
  return toStringArray(value)
}

function toSegments(entry: unknown): string[] {
  if (entry === null || typeof entry === 'undefined') {
    return []
  }

  if (Array.isArray(entry)) {
    return entry.flatMap((segment) => toSegments(segment)).filter((segment) => segment.length > 0)
  }

  return String(entry)
    .split('>')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
}

export function normalizeCategoryPaths(value: unknown): CategoryPath[] {
  if (value === null || typeof value === 'undefined') {
    return []
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return []
    }
    return value.reduce<CategoryPath[]>((acc, item) => {
      const segments = toSegments(item)
      if (segments.length > 0) {
        acc.push(segments)
      }
      return acc
    }, [])
  }

  const segments = toSegments(value)
  return segments.length > 0 ? [segments] : []
}

export function sanitizeCategoryPaths(paths: CategoryPath[]): CategoryPath[] {
  const dedup = new Set<string>()
  const sanitized: CategoryPath[] = []

  for (const path of paths) {
    const clean = path.map((segment) => segment.trim()).filter((segment) => segment.length > 0)
    if (clean.length === 0) {
      continue
    }
    const key = clean.join('>')
    if (!dedup.has(key)) {
      dedup.add(key)
      sanitized.push(clean)
    }
  }

  return sanitized
}

export function setFrontMatterCategories(
  frontMatter: FrontMatterData,
  paths: CategoryPath[],
): void {
  const sanitized = sanitizeCategoryPaths(paths)
  if (sanitized.length === 0) {
    delete frontMatter.categories
    return
  }

  const allSingleLevel = sanitized.every((path) => path.length === 1)
  if (allSingleLevel) {
    const singleValues = sanitized.map((path) => path[0])
    frontMatter.categories = singleValues.length === 1 ? singleValues[0] : singleValues
    return
  }

  frontMatter.categories = sanitized
}

export function pathsEqual(a: CategoryPath, b: CategoryPath): boolean {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

export function toCategoryAssignment(
  paths: CategoryPath[],
): string | string[] | string[][] | undefined {
  if (paths.length === 0) {
    return undefined
  }
  if (paths.length === 1) {
    const [path] = paths
    if (path.length === 1) {
      return path[0]
    }
    return path
  }
  return paths
}

export function buildPostMeta(data: FrontMatterData): PostMeta {
  const meta: PostMeta = {}

  for (const [key, rawValue] of Object.entries(data)) {
    if (typeof rawValue === 'undefined') {
      continue
    }
    if (key === 'categories') {
      const normalized = normalizeCategoryPaths(rawValue)
      const categories = toCategoryAssignment(sanitizeCategoryPaths(normalized))
      if (typeof categories !== 'undefined') {
        meta.categories = categories
      }
      continue
    }
    if (key === 'tags') {
      meta.tags = normalizeTags(rawValue)
      continue
    }
    if (key === 'date' || key === 'updated') {
      const date = toDate(rawValue)
      if (date) {
        meta[key] = date
      }
      continue
    }

    meta[key] = cloneValue(rawValue)
  }

  if (!meta.tags) {
    meta.tags = []
  }

  return meta
}

export function preparePostMeta(meta: PostMeta): FrontMatterData {
  const data: FrontMatterData = {}

  for (const [key, rawValue] of Object.entries(meta)) {
    if (typeof rawValue === 'undefined' || key === 'categories') {
      continue
    }
    if (key === 'tags') {
      data.tags = normalizeTags(rawValue)
      continue
    }
    if (key === 'date' || key === 'updated') {
      const date = toDate(rawValue)
      if (date) {
        data[key] = date
      }
      continue
    }
    data[key] = cloneValue(rawValue)
  }

  const normalizedCategories = normalizeCategoryPaths(meta.categories as unknown)
  setFrontMatterCategories(data, normalizedCategories)

  return data
}
