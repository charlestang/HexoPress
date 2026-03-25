import { describe, it, expect } from 'vitest'
import { computeImagePath } from '../path'

describe('computeImagePath', () => {
  it('returns a root-based absolute path when hexo root is slash', () => {
    expect(computeImagePath('/', 'images/foo.png')).toBe('/images/foo.png')
  })

  it('prefixes the configured hexo root for deployed absolute paths', () => {
    expect(computeImagePath('/HexoPress/', 'images/foo.png')).toBe('/HexoPress/images/foo.png')
  })

  it('normalizes root and asset path slashes', () => {
    expect(computeImagePath('HexoPress', '/images/bar.jpg')).toBe('/HexoPress/images/bar.jpg')
  })
})
