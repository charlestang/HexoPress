import { useCache } from '@/hooks/useCache'
import type { HexoConfig, SiteInfo } from '@/local'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { store } from './index'

const languages = {
  'zh-CN': zhCn,
  en: en,
}

export const useAppStore = defineStore('app', () => {
  const { wsCache } = useCache('localStorage')

  // locale
  const locale = ref(wsCache.get('locale') || 'en')
  // locale setter
  function setLocale(newLocale: string) {
    console.log('appStore setLocale called, newVal is: ', newLocale)
    locale.value = newLocale
    wsCache.set('locale', locale.value)
  }
  const localeLang = computed(() => {
    console.log('localeLang called, locale is: ', locale.value)
    if (languages[locale.value as keyof typeof languages]) {
      return languages[locale.value as keyof typeof languages]
    } else {
      return languages['en']
    }
  })

  // dark mode
  const darkMode = ref('system')
  const darkModeVal = wsCache.get('darkMode')
  if (darkModeVal !== null) {
    darkMode.value = darkModeVal as string
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
      window.site.getHexoConfig().then((config) => {
        if (config != null) {
          hexoConfig.value = config
        }
      })
      window.site.getSiteInfo().then((info) => {
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
    wsCache.set('editMode', editMode.value)
  }

  const autoSave = ref('autoSaveOff')
  const autoSaveVal = wsCache.get('autoSave')
  if (autoSaveVal !== null) {
    autoSave.value = autoSaveVal as string
  }

  function setAutoSave(newVal: string) {
    autoSave.value = newVal
    wsCache.set('autoSave', autoSave.value)
  }

  return {
    locale,
    setLocale,
    localeLang,
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
    autoSave,
    setAutoSave,
  }
})

export const useAppStoreWithout = () => {
  return useAppStore(store)
}
