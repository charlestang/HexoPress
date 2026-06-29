import { buildPostMeta, preparePostMeta } from '../postMetaUtils'
import { HexoContext } from './HexoContext'
import { HexoTagRecord } from './types'

/**
 * Tag-centric operations: listing tags and detaching a tag from a post.
 */
export class TagService {
  constructor(private readonly ctx: HexoContext) {}

  /**
   * Get all tags.
   */
  public async getTags(): Promise<Tag[]> {
    console.log('HexoAgent getTags is called.')
    await this.ctx.ensureReady()

    const tags = <Tag[]>[]
    this.ctx.hexo.locals.get('tags').each(function (tag) {
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

  public async removeTagFromPost(sourcePath: string, tagId: string): Promise<void> {
    if (!sourcePath) {
      throw new Error('Source path cannot be empty')
    }
    if (!tagId) {
      throw new Error('Tag id cannot be empty')
    }

    await this.ctx.ensureReady()
    const tagModel = this.ctx.hexo.database.model('Tag')
    const tag = tagModel.findById(tagId, { lean: true }) as HexoTagRecord | undefined

    if (!tag) {
      throw new Error(`Tag not found: ${tagId}`)
    }

    const document = this.ctx.readPostFrontMatter(sourcePath)
    const meta = buildPostMeta(document.data)
    const currentTags = meta.tags ?? []
    const filtered = currentTags.filter((value) => value !== tag.name)

    if (filtered.length === currentTags.length) {
      return
    }

    meta.tags = filtered.length > 0 ? filtered : undefined
    const nextData = preparePostMeta(meta)
    this.ctx.writePostFrontMatter(sourcePath, {
      data: nextData,
      content: document.content,
    })
    await this.ctx.updateCache()
  }
}
