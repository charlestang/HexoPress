const Hexo = require('hexo')

class HexoAgent {
  constructor() {
    this.hexo = null
    this.hexoInitialized = false
    this.hexoDbLoaded = false
  }

  async init(rootPath) {
    this.hexo = new Hexo(rootPath, {
      safe: true
    })
    await this.hexo.init()
    this.hexoInitialized = true
    await this.hexo.load()
    this.hexoDbLoaded = true
  }

  /**
   * 获取所有的文章
   *
   * @returns {[Object]}
   */
  getPosts(event, args) {
    console.log('getPosts is called.')
    const postList = []
    const posts = this.hexo.locals.get('posts')
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
}

const agent = new HexoAgent()
module.exports = agent
