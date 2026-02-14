<script lang="ts" setup>
import { site } from '@/bridge'
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { useStatsStore } from '@/stores/stats'
import { format, formatDistanceToNow } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarHeatmap } from 'vue3-calendar-heatmap'
import 'vue3-calendar-heatmap/dist/style.css'

const { t, locale } = useI18n()

const appStore = useAppStore()
const statsStore = useStatsStore()
const { hexoConfig } = storeToRefs(appStore)
const { publishedTotal, draftTotal, pageTotal } = storeToRefs(statsStore)
statsStore.updateStats()

const keywordList = computed<string[]>(() => {
  const kw = hexoConfig.value?.keywords
  if (!kw) return []
  if (Array.isArray(kw)) return kw
  return String(kw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
})

// recent posts
const PAGE_SIZE = 5
const posts = ref<Post[]>([])
const postsOffset = ref(0)
const hasMorePosts = ref(true)

async function fetchPosts() {
  const data = await site.getPosts(true, false, PAGE_SIZE, postsOffset.value)
  posts.value.push(...data.posts)
  postsOffset.value += data.posts.length
  hasMorePosts.value = data.posts.length === PAGE_SIZE
}
fetchPosts()

// drafts
const drafts = ref<Post[]>([])
const draftsOffset = ref(0)
const hasMoreDrafts = ref(true)

async function fetchDrafts() {
  const data = await site.getPosts(false, true, PAGE_SIZE, draftsOffset.value)
  drafts.value.push(...data.posts)
  draftsOffset.value += data.posts.length
  hasMoreDrafts.value = data.posts.length === PAGE_SIZE
}
fetchDrafts()

// heatmap
const todayDate = format(new Date(), 'yyyy-MM-dd')
const heatMap = ref<DateEntry[]>([])
async function fetchHeatMap() {
  heatMap.value = await site.getHeatMap()
}
fetchHeatMap()

function onClick(sourcePath: string) {
  router.push({ name: 'frame', query: { sourcePath } })
}

function relativeTime(dateStr: string): string {
  const dateFnsLocale = locale.value === 'zh-CN' ? zhCN : enUS
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: dateFnsLocale })
}
</script>
<template>
  <h2 class="text-lg font-bold mb-4">{{ t('common.dashboard') }}</h2>

  <!-- Top row: Profile (8) + Heatmap (16) -->
  <el-row :gutter="20" class="mb-4 items-stretch">
    <el-col :span="8">
      <el-card class="h-full">
        <template #header>
          <span class="font-bold">{{ t('dashboard.blogProfile') }}</span>
        </template>
        <template v-if="hexoConfig">
          <div class="text-xl font-bold mb-1">{{ hexoConfig.title }}</div>
          <div class="text-sm text-gray-500 mb-1" v-if="hexoConfig.subtitle">
            {{ hexoConfig.subtitle }}
          </div>
          <div class="text-sm text-gray-400 mb-3" v-if="hexoConfig.description">
            {{ hexoConfig.description }}
          </div>
          <div class="mb-3 flex flex-wrap gap-1" v-if="keywordList.length">
            <el-tag v-for="kw in keywordList" :key="kw" size="small" type="info">
              {{ kw }}
            </el-tag>
          </div>
          <div class="text-xs text-gray-400 flex gap-4">
            <span v-if="hexoConfig.author">✍ {{ hexoConfig.author }}</span>
            <span v-if="hexoConfig.language">🌐 {{ hexoConfig.language }}</span>
          </div>
        </template>
        <template v-else>
          <el-skeleton :rows="4" animated />
        </template>
        <el-divider class="my-3" />
        <div class="flex justify-around text-center">
          <div>
            <div class="text-2xl font-bold">{{ publishedTotal }}</div>
            <div class="text-xs text-gray-400">{{ t('common.published') }}</div>
          </div>
          <div>
            <div class="text-2xl font-bold">{{ draftTotal }}</div>
            <div class="text-xs text-gray-400">{{ t('common.draft') }}</div>
          </div>
          <div>
            <div class="text-2xl font-bold">{{ pageTotal }}</div>
            <div class="text-xs text-gray-400">{{ t('common.page') }}</div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="16">
      <el-card class="h-full">
        <template #header>
          <span class="font-bold">{{ t('dashboard.writingHeatmap') }}</span>
        </template>
        <div class="flex justify-center items-center">
          <CalendarHeatmap
            class="heatmap-small"
            :locale="{
              months: [
                t('common.month.short.January'),
                t('common.month.short.February'),
                t('common.month.short.March'),
                t('common.month.short.April'),
                t('common.month.short.May'),
                t('common.month.short.June'),
                t('common.month.short.July'),
                t('common.month.short.August'),
                t('common.month.short.September'),
                t('common.month.short.October'),
                t('common.month.short.November'),
                t('common.month.short.December'),
              ],
              days: [
                t('common.weekday.short.Sunday'),
                t('common.weekday.short.Monday'),
                t('common.weekday.short.Tuesday'),
                t('common.weekday.short.Wednesday'),
                t('common.weekday.short.Thursday'),
                t('common.weekday.short.Friday'),
                t('common.weekday.short.Saturday'),
              ],
              on: t('common.on'),
            }"
            :max="5"
            :values="heatMap"
            :end-date="todayDate" />
        </div>
      </el-card>
    </el-col>
  </el-row>

  <!-- Bottom row: Recent Posts (12) + Drafts (12) -->
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card class="post-card">
        <template #header>
          <span class="font-bold">{{ t('dashboard.recentPosts') }}</span>
        </template>
        <div class="post-list-scroll">
          <ul class="list-none m-0 p-0 text-sm" v-if="posts.length">
            <li
              v-for="post in posts"
              :key="post.permalink"
              class="flex justify-between items-center py-1.5 px-2 border-b border-gray-100 last:border-b-0">
              <el-link type="primary" underline="never" @click="onClick(post.source)">
                {{ post.title }}
              </el-link>
              <span class="text-xs text-gray-400 shrink-0 ml-2">
                {{ relativeTime(post.date) }}
              </span>
            </li>
          </ul>
          <div v-else class="text-sm text-gray-400 text-center py-4">
            {{ t('dashboard.noPosts') }}
          </div>
        </div>
        <div class="text-right mt-1">
          <el-link
            v-if="hasMorePosts"
            type="primary"
            underline="hover"
            class="text-xs"
            @click="fetchPosts">
            {{ t('dashboard.loadMore') }}
          </el-link>
        </div>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card class="post-card">
        <template #header>
          <span class="font-bold">{{ t('dashboard.drafts') }}</span>
        </template>
        <div class="post-list-scroll">
          <ul class="list-none m-0 p-0 text-sm" v-if="drafts.length">
            <li
              v-for="draft in drafts"
              :key="draft.permalink"
              class="flex justify-between items-center py-1.5 px-2 border-b border-gray-100 last:border-b-0">
              <el-link type="primary" underline="never" @click="onClick(draft.source)">
                {{ draft.title }}
              </el-link>
              <span class="text-xs text-gray-400 shrink-0 ml-2">
                {{ relativeTime(draft.date) }}
              </span>
            </li>
          </ul>
          <div v-else class="text-sm text-gray-400 text-center py-4">
            {{ t('dashboard.noDrafts') }}
          </div>
        </div>
        <div class="text-right mt-1">
          <el-link
            v-if="hasMoreDrafts"
            type="primary"
            underline="hover"
            class="text-xs"
            @click="fetchDrafts">
            {{ t('dashboard.loadMore') }}
          </el-link>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>
<style scoped>
.post-card {
  height: 295px;
  display: flex;
  flex-direction: column;
}
.post-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.post-list-scroll {
  flex: 1;
  overflow-y: auto;
}
.heatmap-small {
  max-width: 100%;
  width: 100%;
}
.heatmap-small :deep(rect) {
  width: 9px;
  height: 9px;
}
</style>
