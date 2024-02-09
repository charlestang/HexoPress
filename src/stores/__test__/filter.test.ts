import { beforeEach } from 'node:test'
import { setActivePinia, createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { useFilterStore } from '../filter'
import { PostFilterType } from '@/components/PostListFilters'

describe('Filter Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })
    
    it('Initial value of currentActiveFilter should be statusFilter', () => {
        const store = useFilterStore()
        expect(store.currentActiveFilter).toBe(PostFilterType.StatusFilter)
    })
})