import { existsSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'fs'
import util from 'hexo-util'
import { dirname, relative } from 'path'
import { buildPostMeta, preparePostMeta } from '../postMetaUtils'
import { HexoContext } from './HexoContext'
import { HexoCategoryRecord, HexoPostRecord, HexoTagRecord } from './types'

const { slugize } = util

/**
 * Post-centric operations: querying posts, reading/writing post documents and
 * raw content, and creating/moving/deleting post files.
 */
export class PostService {
  constructor(private readonly ctx: HexoContext) {}

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
    await this.ctx.settle()

    console.log(
      'HexoAgent.getPosts is called.',
      `Getting posts with published=${published}, draft=${isDraft}, limit=${limit}, offset=${offset}, keywords=${keywords}, tagId=${tagId}, orderBy=${orderBy}, order=${order}`,
    )
    const results = {
      total: 0,
      posts: <Post[]>[],
    }
    const postList = <Post[]>[]

    let posts = this.ctx.hexo.locals.get('posts')

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

    const locale = Intl.DateTimeFormat().resolvedOptions().locale

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
    await this.ctx.settle()
    let posts = this.ctx.hexo.locals.get('posts')
    posts = posts.sort('date', 'desc')

    const months = new Set<string>()
    posts.each(function (post) {
      months.add(post.date.format('YYYY-MM'))
    })

    return [...months.values()]
  }

  public async getPostMeta(sourcePath: string): Promise<PostMeta> {
    await this.ctx.ensureReady()
    const document = this.ctx.readPostFrontMatter(sourcePath)
    return buildPostMeta(document.data)
  }

  public async updatePostMeta(sourcePath: string, meta: PostMeta): Promise<void> {
    await this.ctx.ensureReady()
    const document = this.ctx.readPostFrontMatter(sourcePath)
    const nextData = preparePostMeta(meta)
    this.ctx.writePostFrontMatter(sourcePath, {
      data: nextData,
      content: document.content,
    })
    await this.ctx.updateCache()
  }

  public async getPostDocument(sourcePath: string): Promise<PostDocument> {
    await this.ctx.ensureReady()
    const document = this.ctx.readPostFrontMatter(sourcePath)
    return {
      meta: buildPostMeta(document.data),
      content: document.content,
    }
  }

  public async savePostDocument(sourcePath: string, document: PostDocument): Promise<void> {
    await this.ctx.ensureReady()
    const nextData = preparePostMeta(document.meta)
    this.ctx.writePostFrontMatter(sourcePath, {
      data: nextData,
      content: document.content,
    })
    await this.ctx.updateCache()
  }

  /**
   * Read the content of a blog post by its source path
   */
  public getContent(sourcePath: string): string {
    if (!sourcePath) {
      throw new Error('Source path cannot be empty')
    }

    try {
      const filePath = this.ctx.safeResolve(this.ctx.hexo.source_dir, sourcePath)

      if (!existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`)
      }

      const buffer = readFileSync(filePath)
      return buffer.toString()
    } catch (error) {
      console.error('Error reading file at:', sourcePath, error)
      throw error
    }
  }

  /**
   * Save content to a blog post file
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

      const filePath = this.ctx.safeResolve(this.ctx.hexo.source_dir, sourcePath)
      const dirPath = dirname(filePath)

      // Ensure the directory exists
      if (!existsSync(dirPath)) {
        throw new Error(`Directory does not exist: ${dirPath}`)
      }

      writeFileSync(filePath, content)
      await this.ctx.updateCache()
    } catch (error) {
      console.error('Error saving content to:', sourcePath, error)
      throw error
    }
  }

  /**
   * Delete a file from the source directory and remove it from the database
   */
  public async deleteFile(sourcePath: string): Promise<void> {
    if (!sourcePath) {
      throw new Error('Source path cannot be empty')
    }

    try {
      console.log('Deleting file:', sourcePath)
      const filePath = this.ctx.safeResolve(this.ctx.hexo.source_dir, sourcePath)

      if (!existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`)
      }

      unlinkSync(filePath)

      // Remove from database if it's a post
      const doc = this.ctx.hexo.model('Post').findOne({ source: sourcePath })
      if (doc) {
        doc.remove()
      }

      await this.ctx.updateCache()
      console.log('File deleted successfully:', sourcePath)
    } catch (error) {
      console.error('Error deleting file:', sourcePath, error)
      throw error
    }
  }

  /**
   * Create a new blog post file in the specified directory
   */
  public async createFile(
    directory: string,
    title: string,
    slug: string,
    content: string,
  ): Promise<string> {
    if (!this.ctx.hexo) {
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
        title,
        path: '',
        slug: '',
        layout,
      }

      if (slug && slug !== '') {
        data.slug = slug
      } else {
        data.slug = slugize(title.toString())
      }

      const post = await this.ctx.hexo.post.create(data, true)
      console.log('Post created:', post.path)

      const relativePath = post.path.replace(this.ctx.hexo.source_dir, '')

      if (content && content.trim().length > 0) {
        await this.saveContent(relativePath, content)
      } else {
        await this.ctx.updateCache()
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
    const oldPath = this.ctx.safeResolve(this.ctx.hexo.source_dir, sourcePath)
    const newPath = oldPath.replace('_drafts', '_posts')
    console.log('oldPath is: ', oldPath, ' and newPath is: ', newPath)

    try {
      renameSync(oldPath, newPath)
      console.log('Successfully moved file from', oldPath, 'to', newPath)
      await this.ctx.updateCache()
      return relative(this.ctx.hexo.source_dir, newPath)
    } catch (error) {
      console.error('Error moving file from', oldPath, 'to', newPath, error)
      return ''
    }
  }
}
