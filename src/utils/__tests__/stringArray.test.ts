import { describe, expect, it } from 'vitest'
import { normalizeList } from '../stringArray'

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

  it('normalizeList with duplicate values', () => {
    const result = normalizeList(['abc', 'abc'])
    expect(result).toEqual([['abc', 'abc']])
  })

  it('normalizeList with special characters', () => {
    const result = normalizeList(['a-b', 'c_d'])
    expect(result).toEqual([['a-b', 'c_d']])
  })

  it('normalizeList with complex mixed array', () => {
    const result = normalizeList(['abc', ['def', 'ghi'], 'jkl', ['mno', 'pqr']])
    expect(result).toEqual([['abc'], ['def', 'ghi'], ['jkl'], ['mno', 'pqr']])
  })

  it('normalizeList with empty strings in mixed array', () => {
    const result = normalizeList(['abc', '', ['def', '']])
    expect(result).toEqual([['abc'], ['def']])
  })
})