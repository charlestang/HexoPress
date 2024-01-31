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
  const basePath = ref('')

  async function getBasePath() {
    console.log('Actively get vault path from main process.')
    basePath.value = (await window.site.getConfig('vaultPath')) as string
  }

  window.site.onVaultPathChanged((newValue) => {
    console.log('vault path changed, new value is:', newValue)
    basePath.value = newValue
  })

  const isBasePathSet = computed(async () => {
    if (basePath.value == '') {
      await getBasePath()
    }
    return basePath.value !== null && basePath.value !== ''
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
