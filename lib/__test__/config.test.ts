import { describe, expect, it, beforeEach, vi } from 'vitest'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { Config } from '../config.mjs'

vi.mock('fs')

vi.mock('electron', async (importOriginal) => {
  const mod = await importOriginal<typeof import('electron')>()
  return {
    ...mod,
    // 替换一些导出
    app: {
      getPath: vi.fn(() => '')
    }
  }
})

describe('Config', () => {
  const filePath = join(__dirname, 'testConfig.json')
  let config

  beforeEach(() => {
    config = new Config(filePath)
  })

  it('should read config if file exists', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ testKey: 'testValue' }))

    expect(config.get('testKey')).toBe('testValue')
  })

  it('should return null if key does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({}))

    expect(config.get('nonExistingKey')).toBe(null)
  })

  it('should write config if file does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false)
    vi.mocked(writeFileSync).mockImplementation(() => {})

    expect(config.get('testKey')).toBe(null)
    expect(writeFileSync).toHaveBeenCalledWith(filePath, '{}')
  })

  it('should set and get a key-value pair', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({}))
    vi.mocked(writeFileSync).mockImplementation(() => {})

    config.set('testKey', 'testValue')
    expect(config.get('testKey')).toBe('testValue')
    expect(writeFileSync).toHaveBeenCalledWith(filePath, '{"testKey":"testValue"}')
  })
})
