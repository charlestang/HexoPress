<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { site } from '@/bridge'
import { useI18n } from 'vue-i18n'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { Folder, PriceTag, Timer } from '@element-plus/icons-vue'
import { normalizeList } from '@shared/utils/stringArray'
import { toDate, toStringArray } from '@shared/utils/value'

type TocItem = {
  id: string
  text: string
  level: number
  index?: number
}

const props = defineProps<{
  modelValue: boolean
  sourcePath: string
  permalink?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { t } = useI18n()
const content = ref('')
const loading = ref(false)
const tocItems = ref<TocItem[]>([])
const previewScrollRef = ref<HTMLElement | null>(null)
const renderKey = ref(0)
const topHeadingLevel = ref<number | null>(null)

/**
 * Content sanitizer to help preview display images in content.
 * @param html The HTML content of the blog post.
 */
function filterImage(html: string): string {
  console.log('filterImage', props.permalink)
  let relativePermalink = props.permalink || ''
  // 移除 URL 中的 http(s)://<host>/ 部分
  if (relativePermalink) {
    relativePermalink = relativePermalink.replace(/^https?:\/\/[^\/]+\//, '')
  }
  console.log('relativePermalink', relativePermalink)
  return _addPrefixToImgSrc(html, import.meta.env.VITE_ASSET_BASE_URL, relativePermalink)
}

function _addPrefixToImgSrc(html: string, prefix: string, currentPath: string): string {
  const regex = /(<img[^>]+src\s*=\s*["'])([^"']*)/gi
  return html.replace(regex, (match, p1, p2: string) => {
    console.log('p2', p2)
    if (p2.startsWith('http://') || p2.startsWith('https://')) {
      return match
    }
    const curPath = currentPath.split('/').filter((p) => p !== '')
    const imgPath = p2.split('/').filter((p) => p !== '')
    while (curPath.length > 0 && imgPath[0] == '..') {
      imgPath.shift()
      curPath.pop()
    }
    return p1 + prefix + curPath.concat(imgPath).join('/')
  })
}

const frontMatter = ref<PostMeta>({
  title: '',
  date: new Date(),
  permalink: '',
  categories: [],
  tags: [],
})

async function fetchContent() {
  if (!props.sourcePath) return
  tocItems.value = []
  content.value = ''
  loading.value = true
  try {
    const { meta, content: body } = await site.getPostDocument(props.sourcePath)
    frontMatter.value = {
      ...frontMatter.value,
      ...meta,
      date: toDate(meta.date) ?? new Date(),
      updated: toDate(meta.updated) ?? meta.updated,
      tags: toStringArray(meta.tags),
      categories: meta.categories ?? [],
    }
    content.value = body
    renderKey.value += 1
    await nextTick()
    resetPreviewScroll()
    queueBuildToc()
  } catch (error) {
    console.error('Failed to fetch post content:', error)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      fetchContent()
    } else {
      tocItems.value = []
    }
  },
  { immediate: true },
)

watch(
  () => props.sourcePath,
  () => {
    if (props.modelValue) {
      fetchContent()
    }
  },
)

watch(content, async () => {
  if (!props.modelValue) {
    return
  }
  await nextTick()
  queueBuildToc()
})

const categoriesDisplay = computed(() => {
  const normalized = normalizeList(frontMatter.value.categories ?? [])
  if (normalized.length === 0) {
    return ''
  }
  return normalized.map((path) => path.join(' / ')).join('、')
})

const tagsDisplay = computed(() => toStringArray(frontMatter.value.tags).join('、'))

const dateDisplay = computed(() => {
  const date = toDate(frontMatter.value.date)
  return date ? date.toLocaleString() : ''
})

const handleDialogModelUpdate = (value: boolean) => {
  emit('update:modelValue', value)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
}

function buildToc() {
  const container = previewScrollRef.value
  if (!container) {
    tocItems.value = []
    return
  }
  const headings = Array.from(container.querySelectorAll('h1, h2, h3')) as HTMLHeadingElement[]
  if (headings.length === 0) {
    tocItems.value = []
    topHeadingLevel.value = null
    return
  }
  const idCounts = new Map<string, number>()
  const items: TocItem[] = []
  let topLevelIndex = 0
  const topLevel = Math.min(...headings.map((heading) => Number(heading.tagName.slice(1))))
  topHeadingLevel.value = topLevel

  headings.forEach((heading) => {
    const level = Number(heading.tagName.slice(1))
    if (Number.isNaN(level) || level < 1 || level > 3) {
      return
    }

    const baseId = heading.id || slugify(heading.textContent || 'heading') || 'heading'
    const count = idCounts.get(baseId) ?? 0
    const id = count === 0 ? baseId : `${baseId}-${count}`
    idCounts.set(baseId, count + 1)
    heading.id = id

    const item: TocItem = {
      id,
      text: heading.textContent?.trim() || '',
      level,
      index: level === topLevel ? ++topLevelIndex : undefined,
    }
    items.push(item)
  })

  tocItems.value = items
}

function queueBuildToc() {
  nextTick().then(() => buildToc())
}

function scrollToHeading(id: string) {
  const container = previewScrollRef.value
  if (!container) return
  const safeId = typeof CSS !== 'undefined' && CSS.escape ? `#${CSS.escape(id)}` : `#${id}`
  const target = container.querySelector(safeId) as HTMLElement | null
  if (!target) return

  const parentRect = container.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const top = targetRect.top - parentRect.top + container.scrollTop - 8
  if (typeof container.scrollTo === 'function') {
    container.scrollTo({ top, behavior: 'smooth' })
  } else {
    container.scrollTop = top
  }
}

function resetPreviewScroll() {
  const container = previewScrollRef.value
  if (!container) return
  if (typeof container.scrollTo === 'function') {
    container.scrollTo({ top: 0 })
  } else {
    container.scrollTop = 0
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="t('posts.preview')"
    width="1180px"
    :close-on-click-modal="false"
    @update:modelValue="handleDialogModelUpdate">
    <div v-loading="loading" class="preview-layout">
      <div class="preview-header">
        <h1 class="preview-title">{{ frontMatter.title }}</h1>
        <div class="preview-meta">
          <div class="meta-row">
            <div v-if="categoriesDisplay" class="meta-entry">
              <el-icon class="meta-icon"><Folder /></el-icon>
              <span class="meta-text">{{ categoriesDisplay }}</span>
            </div>
            <div v-if="tagsDisplay" class="meta-entry">
              <el-icon class="meta-icon"><PriceTag /></el-icon>
              <span class="meta-text">{{ tagsDisplay }}</span>
            </div>
          </div>
          <div class="meta-row">
            <el-icon class="meta-icon"><Timer /></el-icon>
            <span class="meta-text">{{ dateDisplay }}</span>
          </div>
        </div>
      </div>
      <div class="preview-columns">
        <div class="toc-column">
          <div class="toc-title">目录</div>
          <el-scrollbar class="toc-scroll">
            <template v-if="tocItems.length > 0">
              <div
                v-for="item in tocItems"
                :key="item.id"
                :class="['toc-item', `toc-level-${item.level}`]"
                @click="scrollToHeading(item.id)">
                <span v-if="item.index" class="toc-index">{{ item.index }}.</span>
                <span class="toc-text">{{ item.text }}</span>
              </div>
            </template>
            <div v-else class="toc-empty">--</div>
          </el-scrollbar>
        </div>
        <div ref="previewScrollRef" class="content-column">
          <div class="content-inner content-body" :data-top-level="topHeadingLevel ?? ''">
            <MdPreview :key="renderKey" :modelValue="content" :sanitize="filterImage" />
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.preview-layout {
  min-height: 400px;
  max-height: 75vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.preview-header {
  width: 100%;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}
.preview-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.4;
}
.preview-meta {
  font-size: 14px;
  color: #4b5563;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.meta-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.meta-entry {
  display: flex;
  align-items: center;
  gap: 6px;
}
.meta-icon {
  font-size: 16px;
  color: #6b7280;
}
.meta-text {
  color: #1f2937;
}
.preview-columns {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 16px;
  flex: 1 1 auto;
  min-height: 320px;
}
.toc-column {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
}
.toc-title {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}
.toc-scroll {
  flex: 1 1 auto;
  max-height: 100%;
}
.toc-item {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1f2937;
}
.toc-item:hover {
  background: #e5e7eb;
}
.toc-level-1 {
  font-weight: 600;
}
.toc-level-2 {
  padding-left: 16px;
}
.toc-level-3 {
  padding-left: 28px;
  font-size: 13px;
}
.toc-index {
  color: #2563eb;
}
.toc-empty {
  color: #9ca3af;
  font-size: 13px;
  padding: 6px 8px;
}
.toc-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.content-column {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  overflow-y: auto;
}
.content-inner {
  max-width: 880px;
  margin: 0 auto;
  line-height: 1.6;
  font-size: 16px;
}
.content-body :deep(h1),
.content-body :deep(h2),
.content-body :deep(h3) {
  margin: 16px 0 12px;
  color: #111827;
  line-height: 1.35;
}
.content-body {
  counter-reset: preview-top-heading;
}
.content-body[data-top-level='1'] :deep(.md-editor-preview h1),
.content-body[data-top-level='2'] :deep(.md-editor-preview h2),
.content-body[data-top-level='3'] :deep(.md-editor-preview h3) {
  position: relative;
  color: #1f4b99;
  padding-bottom: 4px;
  margin: 22px 0 22px;
  counter-increment: preview-top-heading;
}
.content-body[data-top-level='1'] :deep(.md-editor-preview h1::before),
.content-body[data-top-level='2'] :deep(.md-editor-preview h2::before),
.content-body[data-top-level='3'] :deep(.md-editor-preview h3::before) {
  content: counter(preview-top-heading) '. ';
  font-weight: 700;
  margin-right: 6px;
}
.content-body[data-top-level='1'] :deep(.md-editor-preview h1::after),
.content-body[data-top-level='2'] :deep(.md-editor-preview h2::after),
.content-body[data-top-level='3'] :deep(.md-editor-preview h3::after) {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 34%;
  border-bottom: 3px solid #1f4b99;
}
.content-body[data-top-level='2'] :deep(.md-editor-preview h3) {
  padding-bottom: 3px;
}
.content-body[data-top-level='2'] :deep(.md-editor-preview h3::after),
.content-body[data-top-level='3'] :deep(.md-editor-preview h4::after) {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 30%;
  border-bottom: 1px solid #1f4b99;
}
</style>
