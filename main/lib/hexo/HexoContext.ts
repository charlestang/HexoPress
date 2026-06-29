import { existsSync, readFileSync, statSync, writeFileSync } from 'fs'
import Hexo from 'hexo'
import { parse as parseFrontMatter, stringify as stringifyFrontMatter } from 'hexo-front-matter'
import { join } from 'path'
import { FrontMatterData } from '../postMetaUtils'
import { resolveWithin } from '../pathGuard'
import { FrontMatterDocument } from './types'

/**
 * Holds the live Hexo instance and the lifecycle/state shared by every domain
 * service (PostService, CategoryService, ...). Domain services receive a
 * HexoContext via constructor injection and operate through it instead of
 * owning the Hexo instance themselves.
 */
export class HexoContext {
  public hexo!: Hexo
  public rootPath!: string
  private initPromise?: Promise<void>
  private exitPromise?: Promise<void>

  /**
   * Wait for any pending exit/init to settle without asserting that the Hexo
   * instance is available. Mirrors the historical inline wait pattern.
   */
  public async settle(): Promise<void> {
    if (this.exitPromise) {
      await this.exitPromise
    }
    if (this.initPromise) {
      await this.initPromise
    }
  }

  /**
   * Settle pending work and assert the Hexo instance is ready to use.
   */
  public async ensureReady(): Promise<void> {
    await this.settle()
    if (typeof this.hexo === 'undefined') {
      throw new Error('Hexo instance is not initialized')
    }
  }

  public safeResolve(baseDir: string, relativePath: string): string {
    return resolveWithin(baseDir, relativePath)
  }

  public readPostFrontMatter(sourcePath: string): FrontMatterDocument {
    const filePath = this.safeResolve(this.hexo.source_dir, sourcePath)
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const raw = readFileSync(filePath, 'utf-8')
    const parsed = parseFrontMatter(raw)
    const content = typeof parsed._content === 'string' ? parsed._content : ''
    delete parsed._content

    return {
      data: parsed as FrontMatterData,
      content,
    }
  }

  public writePostFrontMatter(sourcePath: string, document: FrontMatterDocument): void {
    const filePath = this.safeResolve(this.hexo.source_dir, sourcePath)
    const payload = {
      ...document.data,
      _content: document.content,
    }
    const output = stringifyFrontMatter(payload, { prefixSeparator: true }) as string
    writeFileSync(filePath, output)
  }

  private purgeNullRecords(modelName: string): void {
    const model = this.hexo?.database?.model(modelName) as
      | { data: Record<string, unknown | null> }
      | undefined
    if (!model?.data) {
      return
    }

    Object.keys(model.data).forEach((key) => {
      if (model.data[key] == null) {
        delete model.data[key]
      }
    })
  }

  public init(rootPath: string): void {
    console.log('HexoAgent.init is called. rootPath is: ', rootPath)

    // If already initialized with the same path, skip re-initialization
    if (typeof this.hexo !== 'undefined' && this.rootPath === rootPath) {
      console.log('Hexo is already initialized with the same path. Skipping re-initialization.')
      return
    }

    this.rootPath = rootPath

    // Users can unbind the agent with previous directory and bind it with a new one.
    // In this case, we need to exit the previous hexo instance first.
    if (typeof this.hexo !== 'undefined') {
      console.log(
        'The member hexo is already initialized with a different path. Exiting old instance.',
      )

      this.exitPromise = this.hexo.exit()
    }

    this.hexo = new Hexo(this.rootPath, {
      safe: false,
      draft: true,
    })

    this.initPromise = this.hexo
      .init()
      .then(async () => {
        console.log('A new instance of Hexo is initialized with rootPath: ', this.rootPath)
        // Register a dummy renderer for markdown files to make db cache sync.
        // Must be registered BEFORE loading to avoid expensive template rendering.
        this.hexo.extend.renderer.register('md', 'html', (data) => data.text, true)

        // Custom load: skip _generate() which renders all posts through the theme
        // template engine (11+ seconds for ~467 posts). HexoPress only needs the
        // database (posts/categories/tags metadata), not generated HTML.
        const hexo = this.hexo as Hexo & {
          _binaryRelationIndex: {
            post_tag: { load: () => void }
            post_category: { load: () => void }
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const loadDatabase = require('hexo/dist/hexo/load_database')
        await loadDatabase(hexo)
        hexo._binaryRelationIndex.post_tag.load()
        hexo._binaryRelationIndex.post_category.load()
        await Promise.all([hexo.source.process(), hexo.theme.process()])
      })
      .then(() => {
        console.log('The instance of Hexo loading finished.')
      })
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

      // Rebuild binary relation indexes so tag/category counts are correct
      const hexo = this.hexo as Hexo & {
        _binaryRelationIndex: {
          post_tag: { load: () => void }
          post_category: { load: () => void }
        }
      }
      hexo._binaryRelationIndex.post_tag.load()
      hexo._binaryRelationIndex.post_category.load()

      this.purgeNullRecords('PostCategory')
      this.purgeNullRecords('PostTag')

      // Invalidate locals cache so locals.get('posts') re-reads from database
      this.hexo.locals.invalidate()

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
   * Check if the directory exists.
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
    return (
      HexoContext.checkDir(join(path, 'source')) && HexoContext.checkDir(join(path, 'scaffolds'))
    )
  }
}
