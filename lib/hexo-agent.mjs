import { app } from 'electron'
import { readFileSync, renameSync, unlinkSync, writeFileSync } from 'fs'
import Hexo from 'hexo'
import util from 'hexo-util'
import { join, relative } from 'path'

const { slugize } = util
class HexoAgent {
  constructor() {
    this.hexo = null
    this.rootPath = ''
  }

  init(rootPath) {
    this.rootPath = rootPath
    this.hexo = new Hexo(rootPath, {
      safe: true,
      draft: true
    })
    this.initPromise = this.hexo
      .init()
      .then(() => {
        return this.hexo.load()
      })
      .then(() => {
        // register a dummy render for markdown files make db cache sync.
        this.hexo.extend.renderer.register('md', 'html', (data) => data.text, true)
      })
  }

  /**
   * Fetch all posts meet the conditions.
   *
   * @param {boolean} published
   * @param {boolean} draft
   * @param {number} limit
   * @param {number} offset
   * @param {string} orderBy
   * @param {string} order
   * @returns {Object[]}
   */
  async getPosts(
    published = true,
    draft = true,
    limit = -1,
    offset = 0,
    categoryId = '',
    monthCode = '',
    orderBy = 'date',
    order = 'desc'
  ) {
    if (this.initPromise) {
      await this.initPromise
    }
    console.log(
      'HexoAgent.getPosts is called.',
      `Getting posts with published=${published}, draft=${draft}, limit=${limit}, offset=${offset}, orderBy=${orderBy}, order=${order}`
    )
    const results = {
      total: 0,
      posts: []
    }
    const postList = []
    let posts = this.hexo.locals.get('posts')
    if (orderBy && order) {
      posts = posts.sort(orderBy, order)
    }
    if (!published) {
      posts = posts.filter((item) => {
        return !item.published
      })
    }
    if (!draft) {
      posts = posts.filter((item) => {
        return item.published
      })
    }
    if (categoryId !== '') {
      console.log(categoryId)
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
      const onePost = {
        title: post.title,
        date: post.date.locale(locale).format(),
        updated: post.updated.locale(locale).format(),
        source: post.source,
        status: post.published ? 'published' : 'draft',
        layout: post.layout,
        path: post.path,
        permalink: post.permalink,
        asset_dir: post.asset_dir,
        tags: post.tags.data.reduce(function (acc, tag) {
          acc[tag._id] = tag.name
          return acc
        }, {}),
        categories: post.categories.data.reduce(function (acc, cat) {
          acc[cat._id] = cat.name
          return acc
        }, {})
      }
      postList.push(onePost)
    })
    results.posts = postList
    return results
  }

  getSiteInfo() {
    const pkgJsonPath = join(this.rootPath, 'package.json')
    const pkgJsonData = readFileSync(pkgJsonPath, 'utf-8')
    const pkgJson = JSON.parse(pkgJsonData)
    return {
      name: pkgJson.name,
      version: pkgJson.version,
      hexoVersion: pkgJson.hexo?.version
    }
  }

  getHexoConfig() {
    return this.hexo.config
  }

  /**
   * Get all categories.
   * @returns {[Object]}
   */
  getCategories() {
    console.log('getCategories is called.')
    const categories = []
    this.hexo.locals.get('categories').each(function (category) {
      const cat = {
        id: category._id,
        parent: category.parent,
        name: category.name,
        slug: category.slug,
        path: category.path,
        permalink: category.permalink,
        length: category.length
      }
      categories.push(cat)
    })
    return categories
  }

  /**
   * Get all tags.
   * @param {*} event
   * @param {*} args
   * @returns
   */
  getTags() {
    console.log('getTags is called.')
    const tags = []
    this.hexo.locals.get('tags').each(function (tag) {
      const t = {
        id: tag._id,
        name: tag.name,
        slug: tag.slug,
        path: tag.path,
        permalink: tag.permalink,
        length: tag.length
      }

      tags.push(t)
    })

    return tags
  }

  /**
   * 获取一篇文章的内容
   * @param {string} sourcePath
   * @returns
   */
  getContent(sourcePath) {
    console.log('getContent is called.')
    console.log('path is: ', sourcePath)
    const filePath = join(this.hexo.source_dir, sourcePath)
    const buffer = readFileSync(filePath)
    return buffer.toString()
  }

  async saveContent(sourcePath, content) {
    console.log('saveContent is called.')
    console.log('path is: ', sourcePath, ' content length is: ', content.length)
    const filePath = join(this.hexo.source_dir, sourcePath)
    writeFileSync(filePath, content)
    await this.updateCache()
  }

  async updateCache() {
    await this.hexo.source.process()
    await this.hexo.load()
    await this.hexo.database.save()
  }

  async deleteFile(sourcePath) {
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
  async createFile(directory, title, slug, content) {
    console.log(
      'create a new blog post. directory: ',
      directory,
      ' title: ',
      title,
      ' slug: ',
      slug,
      ' content: ',
      content
    )
    const layout = directory === '_drafts' ? 'draft' : 'post'

    const data = {
      path: '.',
      slug: '',
      layout
    }
    if (slug !== '') {
      data.slug = slug
    } else {
      data.slug = slugize(title.toString())
      data.path = slug
    }

    const post = await this.hexo.post.create(data, true)
    console.log('hexo.post.create is called. post is: ', post)
    const relativePath = post.path.replace(this.hexo.source_dir, '')
    if (content !== '') {
      this.saveContent(relativePath, content)
    }

    await this.updateCache()
    return relativePath
  }

  // Move file from _drafts to _posts with content
  async moveFile(sourcePath, content) {
    console.log(
      'moveFile is called. sourcePath is: ',
      sourcePath,
      ' and content length is: ',
      content.length
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
   * @returns
   */
  async getStats() {
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
      pageCount
    }

    return stats
  }

  /**
   * Get the config of the site.
   * @returns
   */
  getConfig() {
    return this.hexo.config
  }
}

const agent = new HexoAgent()
export default agent
