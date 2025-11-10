import { app } from 'electron'
import { existsSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'fs'
import Hexo from 'hexo'
import util from 'hexo-util'
import { parse as parseFrontMatter, stringify as stringifyFrontMatter } from 'hexo-front-matter'
import { join, relative } from 'path'
import {
  CategoryPath,
  FrontMatterData,
  buildPostMeta,
  normalizeCategoryPaths,
  pathsEqual,
  preparePostMeta,
  sanitizeCategoryPaths,
  setFrontMatterCategories,
} from './postMetaUtils'

const { slugize } = util

type FrontMatterDocument = {
  data: FrontMatterData
  content: string
}

type BulkCategoryOperationResult = {
  total: number
  success: number
  failure: number
  errors?: Array<{ source: string; message: string }>
}

type MomentLike = {
  locale: (locale: string) => MomentLike
  format: (formatString?: string) => string
}

type HexoTagRecord = {
  _id: string
  name: string
}

type HexoCategoryRecord = {
  _id: string
  name: string
  parent?: string
}

type HexoPostRecord = {
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
export class HexoAgent {
  private hexo!: Hexo
  private rootPath!: string
  private initPromise?: Promise<void>
  private exitPromise?: Promise<void>

  private async ensureReady(): Promise<void> {
    if (this.exitPromise) {
      await this.exitPromise
    }
    if (this.initPromise) {
      await this.initPromise
    }
    if (typeof this.hexo === 'undefined') {
      throw new Error('Hexo instance is not initialized')
    }
  }

  private readPostFrontMatter(sourcePath: string): FrontMatterDocument {
    const filePath = join(this.hexo.source_dir, sourcePath)
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const raw = readFileSync(filePath, 'utf-8')
    const parsed = parseFrontMatter(raw)
    const content = typeof parsed._content === 'string' ? parsed._content : ''
    delete parsed._content

    return {
      data: parsed as FrontMatterData,
      content,
    }
  }

  private writePostFrontMatter(sourcePath: string, document: FrontMatterDocument): void {
    const filePath = join(this.hexo.source_dir, sourcePath)
    const payload = {
      ...document.data,
      _content: document.content,
    }
    const output = stringifyFrontMatter(payload, { prefixSeparator: true }) as string
    writeFileSync(filePath, output)
  }

  private purgeNullRecords(modelName: string): void {
    const model = this.hexo?.database?.model(modelName) as
      | { data: Record<string, unknown | null> }
      | undefined
    if (!model?.data) {
      return
    }

    Object.keys(model.data).forEach((key) => {
      if (model.data[key] == null) {
        delete model.data[key]
      }
    })
  }

  public async getPostMeta(sourcePath: string): Promise<PostMeta> {
    await this.ensureReady()
    const document = this.readPostFrontMatter(sourcePath)
    return buildPostMeta(document.data)
  }

  public async updatePostMeta(sourcePath: string, meta: PostMeta): Promise<void> {
    await this.ensureReady()
    const document = this.readPostFrontMatter(sourcePath)
    const nextData = preparePostMeta(meta)
    this.writePostFrontMatter(sourcePath, {
      data: nextData,
      content: document.content,
    })
    await this.updateCache()
  }

  public async getPostDocument(sourcePath: string): Promise<PostDocument> {
    await this.ensureReady()
    const document = this.readPostFrontMatter(sourcePath)
    return {
      meta: buildPostMeta(document.data),
      content: document.content,
    }
  }

  public async savePostDocument(sourcePath: string, document: PostDocument): Promise<void> {
    await this.ensureReady()
    const nextData = preparePostMeta(document.meta)
    this.writePostFrontMatter(sourcePath, {
      data: nextData,
      content: document.content,
    })
    await this.updateCache()
  }

  public async removeTagFromPost(sourcePath: string, tagId: string): Promise<void> {
    if (!sourcePath) {
      throw new Error('Source path cannot be empty')
    }
    if (!tagId) {
      throw new Error('Tag id cannot be empty')
    }

    await this.ensureReady()
    const tagModel = this.hexo.database.model('Tag')
    const tag = tagModel.findById(tagId, { lean: true }) as HexoTagRecord | undefined

    if (!tag) {
      throw new Error(`Tag not found: ${tagId}`)
    }

    const document = this.readPostFrontMatter(sourcePath)
    const meta = buildPostMeta(document.data)
    const currentTags = meta.tags ?? []
    const filtered = currentTags.filter((value) => value !== tag.name)

    if (filtered.length === currentTags.length) {
      return
    }

    meta.tags = filtered.length > 0 ? filtered : undefined
    const nextData = preparePostMeta(meta)
    this.writePostFrontMatter(sourcePath, {
      data: nextData,
      content: document.content,
    })
    await this.updateCache()
  }

  private async getCategoryPathById(categoryId: string): Promise<CategoryPath> {
    await this.ensureReady()
    const categoryModel = this.hexo.database.model('Category')
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
    await this.ensureReady()
    const document = this.readPostFrontMatter(sourcePath)
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
    this.writePostFrontMatter(sourcePath, document)
    return { changed: true }
  }

  public init(rootPath: string): void {
    console.log('HexoAgent.init is called. rootPath is: ', rootPath)

    this.rootPath = rootPath

    // Users can unbind the agent with previous directory and bind it with a new one.
    // In this case, we need to exit the previous hexo instance first.
    if (typeof this.hexo !== 'undefined') {
      console.log('The member hexo is already initialized.')

      this.exitPromise = this.hexo.exit()
    }

    this.hexo = new Hexo(this.rootPath, {
      safe: false,
      draft: true,
    })

    this.initPromise = this.hexo
      .init()
      .then(() => {
        console.log('A new instance of Hexo is initialized with rootPath: ', this.rootPath)

        return this.hexo.load()
      })
      .then(() => {
        console.log('The instance of Hexo loading finished.')

        // register a dummy render for markdown files make db cache sync.
        this.hexo.extend.renderer.register('md', 'html', (data) => data.text, true)
      })
  }

  /**
   * Check if the directory exists.
   * @param path string
   * @returns boolean
   */
  public static checkDir(path: string): boolean {
    if (!existsSync(path)) {
      return false
    }

    try {
      const stat = statSync(path)
      return stat.isDirectory()
    } catch (error) {
      console.log('Error checking directory: ', path, ' error is:', error)
    }
    return false
  }

  public static checkHexoDir(path: string): boolean {
    return HexoAgent.checkDir(join(path, 'source')) && HexoAgent.checkDir(join(path, 'scaffolds'))
  }

  /**
   * Fetch all posts meet the conditions.
   */
  public async getPosts(
    published: boolean = true,
    isDraft: boolean = true,
    limit: number = -1,
    offset: number = 0,
    categoryId: string = '',
    monthCode: string = '',
    keywords: string = '',
    tagId: string = '',
    orderBy: string = 'date',
    order: string = 'desc',
  ): Promise<PostsResults> {
    if (this.exitPromise) {
      await this.exitPromise
    }
    if (this.initPromise) {
      await this.initPromise
    }
    console.log(
      'HexoAgent.getPosts is called.',
      `Getting posts with published=${published}, draft=${isDraft}, limit=${limit}, offset=${offset}, keywords=${keywords}, tagId=${tagId}, orderBy=${orderBy}, order=${order}`,
    )
    const results = {
      total: 0,
      posts: <Post[]>[],
    }
    const postList = <Post[]>[]
    let posts = this.hexo.locals.get('posts')
    if (orderBy && order) {
      posts = posts.sort(orderBy, order)
    }
    if (!published) {
      posts = posts.filter((item) => {
        return !item.published
      })
    }
    if (!isDraft) {
      posts = posts.filter((item) => {
        return item.published
      })
    }
    if (categoryId !== '') {
      posts = posts.filter((item) => {
        return item.categories.some((cat) => {
          return cat._id === categoryId
        })
      })
    }
    if (monthCode !== '') {
      posts = posts.filter((item) => {
        return item.date.format('YYYY-MM') === monthCode
      })
    }
    if (keywords !== '') {
      posts = posts.filter((item) => {
        return item.title.includes(keywords) || item.content.includes(keywords)
      })
    }
    if (tagId !== '') {
      posts = posts.filter((item) => {
        const tagData = item.tags?.data ?? []
        return tagData.some((tag: HexoTagRecord) => tag._id === tagId)
      })
    }
    results.total = posts.length

    console.log('This query posts total is: ', results.total)

    if (offset > 0) {
      posts = posts.skip(offset)
    }
    if (limit > 0) {
      posts = posts.limit(limit)
    }

    const locale = app.getSystemLocale()

    posts.each((post: HexoPostRecord) => {
      const onePost = <Post>{
        title: post.title,
        date: post.date.locale(locale).format(),
        updated: post.updated.locale(locale).format(),
        source: post.source,
        status: post.published ? 'published' : 'draft',
        layout: post.layout,
        path: post.path,
        permalink: post.permalink,
        asset_dir: post.asset_dir,
        tags: post.tags.data.reduce<Record<string, string>>((acc, tag: HexoTagRecord) => {
          acc[tag._id] = tag.name
          return acc
        }, {}),
        categories: post.categories.data.map((cat: HexoCategoryRecord) => {
          return {
            _id: cat._id,
            name: cat.name,
            parent: cat.parent,
          }
        }),
      }
      postList.push(onePost)
    })
    results.posts = postList
    return results
  }

  public async getHeatMap() {
    const postsList = await this.getPosts(true, false)

    const heatMap = postsList.posts.reduce((acc, post) => {
      const date = new Date(post.date)
      const year = String(date.getFullYear())
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      acc[dateKey] = (acc[dateKey] || 0) + 1

      return acc
    }, {})

    const heatMapArray = Object.entries(heatMap).map(([date, count]) => ({ date, count }))

    return heatMapArray
  }
  /**
   * Get all months that have posts.
   */
  public async getPostMonths(): Promise<string[]> {
    if (this.exitPromise) {
      await this.exitPromise
    }
    if (this.initPromise) {
      await this.initPromise
    }
    let posts = this.hexo.locals.get('posts')
    posts = posts.sort('date', 'desc')

    const months = new Set<string>()
    posts.each(function (post) {
      months.add(post.date.format('YYYY-MM'))
    })

    return [...months.values()]
  }

  /**
   * Get hexo site info from package.json
   */
  public getSiteInfo(): SiteInfo {
    const pkgJsonPath = join(this.rootPath, 'package.json')
    const pkgJsonData = readFileSync(pkgJsonPath, 'utf-8')
    const pkgJson = JSON.parse(pkgJsonData)
    return {
      name: pkgJson.name,
      version: pkgJson.version,
      hexoVersion: pkgJson.hexo?.version,
    }
  }

  public async getHexoConfig(): Promise<Record<string, unknown> | null> {
    if (this.exitPromise) {
      await this.exitPromise
    }
    if (this.initPromise) {
      await this.initPromise
    }
    if (typeof this.hexo === 'undefined') {
      return null
    }

    // Create a clean, serializable config object by copying only primitive values
    const config = this.hexo.config
    const cleanConfig: Record<string, unknown> = {}

    // Copy safe properties
    const safeProperties = [
      'title',
      'subtitle',
      'description',
      'keywords',
      'author',
      'language',
      'timezone',
      'url',
      'permalink',
      'date_format',
      'time_format',
      'theme',
      'source_dir',
      'public_dir',
      'tag_dir',
      'archive_dir',
      'category_dir',
      'code_dir',
      'i18n_dir',
      'per_page',
      'pagination_dir',
      'new_post_name',
      'default_layout',
    ]

    for (const prop of safeProperties) {
      if (config[prop] !== undefined) {
        cleanConfig[prop] = config[prop]
      }
    }

    return cleanConfig
  }

  /**
   * Get all categories.
   */
  public async getCategories(): Promise<Category[]> {
    console.log('HexoAgent getCategories is called.')
    if (this.exitPromise) {
      await this.exitPromise
    }
    if (this.initPromise) {
      await this.initPromise
    }
    if (typeof this.hexo === 'undefined') {
      throw new Error('Hexo instance is not initialized')
    }

    const categories = <Category[]>[]
    this.hexo.locals.get('categories').each(function (category) {
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

  /**
   * Get all tags.
   */
  public async getTags(): Promise<Tag[]> {
    console.log('HexoAgent getTags is called.')
    if (this.exitPromise) {
      await this.exitPromise
    }
    if (this.initPromise) {
      await this.initPromise
    }
    if (typeof this.hexo === 'undefined') {
      throw new Error('Hexo instance is not initialized')
    }

    const tags = <Tag[]>[]
    this.hexo.locals.get('tags').each(function (tag) {
      const t = {
        id: tag._id,
        name: tag.name,
        slug: tag.slug,
        path: tag.path,
        permalink: tag.permalink,
        length: tag.length,
      }

      tags.push(t)
    })

    return tags
  }

  /**
   * Get all assets.
   */
  public async getAssets(): Promise<Asset[]> {
    console.log('HexoAgent getAssets is called.')
    if (this.exitPromise) {
      await this.exitPromise
    }
    if (this.initPromise) {
      await this.initPromise
    }
    if (typeof this.hexo === 'undefined') {
      throw new Error('Hexo instance is not initialized')
    }

    const assets = <Asset[]>[]
    this.hexo.database.model('Asset').each(function (asset) {
      const a = {
        id: asset._id,
        path: asset.path,
        modified: asset.modified,
        renderable: asset.renderable,
        source: asset.source,
      }

      assets.push(a)
    })

    return assets
  }

  /**
   * Delete an asset file and remove its record from Hexo's database.
   * @param assetId The asset identifier (_id in Hexo DB)
   */
  public async deleteAsset(assetId: string): Promise<void> {
    if (!assetId) {
      throw new Error('Asset id cannot be empty')
    }

    if (this.exitPromise) {
      await this.exitPromise
    }
    if (this.initPromise) {
      await this.initPromise
    }
    if (typeof this.hexo === 'undefined') {
      throw new Error('Hexo instance is not initialized')
    }

    const assetModel = this.hexo.database.model('Asset')
    const asset = assetModel.get(assetId)

    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`)
    }

    const assetPath = join(this.hexo.base_dir, asset._id)

    if (!existsSync(assetPath)) {
      throw new Error(`Asset file not found: ${assetPath}`)
    }

    try {
      unlinkSync(assetPath)
      await asset.remove()
      await this.hexo.database.save()
    } catch (error) {
      console.error(`Failed to delete asset ${assetId}:`, error)
      throw error
    }

    // In certain scenarios Hexo may keep stale cache; reload if the record persists.
    if (assetModel.get(assetId)) {
      await this.hexo.load()
    }
  }

  /**
   * Read the content of a blog post by its source path
   * @param sourcePath The relative path of the post in the source directory
   * @returns The content of the post as a string
   * @throws Error if the file doesn't exist or cannot be read
   */
  public getContent(sourcePath: string): string {
    if (!sourcePath) {
      throw new Error('Source path cannot be empty')
    }

    try {
      const filePath = join(this.hexo.source_dir, sourcePath)

      if (!existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`)
      }

      const buffer = readFileSync(filePath)
      return buffer.toString()
    } catch (error) {
      console.error(`Error reading file at ${sourcePath}:`, error)
      throw error
    }
  }

  /**
   * Save content to a blog post file
   * @param sourcePath The relative path of the post in the source directory
   * @param content The content to save to the file
   * @throws Error if the file cannot be written
   */
  public async saveContent(sourcePath: string, content: string): Promise<void> {
    if (!sourcePath) {
      throw new Error('Source path cannot be empty')
    }

    if (content === undefined) {
      throw new Error('Content cannot be undefined')
    }

    try {
      console.log('Saving content to file. Path:', sourcePath, 'Content length:', content.length)

      const filePath = join(this.hexo.source_dir, sourcePath)
      const dirPath = filePath.substring(0, filePath.lastIndexOf('/'))

      // Ensure the directory exists
      if (!existsSync(dirPath)) {
        throw new Error(`Directory does not exist: ${dirPath}`)
      }

      writeFileSync(filePath, content)
      await this.updateCache()
    } catch (error) {
      console.error(`Error saving content to ${sourcePath}:`, error)
      throw error
    }
  }

  /**
   * Update Hexo cache after file changes
   * This method processes source files, reloads Hexo, and saves the database
   * @throws Error if any of the cache update operations fail
   */
  public async updateCache(): Promise<void> {
    if (!this.hexo) {
      throw new Error('Hexo instance is not initialized')
    }

    try {
      console.log('Updating Hexo cache...')
      await this.hexo.source.process()
      this.purgeNullRecords('PostCategory')
      this.purgeNullRecords('PostTag')
      await this.hexo.load()
      await this.hexo.database.save()
      console.log('Hexo cache updated successfully')
    } catch (error) {
      console.error('Failed to update Hexo cache:', error)
      throw error
    }
  }

  /**
   * Generate static files for the Hexo site
   * @throws Error if the generation process fails
   */
  public async generate(): Promise<void> {
    if (!this.hexo) {
      throw new Error('Hexo instance is not initialized')
    }

    try {
      console.log('Generating static files...')
      await this.hexo.call('generate')
      console.log('Static files generated successfully')
    } catch (error) {
      console.error('Failed to generate static files:', error)
      throw error
    }
  }

  /**
   * Delete a file from the source directory and remove it from the database
   * @param sourcePath The relative path of the file to delete
   * @throws Error if the file cannot be deleted or does not exist
   */
  public async deleteFile(sourcePath: string): Promise<void> {
    if (!sourcePath) {
      throw new Error('Source path cannot be empty')
    }

    try {
      console.log('Deleting file:', sourcePath)
      const filePath = join(this.hexo.source_dir, sourcePath)

      if (!existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`)
      }

      unlinkSync(filePath)

      // Remove from database if it's a post
      const doc = this.hexo.model('Post').findOne({ source: sourcePath })
      if (doc) {
        doc.remove()
      }

      await this.updateCache()
      console.log('File deleted successfully:', sourcePath)
    } catch (error) {
      console.error(`Error deleting file ${sourcePath}:`, error)
      throw error
    }
  }

  public async replaceCategoryForPosts(
    categoryId: string,
    sources: string[],
    replacements: CategoryPath[],
  ): Promise<BulkCategoryOperationResult> {
    if (!categoryId) {
      throw new Error('Category id cannot be empty')
    }

    await this.ensureReady()
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
      await this.updateCache()
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

    await this.ensureReady()
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
      await this.updateCache()
    }

    return result
  }

  /**
   * Create a new blog post file in the specified directory
   * @param directory The directory to create the file in ('_drafts' or '_posts')
   * @param title The title of the blog post
   * @param slug The slug for the URL (optional, will be generated from title if empty)
   * @param content The content to write to the file
   * @returns The relative path of the created file
   * @throws Error if the file cannot be created
   */
  public async createFile(
    directory: string,
    title: string,
    slug: string,
    content: string,
  ): Promise<string> {
    if (!this.hexo) {
      throw new Error('Hexo instance is not initialized')
    }

    if (!directory) {
      throw new Error('Directory cannot be empty')
    }

    if (!title) {
      throw new Error('Title cannot be empty')
    }

    try {
      console.log(
        'Creating new blog post:',
        'Directory:',
        directory,
        'Title:',
        title,
        'Slug:',
        slug || '(will be generated)',
        'Content length:',
        content?.length || 0,
      )

      const layout = directory === '_drafts' ? 'draft' : 'post'

      const data = {
        path: '',
        slug: '',
        layout,
      }

      if (slug && slug !== '') {
        data.slug = slug
      } else {
        data.slug = slugize(title.toString())
      }

      const post = await this.hexo.post.create(data, true)
      console.log('Post created:', post.path)

      const relativePath = post.path.replace(this.hexo.source_dir, '')

      if (content && content !== '') {
        await this.saveContent(relativePath, content)
      } else {
        await this.updateCache()
      }

      return relativePath
    } catch (error) {
      console.error('Error creating file:', error)
      throw error
    }
  }

  // Move file from _drafts to _posts with content
  public async moveFile(sourcePath: string, content: string): Promise<string> {
    console.log(
      'moveFile is called. sourcePath is: ',
      sourcePath,
      ' and content length is: ',
      content.length,
    )
    if (!sourcePath.startsWith('_drafts')) {
      return ''
    }
    const oldPath = join(this.hexo.source_dir, sourcePath)
    const newPath = oldPath.replace('_drafts', '_posts')
    console.log('oldPath is: ', oldPath, ' and newPath is: ', newPath)

    try {
      renameSync(oldPath, newPath)
      console.log(`Successfully moved file from ${oldPath} to ${newPath}`)
      await this.updateCache()
      return relative(this.hexo.source_dir, newPath)
    } catch (error) {
      console.error(`Error moving file from ${oldPath} to ${newPath}:`, error)
      return ''
    }
  }

  /**
   * Statistic info about the site.
   */
  public async getStats(): Promise<Stats> {
    if (this.exitPromise) {
      await this.exitPromise
    }
    if (this.initPromise) {
      await this.initPromise
    }
    const postCount = this.hexo.locals.get('posts').find({ published: true }).length
    const postDraftCount = this.hexo.locals.get('posts').find({ published: false }).length
    const pageCount = this.hexo.locals.get('pages').length
    const stats = {
      postCount,
      postDraftCount,
      pageCount,
    }

    return stats
  }
}

const agent = new HexoAgent()
export default agent
