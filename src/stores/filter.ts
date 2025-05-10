/**
 * Store for managing post list filters
 * This file provides centralized state management for post filtering options
 * using Pinia store, including status filters, date/category filters, and search filters.
 */
import { PostStatusFilterChoice } from '@/components/PostListFilters'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { store } from './index'

/**
 * Filter store for managing post list filtering options
 * @returns Store with filter state and methods
 */
export const useFilterStore = defineStore('filter', () => {
  // Filter State
  /** Current post status filter value */
  const statusFilterVal = ref(PostStatusFilterChoice.All)

  /**
   * Set the post status filter value
   * @param newVal New status filter value
   * @param paginationConfig Pagination configuration to apply
   */
  function setStatusFilter(
    newVal: PostStatusFilterChoice,
    paginationConfig: typeof pagination.value,
  ) {
    statusFilterVal.value = newVal
    pagination.value = paginationConfig
  }

  /** Current date and category filter values */
  const dateCategoryFilterVal = ref({
    date: 'all',
    category: 'all',
  })

  /**
   * Set the date and category filter values
   * @param newVal New date and category filter values
   * @param paginationConfig Pagination configuration to apply
   */
  function setDateCategoryFilter(
    newVal: { date: string; category: string },
    paginationConfig: typeof pagination.value,
  ) {
    dateCategoryFilterVal.value = newVal
    pagination.value = paginationConfig
  }

  /** Current search filter text */
  const searchFilterVal = ref('')

  /**
   * Set the search filter text
   * @param newVal New search text
   * @param paginationConfig Pagination configuration to apply
   */
  function setSearchFilter(newVal: string, paginationConfig: typeof pagination.value) {
    searchFilterVal.value = newVal
    pagination.value = paginationConfig
  }

  // Pagination State
  /** Pagination state for filtered post list */
  const pagination = ref({
    total: 0,
    currentPageIndx: 1,
    pageSize: 20,
  })

  // Return the state and methods
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

/**
 * Helper function to create a filter store without the Pinia store instance
 * @returns Filter store without Pinia store instance
 */
export const useFilterStoreWithout = () => {
  return useFilterStore(store)
}
