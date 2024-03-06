import { mkdirSync, rmSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { FsAgent } from '../FsAgent'

describe('FsAgent', () => {
  const testDir = join(__dirname, 'testDir/source')
  mkdirSync(testDir, { recursive: true })
  writeFileSync(join(testDir, 'testFile.txt'), 'Hello, World!')
  writeFileSync(join(testDir, '.hiddenFile.txt'), 'Hello, World!')
  let fsAgent: FsAgent

  beforeEach(() => {
    fsAgent = new FsAgent()
    fsAgent.init(join(__dirname, 'testDir'))
  })

  it('after init, sourceDir should be set', () => {
    expect(fsAgent['sourceDir']).toBe(testDir)
  })

  it('readdir should read non-hidden files', async () => {
    const contents = await fsAgent.readdir('')

    expect(contents.length).toBe(1)
    expect(contents[0].name).toBe('testFile.txt')
    expect(contents[0].relativePath).toBe('testFile.txt')
    expect(contents[0].type).toBe('file')
  })

  it('mv should move a file', async () => {
    const from = 'testFile.txt'
    const to = 'movedFile.txt'

    const result = await fsAgent.mv(from, to)

    expect(result).toBe(true)
    expect(existsSync(join(testDir, to))).toBe(true)
  })

  afterAll(() => {
    rmSync(join(__dirname, 'testDir'), { recursive: true })
  })
})
