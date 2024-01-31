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
  const basePath = computed(async () => {
    return (await window.site.getConfig('vaultPath')) as string
  })
  const isBasePathSet = computed(async () => {
    const basePathValue = await basePath.value
    return basePathValue != null && basePathValue !== ''
  })
  const hexoConfig = computed(() => {
    return window.site.getHexoConfig()
  })
  const siteInfo = computed(() => {
    return window.site.getSiteInfo()
  })

  return {
    locale,
    basePath,
    hexoConfig,
    siteInfo,
    isBasePathSet,
    setLocale
  }
})

export const useAppStoreWithout = () => {
  return useAppStore(store)
}
