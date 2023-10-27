const Hexo = require('hexo')
const fs = require('fs')
const path = require('path')

class HexoAgent {
  constructor() {
    this.hexo = null
    this.hexoInitialized = false
    this.hexoDbLoaded = false
  }

  async init(rootPath) {
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
   * 获取所有的文章
   *
   * @param {boolean} draft
   * @param {number} limit
   * @param {number} offset
   * @param {string} orderBy
   * @param {string} order
   * @returns
   */
  getPosts(draft = true, limit = -1, offset = 0, orderBy = 'date', order = 'desc') {
    console.log(
      'HexoAgent.getPosts is called.',
      `Getting posts with draft=${draft}, limit=${limit}, offset=${offset}, orderBy=${orderBy}, order=${order}`
    )
    const postList = []
    let posts = this.hexo.locals.get('posts')
    if (orderBy && order) {
      posts = posts.sort(orderBy, order)
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
    posts.each(function (post) {
      const onePost = {
        title: post.title,
        date: post.date.format(),
        updated: post.updated.format(),
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
  getCategories(event, args) {
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
  getTags(event, args) {
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
    const filePath = path.join(this.hexo.source_dir, sourcePath)
    const buffer = fs.readFileSync(filePath)
    return buffer.toString()
  }

  /**
   * 获取统计信息
   * @returns
   */
  getStats() {
    const db = this.hexo.database
    const postCount = db.model('Post').length
    const pageCount = db.model('Page').length
    const stats = {
      postCount: postCount,
      pageCount: pageCount
    }

    return stats
  }
}

const agent = new HexoAgent()
module.exports = agent
