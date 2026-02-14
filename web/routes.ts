import type { FastifyInstance, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { Buffer } from 'node:buffer'
import type { HexoAgent } from '../main/lib/HexoAgent'
import type { FsAgent } from '../main/lib/FsAgent'
import type { WebConfig } from './config'

type RouteOpts = {
  agent: HexoAgent
  fsAgent: FsAgent
  config: WebConfig
}

async function routesPlugin(fastify: FastifyInstance, opts: RouteOpts) {
  const { agent, fsAgent, config } = opts

  // ─── Agent lifecycle ───────────────────────────────────────────────

  // POST /api/agent/init
  // In web mode, always uses the configured hexoDir (ignores client path param)
  fastify.post('/api/agent/init', async () => {
    const { HexoAgent: HexoAgentClass } = await import('../main/lib/HexoAgent')
    const check =
      HexoAgentClass.checkDir(config.hexoDir) && HexoAgentClass.checkHexoDir(config.hexoDir)
    if (check) {
      agent.init(config.hexoDir)
      fsAgent.init(config.hexoDir)
    }
    return check
  })

  // ─── Site data queries (GET) ───────────────────────────────────────

  // GET /api/site/posts
  fastify.get('/api/site/posts', async (request: FastifyRequest) => {
    const q = request.query as Record<string, string | undefined>
    const published = q.published !== 'false'
    const draft = q.draft !== 'false'
    const limit = q.limit ? parseInt(q.limit, 10) : -1
    const offset = q.offset ? parseInt(q.offset, 10) : 0
    const categoryId = q.categoryId ?? ''
    const monthCode = q.monthCode ?? ''
    const keywords = q.keywords ?? ''
    const tagId = q.tagId ?? ''
    const orderBy = q.orderBy ?? 'date'
    const order = q.order ?? 'desc'
    return agent.getPosts(
      published,
      draft,
      limit,
      offset,
      categoryId,
      monthCode,
      keywords,
      tagId,
      orderBy,
      order,
    )
  })

  // GET /api/site/postMonths
  fastify.get('/api/site/postMonths', async () => {
    return agent.getPostMonths()
  })

  // GET /api/site/categories
  fastify.get('/api/site/categories', async () => {
    return agent.getCategories()
  })

  // GET /api/site/tags
  fastify.get('/api/site/tags', async () => {
    return agent.getTags()
  })

  // GET /api/site/assets
  fastify.get('/api/site/assets', async () => {
    return agent.getAssets()
  })

  // GET /api/site/stats
  fastify.get('/api/site/stats', async () => {
    return agent.getStats()
  })

  // GET /api/site/info
  fastify.get('/api/site/info', async () => {
    return agent.getSiteInfo()
  })

  // GET /api/site/heatMap
  fastify.get('/api/site/heatMap', async () => {
    return agent.getHeatMap()
  })

  // POST /api/site/refresh
  fastify.post('/api/site/refresh', async () => {
    await agent.updateCache()
    return { ok: true }
  })

  // GET /api/site/hexoConfig
  fastify.get('/api/site/hexoConfig', async () => {
    return agent.getHexoConfig()
  })

  // ─── Post operations ───────────────────────────────────────────────

  // GET /api/post/content?path=...
  fastify.get('/api/post/content', async (request: FastifyRequest) => {
    const q = request.query as { path?: string }
    if (!q.path) {
      throw { statusCode: 400, message: 'Query param "path" is required' }
    }
    return agent.getContent(q.path)
  })

  // POST /api/post/save
  fastify.post('/api/post/save', async (request: FastifyRequest) => {
    const body = request.body as { path: string; content: string }
    await agent.saveContent(body.path, body.content)
    return { ok: true }
  })

  // POST /api/post/create
  fastify.post('/api/post/create', async (request: FastifyRequest) => {
    const body = request.body as { type: string; title: string; slug: string; content: string }
    const relativePath = await agent.createFile(body.type, body.title, body.slug, body.content)
    return { path: relativePath }
  })

  // POST /api/post/move
  fastify.post('/api/post/move', async (request: FastifyRequest) => {
    const body = request.body as { sourcePath: string; content: string }
    const newPath = await agent.moveFile(body.sourcePath, body.content)
    return { path: newPath }
  })

  // POST /api/post/delete
  fastify.post('/api/post/delete', async (request: FastifyRequest) => {
    const body = request.body as { path: string }
    await agent.deleteFile(body.path)
    return { ok: true }
  })

  // GET /api/post/meta?path=...
  fastify.get('/api/post/meta', async (request: FastifyRequest) => {
    const q = request.query as { path?: string }
    if (!q.path) {
      throw { statusCode: 400, message: 'Query param "path" is required' }
    }
    return agent.getPostMeta(q.path)
  })

  // POST /api/post/updateMeta
  fastify.post('/api/post/updateMeta', async (request: FastifyRequest) => {
    const body = request.body as { path: string; meta: PostMeta }
    await agent.updatePostMeta(body.path, body.meta)
    return { ok: true }
  })

  // GET /api/post/document?path=...
  fastify.get('/api/post/document', async (request: FastifyRequest) => {
    const q = request.query as { path?: string }
    if (!q.path) {
      throw { statusCode: 400, message: 'Query param "path" is required' }
    }
    return agent.getPostDocument(q.path)
  })

  // POST /api/post/saveDocument
  fastify.post('/api/post/saveDocument', async (request: FastifyRequest) => {
    const body = request.body as { path: string; document: PostDocument }
    await agent.savePostDocument(body.path, body.document)
    return { ok: true }
  })

  // POST /api/post/removeTag
  fastify.post('/api/post/removeTag', async (request: FastifyRequest) => {
    const body = request.body as { sourcePath: string; tagId: string }
    await agent.removeTagFromPost(body.sourcePath, body.tagId)
    return { ok: true }
  })

  // ─── Asset operations ──────────────────────────────────────────────

  // POST /api/site/assetDelete
  fastify.post('/api/site/assetDelete', async (request: FastifyRequest) => {
    const body = request.body as { assetId: string }
    await agent.deleteAsset(body.assetId)
    return { ok: true }
  })

  // ─── Category operations ───────────────────────────────────────────

  // POST /api/category/replaceAssignments
  fastify.post('/api/category/replaceAssignments', async (request: FastifyRequest) => {
    const body = request.body as {
      categoryId: string
      sources: string[]
      replacements: string[][]
    }
    return agent.replaceCategoryForPosts(body.categoryId, body.sources, body.replacements)
  })

  // POST /api/category/bulkRemove
  fastify.post('/api/category/bulkRemove', async (request: FastifyRequest) => {
    const body = request.body as { categoryId: string; sources: string[] }
    return agent.removeCategoryFromPosts(body.categoryId, body.sources)
  })

  // ─── File system operations ────────────────────────────────────────

  // GET /api/fs/readdir?path=...
  fastify.get('/api/fs/readdir', async (request: FastifyRequest) => {
    const q = request.query as { path?: string }
    return fsAgent.readdir(q.path ?? '')
  })

  // POST /api/fs/mv
  fastify.post('/api/fs/mv', async (request: FastifyRequest) => {
    const body = request.body as { from: string; to: string }
    const result = await fsAgent.mv(body.from, body.to)
    return result
  })

  // POST /api/fs/saveImage
  // Accepts base64-encoded content in JSON body, converts to Buffer
  fastify.post('/api/fs/saveImage', async (request: FastifyRequest) => {
    const body = request.body as { path: string; content: string }
    const buffer = Buffer.from(body.content, 'base64')
    await fsAgent.saveImage(body.path, buffer)
    await agent.generate()
    return { ok: true }
  })

  // GET /api/fs/fileInfo?path=...
  fastify.get('/api/fs/fileInfo', async (request: FastifyRequest) => {
    const q = request.query as { path?: string }
    if (!q.path) {
      throw { statusCode: 400, message: 'Query param "path" is required' }
    }
    return fsAgent.getFileInfo(q.path)
  })

  // GET /api/fs/assetReferences?path=...
  fastify.get('/api/fs/assetReferences', async (request: FastifyRequest) => {
    const q = request.query as { path?: string }
    if (!q.path) {
      throw { statusCode: 400, message: 'Query param "path" is required' }
    }
    return fsAgent.findAssetReferences(q.path)
  })

  // ─── Web-mode stubs (not applicable in server context) ─────────────

  // GET /api/dialog/dir - not supported in web mode
  fastify.get('/api/dialog/dir', async () => {
    return { canceled: true, filePaths: [] }
  })

  // GET /api/sys/locale - return default
  fastify.get('/api/sys/locale', async () => {
    return 'en'
  })

  // GET /api/dark/get - no-op on server, handled client-side
  fastify.get('/api/dark/get', async () => {
    return 'light'
  })

  // POST /api/dark/set - no-op on server, handled client-side
  fastify.post('/api/dark/set', async () => {
    return { ok: true }
  })

  // POST /api/shell/openUrl - not supported in web mode
  fastify.post('/api/shell/openUrl', async () => {
    return { ok: true }
  })
}

export default fp(routesPlugin, {
  name: 'hexopress-routes',
})
