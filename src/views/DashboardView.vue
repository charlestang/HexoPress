<script lang="ts" setup>
import type { Post, Stats } from '@/local.d.ts'
import router from '@/router'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

let posts = ref<null | Post[]>(null)
let stats = ref<null | Stats>(null)

async function fetch() {
  let data = await window.site.getPosts(true, false, 5)
  posts.value = data
}
fetch()

async function fetchStats() {
  let data = await window.site.getStats()
  stats.value = data
}
fetchStats()

function onClick(sourcePath: string) {
  router.push({ name: 'editor', query: { sourcePath: sourcePath } })
}
</script>
<template>
  <h2>{{ t('common.dashboard') }}</h2>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card>
        <template #header>
          <h3>{{ t('common.activities') }}</h3>
        </template>
        <h4>Recent posts</h4>
        <ul class="latest-posts">
          <li v-for="post in posts" :key="post.permalink">
            <span>{{ post.date }}</span>
            <el-button link type="primary" @click="onClick(post.source)">{{
              post.title
            }}</el-button>
          </li>
        </ul>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card>
        <template #header>
          <h3>{{ t('common.overview') }}</h3>
        </template>
        <el-row class="stats">
          <el-col :span="8">
            <el-statistic title="Published" :value="stats?.postCount" :precision="0" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="Draft" :value="stats?.postDraftCount" :precision="0" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="Page" :value="stats?.pageCount" :precision="0" />
          </el-col>
        </el-row>
        <p>Hexo 6.3.0, use Next theme.</p>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card>
        <template #header>
          <h3>{{ t('common.system') }}</h3>
        </template>
      </el-card>
    </el-col>
  </el-row>
</template>
<style scoped>
h2 {
  line-height: 2.5em;
  font-weight: 500;
}
h3 {
  font-weight: 500;
}
.el-card {
  --el-card-padding: 10px;
  margin-bottom: 20px;
}
.stats .el-col {
  text-align: center;
}
.latest-posts {
  list-style: none;
  margin: 0;
  padding-inline-start: 0;
  font-size: 13px;
}
.latest-posts li {
  display: grid;
  grid-template-columns: clamp(200px, calc(2vw + 140px), 200px) auto;
  column-gap: 10px;
  padding: 6px 0;
  color: #646970;
}
.latest-posts li:nth-child(odd) {
  background-color: #f6f7f7;
}
.latest-posts .el-button {
  justify-content: left;
}
</style>
