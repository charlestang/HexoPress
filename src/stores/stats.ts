/**
 * Store for managing blog statistics
 * This file provides a centralized state management for blog statistics
 * using Pinia store.
 */
import { site } from '@/bridge'
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Stats store for managing blog post and page statistics
 * @returns Store with statistics state and methods
 */
export const useStatsStore = defineStore('stats', () => {
  // State references
  /** Total number of posts (published + drafts) */
  const postTotal = ref(0)
  /** Total number of pages */
  const pageTotal = ref(0)
  /** Total number of draft posts */
  const draftTotal = ref(0)
  /** Total number of published posts */
  const publishedTotal = ref(0)

  /**
   * Fetch and update statistics from the backend
   * This method calls the Electron backend to get the latest stats
   * and updates the local state references
   */
  async function updateStats() {
    const data = await site.getStats()
    postTotal.value = data.postCount + data.postDraftCount
    publishedTotal.value = data.postCount
    draftTotal.value = data.postDraftCount
    pageTotal.value = data.pageCount
  }

  // Return the state and methods
  return {
    postTotal,
    pageTotal,
    draftTotal,
    publishedTotal,
    updateStats,
  }
})
