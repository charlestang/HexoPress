import { defineStore } from 'pinia'
import { ref } from 'vue'
import { store } from './index'
import { PostFilterType, PostStatusFilterChoice } from '@/components/PostListFilter'

export const useFilterStore = defineStore('filter', () => {
  const currentActiveFilter = ref(PostFilterType.StatusFilter)
  function _setCurrentActiveFilter(filter: PostFilterType) {
    currentActiveFilter.value = filter
  }

  const statusFilterVal = ref(PostStatusFilterChoice.All)

  function setStatusFilter(newVal: PostStatusFilterChoice, paginationConfig: any) {
    statusFilterVal.value = newVal
    pagination.value = paginationConfig
    _setCurrentActiveFilter(PostFilterType.StatusFilter)
  }

  const dateCategoryFilterVal = ref({
    date: 'all',
    category: 'all',
  })

  function setDateCategoryFilter(newVal: { date: string; category: string }, paginationConfig: any) {
    dateCategoryFilterVal.value = newVal
    pagination.value = paginationConfig
    _setCurrentActiveFilter(PostFilterType.DateCategoryFilter)
  }

  const searchFilterVal = ref('')
  function setSearchFilter(newVal: string, paginationConfig: any) {
    searchFilterVal.value = newVal
    pagination.value = paginationConfig
    _setCurrentActiveFilter(PostFilterType.SearchFilter)
  }
  
  const pagination = ref({
    total: 0,
    currentPageIndx: 1,
    pageSize: 20,
  })

  return {
    currentActiveFilter,
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
