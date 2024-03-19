<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const tags = ref<Tag[]>([])
const tagsCount = ref(0)

async function fetch() {
  tags.value = await window.site.getTags()
  tagsCount.value = tags.value.length
}
fetch()

const sortedTags = computed(() => {
  if (tags.value == null) {
    return []
  }
  return tags.value?.slice().sort((a, b) => {
    return b.length - a.length
  })
})
const midIndex = computed(() => {
  return Math.ceil(sortedTags.value.length / 2)
})
const firstHalf = computed(() => {
  if (tags.value == null) {
    return []
  }
  return sortedTags.value?.slice(0, midIndex.value)
})
const secondHalf = computed(() => {
  if (tags.value == null) {
    return []
  }
  return sortedTags.value?.slice(midIndex.value)
})

function onClickLink(url: string) {
  window.site.openUrl(url)
}
</script>

<template>
  <h2>{{ t('common.tags') }} {{ t('tags.stats', { count: tagsCount }) }}</h2>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-table
        :data="firstHalf"
        style="width: 100%; margin-bottom: 20px"
        row-key="id"
        :border="false"
        :stripe="true"
        default-expand-all>
        <el-table-column prop="name" :label="t('tags.name')" sortable>
          <template #default="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="length" :label="t('tags.total')" sortable />
        <el-table-column :label="t('tags.actions')">
          <template #default="scope">
            <el-link type="primary" link @click="onClickLink(scope.row.permalink)">{{
              t('tags.view')
            }}</el-link>
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
        <el-table-column prop="name" :label="t('tags.name')" sortable>
          <template #default="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="length" :label="t('tags.total')" sortable />
        <el-table-column :label="t('tags.actions')">
          <template #default="scope">
            <el-link type="primary" link @click="onClickLink(scope.row.permalink)">{{
              t('tags.view')
            }}</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>
