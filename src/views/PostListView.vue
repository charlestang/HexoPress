<script lang="ts" setup>
import type { Post } from '@/local.d.ts'
import router from '@/router'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
let posts = ref<null | Post[]>(null)
let allCount = ref<null | number>(null)
let postCount = ref<null | number>(null)
let draftCount = ref<null | number>(null)
async function fetch() {
  let data = await window.site.getPosts()
  posts.value = data
}

fetch()
async function fetchStats() {
  let data = await window.site.getStats()
  console.log('stats: ', data)
  allCount.value = data.postCount + data.postDraftCount
  postCount.value = data.postCount
  draftCount.value = data.postDraftCount
}

fetchStats()

function onClick(sourcePath: string) {
  console.log('send parmas: ', sourcePath)
  router.push({ name: 'editor', params: { sourcePath: sourcePath } })
}
</script>
<template>
  <h2>{{ t('posts.pageTitle') }}</h2>
  <el-row>
    <el-col :span="12"
      >{{ t('posts.all') }} {{ allCount !== null ? '(' + allCount + ')' : '' }} |
      {{ t('posts.published') }} | {{ t('posts.draft') }}</el-col
    >
    <el-col :span="12"></el-col>
  </el-row>
  <el-table :data="posts" stripe style="width: 100%">
    <el-table-column prop="title" :label="t('posts.title')" width="360" />
    <el-table-column prop="status" :label="t('posts.status')" />
    <el-table-column prop="tags" :label="t('posts.tags')" />
    <el-table-column prop="categories" :label="t('posts.categories')" />
    <el-table-column prop="date" :label="t('posts.publishedDate')" />
    <el-table-column prop="updated" :label="t('posts.updatedDate')" />
    <el-table-column label="操作">
      <template #default="scope">
        <el-button link type="primary" @click="onClick(scope.row.source)">Edit</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
<style scoped></style>
