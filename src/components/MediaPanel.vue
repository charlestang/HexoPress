<script lang="ts" setup>
import { computed, nextTick, reactive, ref, watch, type ComponentPublicInstance } from 'vue'
import { site } from '@/bridge'
import SearchBar from '@/components/SearchBar.vue'
import { formatBytes } from '@/utils/number'
import { computeRelativeImagePath } from '@/utils/path'

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp']
const assetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL

type MediaItem = {
  asset: Asset
  name: string
  url: string
  fileInfo: AssetFileInfo | null
}

const props = defineProps<{
  active: boolean
  uploadKey?: number
  permalink?: string
}>()

const emit = defineEmits<{
  (event: 'request-insert', markdown: string): void
}>()

const items = ref<MediaItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const matchIndex = ref(-1)
const pendingUploadRefresh = ref(false)
const previewVisible = ref(false)
const previewItem = ref<MediaItem | null>(null)
const previewMeta = reactive({ width: 0, height: 0 })

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())
const matchIndices = computed(() => {
  if (!normalizedQuery.value) {
    return []
  }
  const indices: number[] = []
  items.value.forEach((item, index) => {
    if (item.name.toLowerCase().includes(normalizedQuery.value)) {
      indices.push(index)
    }
  })
  return indices
})
const totalMatches = computed(() => matchIndices.value.length)
const activeMatchId = computed(() => {
  if (totalMatches.value === 0 || matchIndex.value < 0) {
    return null
  }
  const actualIndex = matchIndices.value[matchIndex.value]
  return actualIndex != null ? (items.value[actualIndex]?.asset.id ?? null) : null
})

const itemRefs = new Map<string, HTMLElement>()
function setItemRef(id: string) {
  return (el: Element | ComponentPublicInstance | null) => {
    const element = (el as HTMLElement | null) ?? null
    if (!element) {
      itemRefs.delete(id)
      return
    }
    itemRefs.set(id, element)
  }
}

watch(
  () => props.active,
  (active) => {
    if (active) {
      loadAssets()
      pendingUploadRefresh.value = false
    }
  },
  { immediate: true },
)

watch(
  () => props.uploadKey,
  () => {
    if (props.active) {
      loadAssets()
    } else {
      pendingUploadRefresh.value = true
    }
  },
)

watch(matchIndices, () => {
  matchIndex.value = matchIndices.value.length > 0 ? 0 : -1
})

watch(matchIndex, () => {
  scrollToActiveMatch()
})

