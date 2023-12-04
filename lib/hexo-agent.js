const { app } = require('electron')
const Hexo = require('hexo')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const yaml = require('js-yaml')
const { slugize } = require('hexo-util')

class HexoAgent {
  constructor () {
    this.hexo = null
    this.hexoInitialized = false
    this.hexoDbLoaded = false
    this.rootPath = ''
  }

  generateSite () {
    return new Promise((resolve, reject) => {
      exec('hexo generate', { cwd: this.rootPath }, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          reject(error)
          return
        }
        resolve(stdout)
      })
    })
  }

  async init (rootPath) {
    this.rootPath = rootPath
    this.hexo = new Hexo(rootPath, {
      safe: true,
      draft: true
    })
    await this.hexo.init()
    this.hexoInitialized = true
    await this.hexo.load()
    // register a dummy render for markdown files make db cache sync.
    this.hexo.extend.renderer.register('md', 'html', (data) => data.text, true)
    this.hexoDbLoaded = true
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
  getPosts (
    published = true,
    draft = true,
    limit = -1,
    offset = 0,
    categoryId = '',
    monthCode = '',
    orderBy = 'date',
    order = 'desc'
  ) {
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
      posts = posts.filter((item, index) => {
        return !item.published
      })
    }
    if (!draft) {
      posts = posts.filter((item, index) => {
        return item.published
      })
    }
    if (categoryId !== '') {
      console.log(categoryId)
      posts = posts.filter((item, index) => {
        return item.categories.some((cat, index) => {
          return cat._id === categoryId
        })
      })
    }
    if (monthCode !== '') {
      posts = posts.filter((item, index) => {
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

  getSiteInfo () {
    const pkgJson = require(path.join(this.rootPath, 'package.json'))
    return {
      name: pkgJson.name,
      version: pkgJson.version,
      hexoVersion: pkgJson.hexo.version
    }
  }

  getHexoConfig () {
    const configFile = path.join(this.rootPath, '_config.yml')
    // read config file and parse it as a js plain object and return it.
    try {
      const fileContents = fs.readFileSync(configFile, 'utf8')
      const data = yaml.load(fileContents)

      return {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        keywords: data.keywords,
        author: data.author,
        language: data.language,
        timezone: data.timezone,
        url: data.url,
        permalink: data.permalink,
        date_format: data.date_format,
        time_format: data.time_format
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  /**
   * 获取所有的分类
   * @returns {[Object]}
   */
  getCategories (event, args) {
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
   * 获取所有的标签
   * @param {*} event
   * @param {*} args
   * @returns
   */
  getTags (event, args) {
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
  getContent (sourcePath) {
    console.log('getContent is called.')
    console.log('path is: ', sourcePath)
    const filePath = path.join(this.hexo.source_dir, sourcePath)
    const buffer = fs.readFileSync(filePath)
    return buffer.toString()
  }

  saveContent (sourcePath, content) {
    console.log('saveContent is called.')
    console.log('path is: ', sourcePath, ' content length is: ', content.length)
    const filePath = path.join(this.hexo.source_dir, sourcePath)
    fs.writeFileSync(filePath, content)
  }

  async deleteFile (sourcePath) {
    console.log('try to del the real file. path is: ', sourcePath)
    const filePath = path.join(this.hexo.source_dir, sourcePath)
    fs.unlinkSync(filePath)
    const doc = this.hexo.model('Post').findOne({ source: sourcePath })
    if (doc) {
      doc.remove()
    }
    await this.hexo.load(() => {
      console.log('hexo load call finished.')
    })
  }

  // Create a new file with content in indicated directory
  // use filename if provided, otherwise use a default name
  async createFile (directory, title, slug, content) {
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
    const relativePath = post.path.replace(this.hexo.source_dir, '')
    if (content !== '') {
      this.saveContent(relativePath, content)
    }

    await this.hexo.source.process()
    await this.hexo.load(() => {
      console.log('hexo load call finished.')
    })
    return relativePath
  }

  // Move file from _drafts to _posts with content
  moveFile (sourcePath, content) {}

  /**
   * 获取统计信息
   * @returns
   */
  getStats () {
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
   * 获取站点配置信息
   * @returns
   */
  getConfig () {
    return this.hexo.config
  }
}

const agent = new HexoAgent()
module.exports = agent
