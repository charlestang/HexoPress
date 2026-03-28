import { site } from '@/bridge'
import {
  appearanceDefaults,
  appThemeValues,
  codeFontPresetValues,
  codeThemeValues,
  editorFontPresetValues,
  type AppThemePreference,
  type AppearanceCodeTheme,
  type CodeFontPresetId,
  type EditorFontPresetId,
} from '@/constants/appearance'
import { useCache } from '@/hooks/useCache'
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

  function getStoredEnumValue<T extends string>(key: string, values: readonly T[], fallback: T): T {
    const stored = wsCache.get(key)
    if (typeof stored === 'string' && values.includes(stored as T)) {
      return stored as T
    }
    return fallback
  }

  function getStoredBoolean(key: string, fallback: boolean): boolean {
    const stored = wsCache.get(key)
    if (typeof stored === 'boolean') {
      return stored
    }
    if (stored === 'true') {
      return true
    }
    if (stored === 'false') {
      return false
    }
    return fallback
  }

  function getStoredNumber(key: string, fallback: number, min: number, max: number): number {
    const stored = wsCache.get(key)
    const parsed =
      typeof stored === 'number'
        ? stored
        : typeof stored === 'string'
          ? Number.parseInt(stored, 10)
          : Number.NaN

    if (Number.isFinite(parsed) && parsed >= min && parsed <= max) {
      return parsed
    }
    return fallback
  }

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
  const darkMode = ref<AppThemePreference>(
    getStoredEnumValue('darkMode', appThemeValues, appearanceDefaults.darkMode),
  )
  site.setDarkMode(darkMode.value)

  function setDarkMode(newDarkMode: AppThemePreference) {
    console.log('appStore setDarkMode called, newVal is: ', newDarkMode)
    if (newDarkMode !== darkMode.value) {
      wsCache.set('darkMode', newDarkMode)
      darkMode.value = newDarkMode
      site.setDarkMode(newDarkMode)
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
      site.getHexoConfig().then((config) => {
        if (config != null) {
          hexoConfig.value = config
        }
      })
      site.getSiteInfo().then((info) => {
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

  const editorLineWrap = ref(getStoredBoolean('editorLineWrap', appearanceDefaults.editorLineWrap))

  function setEditorLineWrap(newVal: boolean) {
    editorLineWrap.value = newVal
    wsCache.set('editorLineWrap', newVal)
  }

  const editorFontSize = ref(
    getStoredNumber('editorFontSize', appearanceDefaults.editorFontSize, 10, 28),
  )

  function setEditorFontSize(newVal: number) {
    editorFontSize.value = newVal
    wsCache.set('editorFontSize', editorFontSize.value)
  }

  const editorFontFamily = ref<EditorFontPresetId>(
    getStoredEnumValue(
      'editorFontFamily',
      editorFontPresetValues,
      appearanceDefaults.editorFontFamily,
    ),
  )

  function setEditorFontFamily(newVal: EditorFontPresetId) {
    editorFontFamily.value = newVal
    wsCache.set('editorFontFamily', newVal)
  }

  const codeTheme = ref<AppearanceCodeTheme>(
    getStoredEnumValue('codeTheme', codeThemeValues, appearanceDefaults.codeTheme),
  )

  function setCodeTheme(newVal: AppearanceCodeTheme) {
    codeTheme.value = newVal
    wsCache.set('codeTheme', newVal)
  }

  const codeLineNumbers = ref(
    getStoredBoolean('codeLineNumbers', appearanceDefaults.codeLineNumbers),
  )

  function setCodeLineNumbers(newVal: boolean) {
    codeLineNumbers.value = newVal
    wsCache.set('codeLineNumbers', newVal)
  }

  const codeFontFamily = ref<CodeFontPresetId>(
    getStoredEnumValue('codeFontFamily', codeFontPresetValues, appearanceDefaults.codeFontFamily),
  )

  function setCodeFontFamily(newVal: CodeFontPresetId) {
    codeFontFamily.value = newVal
    wsCache.set('codeFontFamily', newVal)
  }

  // AI providers
  const aiProviders = ref<AiProvider[]>([])
  const aiProvidersVal = wsCache.get('aiProviders')
  if (aiProvidersVal !== null) {
    aiProviders.value = aiProvidersVal as AiProvider[]
  }

  function addAiProvider(provider: AiProvider) {
    aiProviders.value.push(provider)
    wsCache.set('aiProviders', aiProviders.value)
  }

  function updateAiProvider(id: string, updates: Partial<AiProvider>) {
    const index = aiProviders.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      aiProviders.value[index] = { ...aiProviders.value[index], ...updates } as AiProvider
      wsCache.set('aiProviders', aiProviders.value)
    }
  }

  function removeAiProvider(id: string) {
    aiProviders.value = aiProviders.value.filter((p) => p.id !== id)
    wsCache.set('aiProviders', aiProviders.value)
    if (defaultAiProviderId.value === id) {
      defaultAiProviderId.value = ''
      wsCache.set('defaultAiProviderId', '')
    }
  }

  // Default AI provider selection
  const defaultAiProviderId = ref('')
  const defaultAiProviderIdVal = wsCache.get('defaultAiProviderId')
  if (defaultAiProviderIdVal !== null) {
    defaultAiProviderId.value = defaultAiProviderIdVal as string
  }

  function setDefaultAiProviderId(id: string) {
    defaultAiProviderId.value = id
    wsCache.set('defaultAiProviderId', id)
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
    editorLineWrap,
    setEditorLineWrap,
    aiProviders,
    addAiProvider,
    updateAiProvider,
    removeAiProvider,
    defaultAiProviderId,
    setDefaultAiProviderId,
    editorFontSize,
    setEditorFontSize,
    editorFontFamily,
    setEditorFontFamily,
    codeTheme,
    setCodeTheme,
    codeLineNumbers,
    setCodeLineNumbers,
    codeFontFamily,
    setCodeFontFamily,
  }
})

export const useAppStoreWithout = () => {
  return useAppStore(store)
}
