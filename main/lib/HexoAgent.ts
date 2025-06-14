import { app } from 'electron'
import { existsSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'fs'
import Hexo from 'hexo'
import util from 'hexo-util'
import { join, relative } from 'path'

const { slugize } = util
export class HexoAgent {
  private hexo!: Hexo
  private rootPath!: string
  private initPromise?: Promise<void>
  private exitPromise?: Promise<void>

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
      `Getting posts with published=${published}, draft=${isDraft}, limit=${limit}, offset=${offset}, keywords=${keywords}, orderBy=${orderBy}, order=${order}`,
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
    results.total = posts.length

    console.log('This query posts total is: ', results.total)

    if (offset > 0) {
      posts = posts.skip(offset)
    }
    if (limit > 0) {
      posts = posts.limit(limit)
    }

    const locale = app.getSystemLocale()

    posts.each(function (post) {
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
        tags: post.tags.data.reduce(function (acc: object, tag) {
          acc[tag._id] = tag.name
          return acc
        }, {}),
        categories: post.categories.data.reduce(function (acc: object, cat) {
          acc[cat._id] = cat.name
          return acc
        }, {}),
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
      'title', 'subtitle', 'description', 'keywords', 'author', 'language',
      'timezone', 'url', 'permalink', 'date_format', 'time_format', 'theme',
      'source_dir', 'public_dir', 'tag_dir', 'archive_dir', 'category_dir',
      'code_dir', 'i18n_dir', 'per_page', 'pagination_dir', 'new_post_name',
      'default_layout'
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
  public getCategories() {
    console.log('HexoAgent getCategories is called.')
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
  public getTags() {
    console.log('HexoAgent getTags is called.')
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
  public getAssets() {
    console.log('HexoAgent getAssets is called.')
    const assets = <object[]>[]
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
