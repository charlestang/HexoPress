<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import type { Asset } from '@/local'
import { watchEffect } from 'vue'

const { t } = useI18n()

const assets = ref<undefined | Asset[]>(undefined)

function fetchAssets() {
  window.site.getAssets().then(res => {
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
    <el-table-column prop="modified" label="modified"></el-table-column>
    <el-table-column prop="renderable" label="renderable"></el-table-column>
    <el-table-column prop="source" label="source"></el-table-column>
  </el-table>
</template>
