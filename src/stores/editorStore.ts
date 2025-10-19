import { defineStore } from 'pinia'
import { ref } from 'vue'
import { store } from './index'

export const useEditorStore = defineStore('editor', () => {
  const currentHeadings = ref<Heading[]>([])
  const activeHeading = ref<Heading | null>(null)

  function setHeadings(headings: Heading[]) {
    currentHeadings.value = headings
  }

  function setActiveHeading(heading: Heading | null) {
    activeHeading.value = heading
    // Optionally, scroll to the heading here if direct editor access is too complex from outside
    // However, the plan is for EditorMain.vue to watch this and scroll.
  }

  return {
    currentHeadings,
    activeHeading,
    setHeadings,
    setActiveHeading,
  }
})

export const useEditorStoreWithout = () => {
  return useEditorStore(store)
}
