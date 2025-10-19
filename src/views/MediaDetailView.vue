<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { buildImageGroups, type ImageAssetGroup } from '@/utils/media'
import { useAppStore } from '@/stores/app'
import { formatDate } from '@shared/utils/date'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const assets = ref<Asset[]>([])
const deletingState = ref<Record<string, boolean>>({})

const previewableExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
const deletableExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']
const assetBaseUrl = 'http://127.0.0.1:2357/'

async function fetchAssets() {
  const res = await window.site.getAssets()
  assets.value = res
}

function assetUrl(asset: Asset) {
  return `${assetBaseUrl}${asset.path}`
}

function assetName(asset: Asset) {
  const segments = asset.path.split('/')
  return segments[segments.length - 1] || asset.path
}

function hasExtension(asset: Asset, extensions: string[]) {
  const lowerPath = asset.path.toLowerCase()
  return extensions.some((ext) => lowerPath.endsWith(ext))
}

function isDeletableAsset(asset: Asset) {
  return hasExtension(asset, deletableExtensions)
}

function isDeleting(assetId: string) {
  return Boolean(deletingState.value[assetId])
}

function setDeleting(assetId: string, value: boolean) {
  if (value) {
    deletingState.value = {
      ...deletingState.value,
      [assetId]: true,
    }
  } else {
    const updated = { ...deletingState.value }
    delete updated[assetId]
    deletingState.value = updated
  }
}

async function handleDelete(asset: Asset) {
  if (!isDeletableAsset(asset)) {
    return
  }

  if (isDeleting(asset.id)) {
    return
  }

  try {
    await ElMessageBox.confirm(
      t('mediaLibrary.deleteConfirmMessage'),
      t('mediaLibrary.deleteConfirmTitle'),
      {
        confirmButtonText: t('posts.confirm'),
        cancelButtonText: t('posts.cancel'),
        type: 'warning',
      },
    )
  } catch {
    return
  }

  try {
    setDeleting(asset.id, true)
    await window.site.deleteAsset(asset.id)
    ElMessage.success(t('mediaLibrary.deleteSuccess'))
    await fetchAssets()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    ElMessage.error(`${t('mediaLibrary.deleteFailed')}${message}`)
  } finally {
    setDeleting(asset.id, false)
  }
}

const imageGroups = computed<ImageAssetGroup[]>(() =>
  buildImageGroups(assets.value, previewableExtensions),
)

const groupKey = computed(() => {
  const raw = route.params.groupKey
  if (Array.isArray(raw)) {
    return decodeURIComponent(raw[0] ?? '')
  }
  return raw ? decodeURIComponent(raw) : ''
})

const selectedGroup = computed(
  () => imageGroups.value.find((group) => group.key === groupKey.value) ?? null,
)

const representativeAsset = computed(() => selectedGroup.value?.representative ?? null)

const selectedFileName = computed(() => {
  if (!representativeAsset.value) {
    return t('mediaLibrary.detailFallback')
  }
  return assetName(representativeAsset.value)
})

const representativePreviewUrl = computed(() => {
  if (!representativeAsset.value) {
    return ''
  }
  const base = assetUrl(representativeAsset.value)
  const version = representativeAsset.value.modified
  if (!version) {
    return base
  }
  const separator = base.includes('?') ? '&' : '?'
  return `${base}${separator}v=${encodeURIComponent(String(version))}`
})

const representativeOpenUrl = computed(() => {
  if (!representativeAsset.value) {
    return ''
  }
  return assetUrl(representativeAsset.value)
})

const pageTitle = computed(() =>
  t('mediaLibrary.detailImageTitle', { name: selectedFileName.value }),
)

const representativeMeta = reactive({
  size: null as number | null,
  width: null as number | null,
  height: null as number | null,
  createdAt: null as string | null,
  updatedAt: null as string | null,
  loading: false,
})

type VariantMetaState = {
  size: number | null
  width: number | null
  height: number | null
}

const variantMetaMap = reactive<Record<string, VariantMetaState>>({})
const variantMetaLoading = ref(false)

