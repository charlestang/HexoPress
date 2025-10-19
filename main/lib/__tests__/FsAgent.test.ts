import { existsSync, mkdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'fs'
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

  it('returns file info for existing files', async () => {
    const agent = createAgent()
    const target = join(sourceRoot, 'testFile.txt')
    const created = new Date('2024-01-01T12:00:00Z')
    const modified = new Date('2024-02-01T12:00:00Z')
    utimesSync(target, created, modified)

    const info = await agent.getFileInfo('testFile.txt')
    expect(info).not.toBeNull()
    expect(info?.size).toBe(13)
    expect(
      info?.createdAt === created.toISOString() || info?.createdAt === modified.toISOString(),
    ).toBe(true)
    expect(info?.updatedAt).toBe(modified.toISOString())
  })

  it('returns null for missing file info', async () => {
    const agent = createAgent()
    const info = await agent.getFileInfo('missing.txt')
    expect(info).toBeNull()
  })

  it('finds asset references in posts', async () => {
    const agent = createAgent()
    const postsDir = join(sourceRoot, '_posts')
    mkdirSync(postsDir, { recursive: true })
    writeFileSync(join(postsDir, 'first.md'), '![img](images/gallery/photo.png)')
    writeFileSync(join(postsDir, 'second.md'), 'No references here')
    mkdirSync(join(sourceRoot, 'images', 'gallery'), { recursive: true })
    writeFileSync(join(sourceRoot, 'images/gallery/photo.png'), 'binary')

    const references = await agent.findAssetReferences('images/gallery/photo.png')

    expect(references).toEqual(['_posts/first.md'])
  })

  it('returns empty references when none found', async () => {
    const agent = createAgent()
    const postsDir = join(sourceRoot, '_posts')
    mkdirSync(postsDir, { recursive: true })
    writeFileSync(join(postsDir, 'first.md'), 'No references here either')

    const references = await agent.findAssetReferences('images/gallery/photo.png')

    expect(references).toEqual([])
  })

  it('detects references with leading slash and nested directories', async () => {
    const agent = createAgent()
    const nestedDir = join(sourceRoot, '_posts/nested')
    mkdirSync(nestedDir, { recursive: true })
    writeFileSync(join(nestedDir, 'entry.md'), '<img src="/images/gallery/photo.png" />')
    mkdirSync(join(sourceRoot, 'images', 'gallery'), { recursive: true })
    writeFileSync(join(sourceRoot, 'images/gallery/photo.png'), 'binary')

    const references = await agent.findAssetReferences('images/gallery/photo.png')

    expect(references).toEqual(['_posts/nested/entry.md'])
  })

  it('ignores files with unsupported extensions when searching references', async () => {
    const agent = createAgent()
    const postsDir = join(sourceRoot, '_posts')
    mkdirSync(postsDir, { recursive: true })
    mkdirSync(join(sourceRoot, 'images', 'gallery'), { recursive: true })
    writeFileSync(join(sourceRoot, 'images/gallery/photo.png'), 'binary')
    writeFileSync(join(postsDir, 'script.js'), 'const img = "images/gallery/photo.png";')

    const references = await agent.findAssetReferences('images/gallery/photo.png')

    expect(references).toEqual([])
  })
})
