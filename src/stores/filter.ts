import { defineStore } from 'pinia'
import { ref } from 'vue'
import { store } from './index'

export const useFilterStore = defineStore('filter', () => {
  const currentActiveFilter = ref('statusFilter')
  function setCurrentActiveFilter(filter: 'statusFilter' | 'dateCategoryFilter' | 'searchFilter') {
    currentActiveFilter.value = filter
  }

  const statusFilterVal = ref('all')

  function setStatusFilter(newVal: 'all' | 'published' | 'draft') {
    statusFilterVal.value = newVal
  }

  const dateCategoryFilterVal = ref({
    date: 'all',
    category: 'all',
  })

  function setDateCategoryFilter(newVal: { date: string; category: string }) {
    dateCategoryFilterVal.value = newVal
  }

  const searchFilterVal = ref('')
  function setSearchFilter(newVal: string) {
    searchFilterVal.value = newVal
  }
  const currentPageIndex = ref(1)
  function setCurrentPageIndex(newVal: number) {
    currentPageIndex.value = newVal
  }

  return {
    currentActiveFilter,
    setCurrentActiveFilter,
    statusFilterVal,
    setStatusFilter,
    dateCategoryFilterVal,
    setDateCategoryFilter,
    searchFilterVal,
    setSearchFilter,
    currentPageIndex,
    setCurrentPageIndex,
  }
})

export const useFilterStoreWithout = () => {
  return useFilterStore(store)
}
