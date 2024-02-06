import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { store } from './index'
import { useCache } from '@/hooks/useCache'

export const useAppStore = defineStore('app', () => {
  // locale
  const locale = ref('en')
  // locale setter
  function setLocale(newLocale: string) {
    locale.value = newLocale
  }

  // base path
  const basePath = ref('')

  const { wsCache } = useCache('localStorage')
  let basePathVal = wsCache.get('basePath')
  if (basePathVal !== null) {
    basePath.value = basePathVal as string
  }

  function setBasePath(newBasePath: string) {
    wsCache.set('basePath', newBasePath)
    basePath.value = newBasePath
  }

  const isBasePathSet = computed(() => basePath.value.length > 0)

  const isAgentInitialized = ref(false)

  function setAgentInitialized() {
    isAgentInitialized.value = true
  }

  const hexoConfig = computed(() => {
    return window.site.getHexoConfig()
  })

  const siteInfo = computed(() => {
    return window.site.getSiteInfo()
  })

  return {
    locale,
    setLocale,
    basePath,
    isBasePathSet,
    setBasePath,
    isAgentInitialized,
    setAgentInitialized,
    hexoConfig,
    siteInfo,
  }
})

export const useAppStoreWithout = () => {
  return useAppStore(store)
}
