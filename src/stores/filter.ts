import { PostFilterType, PostStatusFilterChoice } from '@/components/PostListFilters'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { store } from './index'

export const useFilterStore = defineStore('filter', () => {
  const statusFilterVal = ref(PostStatusFilterChoice.All)

  function setStatusFilter(newVal: PostStatusFilterChoice, paginationConfig: any) {
    statusFilterVal.value = newVal
    pagination.value = paginationConfig
  }

  const dateCategoryFilterVal = ref({
    date: 'all',
    category: 'all',
  })

  function setDateCategoryFilter(
    newVal: { date: string; category: string },
    paginationConfig: any,
  ) {
    dateCategoryFilterVal.value = newVal
    pagination.value = paginationConfig
  }

  const searchFilterVal = ref('')
  function setSearchFilter(newVal: string, paginationConfig: any) {
    searchFilterVal.value = newVal
    pagination.value = paginationConfig
  }

  const pagination = ref({
    total: 0,
    currentPageIndx: 1,
    pageSize: 20,
  })

  return {
    statusFilterVal,
    setStatusFilter,
    dateCategoryFilterVal,
    setDateCategoryFilter,
    searchFilterVal,
    setSearchFilter,
    pagination,
  }
})

export const useFilterStoreWithout = () => {
  return useFilterStore(store)
}
