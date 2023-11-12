import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { store } from './index'

export const useAppStore = defineStore('app', () => {
  // locale
  const locale = ref('en')
  // locale setter
  function setLocale(newLocale: string) {
    locale.value = newLocale
  }

  // base path
  let basePath: string = ''
  const isBasePathSet = computed(async () => {
    if (basePath === '') {
      const vaultPath = await window.site.getConfig('vaultPath')
      if (vaultPath == null || vaultPath === '') {
        console.log('Vault path is not set')
        return false
      } else {
        basePath = vaultPath
        return true
      }
    } else {
      return true
    }
  })

  return {
    locale,
    isBasePathSet,
    setLocale
  }
})

export const useAppStoreWithout = () => {
  return useAppStore(store)
}