const referencesDialogVisible = ref(false)
const referencesLoading = ref(false)
const referencesError = ref('')
const referencePosts = ref<Post[]>([])
const referenceAssetLabel = ref('')
const referenceAsset = ref<Asset | null>(null)
const allPostsCache = ref<Post[] | null>(null)

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) {
    return '--'
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  const precision = value < 10 && unitIndex > 0 ? 1 : 0
  return `${value.toFixed(precision)} ${units[unitIndex]}`
}

const formattedFileSize = computed(() => {
  if (!representativeMeta.size || representativeMeta.size <= 0) {
    return '--'
  }
  return formatBytes(representativeMeta.size)
})

const dimensionsLabel = computed(() => {
  if (!representativeMeta.width || !representativeMeta.height) {
    return '--'
  }
  return `${representativeMeta.width} × ${representativeMeta.height}`
})

const formattedCreatedAt = computed(() => {
  if (!representativeMeta.createdAt) {
    return '--'
  }
  return formatDate(representativeMeta.createdAt, appStore.locale)
})

const formattedUpdatedAt = computed(() => {
  if (!representativeMeta.updatedAt) {
    return '--'
  }
  return formatDate(representativeMeta.updatedAt, appStore.locale)
})

watchEffect(() => {
  fetchAssets()
})

watchEffect(() => {
  if (!groupKey.value) {
    return
  }

  if (!assets.value.length) {
    return
  }

  if (!selectedGroup.value) {
    router.replace({ name: 'media-library' })
  }
})

function handleBack() {
  router.push({ name: 'media-library' })
}

let metaRequestId = 0
watch(
  [representativeAsset, representativePreviewUrl],
  async ([asset, url]) => {
    representativeMeta.size = null
    representativeMeta.width = null
    representativeMeta.height = null
    representativeMeta.createdAt = null
    representativeMeta.updatedAt = null
    representativeMeta.loading = false
    if (!asset) {
      return
    }
    const currentRequest = ++metaRequestId
    const targetUrl = url || assetUrl(asset)
    representativeMeta.loading = true
    try {
      const [fileInfo, dimensions] = await Promise.all([
        window.site.getFileInfo(asset.path).catch(() => null),
        loadImageDimensions(targetUrl),
      ])
      if (metaRequestId !== currentRequest) {
        return
      }
      representativeMeta.size = fileInfo?.size ?? null
      representativeMeta.createdAt = fileInfo?.createdAt ?? null
      representativeMeta.updatedAt = fileInfo?.updatedAt ?? null
      representativeMeta.width = dimensions?.width ?? null
      representativeMeta.height = dimensions?.height ?? null
    } catch (error) {
      console.warn('Failed to load asset metadata', error)
    } finally {
      if (metaRequestId === currentRequest) {
        representativeMeta.loading = false
      }
    }
  },
  { immediate: true },
)

let variantMetaRequestId = 0
watch(
  () => (selectedGroup.value ? selectedGroup.value.assets.map((asset) => asset.id).join(',') : ''),
  async () => {
    variantMetaRequestId += 1
    const currentRequest = variantMetaRequestId
    Object.keys(variantMetaMap).forEach((key) => delete variantMetaMap[key])
    variantMetaLoading.value = false
    const group = selectedGroup.value
    if (!group || group.assets.length === 0) {
      return
    }
    variantMetaLoading.value = true
    try {
      await Promise.all(
        group.assets.map(async (asset) => {
          try {
            const [fileInfo, dimensions] = await Promise.all([
              window.site.getFileInfo(asset.path).catch(() => null),
              loadImageDimensions(assetUrl(asset)),
            ])
            if (variantMetaRequestId !== currentRequest) {
              return
            }
            variantMetaMap[asset.id] = {
              size: fileInfo?.size ?? null,
              width: dimensions?.width ?? null,
              height: dimensions?.height ?? null,
            }
          } catch (error) {
            console.warn('Failed to load variant metadata', error)
          }
        }),
      )
    } finally {
      if (variantMetaRequestId === currentRequest) {
        variantMetaLoading.value = false
      }
    }
  },
  { immediate: true },
)

