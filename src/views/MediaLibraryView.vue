<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ref, watchEffect, computed } from 'vue'

const { t } = useI18n()

const assets = ref<Asset[]>([])
const fileTypeFilter = ref('all')

function fetchAssets() {
  window.site.getAssets().then((res) => {
    assets.value = res
  })
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
        <template v-if="scope.row.path.endsWith('png') || scope.row.path.endsWith('jpg')">
          <img :src="'http://127.0.0.1:2357/' + scope.row.path" width="100px" />
        </template>
      </template>
    </el-table-column>
    <el-table-column prop="modified" :label="t('mediaLibrary.modified')"></el-table-column>
    <el-table-column prop="renderable" :label="t('mediaLibrary.rederable')"></el-table-column>
    <el-table-column prop="source" :label="t('mediaLibrary.source')"></el-table-column>
  </el-table>
</template>
