import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useTableHeight() {
  const tableHeight = ref(0)
  const wrapper = ref<HTMLElement | null>(null)

  function updateTableHeight() {
    if (wrapper.value) {
      tableHeight.value = wrapper.value.clientHeight - 10
    }
  }

  onMounted(() => {
    updateTableHeight()
    window.addEventListener('resize', updateTableHeight)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateTableHeight)
  })

  return {
    tableHeight,
    wrapper
  }
}
