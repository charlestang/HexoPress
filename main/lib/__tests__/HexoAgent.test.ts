import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { HexoAgent } from '../HexoAgent'

describe('HexoAgent', () => {
  let hexoAgent: HexoAgent
  const testDir = join(__dirname, 'hexoAgent/testDir')
  mkdirSync(testDir, { recursive: true })
  mkdirSync(join(testDir, 'source'), { recursive: true })
  mkdirSync(join(testDir, 'scaffolds'), { recursive: true })

  beforeEach(() => {
    hexoAgent = new HexoAgent()
  })

  it('should be able to create a new instance', () => {
    expect(hexoAgent).toBeDefined()
  })

  it('should return true if dir exists', () => {
    expect(HexoAgent.checkDir(testDir)).toBe(true)
    expect(HexoAgent.checkDir('nonexistent')).toBe(false)
  })

  describe('removeTagFromPost', () => {
    const removeTagRoot = join(__dirname, 'hexoAgent/removeTag')
    const sourceDir = join(removeTagRoot, 'source')
    const postsDir = join(sourceDir, '_posts')
    const sourcePath = '_posts/sample.md'

    beforeEach(() => {
      rmSync(removeTagRoot, { recursive: true, force: true })
      mkdirSync(postsDir, { recursive: true })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    function assignHexo(tagRecord?: { _id: string; name: string }) {
      const tagModel = {
        findById: vi.fn((id: string) => {
          if (!tagRecord) {
            return undefined
          }
          return id === tagRecord._id ? tagRecord : undefined
        }),
      }
      const fakeHexo = {
        source_dir: sourceDir,
        database: {
          model: vi.fn((modelName: string) => {
            if (modelName === 'Tag') {
              return tagModel
            }
            throw new Error(`Unexpected model ${modelName}`)
          }),
        },
      }
      ;(hexoAgent as unknown as { hexo: unknown }).hexo = fakeHexo
      return { tagModel }
    }

    function writePost(tags: string[]): string {
      const contentLines = [
        '---',
        'title: Sample',
        tags.length > 0 ? 'tags:' : undefined,
        ...tags.map((tag) => `  - ${tag}`),
        '---',
        'Hello world',
      ].filter((line): line is string => typeof line === 'string')
      const absolutePath = join(postsDir, 'sample.md')
      writeFileSync(absolutePath, `${contentLines.join('\n')}\n`, 'utf-8')
      return absolutePath
    }

    it('removes an existing tag and updates cache', async () => {
      assignHexo({ _id: 'tag-clean', name: 'Cleanup' })
      const absolutePath = writePost(['Cleanup', 'Keep'])
      const updateCacheSpy = vi
        .spyOn(hexoAgent as unknown as { updateCache: () => Promise<void> }, 'updateCache')
        .mockResolvedValue()

      await hexoAgent.removeTagFromPost(sourcePath, 'tag-clean')

      const content = readFileSync(absolutePath, 'utf-8')
      expect(content).not.toContain('Cleanup')
      expect(content).toContain('Keep')
      expect(updateCacheSpy).toHaveBeenCalledTimes(1)
    })

    it('throws when tag record cannot be found', async () => {
      assignHexo(undefined)
      writePost(['Cleanup'])
      await expect(hexoAgent.removeTagFromPost(sourcePath, 'missing')).rejects.toThrow(
        'Tag not found: missing',
      )
    })

    it('does nothing when the tag is not attached to the post', async () => {
      assignHexo({ _id: 'tag-clean', name: 'Cleanup' })
      const absolutePath = writePost(['Keep'])
      const updateCacheSpy = vi
        .spyOn(hexoAgent as unknown as { updateCache: () => Promise<void> }, 'updateCache')
        .mockResolvedValue()

      await hexoAgent.removeTagFromPost(sourcePath, 'tag-clean')

      const content = readFileSync(absolutePath, 'utf-8')
      expect(content).toContain('Keep')
      expect(updateCacheSpy).not.toHaveBeenCalled()
    })
  })

  afterAll(() => {
    rmSync(join(__dirname, 'hexoAgent'), { recursive: true })
  })
})
