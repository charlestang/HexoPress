import Module from 'node:module'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import Fastify from 'fastify'
import rateLimit from '@fastify/rate-limit'
import fastifyStatic from '@fastify/static'
import { loadConfig } from './config'
import authPlugin from './auth'
import routesPlugin from './routes'

// ─── CJS/ESM interop fix ────────────────────────────────────────────
// Some npm packages (e.g. hexo-util) set __esModule: true but have no
// default export, which breaks esbuild's CJS interop.
/* eslint-disable @typescript-eslint/no-explicit-any */
const originalLoad = (Module as any)._load
;(Module as any)._load = function (request: string, parent: any, isMain: boolean) {
  const result = originalLoad.call(this, request, parent, isMain)
  if (
    result &&
    result.__esModule &&
    !('default' in result) &&
    (request === 'hexo-util' || request.startsWith('hexo-'))
  ) {
    result.default = result
  }
  return result
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── Parse CLI args ──────────────────────────────────────────────────
const args = process.argv.slice(2)
const isDev = args.includes('--dev')

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  const config = loadConfig()

  console.log(`HexoPress Web Server starting...`)
  console.log(`  Hexo directory: ${config.hexoDir}`)
  console.log(`  Port: ${config.port}`)
  console.log(`  Dev mode: ${isDev}`)

  // Import agents after the electron shim is in place
  const { default: agent } = await import('../main/lib/HexoAgent')
  const { default: fsAgent } = await import('../main/lib/FsAgent')
  const { HexoAgent } = await import('../main/lib/HexoAgent')

  // Validate and initialize
  if (!HexoAgent.checkDir(config.hexoDir) || !HexoAgent.checkHexoDir(config.hexoDir)) {
    console.error(`Invalid Hexo directory: ${config.hexoDir}`)
    console.error('Ensure the directory exists and contains "source/" and "scaffolds/" folders.')
    process.exit(1)
  }

  agent.init(config.hexoDir)
  fsAgent.init(config.hexoDir)

  // Create Fastify instance
  const app = Fastify({
    logger: {
      level: isDev ? 'info' : 'warn',
    },
    bodyLimit: 50 * 1024 * 1024, // 50MB for image uploads
  })

  // Register auth plugin
  await app.register(authPlugin, { config })

  // Register rate limiting for all API routes
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  // Register API routes
  await app.register(routesPlugin, { agent, fsAgent, config })

  // Serve Hexo public/ directory at /assets/*
  const hexoPublicDir = resolve(config.hexoDir, 'public')
  if (existsSync(hexoPublicDir)) {
    await app.register(fastifyStatic, {
      root: hexoPublicDir,
      prefix: '/assets/',
      decorateReply: false,
    })
  } else {
    console.warn(
      `Hexo public/ directory not found at ${hexoPublicDir}, /assets/ will not be served`,
    )
  }

  // In production mode, serve the SPA from dist/web/
  if (!isDev) {
    const spaDir = resolve(__dirname, '..', 'dist', 'web')
    if (existsSync(spaDir)) {
      await app.register(fastifyStatic, {
        root: spaDir,
        prefix: '/',
        decorateReply: false,
        wildcard: false,
      })

      // SPA fallback: serve index.html for all non-API, non-asset routes
      app.setNotFoundHandler(async (request, reply) => {
        const url = request.url
        if (url.startsWith('/api/') || url.startsWith('/assets/')) {
          return reply.status(404).send({ error: 'Not found' })
        }
        return reply.sendFile('index.html', spaDir)
      })
    } else {
      console.warn(`SPA directory not found at ${spaDir}, skipping SPA serving`)
    }
  }

  // Global error handler
  app.setErrorHandler(async (error: { statusCode?: number; message?: string }, _request, reply) => {
    const statusCode = error.statusCode ?? 500
    if (statusCode >= 500) {
      console.error('Server error:', error)
    }
    return reply.status(statusCode).send({
      error: error.message || 'Internal server error',
    })
  })

  // Start listening
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' })
    console.log(`HexoPress Web Server is running on http://localhost:${config.port}`)
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

main()
