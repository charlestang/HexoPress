import { CategoryPath } from './postMetaUtils'
import { AssetService } from './hexo/AssetService'
import { CategoryService } from './hexo/CategoryService'
import { HexoContext } from './hexo/HexoContext'
import { PostService } from './hexo/PostService'
import { StatsService } from './hexo/StatsService'
import { TagService } from './hexo/TagService'
import { BulkCategoryOperationResult } from './hexo/types'

/**
 * Facade over the Hexo domain services. The public surface here is the source
 * of truth for the `ISite` contract consumed by the IPC / Web bridge layers, so
 * method signatures must stay stable. Each method simply delegates to the
 * appropriate domain service, which shares state through a single HexoContext.
 */
export class HexoAgent {
  private readonly ctx = new HexoContext()
  private readonly posts = new PostService(this.ctx)
  private readonly categories = new CategoryService(this.ctx)
  private readonly tags = new TagService(this.ctx)
  private readonly assets = new AssetService(this.ctx)
  private readonly stats = new StatsService(this.ctx)

  // ----- Lifecycle -----

  public init(rootPath: string): void {
    this.ctx.init(rootPath)
  }

  public async updateCache(): Promise<void> {
    return this.ctx.updateCache()
  }

  public async generate(): Promise<void> {
    return this.ctx.generate()
  }

  public static checkDir(path: string): boolean {
    return HexoContext.checkDir(path)
  }

  public static checkHexoDir(path: string): boolean {
    return HexoContext.checkHexoDir(path)
  }

  // ----- Posts -----

  public getPosts(
    published?: boolean,
    isDraft?: boolean,
    limit?: number,
    offset?: number,
    categoryId?: string,
    monthCode?: string,
    keywords?: string,
    tagId?: string,
    orderBy?: string,
    order?: string,
  ): Promise<PostsResults> {
    return this.posts.getPosts(
      published,
      isDraft,
      limit,
      offset,
      categoryId,
      monthCode,
      keywords,
      tagId,
      orderBy,
      order,
    )
  }

  public getHeatMap() {
    return this.posts.getHeatMap()
  }

  public getPostMonths(): Promise<string[]> {
    return this.posts.getPostMonths()
  }

  public getPostMeta(sourcePath: string): Promise<PostMeta> {
    return this.posts.getPostMeta(sourcePath)
  }

  public updatePostMeta(sourcePath: string, meta: PostMeta): Promise<void> {
    return this.posts.updatePostMeta(sourcePath, meta)
  }

  public getPostDocument(sourcePath: string): Promise<PostDocument> {
    return this.posts.getPostDocument(sourcePath)
  }

  public savePostDocument(sourcePath: string, document: PostDocument): Promise<void> {
    return this.posts.savePostDocument(sourcePath, document)
  }

  public getContent(sourcePath: string): string {
    return this.posts.getContent(sourcePath)
  }

  public saveContent(sourcePath: string, content: string): Promise<void> {
    return this.posts.saveContent(sourcePath, content)
  }

  public createFile(
    directory: string,
    title: string,
    slug: string,
    content: string,
  ): Promise<string> {
    return this.posts.createFile(directory, title, slug, content)
  }

  public moveFile(sourcePath: string, content: string): Promise<string> {
    return this.posts.moveFile(sourcePath, content)
  }

  public deleteFile(sourcePath: string): Promise<void> {
    return this.posts.deleteFile(sourcePath)
  }

  // ----- Categories -----

  public getCategories(): Promise<Category[]> {
    return this.categories.getCategories()
  }

  public replaceCategoryForPosts(
    categoryId: string,
    sources: string[],
    replacements: CategoryPath[],
  ): Promise<BulkCategoryOperationResult> {
    return this.categories.replaceCategoryForPosts(categoryId, sources, replacements)
  }

  public removeCategoryFromPosts(
    categoryId: string,
    sources: string[],
  ): Promise<BulkCategoryOperationResult> {
    return this.categories.removeCategoryFromPosts(categoryId, sources)
  }

  // ----- Tags -----

  public getTags(): Promise<Tag[]> {
    return this.tags.getTags()
  }

  public removeTagFromPost(sourcePath: string, tagId: string): Promise<void> {
    return this.tags.removeTagFromPost(sourcePath, tagId)
  }

  // ----- Assets -----

  public getAssets(): Promise<Asset[]> {
    return this.assets.getAssets()
  }

  public deleteAsset(assetId: string): Promise<void> {
    return this.assets.deleteAsset(assetId)
  }

  // ----- Site / Stats -----

  public getSiteInfo(): SiteInfo {
    return this.stats.getSiteInfo()
  }

  public getHexoConfig(): Promise<HexoConfig> {
    return this.stats.getHexoConfig()
  }

  public getStats(): Promise<Stats> {
    return this.stats.getStats()
  }
}

const agent = new HexoAgent()
export default agent
