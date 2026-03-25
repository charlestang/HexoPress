import { describe, expect, it } from 'vitest'
import { normalizeHexoRoot, resolveMarkdownImageUrl, stripHexoRootPrefix } from '../markdownImage'

describe('normalizeHexoRoot', () => {
  it('falls back to slash for empty values', () => {
    expect(normalizeHexoRoot('')).toBe('/')
    expect(normalizeHexoRoot(null)).toBe('/')
    expect(normalizeHexoRoot(undefined)).toBe('/')
  })

  it('normalizes non-root values with leading and trailing slashes', () => {
    expect(normalizeHexoRoot('HexoPress')).toBe('/HexoPress/')
    expect(normalizeHexoRoot('/HexoPress')).toBe('/HexoPress/')
    expect(normalizeHexoRoot('/HexoPress/')).toBe('/HexoPress/')
  })
})

describe('stripHexoRootPrefix', () => {
  it('removes a matching root prefix from deployed absolute paths', () => {
    expect(stripHexoRootPrefix('/HexoPress/images/test.jpg', '/HexoPress/')).toBe(
      '/images/test.jpg',
    )
  })

  it('leaves non-matching absolute paths unchanged', () => {
    expect(stripHexoRootPrefix('/images/test.jpg', '/HexoPress/')).toBe('/images/test.jpg')
  })
})

describe('resolveMarkdownImageUrl', () => {
  it('rewrites a root-prefixed absolute image url for electron preview', () => {
    expect(
      resolveMarkdownImageUrl(
        '/HexoPress/images/test.jpg',
        'http://127.0.0.1:2357/',
        '',
        '/HexoPress/',
      ),
    ).toBe('http://127.0.0.1:2357/images/test.jpg')
  })

  it('rewrites a root-prefixed absolute image url for web preview', () => {
    expect(
      resolveMarkdownImageUrl('/HexoPress/images/test.jpg', '/assets/', '', '/HexoPress/'),
    ).toBe('/assets/images/test.jpg')
  })

  it('keeps external urls unchanged', () => {
    expect(
      resolveMarkdownImageUrl(
        'https://cdn.example.com/image.jpg',
        'http://127.0.0.1:2357/',
        '',
        '/HexoPress/',
      ),
    ).toBe('https://cdn.example.com/image.jpg')
  })

  it('keeps resolving legacy relative paths by permalink depth', () => {
    expect(
      resolveMarkdownImageUrl(
        '../images/2026/01/demo.png',
        'https://assets.example.com',
        '/posts/hello-world/',
        '/HexoPress/',
      ),
    ).toBe('https://assets.example.com/posts/images/2026/01/demo.png')
  })
})
