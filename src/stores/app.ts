import { defineStore } from 'pinia'
import { ref } from 'vue'
import { store } from './index'

export const useAppStore = defineStore('app', () => {
  const locale = ref('en')

  function setLocale(newLocale: string) {
    locale.value = newLocale
  }

  return {
    locale,
    setLocale
  }
})

export const useAppStoreWithout = () => {
  return useAppStore(store)
}
