<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ref, watchEffect, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const { t } = useI18n()

const assets = ref<Asset[]>([])
const fileTypeFilter = ref('all')
const deletingState = ref<Record<string, boolean>>({})

const previewableExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg']
const deletableExtensions = ['.png', '.jpg', '.jpeg']

async function fetchAssets() {
  const res = await window.site.getAssets()
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
    await ElMessageBox.confirm(t('mediaLibrary.deleteConfirmMessage'), t('mediaLibrary.deleteConfirmTitle'), {
      confirmButtonText: t('posts.confirm'),
      cancelButtonText: t('posts.cancel'),
      type: 'warning',
    })
  } catch {
    // user cancelled
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

const fileTypes = computed(() => {
  const types = new Set(assets.value.map((asset) => asset.path.split('.').pop() || ''))
  return ['all', ...Array.from(types)]
})

const filteredAssets = computed(() => {
  if (fileTypeFilter.value === 'all') {
    return assets.value
  }
  return assets.value.filter((asset) => asset.path.endsWith(fileTypeFilter.value))
})

watchEffect(() => {
  fetchAssets()
})
</script>
<template>
  <h2>{{ t('mediaLibrary.MediaLibrary') }}</h2>

  <el-select v-model="fileTypeFilter" style="margin-bottom: 20px">
    <el-option
      v-for="type in fileTypes"
      :key="type"
      :label="type === 'all' ? t('mediaLibrary.allTypes') : type"
      :value="type"></el-option>
  </el-select>

  <!-- Media file list. -->
  <el-table :data="filteredAssets" stripe style="width: 100%; margin-bottom: 10px">
    <el-table-column prop="id" :label="t('mediaLibrary.id')"></el-table-column>
    <el-table-column prop="path" :label="t('mediaLibrary.path')"></el-table-column>
    <el-table-column :label="t('mediaLibrary.preview')">
      <template #default="scope">
        <template v-if="isPreviewAsset(scope.row)">
          <img :src="'http://127.0.0.1:2357/' + scope.row.path" width="100px" />
        </template>
      </template>
    </el-table-column>
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
</template>
