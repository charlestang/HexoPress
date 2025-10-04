import fastifyStatic from '@fastify/static'
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import { resolve } from 'path'

class HttpServer {
  private app?: FastifyInstance
  private currentRoot?: string
  private listening = false
  private readonly port = 2357
  private readonly host = '127.0.0.1'

  public async init(basePath: string): Promise<void> {
    const staticRoot = resolve(basePath, 'public')

    if (!this.app) {
      this.app = Fastify({ logger: false })
      await this.registerStaticRoot(staticRoot)
    } else if (this.currentRoot !== staticRoot) {
      await this.restartWithRoot(staticRoot)
    }

    if (!this.listening) {
      await this.start()
    }
  }

  public async close(): Promise<void> {
    if (!this.app) {
      return
    }
    try {
      await this.app.close()
    } finally {
      this.app = undefined
      this.currentRoot = undefined
      this.listening = false
    }
  }

  private async restartWithRoot(staticRoot: string): Promise<void> {
    if (this.app && this.listening) {
      await this.app.close()
      this.listening = false
    }
    this.app = Fastify({ logger: false })
    await this.registerStaticRoot(staticRoot)
  }

  private async registerStaticRoot(staticRoot: string): Promise<void> {
    if (!this.app) {
      return
    }
    console.log('Static file path set to:', staticRoot)
    await this.app.register(fastifyStatic, {
      root: staticRoot,
      prefix: '/',
      wildcard: false,
    })
    this.currentRoot = staticRoot
  }

  private async start(): Promise<void> {
    if (!this.app) {
      throw new Error('HTTP server is not initialized')
    }
    await this.app.listen({ port: this.port, host: this.host })
    this.listening = true
    console.log(`Server is running on http://${this.host}:${this.port}`)
  }
}

const server = new HttpServer()
export default server
