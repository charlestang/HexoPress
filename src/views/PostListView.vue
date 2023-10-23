<script lang="ts" setup>
import { ref } from 'vue'
import type { Post } from '@/local.d.ts'
let posts = ref<null | Post[]>(null)

async function fetch() {
  let x = '3'
  let y = 4
  let z = false
  let data = await window.site.getPosts(x, y, z)
  posts.value = data
  
}

fetch()

</script>
<template>
  <el-table :data="posts" stripe style="width: 100%">
    <el-table-column prop="title" label="标题" width="360" />
    <!--
    <el-table-column prop="categories" label="分类" width="200" />
    <el-table-column prop="tags" label="标签" width="200" />
    -->
    <el-table-column prop="date" label="日期" />
  </el-table>
</template>
<style scoped></style>
