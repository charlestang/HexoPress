<script lang="ts" setup>
import type { Post } from '@/local.d.ts'
import { ref } from 'vue'
let posts = ref<null | Post[]>(null)

async function fetch() {
  let data = await window.site.getPosts()
  posts.value = data
}

fetch()

async function getConfig() {
  let path = await window.site.getConfig('defaultVault')
  console.log('test read config')
  console.log(path)
}

getConfig()
</script>
<template>
  <el-table :data="posts" stripe style="width: 100%">
    <el-table-column prop="title" label="标题" width="360" />
    <!--
    <el-table-column prop="categories" label="分类" width="200" />
    <el-table-column prop="tags" label="标签" width="200" />
    -->
    <el-table-column prop="status" label="状态" />
    <el-table-column prop="tags" label="标签" />
    <el-table-column prop="categories" label="分类" />
    <el-table-column prop="date" label="发表日" />
    <el-table-column prop="updated" label="更新于" />
  </el-table>
</template>
<style scoped></style>
