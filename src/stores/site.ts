import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'
import type { HexoConfig, SiteInfo } from '../local'

interface SiteStore {
  siteName: Ref<string | undefined>
  siteVersion: Ref<string | undefined>
  hexoVersion: Ref<string | undefined>
  siteTitle: Ref<string | undefined>
  siteSubtitle: Ref<string | undefined>
  siteDescription: Ref<string | undefined>
  siteKeywords: Ref<string[] | undefined>
  siteAuthor: Ref<string | undefined>
  siteLanguage: Ref<string | undefined>
  siteTimezone: Ref<string | undefined>
  siteUrl: Ref<string | undefined>
  sitePermalink: Ref<string | undefined>
  siteDateFormat: Ref<string | undefined>
  siteTimeFormat: Ref<string | undefined>
}

export const useSiteStore = defineStore('site', (): SiteStore => {
  const _siteInfo = ref<SiteInfo | null>(null)

  const siteName = computed(() => {
    return _siteInfo.value?.name
  })
  const siteVersion = computed(() => {
    return _siteInfo.value?.version
  })
  const hexoVersion = computed(() => {
    return _siteInfo.value?.hexoVersion
  })

  const _siteConfig = ref<HexoConfig | null>(null)
  const siteTitle = computed(() => {
    return _siteConfig.value?.title
  })
  const siteSubtitle = computed(() => {
    return _siteConfig.value?.subtitle
  })
  const siteDescription = computed(() => {
    return _siteConfig.value?.description
  })
  const siteKeywords = computed(() => {
    return _siteConfig.value?.keywords
  })
  const siteAuthor = computed(() => {
    return _siteConfig.value?.author
  })
  const siteLanguage = computed(() => {
    return _siteConfig.value?.language
  })
  const siteTimezone = computed(() => {
    return _siteConfig.value?.timezone
  })
  const siteUrl = computed(() => {
    return _siteConfig.value?.url
  })
  const sitePermalink = computed(() => {
    return _siteConfig.value?.permalink
  })
  const siteDateFormat = computed(() => {
    return _siteConfig.value?.date_format
  })
  const siteTimeFormat = computed(() => {
    return _siteConfig.value?.time_format
  })
  return {
    siteName,
    siteVersion,
    hexoVersion,
    siteTitle,
    siteSubtitle,
    siteDescription,
    siteKeywords,
    siteAuthor,
    siteLanguage,
    siteTimezone,
    siteUrl,
    sitePermalink,
    siteDateFormat,
    siteTimeFormat
  }
})
