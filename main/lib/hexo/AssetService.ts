import { existsSync, unlinkSync } from 'fs'
import { HexoContext } from './HexoContext'

/**
 * Asset-centric operations: listing media assets and deleting an asset along
 * with its Hexo database record.
 */
export class AssetService {
  constructor(private readonly ctx: HexoContext) {}

  /**
   * Get all assets.
   */
  public async getAssets(): Promise<Asset[]> {
    console.log('HexoAgent getAssets is called.')
    await this.ctx.ensureReady()

    const assets = <Asset[]>[]
    this.ctx.hexo.database.model('Asset').each(function (asset) {
      const a = {
        id: asset._id,
        path: asset.path,
        modified: asset.modified,
        renderable: asset.renderable,
        source: asset.source,
      }

      assets.push(a)
    })

    return assets
  }

  /**
   * Delete an asset file and remove its record from Hexo's database.
   * @param assetId The asset identifier (_id in Hexo DB)
   */
  public async deleteAsset(assetId: string): Promise<void> {
    if (!assetId) {
      throw new Error('Asset id cannot be empty')
    }

    await this.ctx.ensureReady()

    const assetModel = this.ctx.hexo.database.model('Asset')
    const asset = assetModel.get(assetId)

    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`)
    }

    const assetPath = this.ctx.safeResolve(this.ctx.hexo.base_dir, asset._id)

    if (!existsSync(assetPath)) {
      throw new Error(`Asset file not found: ${assetPath}`)
    }

    try {
      unlinkSync(assetPath)
      await asset.remove()
      await this.ctx.hexo.database.save()
    } catch (error) {
      console.error('Failed to delete asset:', assetId, error)
      throw error
    }

    // In certain scenarios Hexo may keep stale cache; reload if the record persists.
    if (assetModel.get(assetId)) {
      await this.ctx.hexo.load()
    }
  }
}
