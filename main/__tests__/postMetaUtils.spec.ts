import { describe, expect, it } from 'vitest'
import {
  buildPostMeta,
  normalizeCategoryPaths,
  pathsEqual,
  preparePostMeta,
  sanitizeCategoryPaths,
  setFrontMatterCategories,
  toCategoryAssignment,
  type CategoryPath,
  type FrontMatterData,
} from '../lib/postMetaUtils'

describe('postMetaUtils', () => {
  describe('category helpers', () => {
    it('normalizes various category shapes', () => {
      expect(normalizeCategoryPaths('Tech')).toEqual([['Tech']])
      expect(normalizeCategoryPaths(['Tech', 'AI'])).toEqual([
        ['Tech'],
        ['AI'],
      ])
      expect(normalizeCategoryPaths('Life > Health')).toEqual([
        ['Life', 'Health'],
      ])
    })

    it('sanitizes and deduplicates category paths', () => {
      const input: CategoryPath[] = [
        ['Tech', 'AI'],
        ['Tech', 'AI'],
        ['  '],
        ['Life'],
      ]
      expect(sanitizeCategoryPaths(input)).toEqual([
        ['Tech', 'AI'],
        ['Life'],
      ])
    })

    it('sets front-matter categories based on sanitized paths', () => {
      const frontMatter: FrontMatterData = {}
      setFrontMatterCategories(frontMatter, [
        ['Programming'],
      ])
      expect(frontMatter.categories).toBe('Programming')

      setFrontMatterCategories(frontMatter, [
        ['Programming'],
        ['Design'],
      ])
      expect(frontMatter.categories).toEqual(['Programming', 'Design'])

      setFrontMatterCategories(frontMatter, [
        ['Programming', 'Frontend'],
      ])
      expect(frontMatter.categories).toEqual([
        ['Programming', 'Frontend'],
      ])

      setFrontMatterCategories(frontMatter, [])
      expect(frontMatter.categories).toBeUndefined()
    })

    it('compares paths correctly', () => {
      expect(pathsEqual(['A', 'B'], ['A', 'B'])).toBe(true)
      expect(pathsEqual(['A'], ['B'])).toBe(false)
    })

    it('converts sanitized paths back to assignment values', () => {
      expect(toCategoryAssignment([])).toBeUndefined()
      expect(toCategoryAssignment([['A']])).toBe('A')
      expect(toCategoryAssignment([['A', 'B']])).toEqual(['A', 'B'])
      expect(
        toCategoryAssignment([
          ['A'],
          ['B'],
        ]),
      ).toEqual([
        ['A'],
        ['B'],
      ])
    })
  })

  describe('meta conversion', () => {
    it('builds PostMeta from front-matter data', () => {
      const meta = buildPostMeta({
        title: 'Sample',
        date: '2024-01-01',
        categories: ['Tech', 'Life > Health'],
        tags: ['vue', 42],
        draft: true,
      })

      expect(meta.title).toBe('Sample')
      expect(meta.tags).toEqual(['vue', '42'])
      expect(meta.categories).toEqual([
        ['Tech'],
        ['Life', 'Health'],
      ])
      expect(meta.draft).toBe(true)
      expect(meta.date).toBeInstanceOf(Date)
    })

    it('prepares front-matter data from PostMeta', () => {
      const data = preparePostMeta({
        title: 'Sample',
        date: new Date('2024-01-01T00:00:00Z'),
        tags: ['vue'],
        categories: [
          ['Tech'],
          ['Life', 'Health'],
        ],
      })

      expect(data.title).toBe('Sample')
      expect(data.tags).toEqual(['vue'])
      expect(data.date).toBeInstanceOf(Date)
      expect(data.categories).toEqual([
        ['Tech'],
        ['Life', 'Health'],
      ])
    })

    it('round-trips meta through prepare and build', () => {
      const original: PostMeta = {
        title: 'Round Trip',
        categories: 'Life',
        tags: ['a', 'b'],
      }
      const prepared = preparePostMeta(original)
      const rebuilt = buildPostMeta(prepared)
      expect(rebuilt.title).toBe(original.title)
      expect(rebuilt.tags).toEqual(original.tags)
      expect(rebuilt.categories).toBe('Life')
    })
  })
})
