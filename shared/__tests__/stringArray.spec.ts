import { describe, expect, it } from 'vitest'
import { normalizeList } from '../utils/stringArray'

describe('normalizeList', () => {
  it('returns empty array for empty string', () => {
    expect(normalizeList('')).toEqual([])
  })

  it('wraps single string in nested array', () => {
    expect(normalizeList('abc')).toEqual([['abc']])
  })

  it('returns original nested array when already normalized', () => {
    expect(normalizeList([['abc']])).toEqual([['abc']])
  })

  it('returns empty array for empty array input', () => {
    expect(normalizeList([])).toEqual([])
  })

  it('filters empty strings', () => {
    expect(normalizeList([''])).toEqual([])
  })

  it('filters empty nested arrays', () => {
    expect(normalizeList([[]])).toEqual([])
  })

  it('combines string array into single path', () => {
    expect(normalizeList(['abc', 'def'])).toEqual([['abc', 'def']])
  })

  it('handles mixed array of strings and nested arrays', () => {
    expect(normalizeList(['abc', ['def', 'ghi']])).toEqual([['abc'], ['def', 'ghi']])
  })

  it('retains duplicate values within single path', () => {
    expect(normalizeList(['abc', 'abc'])).toEqual([['abc', 'abc']])
  })

  it('supports special characters', () => {
    expect(normalizeList(['a-b', 'c_d'])).toEqual([['a-b', 'c_d']])
  })

  it('handles complex mixed arrays', () => {
    expect(normalizeList(['abc', ['def', 'ghi'], 'jkl', ['mno', 'pqr']])).toEqual([
      ['abc'],
      ['def', 'ghi'],
      ['jkl'],
      ['mno', 'pqr'],
    ])
  })

  it('filters empty values in complex mixed arrays', () => {
    expect(normalizeList(['abc', '', ['def', '']])).toEqual([['abc'], ['def']])
  })
})