async function loadAssets() {
  loading.value = true
  error.value = null
  try {
    const assets = await site.getAssets()
    const imageAssets = assets.filter((asset) => isImageAsset(asset.path))
    const enriched = await Promise.all(
      imageAssets.map(async (asset) => {
        const fileInfo = await site.getFileInfo(asset.path).catch(() => null)
        return {
          asset,
          fileInfo,
          name: extractName(asset.path),
          url: assetUrl(asset.path),
        }
      }),
    )
    enriched.sort((a, b) => getTimestamp(b) - getTimestamp(a))
    items.value = enriched
    if (pendingUploadRefresh.value) {
      pendingUploadRefresh.value = false
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    error.value = message
  } finally {
    loading.value = false
  }
}

function assetUrl(path: string) {
  return assetBaseUrl + path
}

function isImageAsset(path: string) {
  const lower = path.toLowerCase()
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

function extractName(path: string) {
  const segments = path.split('/')
  return segments[segments.length - 1] || path
}

function getTimestamp(item: MediaItem) {
  const updated = item.fileInfo?.updatedAt ?? item.fileInfo?.createdAt
  if (!updated) {
    return 0
  }
  return new Date(updated).getTime()
}

function highlightClass(index: number) {
  const isMatch = matchIndices.value.includes(index)
  const isActive = activeMatchId.value === items.value[index]?.asset.id
  return {
    'is-match': isMatch,
    'is-active-match': isActive,
  }
}

function handleSearchNavigate(direction: 'prev' | 'next') {
  if (totalMatches.value === 0) {
    return
  }
  if (direction === 'next') {
    matchIndex.value = (matchIndex.value + 1) % totalMatches.value
  } else {
    matchIndex.value = (matchIndex.value - 1 + totalMatches.value) % totalMatches.value
  }
}

function scrollToActiveMatch() {
  if (!activeMatchId.value) {
    return
  }
  nextTick(() => {
    const el = itemRefs.get(activeMatchId.value!)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function onItemClick(item: MediaItem, event: MouseEvent) {
  if (event.detail > 1) {
    return
  }
  openPreview(item)
}

function openPreview(item: MediaItem) {
  previewItem.value = item
  previewVisible.value = true
  previewMeta.width = 0
  previewMeta.height = 0
  const image = new Image()
  image.onload = () => {
    previewMeta.width = image.naturalWidth
    previewMeta.height = image.naturalHeight
  }
  image.src = item.url
}

function insertDirect(item: MediaItem) {
  requestInsert(item)
}

function insertFromPreview() {
  if (previewItem.value) {
    requestInsert(previewItem.value)
    previewVisible.value = false
  }
}

function requestInsert(item: MediaItem) {
  const permalink = props.permalink ?? ''
  const relativePath = computeRelativeImagePath(permalink, item.asset.path)
  const markdown = `![](${relativePath})\n\n`
  emit('request-insert', markdown)
}

watch(
  () => props.active,
  (active) => {
    if (active && pendingUploadRefresh.value) {
      loadAssets()
    }
  },
)
</script>

<template>
  <div class="media-panel">
    <SearchBar
      v-model="searchQuery"
      :total="totalMatches"
      :current-index="totalMatches ? matchIndex + 1 : 0"
      :disabled="loading"
      :placeholder="$t('mediaLibrary.searchPlaceholder') as string"
      @navigate="handleSearchNavigate" />
    <div v-if="error" class="media-panel__error">
      <el-alert :title="error" type="error" show-icon />
    </div>
    <el-skeleton v-else-if="loading" :rows="6" animated />
    <template v-else>
      <el-scrollbar class="media-panel__scroll">
        <div v-if="items.length" class="media-grid">
          <div
            v-for="(item, index) in items"
            :key="item.asset.id"
            :ref="setItemRef(item.asset.id)"
            class="media-item"
            :class="highlightClass(index)"
            @click="onItemClick(item, $event)"
            @dblclick.stop="insertDirect(item)">
            <div class="media-item__thumb">
              <img :src="item.url" :alt="item.name" loading="lazy" />
            </div>
            <div class="media-item__name" :title="item.name">{{ item.name }}</div>
          </div>
        </div>
        <el-empty v-else :description="$t('mediaLibrary.noImages')" />
      </el-scrollbar>
    </template>

    <el-dialog v-model="previewVisible" width="480px" destroy-on-close>
      <template #header>
        <span>{{ previewItem?.name }}</span>
      </template>
      <div v-if="previewItem" class="preview-dialog">
        <div class="preview-dialog__image">
          <img :src="previewItem.url" :alt="previewItem.name" />
        </div>
        <div class="preview-dialog__meta">
          <div>
            <strong>Path:</strong>
            <span>{{ previewItem.asset.path }}</span>
          </div>
          <div v-if="previewItem.fileInfo?.size">
            <strong>Size:</strong>
            <span>{{ formatBytes(previewItem.fileInfo.size) }}</span>
          </div>
          <div v-if="previewMeta.width && previewMeta.height">
            <strong>Dimensions:</strong>
            <span>{{ previewMeta.width }} × {{ previewMeta.height }}</span>
          </div>
          <div v-if="previewItem.fileInfo?.createdAt">
            <strong>Created:</strong>
            <span>{{ new Date(previewItem.fileInfo.createdAt).toLocaleString() }}</span>
          </div>
          <div v-if="previewItem.fileInfo?.updatedAt">
            <strong>Updated:</strong>
            <span>{{ new Date(previewItem.fileInfo.updatedAt).toLocaleString() }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewVisible = false">{{ $t('posts.cancel') }}</el-button>
          <el-button type="primary" @click="insertFromPreview">{{ $t('editor.insert') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.media-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.media-panel__scroll {
  flex: 1;
  padding: 4px 8px 8px;
}
.media-panel__error {
  padding: 8px;
}
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}
.media-item {
  border: 1px solid var(--el-border-color, #ebeef5);
  border-radius: 6px;
  padding: 6px;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.media-item.is-match {
  border-color: var(--el-color-primary-light-5, #c6e2ff);
}
.media-item.is-active-match {
  border-color: var(--el-color-primary, #409eff);
  box-shadow: 0 0 0 1px var(--el-color-primary, #409eff);
}
.media-item.is-match .media-item__name {
  background: rgba(255, 245, 157, 0.8);
}
.media-item.is-active-match .media-item__name {
  background: rgba(255, 223, 128, 0.95);
}
.media-item__thumb {
  width: clamp(80px, 100%, 160px);
  height: clamp(80px, 120px, 160px);
  margin: 0 auto 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.media-item__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.media-item__name {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  word-break: break-all;
  border-radius: 4px;
  padding: 2px 4px;
}
.preview-dialog {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.preview-dialog__image {
  display: flex;
  justify-content: center;
  background: var(--el-fill-color-light, #f5f7fa);
  padding: 12px;
}
.preview-dialog__image img {
  max-width: 100%;
  max-height: 240px;
  object-fit: contain;
}
.preview-dialog__meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.preview-dialog__meta strong {
  margin-right: 4px;
}
</style>
