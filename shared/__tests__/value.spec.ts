import { describe, expect, it } from 'vitest'
import { cloneValue, toArray, toDate, toStringArray } from '../utils/value'

describe('shared/utils/value', () => {
  describe('cloneValue', () => {
    it('clones primitive values without modification', () => {
      expect(cloneValue(42)).toBe(42)
      expect(cloneValue('foo')).toBe('foo')
    })

    it('clones arrays deeply', () => {
      const source = ['a', { nested: true }]
      const clone = cloneValue(source)
      expect(clone).toEqual(source)
      expect(clone).not.toBe(source)
      expect((clone[1] as Record<string, unknown>)).not.toBe(source[1])
    })
  })

  describe('toDate', () => {
    it('returns undefined for invalid inputs', () => {
      expect(toDate(undefined)).toBeUndefined()
      expect(toDate('not-a-date')).toBeUndefined()
    })

    it('converts valid values to Date instances', () => {
      const fromString = toDate('2024-05-01T00:00:00Z')
      expect(fromString).toBeInstanceOf(Date)
      expect(fromString?.toISOString()).toBe('2024-05-01T00:00:00.000Z')

      const fromNumber = toDate(Date.parse('2024-06-01T12:00:00Z'))
      expect(fromNumber?.toISOString()).toBe('2024-06-01T12:00:00.000Z')

      const original = new Date('2024-07-01T00:00:00Z')
      const cloned = toDate(original)
      expect(cloned).not.toBe(original)
      expect(cloned?.getTime()).toBe(original.getTime())
    })
  })

  describe('toArray', () => {
    it('wraps non-array values in an array', () => {
      expect(toArray('foo')).toEqual(['foo'])
    })

    it('returns empty array for nullish inputs', () => {
      expect(toArray(null)).toEqual([])
      expect(toArray(undefined)).toEqual([])
    })

    it('clones array inputs', () => {
      const source = [{ a: 1 }]
      const clone = toArray(source)
      expect(clone).toEqual(source)
      expect(clone).not.toBe(source)
      expect(clone[0]).not.toBe(source[0])
    })
  })

  describe('toStringArray', () => {
    it('converts values to trimmed string arrays', () => {
      expect(toStringArray(['foo', 123])).toEqual(['foo', '123'])
      expect(toStringArray('bar')).toEqual(['bar'])
    })

    it('optionally retains empty strings', () => {
      expect(toStringArray(['', 'foo'], { filterEmpty: false })).toEqual(['', 'foo'])
      expect(toStringArray(['', 'foo'])).toEqual(['foo'])
    })
  })
})
