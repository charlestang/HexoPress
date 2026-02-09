import { defineStore } from 'pinia'
import { ref } from 'vue'
import { store } from './index'

export const useEditorStore = defineStore('editor', () => {
  const currentHeadings = ref<Heading[]>([])
  const activeHeading = ref<Heading | null>(null)

  // AI panel shared state
  const text = ref('')
  const frontMatter = ref<PostMeta>({})
  const selectedText = ref('')
  const selectionRange = ref<SelectionRange | null>(null)

  function setHeadings(headings: Heading[]) {
    currentHeadings.value = headings
  }

  function setActiveHeading(heading: Heading | null) {
    activeHeading.value = heading
  }

  function setText(value: string) {
    text.value = value
  }

  function setFrontMatter(meta: PostMeta) {
    frontMatter.value = meta
  }

  function setSelection(content: string, range: SelectionRange | null) {
    selectedText.value = content
    selectionRange.value = range
  }

  return {
    currentHeadings,
    activeHeading,
    setHeadings,
    setActiveHeading,
    text,
    frontMatter,
    selectedText,
    selectionRange,
    setText,
    setFrontMatter,
    setSelection,
  }
})

export const useEditorStoreWithout = () => {
  return useEditorStore(store)
}