function variantSizeLabel(asset: Asset): string {
  const meta = variantMetaMap[asset.id]
  if (!meta || meta.size == null || meta.size <= 0) {
    return variantMetaLoading.value ? '...' : '--'
  }
  return formatBytes(meta.size)
}

function variantDimensionsLabel(asset: Asset): string {
  const meta = variantMetaMap[asset.id]
  if (!meta || !meta.width || !meta.height) {
    return variantMetaLoading.value ? '...' : '--'
  }
  return `${meta.width} × ${meta.height}`
}

async function ensureAllPostsLoaded(): Promise<void> {
  if (allPostsCache.value) {
    return
  }
  try {
    const result = await window.site.getPosts(true, true, -1, 0)
    allPostsCache.value = result?.posts ?? []
  } catch (error) {
    console.warn('Failed to load posts for references', error)
    allPostsCache.value = []
  }
}

let referencesRequestId = 0
async function viewAssetReferences(asset: Asset) {
  referenceAssetLabel.value = assetName(asset)
  referenceAsset.value = asset
  referencesDialogVisible.value = true
  referencesLoading.value = true
  referencesError.value = ''
  referencePosts.value = []
  const currentRequest = ++referencesRequestId
  try {
    const references = await window.site.getAssetReferences(asset.path)
    if (referencesRequestId !== currentRequest) {
      return
    }
    const normalized = new Set((references ?? []).map((ref) => ref.replace(/\\/g, '/')))
    if (normalized.size === 0) {
      return
    }
    await ensureAllPostsLoaded()
    if (referencesRequestId !== currentRequest) {
      return
    }
    const posts = allPostsCache.value ?? []
    referencePosts.value = posts.filter((post) => normalized.has(post.source.replace(/\\/g, '/')))
  } catch (error) {
    referencesError.value = error instanceof Error ? error.message : String(error)
  } finally {
    if (referencesRequestId === currentRequest) {
      referencesLoading.value = false
    }
  }
}

function openAssetInBrowser(asset: Asset) {
  window.site.openUrl(assetUrl(asset))
}

function openPostEditor(post: Post) {
  router.push({ path: '/frame', query: { sourcePath: post.source } })
}

const canDeleteReferenceAsset = computed(() =>
  referenceAsset.value ? isDeletableAsset(referenceAsset.value) : false,
)

const resolveRowKey = (row: Asset) => row.id

function closeReferencesDialog() {
  referencesDialogVisible.value = false
  referenceAsset.value = null
}

async function deleteReferenceAsset() {
  const asset = referenceAsset.value
  if (!asset) {
    return
  }
  await handleDelete(asset)
  if (!assets.value.some((entry) => entry.id === asset.id)) {
    closeReferencesDialog()
  }
}

