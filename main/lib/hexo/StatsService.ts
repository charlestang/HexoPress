import { readFileSync } from 'fs'
import { join } from 'path'
import { HexoContext } from './HexoContext'

/**
 * Site-level read operations: package info, Hexo config and aggregate stats.
 */
export class StatsService {
  constructor(private readonly ctx: HexoContext) {}

  /**
   * Get hexo site info from package.json
   */
  public getSiteInfo(): SiteInfo {
    const pkgJsonPath = join(this.ctx.rootPath, 'package.json')
    const pkgJsonData = readFileSync(pkgJsonPath, 'utf-8')
    const pkgJson = JSON.parse(pkgJsonData)
    return {
      basePath: this.ctx.rootPath,
      name: pkgJson.name,
      version: pkgJson.version,
      hexoVersion: pkgJson.hexo?.version,
    }
  }

  public async getHexoConfig(): Promise<HexoConfig> {
    await this.ctx.settle()
    if (typeof this.ctx.hexo === 'undefined') {
      return null
    }

    // Create a clean, serializable config object by copying only primitive values
    const config = this.ctx.hexo.config
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
      'root',
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

    const rawRoot = typeof cleanConfig.root === 'string' ? cleanConfig.root : '/'
    cleanConfig.root = rawRoot || '/'

    return cleanConfig as HexoConfig
  }

  /**
   * Statistic info about the site.
   */
  public async getStats(): Promise<Stats> {
    await this.ctx.settle()
    const postCount = this.ctx.hexo.locals.get('posts').find({ published: true }).length
    const postDraftCount = this.ctx.hexo.locals.get('posts').find({ published: false }).length
    const pageCount = this.ctx.hexo.locals.get('pages').length
    const stats = {
      postCount,
      postDraftCount,
      pageCount,
    }

    return stats
  }
}
