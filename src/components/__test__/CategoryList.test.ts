import { describe, expect, it } from 'vitest'
import { normalizeList, simplifyList } from '../CategoryList'

describe('normalizeList', () => {

  it('normalizeList with empty string', () => {
    const result = normalizeList('')
    expect(result).toEqual([])
  })
  it('normalizeList with string', () => {
    const result = normalizeList('abc')
    expect(result).toEqual([['abc']])
  })

  it('normalizeList with normalized array', () => {
    const result = normalizeList([['abc']])
    expect(result).toEqual([['abc']])
  })

  it('normalizeList with empty array', () => {
    const result = normalizeList([])
    expect(result).toEqual([])
  })

  it('normalizeList with array of empty string', () => {
    const result = normalizeList([''])
    expect(result).toEqual([])
  })

  it('normalizeList with array of empty array', () => {
    const result = normalizeList([[]])
    expect(result).toEqual([])
  })

  it('normalizeList with string array', () => {
    const result = normalizeList(['abc', 'def'])
    expect(result).toEqual([['abc', 'def']])
  })

  it('normalizeList with mixed array', () => {
    const result = normalizeList(['abc', ['def', 'ghi']])
    expect(result).toEqual([['abc'], ['def', 'ghi']])
  })
})

describe('simplifyList', () => {
  it('simplifyList with single string', () => {
    const result = simplifyList([['abc']])
    expect(result).toBe('abc')
  })

  it('simplifyList with single string array', () => {
    const result = simplifyList([['abc', 'def']])
    expect(result).toEqual(['abc', 'def'])
  })

  it('simplifyList with multiple string arrays', () => {
    const result = simplifyList([['abc'], ['def', 'ghi']])
    expect(result).toEqual(['abc', ['def', 'ghi']])
  })
})
