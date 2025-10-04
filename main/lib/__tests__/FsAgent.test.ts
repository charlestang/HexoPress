import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { FsAgent } from '../FsAgent'

describe('FsAgent', () => {
  const testRoot = join(__dirname, 'testDir')
  const sourceRoot = join(testRoot, 'source')

  beforeEach(() => {
    rmSync(testRoot, { recursive: true, force: true })
    mkdirSync(sourceRoot, { recursive: true })
    writeFileSync(join(sourceRoot, 'testFile.txt'), 'Hello, World!')
    writeFileSync(join(sourceRoot, '.hiddenFile.txt'), 'ignored')
  })

  afterAll(() => {
    rmSync(testRoot, { recursive: true, force: true })
  })

  function createAgent(): FsAgent {
    const agent = new FsAgent()
    agent.init(testRoot)
    return agent
  }

  it('initializes source directory', () => {
    const agent = createAgent()
    expect(agent['sourceDir']).toBe(sourceRoot)
  })

  it('returns visible directory contents', async () => {
    const agent = createAgent()
    const contents = await agent.readdir('')
    expect(contents).toEqual([
      {
        name: 'testFile.txt',
        relativePath: 'testFile.txt',
        type: 'file',
      },
    ])
  })

  it('creates intermediate directories when moving files', async () => {
    const agent = createAgent()
    const result = await agent.mv('testFile.txt', 'nested/movedFile.txt')
    expect(result).toBe(true)
    expect(existsSync(join(sourceRoot, 'nested/movedFile.txt'))).toBe(true)
  })

  it('reads file contents', async () => {
    const agent = createAgent()
    await agent.mv('testFile.txt', 'nested/movedFile.txt')
    const content = await agent.readFile('nested/movedFile.txt')
    expect(content).toBe('Hello, World!')
  })

  it('writes text files and creates directories', async () => {
    const agent = createAgent()
    await agent.writeFile('articles/new/post.md', '# Title')
    expect(readFileSync(join(sourceRoot, 'articles/new/post.md'), 'utf-8')).toBe('# Title')
  })

  it('writes binary content', async () => {
    const agent = createAgent()
    const encoder = new TextEncoder()
    await agent.writeFile('bin/data.bin', encoder.encode('binary'))
    expect(readFileSync(join(sourceRoot, 'bin/data.bin'), 'utf-8')).toBe('binary')
  })

  it('deletes files', async () => {
    const agent = createAgent()
    await agent.writeFile('tmp/remove.txt', 'to-delete')
    await agent.delete('tmp/remove.txt')
    expect(existsSync(join(sourceRoot, 'tmp/remove.txt'))).toBe(false)
  })

  it('saves images inside images directory', async () => {
    const agent = createAgent()
    const buffer = new TextEncoder().encode('image-bytes').buffer
    await agent.saveImage('covers/test.png', buffer)
    expect(readFileSync(join(sourceRoot, 'images/covers/test.png'), 'utf-8')).toBe('image-bytes')
  })

  it('prevents path traversal', async () => {
    const agent = createAgent()
    await expect(agent.readFile('../outside.txt')).rejects.toThrow('Path escapes source directory')
  })
})
