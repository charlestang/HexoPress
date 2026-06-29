import {
  CategoryPath,
  normalizeCategoryPaths,
  pathsEqual,
  sanitizeCategoryPaths,
  setFrontMatterCategories,
} from '../postMetaUtils'
import { HexoContext } from './HexoContext'
import { BulkCategoryOperationResult, HexoCategoryRecord } from './types'

/**
 * Category-centric operations: listing categories and bulk re-assigning or
 * removing a category across posts.
 */
export class CategoryService {
  constructor(private readonly ctx: HexoContext) {}

  /**
   * Get all categories.
   */
  public async getCategories(): Promise<Category[]> {
    console.log('HexoAgent getCategories is called.')
    await this.ctx.ensureReady()

    const categories = <Category[]>[]
    this.ctx.hexo.locals.get('categories').each(function (category) {
      const cat = {
        id: category._id,
        parent: category.parent,
        name: category.name,
        slug: category.slug,
        path: category.path,
        permalink: category.permalink,
        length: category.length,
      }
      categories.push(cat)
    })
    return categories
  }

  private async getCategoryPathById(categoryId: string): Promise<CategoryPath> {
    await this.ctx.ensureReady()
    const categoryModel = this.ctx.hexo.database.model('Category')
    const category = categoryModel.findById(categoryId, { lean: true }) as
      | HexoCategoryRecord
      | undefined

    if (!category) {
      throw new Error(`Category not found: ${categoryId}`)
    }

    const path: string[] = []
    let current: HexoCategoryRecord | undefined = category

    while (typeof current !== 'undefined') {
      path.unshift(current.name)

      const parentId: string | undefined = current.parent
      if (!parentId) {
        break
      }

      const parent = categoryModel.findById(parentId, { lean: true }) as
        | HexoCategoryRecord
        | undefined
      if (!parent) {
        break
      }

      current = parent
    }

    return path
  }

  private async mutatePostCategories(
    sourcePath: string,
    mutator: (paths: CategoryPath[]) => { paths: CategoryPath[]; changed: boolean },
  ): Promise<{ changed: boolean }> {
    await this.ctx.ensureReady()
    const document = this.ctx.readPostFrontMatter(sourcePath)
    const currentPaths = normalizeCategoryPaths(document.data.categories)
    const currentSanitized = sanitizeCategoryPaths(currentPaths)
    const { paths: mutatedPaths, changed } = mutator(currentSanitized)
    const nextPaths = sanitizeCategoryPaths(mutatedPaths)

    const structuralChange =
      currentSanitized.length !== nextPaths.length ||
      currentSanitized.some((path, index) => {
        const target = nextPaths[index]
        if (!target) {
          return true
        }
        return !pathsEqual(path, target)
      })

    if (!changed && !structuralChange) {
      return { changed: false }
    }

    setFrontMatterCategories(document.data, nextPaths)
    this.ctx.writePostFrontMatter(sourcePath, document)
    return { changed: true }
  }

  public async replaceCategoryForPosts(
    categoryId: string,
    sources: string[],
    replacements: CategoryPath[],
  ): Promise<BulkCategoryOperationResult> {
    if (!categoryId) {
      throw new Error('Category id cannot be empty')
    }

    await this.ctx.ensureReady()
    const targetPath = await this.getCategoryPathById(categoryId)
    const sanitizedReplacements = sanitizeCategoryPaths(replacements ?? [])

    if (sanitizedReplacements.length === 0) {
      throw new Error('Replacement categories cannot be empty')
    }

    console.debug('replaceCategoryForPosts sanitized replacements', {
      categoryId,
      replacements,
      sanitizedReplacements,
    })

    const uniqueSources = Array.from(
      new Set(sources.filter((item) => item && item.trim().length > 0)),
    )
    const result: BulkCategoryOperationResult = {
      total: uniqueSources.length,
      success: 0,
      failure: 0,
    }

    let changedAny = false

    for (const source of uniqueSources) {
      try {
        const mutation = await this.mutatePostCategories(source, (paths) => {
          const withoutTarget = paths.filter((path) => !pathsEqual(path, targetPath))
          let changed = withoutTarget.length !== paths.length
          const combined: CategoryPath[] = [
            ...withoutTarget.map((path) => [...path]),
            ...sanitizedReplacements.map((path) => [...path]),
          ]
          const deduped = sanitizeCategoryPaths(combined)

          if (!changed) {
            if (deduped.length !== paths.length) {
              changed = true
            } else if (
              deduped.some((path, index) => {
                const original = paths[index]
                if (!original) {
                  return true
                }
                return !pathsEqual(path, original)
              })
            ) {
              changed = true
            }
          }

          return { paths: deduped, changed }
        })

        if (mutation.changed) {
          changedAny = true
        }

        result.success += 1
      } catch (error) {
        result.failure += 1
        const message = error instanceof Error ? error.message : String(error)
        if (!result.errors) {
          result.errors = []
        }
        result.errors.push({ source, message })
      }
    }

    if (changedAny) {
      await this.ctx.updateCache()
    }

    return result
  }

  public async removeCategoryFromPosts(
    categoryId: string,
    sources: string[],
  ): Promise<BulkCategoryOperationResult> {
    if (!categoryId) {
      throw new Error('Category id cannot be empty')
    }

    await this.ctx.ensureReady()
    const targetPath = await this.getCategoryPathById(categoryId)

    const uniqueSources = Array.from(
      new Set(sources.filter((item) => item && item.trim().length > 0)),
    )
    const result: BulkCategoryOperationResult = {
      total: uniqueSources.length,
      success: 0,
      failure: 0,
    }

    let changedAny = false

    for (const source of uniqueSources) {
      try {
        const mutation = await this.mutatePostCategories(source, (paths) => {
          const filtered = paths.filter((path) => !pathsEqual(path, targetPath))
          const changed = filtered.length !== paths.length
          return { paths: filtered, changed }
        })

        if (mutation.changed) {
          changedAny = true
        }

        result.success += 1
      } catch (error) {
        result.failure += 1
        const message = error instanceof Error ? error.message : String(error)
        if (!result.errors) {
          result.errors = []
        }
        result.errors.push({ source, message })
      }
    }

    if (changedAny) {
      await this.ctx.updateCache()
    }

    return result
  }
}
