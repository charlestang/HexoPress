<template>
  <h2>Dashboard</h2>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card>
        <template #header>
          <h4>Activities</h4>
        </template>
        <h5>Recent posts</h5>
        <ul>
          <li v-for="post in posts">{{ post.date }} : {{ post.title }}</li>
        </ul>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card>
        <template #header>
          <h4>Overviews</h4>
        </template>
        <el-button type="primary" :icon="Document" link>415 posts</el-button>
        <el-button type="primary" :icon="Document" link>7 pages</el-button>
        <el-button type="primary" :icon="Document" link>2,215 comments</el-button>
        <p>Hexo 6.3.0, use Next theme.</p>
      </el-card>
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import { Document } from '@element-plus/icons-vue'
import { ref } from 'vue'
import type { Post } from '@/local.d.ts'

let posts = ref<null | Post[]>(null)

async function fetch() {
  let data = await window.site.getPosts(false, 5)
  posts.value = data
}

fetch()
</script>
<style scoped>
h2 {
  line-height: 2em;
}
.el-card {
  --el-card-padding: 10px;
}
</style>
