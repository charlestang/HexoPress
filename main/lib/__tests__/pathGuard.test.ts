import { describe, it, expect } from 'vitest'
import { join, sep } from 'node:path'
import { resolveWithin } from '../pathGuard'

describe('resolveWithin', () => {
  const base = join(sep, 'srv', 'hexo', 'source')

  it('resolves a simple relative path inside the base', () => {
    expect(resolveWithin(base, '_posts/hello.md')).toBe(join(base, '_posts', 'hello.md'))
  })

  it('resolves nested relative paths', () => {
    expect(resolveWithin(base, 'images/2026/pic.png')).toBe(join(base, 'images', '2026', 'pic.png'))
  })

  it('allows the base directory itself via "."', () => {
    expect(resolveWithin(base, '.')).toBe(base)
  })

  it('collapses harmless inner traversal that stays inside the base', () => {
    expect(resolveWithin(base, '_posts/../images/a.png')).toBe(join(base, 'images', 'a.png'))
  })

  it('rejects an empty path', () => {
    expect(() => resolveWithin(base, '')).toThrow('Path must be a non-empty string')
  })

  it('rejects parent traversal', () => {
    expect(() => resolveWithin(base, '..')).toThrow('Path traversal detected')
    expect(() => resolveWithin(base, '../secret')).toThrow('Path traversal detected')
    expect(() => resolveWithin(base, '_posts/../../etc/passwd')).toThrow('Path traversal detected')
  })

  it('rejects absolute paths', () => {
    expect(() => resolveWithin(base, join(sep, 'etc', 'passwd'))).toThrow('Path traversal detected')
  })

  it('rejects paths containing a NUL byte', () => {
    expect(() => resolveWithin(base, 'hello\0.md')).toThrow('Path contains invalid characters')
  })
})
