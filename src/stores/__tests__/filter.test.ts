import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useFilterStore } from '../filter'
import { PostStatusFilterChoice } from '@/components/PostListFilters'

describe('Filter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Initial value of statusFilterVal should be PostStatusFilterChoice.All', () => {
    const store = useFilterStore()
    expect(store.statusFilterVal).toBe(PostStatusFilterChoice.All)
    expect(store.dateCategoryFilterVal).toEqual({ date: 'all', category: 'all' })
    expect(store.searchFilterVal).toBe('')
    expect(store.pagination).toEqual({ total: 0, currentPageIndx: 1, pageSize: 20 })
  })
})
