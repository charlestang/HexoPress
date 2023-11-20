import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useSiteStore = defineStore('site', () => {
  const _siteInfo = ref(null)
  const siteName = computed(() => {
    return _siteInfo.value?.name
  })
  const siteVersion = computed(() => {
    return _siteInfo.value?.version
  })
  const hexoVersion = computed(() => {
    return _siteInfo.value?.hexoVersion
  })

  const _siteConfig = ref(null)
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
})
