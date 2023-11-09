import { watch, type App } from 'vue'
import { createI18n } from 'vue-i18n'
import { useAppStoreWithout } from '@/stores/app'

export const setupI18n = async (app: App) => {
  const currentLocale = await window.site.getSystemLocale()
  console.log('read system locale from backend: ' + currentLocale)
  const appStore = useAppStoreWithout()
  appStore.setLocale(currentLocale)
  const messages = await import(`../../locales/${currentLocale}.yml`)
  const options = {
    legacy: false,
    locale: currentLocale,
    fallbackLocale: 'en',
    messages: {
      [currentLocale]: messages.default
    },
    sync: true,
    silentFallbackWarn: true
  }
  const i18n = createI18n(options)
  // 监听用户的语言设置更改
  watch(
    () => appStore.locale,
    async (newLocale) => {
      const messages = await import(`../../locales/${newLocale}.yml`)
      i18n.global.setLocaleMessage(newLocale, messages.default)
      i18n.global.locale = newLocale
    },
    { immediate: true }
  )

  app.use(i18n)
}
