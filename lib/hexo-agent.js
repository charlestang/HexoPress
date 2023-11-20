const { app } = require('electron')
const Hexo = require('hexo')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { exec } = require('child_process')

class HexoAgent {
  constructor () {
    this.hexo = null
    this.hexoInitialized = false
    this.hexoDbLoaded = false
    this.rootPath = ''
  }

  generateSite () {
    console.log('start to generate site...')
    return new Promise((resolve, reject) => {
      exec('hexo generate', { cwd: this.rootPath }, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          reject(error)
          return
        }
        console.log('no error occurred.')
        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)
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
    orderBy = 'date',
    order = 'desc'
  ) {
    console.log(
      'HexoAgent.getPosts is called.',
      `Getting posts with published=${published}, draft=${draft}, limit=${limit}, offset=${offset}, orderBy=${orderBy}, order=${order}`
    )
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
    if (offset > 0) {
      posts = posts.skip(offset)
    }
    if (limit > 0) {
      posts = posts.limit(limit)
    }
    const locale = app.getSystemLocale()
    const aMonthAgo = moment().subtract(30, 'days')
    posts.each(function (post) {
      const publishedNear = post.date.isAfter(aMonthAgo)
      const updatedNear = post.updated.isAfter(aMonthAgo)
      const onePost = {
        title: post.title,
        date: publishedNear
          ? post.date.locale(locale).fromNow()
          : post.date.locale(locale).format('L HH:mm'),
        updated: updatedNear
          ? post.updated.locale(locale).fromNow()
          : post.updated.locale(locale).format('L HH:mm'),
        source: post.source,
        status: post.published ? 'published' : 'draft',
        layout: post.layout,
        path: post.path,
        permalink: post.permalink,
        asset_dir: post.asset_dir,
        tags: post.tags.data.reduce(function (acc, tag) {
          if (acc === '') {
            return tag.name
          } else {
            return `${acc}, ${tag.name}`
          }
        }, ''),
        categories: post.categories.data.reduce(function (acc1, cat) {
          if (acc1 === '') {
            return cat.name
          } else {
            return `${acc1}, ${cat.name}`
          }
        }, '')
      }
      postList.push(onePost)
    })
    return postList
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
    const filePath = path.join(this.hexo.source_dir, sourcePath)
    fs.unlinkSync(filePath)
    const dbPath = this.hexo.database.options.path
    console.log('dbPath is: ', dbPath, ' type is : ', typeof dbPath)
    fs.unlinkSync(dbPath)
    // only this line real delete the cache.
    this.hexo.locals.get('posts').remove({ source: sourcePath })
    this.generateSite().then(async () => {
      console.log('generate over and hexo.load called.')
      this.hexo._dbLoaded = false
      this.hexo.locals.invalidate()
      await this.hexo.database.load()
    })
  }

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
