<script lang="ts" setup>
import { site } from '@/bridge'
import { useI18n } from 'vue-i18n'
import { ref, watchEffect, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { buildImageGroups, type ImageAssetGroup } from '@/utils/media'

const { t } = useI18n()

const router = useRouter()

const assets = ref<Asset[]>([])
const activeTab = ref<'images' | 'files'>('images')
const deletingState = ref<Record<string, boolean>>({})

const previewableExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
const deletableExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']
const assetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL

async function fetchAssets() {
  const res = await site.getAssets()
  assets.value = res
}

function hasExtension(asset: Asset, extensions: string[]) {
  const lowerPath = asset.path.toLowerCase()
  return extensions.some((ext) => lowerPath.endsWith(ext))
}

function isPreviewAsset(asset: Asset) {
  return hasExtension(asset, previewableExtensions)
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
    // user cancelled
    return
  }

  try {
    setDeleting(asset.id, true)
    await site.deleteAsset(asset.id)
    ElMessage.success(t('mediaLibrary.deleteSuccess'))
    await fetchAssets()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    ElMessage.error(`${t('mediaLibrary.deleteFailed')}${message}`)
  } finally {
    setDeleting(asset.id, false)
  }
}

function assetUrl(asset: Asset) {
  return `${assetBaseUrl}${asset.path}`
}

function assetName(asset: Asset) {
  const segments = asset.path.split('/')
  return segments[segments.length - 1] || asset.path
}

const fileAssets = computed(() => assets.value.filter((asset) => !isPreviewAsset(asset)))

const imageGroups = computed<ImageAssetGroup[]>(() =>
  buildImageGroups(assets.value, previewableExtensions),
)

function handleImageGroupClick(group: ImageAssetGroup) {
  router.push({ name: 'media-detail', params: { groupKey: encodeURIComponent(group.key) } })
}

watchEffect(() => {
  fetchAssets()
})
</script>
<template>
  <h2>{{ t('mediaLibrary.MediaLibrary') }}</h2>

  <el-tabs v-model="activeTab">
    <el-tab-pane :label="t('mediaLibrary.imagesTab')" name="images">
      <div v-if="imageGroups.length" class="media-grid">
        <div
          v-for="group in imageGroups"
          :key="group.key"
          class="media-card"
          @click="handleImageGroupClick(group)">
          <div class="media-card__preview">
            <img :src="assetUrl(group.representative)" :alt="assetName(group.representative)" />
          </div>
          <div class="media-card__body">
            <div class="media-card__path" :title="group.displayName">{{ group.displayName }}</div>
            <div class="media-card__meta">
              {{ t('mediaLibrary.variantCount', { count: group.assets.length }) }}
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else :description="t('mediaLibrary.noImages')" />
    </el-tab-pane>

    <el-tab-pane :label="t('mediaLibrary.filesTab')" name="files">
      <el-table
        v-if="fileAssets.length"
        :data="fileAssets"
        stripe
        style="width: 100%; margin-bottom: 10px">
        <el-table-column prop="id" :label="t('mediaLibrary.id')"></el-table-column>
        <el-table-column prop="path" :label="t('mediaLibrary.path')"></el-table-column>
        <el-table-column prop="modified" :label="t('mediaLibrary.modified')"></el-table-column>
        <el-table-column prop="renderable" :label="t('mediaLibrary.renderable')"></el-table-column>
        <el-table-column prop="source" :label="t('mediaLibrary.source')"></el-table-column>
        <el-table-column :label="t('mediaLibrary.operation')" width="120">
          <template #default="scope">
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
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else :description="t('mediaLibrary.noFiles')" />
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped>
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.media-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color, #ebeef5);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--el-bg-color, #fff);
  min-width: 0;
  width: 100%;
  max-width: 250px;
  margin: 0 auto;
  justify-self: center;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.media-card:hover {
  border-color: var(--el-color-primary, #409eff);
  box-shadow: 0 0 0 1px var(--el-color-primary, #409eff);
}

.media-card__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: var(--el-fill-color-light, #f5f7fa);
  min-height: 180px;
}

.media-card__preview img {
  max-width: 100%;
  max-height: 220px;
  object-fit: contain;
}

.media-card__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px;
  gap: 6px;
}

.media-card__path {
  flex: 1;
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  word-break: break-all;
}

.media-card__meta {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
}
</style>
