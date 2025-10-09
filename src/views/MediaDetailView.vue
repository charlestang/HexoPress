<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, ref, watchEffect } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { buildImageGroups, type ImageAssetGroup } from '@/utils/media'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

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
    await ElMessageBox.confirm(t('mediaLibrary.deleteConfirmMessage'), t('mediaLibrary.deleteConfirmTitle'), {
      confirmButtonText: t('posts.confirm'),
      cancelButtonText: t('posts.cancel'),
      type: 'warning',
    })
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

const selectedGroup = computed(() =>
  imageGroups.value.find((group) => group.key === groupKey.value) ?? null,
)

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
</script>
<template>
  <div class="media-detail-page">
    <h2 class="media-detail-page__title">{{ t('mediaLibrary.detailTitle') }}</h2>

    <el-breadcrumb separator="/" class="media-detail-page__breadcrumb">
      <el-breadcrumb-item>
        <router-link :to="{ name: 'media-library' }">{{ t('mediaLibrary.MediaLibrary') }}</router-link>
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ selectedGroup?.displayName ?? t('mediaLibrary.detailFallback') }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card v-if="selectedGroup" class="media-detail-card">
      <div class="media-detail-card__header">
        <span class="media-detail-card__title">{{ selectedGroup.displayName }}</span>
        <el-button link type="primary" @click="handleBack">{{ t('mediaLibrary.backToList') }}</el-button>
      </div>

      <div class="media-detail-card__preview">
        <img
          :src="assetUrl(selectedGroup.representative)"
          :alt="assetName(selectedGroup.representative)" />
      </div>

      <el-descriptions :column="1" border class="media-detail-card__info">
        <el-descriptions-item :label="t('mediaLibrary.id')">
          {{ selectedGroup.representative.id }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('mediaLibrary.path')">
          {{ selectedGroup.representative.path }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('mediaLibrary.modified')">
          {{ selectedGroup.representative.modified }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('mediaLibrary.renderable')">
          {{ selectedGroup.representative.renderable }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('mediaLibrary.source')">
          {{ selectedGroup.representative.source }}
        </el-descriptions-item>
      </el-descriptions>

      <h3 class="media-detail-card__subtitle">
        {{ t('mediaLibrary.imageVariants') }} · {{ t('mediaLibrary.variantCount', { count: selectedGroup.assets.length }) }}
      </h3>

      <el-table
        :data="selectedGroup.assets"
        :row-key="(row) => row.id"
        border
        size="small"
        class="media-detail-card__table">
        <el-table-column :label="t('mediaLibrary.preview')" width="140">
          <template #default="scope">
            <img
              class="media-detail-card__variant-preview"
              :src="assetUrl(scope.row)"
              :alt="assetName(scope.row)" />
          </template>
        </el-table-column>
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
    </el-card>

    <el-empty v-else :description="t('mediaLibrary.detailMissing')">
      <el-button type="primary" @click="handleBack">{{ t('mediaLibrary.backToList') }}</el-button>
    </el-empty>
  </div>
</template>

<style scoped>
.media-detail-page {
  display: flex;
  flex-direction: column;
}

.media-detail-page__breadcrumb {
  margin-bottom: 16px;
  font-size: 13px;
  font-weight: 400;
}

.media-detail-page__title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.media-detail-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.media-detail-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.media-detail-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.media-detail-card__preview {
  display: flex;
  justify-content: center;
  align-items: center;
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
  margin-top: 4px;
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
</style>
