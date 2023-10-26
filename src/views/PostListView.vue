<script lang="ts" setup>
import type { Post } from '@/local.d.ts'
import router from '@/router'
import { ref } from 'vue'
let posts = ref<null | Post[]>(null)

async function fetch() {
  let data = await window.site.getPosts()
  posts.value = data
}

fetch()

function onClick(sourcePath: string) {
  console.log('send parmas: ', sourcePath)
  router.push({ name: 'editor', params: { sourcePath: sourcePath } })
}
</script>
<template>
  <el-table :data="posts" stripe style="width: 100%">
    <el-table-column prop="title" label="标题" width="360" />
    <el-table-column prop="status" label="状态" />
    <el-table-column prop="tags" label="标签" />
    <el-table-column prop="categories" label="分类" />
    <el-table-column prop="date" label="发表日" />
    <el-table-column prop="updated" label="更新于" />
    <el-table-column label="操作">
      <template #default="scope">
        <el-button link type="primary" @click="onClick(scope.row.source)">Edit</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
<style scoped></style>
