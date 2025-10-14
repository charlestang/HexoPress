import { mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import httpServer from '../HttpServer'

describe('HttpServer', () => {
  const testRoot = join(__dirname, 'httpServerTest')
  const publicDir = join(testRoot, 'public')

  beforeEach(() => {
    rmSync(testRoot, { recursive: true, force: true })
    mkdirSync(publicDir, { recursive: true })
    writeFileSync(join(publicDir, 'index.html'), '<h1>hello</h1>')
  })

  afterEach(async () => {
    await httpServer.close()
    rmSync(testRoot, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it('Before init the server should be undefined.', () => {
    expect(httpServer.app).toBeUndefined()
  })

  it('initializes with static root and starts listening', async () => {
    const listenSpy = vi.spyOn(httpServer as unknown as { start: () => Promise<void> }, 'start')
    await httpServer.init(testRoot)

    expect(httpServer.app).toBeDefined()
    expect(httpServer.currentRoot).toBe(publicDir)
    expect(listenSpy).toHaveBeenCalled()

    // Ensure the server is actually serving files
    const response = await fetch(`http://${httpServer.host}:${httpServer.port}/index.html`)
    expect(response.status).toBe(200)
    const body = await response.text()
    expect(body).toContain('hello')
  })

  it('restarts when static root changes', async () => {
    const firstSpy = vi.spyOn(httpServer as unknown as { start: () => Promise<void> }, 'start')
    await httpServer.init(testRoot)
    expect(firstSpy).toHaveBeenCalledTimes(1)

    const newRoot = join(__dirname, 'anotherRoot')
    const newPublicDir = join(newRoot, 'public')
    rmSync(newRoot, { recursive: true, force: true })
    mkdirSync(newPublicDir, { recursive: true })
    writeFileSync(join(newPublicDir, 'home.html'), '<p>new root</p>')

    await httpServer.init(newRoot)

    expect(httpServer.currentRoot).toBe(newPublicDir)
    const response = await fetch(`http://${httpServer.host}:${httpServer.port}/home.html`)
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('new root')

    rmSync(newRoot, { recursive: true, force: true })
  })

  it('close shuts down server and releases references', async () => {
    await httpServer.init(testRoot)
    expect(httpServer.app).toBeDefined()

    await httpServer.close()

    expect(httpServer.app).toBeUndefined()
    expect(httpServer.currentRoot).toBeUndefined()
    expect(httpServer.listening).toBe(false)

    // Port should be available again
    const { createServer } = await import('net')
    await new Promise<void>((resolve, reject) => {
      const server = createServer()
      server.once('error', reject)
      server.listen(httpServer.port, httpServer.host, () => {
        server.close(() => resolve())
      })
    })
  })
})