function loadImageDimensions(url: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => resolve(null)
    image.src = url
  })
}
</script>
<template>
  <div class="media-detail-page">
    <div class="media-detail-page__header">
      <div class="media-detail-page__header-left">
        <h2 class="media-detail-page__title">
          {{ pageTitle }}
        </h2>
      </div>
      <div class="media-detail-page__header-right">
        <el-button size="small" @click="handleBack">{{ t('mediaLibrary.backToList') }}</el-button>
      </div>
    </div>

    <el-card v-if="selectedGroup" class="media-detail-card">
      <div class="media-detail-card__content">
        <div class="media-detail-card__preview">
          <img :src="representativePreviewUrl" :alt="assetName(selectedGroup.representative)" />
        </div>

        <el-descriptions :column="1" border class="media-detail-card__info">
          <el-descriptions-item :label="t('mediaLibrary.fileSize')">
            {{ representativeMeta.loading ? '...' : formattedFileSize }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('mediaLibrary.dimensions')">
            {{ representativeMeta.loading ? '...' : dimensionsLabel }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('mediaLibrary.createdAt')">
            {{ representativeMeta.loading ? '...' : formattedCreatedAt }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('mediaLibrary.updatedAt')">
            {{ representativeMeta.loading ? '...' : formattedUpdatedAt }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('mediaLibrary.openInBrowser')">
            <el-link
              v-if="representativeOpenUrl"
              type="primary"
              :href="representativeOpenUrl"
              target="_blank"
              rel="noopener">
              {{ t('mediaLibrary.openInBrowserLink') }}
            </el-link>
            <span v-else>--</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <h3 class="media-detail-card__subtitle">
        {{ t('mediaLibrary.imageVariants') }} ·
        {{ t('mediaLibrary.variantCount', { count: selectedGroup.assets.length }) }}
      </h3>

      <el-table
        :data="selectedGroup.assets"
        :row-key="resolveRowKey"
        border
        size="small"
        class="media-detail-card__table"
        v-loading="variantMetaLoading">
        <el-table-column :label="t('mediaLibrary.preview')" width="140">
          <template #default="scope">
            <img
              class="media-detail-card__variant-preview"
              :src="assetUrl(scope.row)"
              :alt="assetName(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="path" :label="t('mediaLibrary.path')"></el-table-column>
        <el-table-column :label="t('mediaLibrary.fileSize')" width="140">
          <template #default="scope">
            {{ variantSizeLabel(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('mediaLibrary.dimensions')" width="140">
          <template #default="scope">
            {{ variantDimensionsLabel(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('mediaLibrary.operation')" width="220">
          <template #default="scope">
            <div class="media-detail-card__variant-actions">
              <el-button type="primary" link size="small" @click="openAssetInBrowser(scope.row)">
                {{ t('mediaLibrary.openInBrowserLink') }}
              </el-button>
              <el-button type="primary" link size="small" @click="viewAssetReferences(scope.row)">
                {{ t('mediaLibrary.viewReferences') }}
              </el-button>
              <el-button
                v-if="isDeletableAsset(scope.row)"
                type="danger"
                link
                size="small"
                :loading="isDeleting(scope.row.id)"
                :disabled="isDeleting(scope.row.id)"
                @click="handleDelete(scope.row)">
                {{ t('mediaLibrary.delete') }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-empty v-else :description="t('mediaLibrary.detailMissing')">
      <el-button type="primary" @click="handleBack">{{ t('mediaLibrary.backToList') }}</el-button>
    </el-empty>

    <el-dialog
      v-model="referencesDialogVisible"
      :title="t('mediaLibrary.referenceDialogTitle', { name: referenceAssetLabel })"
      width="640px">
      <div v-loading="referencesLoading">
        <el-alert
          v-if="referencesError"
          type="error"
          :closable="false"
          :title="referencesError"
          class="mb-3" />
        <el-empty
          v-else-if="!referencesLoading && referencePosts.length === 0"
          :description="t('mediaLibrary.referenceDialogEmpty')" />
        <el-table v-else :data="referencePosts" border size="small" style="width: 100%">
          <el-table-column :label="t('categoryDetail.table.title')" min-width="220">
            <template #default="scope">
              <el-link type="primary" @click="openPostEditor(scope.row)">
                {{ scope.row.title }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="source" :label="t('mediaLibrary.path')" min-width="200" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="closeReferencesDialog()">
          {{ t('categoryDetail.actions.cancel') }}
        </el-button>
        <el-button
          v-if="!referencesLoading && referencePosts.length === 0 && canDeleteReferenceAsset"
          type="danger"
          :disabled="!canDeleteReferenceAsset"
          @click="deleteReferenceAsset()">
          {{ t('mediaLibrary.referenceDialogDelete') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.media-detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.media-detail-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.media-detail-page__header-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.media-detail-page__title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.media-detail-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.media-detail-card__content {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
}

.media-detail-card__preview {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1 1 60%;
  min-width: 320px;
  background-color: var(--el-fill-color-light, #f5f7fa);
  border-radius: 8px;
  padding: 16px;
}

.media-detail-card__preview img {
  max-width: 100%;
  max-height: 360px;
  object-fit: contain;
}

.media-detail-card__info {
  flex: 1 1 240px;
  min-width: 200px;
  max-width: 320px;
}

.media-detail-card__subtitle {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.media-detail-card__table {
  width: 100%;
}

.media-detail-card__variant-preview {
  width: 120px;
  max-height: 120px;
  object-fit: contain;
  background-color: var(--el-fill-color-lighter, #fafafa);
  border-radius: 4px;
}

.media-detail-card__variant-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
