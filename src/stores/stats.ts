import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStatsStore = defineStore('stats', () => {
  const postTotal = ref(0)
  const pageTotal = ref(0)
  const draftTotal = ref(0)
  const publishedTotal = ref(0)

  async function updateStats() {
    const data = await window.site.getStats()
    postTotal.value = data.postCount + data.postDraftCount
    publishedTotal.value = data.postCount
    draftTotal.value = data.postDraftCount
    pageTotal.value = data.pageCount
  }

  return {
    postTotal,
    pageTotal,
    draftTotal,
    publishedTotal,
    updateStats,
  }
})
