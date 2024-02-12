import { useCache } from '@/hooks/useCache'
import type { HexoConfig, SiteInfo } from '@/local'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { store } from './index'

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
    console.log('call setBasePath: ', newBasePath)
    wsCache.set('basePath', newBasePath)
    basePath.value = newBasePath
    if (newBasePath.length == 0) {
      isAgentInitialized.value = false
    }
  }

  const isBasePathSet = computed(() => basePath.value.length > 0)

  const isAgentInitialized = ref(false)

  function setAgentInitialized() {
    isAgentInitialized.value = true
  }

  const hexoConfig = ref<HexoConfig>(null)

  const siteInfo = ref<SiteInfo>(null)

  watch(isAgentInitialized, (newVal, oldVal) => {
    if (newVal && !oldVal) {
      window.site.getHexoConfig().then(config => {
        if (config != null) {
          hexoConfig.value = config
        }
      })
      window.site.getSiteInfo().then(info => {
        if (info != null) {
          siteInfo.value = info
        }
      })
    }
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
