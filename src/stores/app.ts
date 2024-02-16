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

  const { wsCache } = useCache('localStorage')

  // dark mode
  const darkMode = ref('')
  const darkModeVal = wsCache.get('darkMode')
  if (darkModeVal !== null) {
    darkMode.value = darkModeVal as string
  } else {
    darkMode.value = 'system'
  }
  window.site.setDarkMode(darkMode.value)

  function setDarkMode(newDarkMode: string) {
    console.log('appStore setDarkMode called, newVal is: ', newDarkMode)
    if (newDarkMode !== darkMode.value) {
      wsCache.set('darkMode', newDarkMode)
      darkMode.value = newDarkMode
      window.site.setDarkMode(newDarkMode)
    }
  }

  // base path
  const basePath = ref('')
  const basePathVal = wsCache.get('basePath')
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

  const editMode = ref('') // the other value is 'vim'
  const editModeVal = wsCache.get('editMode')
  if (editModeVal !== null) {
    editMode.value = editModeVal as string
  } else {
    editMode.value = 'normal'
  }

  function setEditMode(newMode: string) {
    editMode.value = newMode
  }

  return {
    locale,
    setLocale,
    darkMode,
    setDarkMode,
    basePath,
    isBasePathSet,
    setBasePath,
    isAgentInitialized,
    setAgentInitialized,
    hexoConfig,
    siteInfo,
    editMode,
    setEditMode,
  }
})

export const useAppStoreWithout = () => {
  return useAppStore(store)
}
