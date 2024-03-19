<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ref, watchEffect } from 'vue'

const { t } = useI18n()

const assets = ref<Asset[]>([])

function fetchAssets() {
  window.site.getAssets().then((res) => {
    assets.value = res
  })
}

watchEffect(() => {
  fetchAssets()
})
</script>
<template>
  <h2>{{ t('mediaLibrary.MediaLibrary') }}</h2>

  <el-table :data="assets" stripe style="width: 100%; margin-bottom: 10px">
    <el-table-column prop="id" label="id"></el-table-column>
    <el-table-column prop="path" label="path"></el-table-column>
    <el-table-column :label="t('mediaLibrary.preview')">
      <template #default="scope">
        <template v-if="scope.row.path.endsWith('png') || scope.row.path.endsWith('jpg')">
          <img :src="'http://127.0.0.1:2357/' + scope.row.path" width="100px" />
        </template>
      </template>
    </el-table-column>
    <el-table-column prop="modified" label="modified"></el-table-column>
    <el-table-column prop="renderable" label="renderable"></el-table-column>
    <el-table-column prop="source" label="source"></el-table-column>
  </el-table>
</template>
