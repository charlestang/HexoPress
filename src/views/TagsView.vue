<script lang="ts" setup>
import type { Tag } from '@/local.d.ts'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

let tags = ref<null | Tag[]>(null)

async function fetch() {
  tags.value = await window.site.getTags()
}

fetch()

let sortedTags = computed(() => {
  if (tags.value == null) {
    return []
  }
  return tags.value?.slice().sort((a, b) => {
    return b.length - a.length
  })
})
let midIndex = computed(() => {
  return Math.ceil(sortedTags.value.length / 2)
})
let firstHalf = computed(() => {
  if (tags.value == null) {
    return []
  }
  return sortedTags.value?.slice(0, midIndex.value)
})
let secondHalf = computed(() => {
  if (tags.value == null) {
    return []
  }
  return sortedTags.value?.slice(midIndex.value)
})
</script>

<template>
  <h2>{{ t('common.tags') }}</h2>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-table
        :data="firstHalf"
        style="width: 100%; margin-bottom: 20px"
        row-key="id"
        :border="false"
        :stripe="true"
        default-expand-all>
        <el-table-column prop="name" label="Name" sortable>
          <template #default="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="length" label="Total" sortable />
        <el-table-column label="Operation">
          <template #default="scope">
            <el-link type="primary" link :href="scope.row.permalink">{{ 'View' }}</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
    <el-col :span="12">
      <el-table
        :data="secondHalf"
        style="width: 100%; margin-bottom: 20px"
        row-key="id"
        :border="false"
        :stripe="true"
        default-expand-all>
        <el-table-column prop="name" label="Name" sortable>
          <template #default="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="length" label="Total" sortable />
        <el-table-column label="Operation">
          <template #default="scope">
            <el-link type="primary" link :href="scope.row.permalink">{{ 'View' }}</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>
