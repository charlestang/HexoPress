import type { App } from 'vue'
import { createI18n } from 'vue-i18n'

export const setupI18n = async (app: App) => {
  const currentLocale = await window.site.getSystemLocale()
  console.log('read system locale from backend: ' + currentLocale)
  const messages = await import(`../../locales/${currentLocale}.yml`)
  //console.log('yaml translations loaded')
  console.log('json translations loaded')
  console.log(messages.default)
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
  app.use(i18n)
}
