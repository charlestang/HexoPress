import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { mkdirSync, rmSync } from 'fs'
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

  afterAll(() => {
    rmSync(join(__dirname, 'hexoAgent'), { recursive: true })
  })
})
