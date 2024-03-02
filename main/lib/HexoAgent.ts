import { app } from 'electron'
import { readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'fs'
import Hexo from 'hexo'
import util from 'hexo-util'
import { join, relative } from 'path'

type HexoInstance = InstanceType<typeof Hexo>
type ConfigType = HexoInstance['config']

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

      // @ts-ignore In the latest version of Hexo, the exit parameter can be empty.
      this.exitPromise = this.hexo.exit()
    }

    this.hexo = new Hexo(this.rootPath, {
      safe: true,
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

  public static checkDir(path: string): boolean {
    try {
      const stat = statSync(path)
      return stat.isDirectory()
    } catch (error) {
      console.log('Error checking directory: ', path, ' error is:', error)

      return false
    }
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
      `Getting posts with published=${published}, draft=${isDraft}, limit=${limit}, offset=${offset}, orderBy=${orderBy}, order=${order}`,
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

  public async getHexoConfig(): Promise<ConfigType | null> {
    if (this.exitPromise) {
      await this.exitPromise
    }
    if (this.initPromise) {
      await this.initPromise
    }
    if (typeof this.hexo === 'undefined') {
      return null
    }
    return this.hexo.config
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

  public getContent(sourcePath: string): string {
    console.log('HexoAgent getContent is called. The sourcePath is: ', sourcePath)
    const filePath = join(this.hexo.source_dir, sourcePath)
    const buffer = readFileSync(filePath)
    return buffer.toString()
  }

  public async saveContent(sourcePath: string, content: string): Promise<void> {
    console.log(
      'HexoAgent saveContent is called. The sourcePath is: ',
      sourcePath,
      ' and content length is: ',
      content.length,
    )
    const filePath = join(this.hexo.source_dir, sourcePath)
    writeFileSync(filePath, content)
    await this.updateCache()
  }

  public async updateCache(): Promise<void> {
    await this.hexo.source.process()
    await this.hexo.load()
    await this.hexo.database.save()
  }

  public async deleteFile(sourcePath: string): Promise<void> {
    console.log('try to del the real file. path is: ', sourcePath)
    const filePath = join(this.hexo.source_dir, sourcePath)
    unlinkSync(filePath)
    const doc = this.hexo.model('Post').findOne({ source: sourcePath })
    if (doc) {
      doc.remove()
    }
    await this.updateCache()
  }

  // Create a new file with content in indicated directory
  // use filename if provided, otherwise use a default name
  public async createFile(
    directory: string,
    title: string,
    slug: string,
    content: string,
  ): Promise<string> {
    console.log(
      'create a new blog post. directory: ',
      directory,
      ' title: ',
      title,
      ' slug: ',
      slug,
      ' content: ',
      content,
    )
    const layout = directory === '_drafts' ? 'draft' : 'post'

    const data = {
      path: '',
      slug: '',
      layout,
    }
    if (slug !== '') {
      data.slug = slug
    } else {
      data.slug = slugize(title.toString())
    }

    const post = await this.hexo.post.create(data, true)
    console.log('hexo.post.create is called. post is: ', post)
    const relativePath = post.path.replace(this.hexo.source_dir, '')
    if (content !== '') {
      await this.saveContent(relativePath, content)
    } else {
      await this.updateCache()
    }

    return relativePath
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
    const db = this.hexo.database
    const postCount = db.model('Post').find({ published: true }).length
    const postDraftCount = db.model('Post').find({ published: false }).length
    const pageCount = db.model('Page').length
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
