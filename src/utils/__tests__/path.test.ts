import { describe, it, expect } from 'vitest'
import { computeRelativeImagePath } from '../path'

describe('computeRelativeImagePath', () => {
  it('handles root permalink', () => {
    expect(computeRelativeImagePath('', 'images/foo.png')).toBe('images/foo.png')
  })

  it('handles nested permalink', () => {
    expect(computeRelativeImagePath('2025/test-article/', 'images/foo.png')).toBe(
      '../../images/foo.png',
    )
  })

  it('trims leading slashes', () => {
    expect(computeRelativeImagePath('/posts/sample/', '/images/bar.jpg')).toBe('../../images/bar.jpg')
  })
})
