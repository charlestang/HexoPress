<script lang="ts" setup>
import type { Post } from '@/local.d.ts'
import router from '@/router'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// stats info
let allCount = ref<null | number>(null)
let postCount = ref<null | number>(null)
let draftCount = ref<null | number>(null)
async function fetchStats() {
  let data = await window.site.getStats()
  allCount.value = data.postCount + data.postDraftCount
  postCount.value = data.postCount
  draftCount.value = data.postDraftCount
}
fetchStats()
// posts list
const filters = {
  all: t('posts.all'),
  published: t('posts.published'),
  draft: t('posts.draft')
}
let currentFilter = ref(filters.all)
let posts = ref<null | Post[]>(null)
async function fetch() {
  let data
  if (currentFilter.value === filters.all) {
    data = await window.site.getPosts()
  } else if (currentFilter.value === filters.published) {
    data = await window.site.getPosts(true, false)
  } else {
    data = await window.site.getPosts(false, true)
  }
  posts.value = data
}
fetch()
watch(currentFilter, (value, oldValue) => {
  if (value !== oldValue) {
    fetch()
  }
})
// open editor
function onClick(sourcePath: string) {
  router.push({ path: '/editor', query: { sourcePath: sourcePath } })
}
</script>
<template>
  <h2>{{ t('posts.pageTitle') }}</h2>
  <el-row>
    <el-col :span="12">
      <div v-for="(caption, k, idx) in filters" :key="k" style="float: left">
        <el-button
          link
          type="primary"
          @click="currentFilter = caption"
          v-if="currentFilter !== caption"
          >{{ caption }}</el-button
        >
        <span v-else>{{ caption }}</span>
        <span v-if="k == 'all' && allCount != null">( {{ allCount }} )</span>
        <span v-if="k == 'published' && postCount != null">( {{ postCount }} )</span>
        <span v-if="k == 'draft' && draftCount != null">( {{ draftCount }} )</span>
        <span v-if="idx < Object.keys(filters).length - 1"> | </span>
      </div>
    </el-col>
    <el-col :span="12"></el-col>
  </el-row>
  <el-table :data="posts" stripe style="width: 100%">
    <el-table-column type="index" label="#" width="55" />
    <el-table-column :label="t('posts.title')" width="360">
      <template #default="scope">
        <el-row>
          <el-col :span="24">
            {{ scope.row.title }}
            <span v-if="scope.row.status == 'draft'" class="draft-status">
              -- {{ t('posts.draft') }}</span
            >
          </el-col>
        </el-row>
        <el-row class="op">
          <el-col :span="24">
            <el-button link type="primary" @click="onClick(scope.row.source)"
              >{{ t('posts.edit') }}
            </el-button>
            | <el-button link type="primary">{{ t('posts.editMeta') }}</el-button> |
            <el-button link type="danger">{{ t('posts.delete') }}</el-button>
          </el-col>
        </el-row>
      </template>
    </el-table-column>
    <el-table-column prop="categories" :label="t('posts.categories')" />
    <el-table-column prop="tags" :label="t('posts.tags')" />
    <el-table-column :label="t('posts.datetime')">
      <template #default="scope">
        <el-row>
          <el-col :span="24">
            <span v-if="scope.row.status == 'published'">{{ t('posts.published') }}</span>
            <span v-else>{{ t('posts.updatedDate') }}</span>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <span v-if="scope.row.status == 'published'">{{ scope.row.date }}</span>
            <span v-else>{{ scope.row.updated }}</span>
          </el-col>
        </el-row>
      </template>
    </el-table-column>
  </el-table>
</template>
<style>
.el-table .el-table__cell {
  vertical-align: top;
}
.draft-status {
  font-weight: bold;
}
.el-table__cell .op {
  display: none;
}
.el-table__cell:hover .op {
  display: block;
}
</style>
