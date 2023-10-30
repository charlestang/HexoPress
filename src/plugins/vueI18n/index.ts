import type { App } from 'vue'
import { createI18n } from 'vue-i18n'

export const setupI18n = async (app: App) => {
  const currentLocale = 'zh-CN'
  //const messages = await import(`../../locales/${currentLocale}.yml`)
  const messages = await import(`../../locales/${currentLocale}.json`)
  //console.log('yaml translations loaded')
  console.log('json translations loaded')
  console.log(messages.default)
  const options = {
    legacy: false,
    locale: 'zh-CN',
    fallbackLocale: 'en',
    messages: {
      'zh-CN': messages.default
    },
    sync: true,
    silentFallbackWarn: true
  }
  const i18n = createI18n(options)
  app.use(i18n)
}
