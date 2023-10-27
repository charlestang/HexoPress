<template>
  <el-row><el-col :span="24" class="control-bar" /></el-row>
  <el-row>
    <el-col :span="24">
      <img alt="Hexo Writer" height="48" width="48" src="../assets/logo.svg" />
      <div class="title">Hexo Writer</div>
      <el-button key="new-post" :icon="EditPen" text class="new" @click="handleNewPost"
        >New post</el-button
      >
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import { EditPen } from '@element-plus/icons-vue'
import router from '../router'

const handleNewPost = () => {
  router.push('/editor')
}
</script>
<style scoped>
.control-bar {
  height: 14px;
  display: block;
}
img {
  float: left;
  margin-left: 8px;
}
.title {
  float: left;
  line-height: 48px;
  padding: 0 12px;
}
.new {
  height: 40px;
  margin: 4px 0;
  color: #fff;
  -webkit-app-region: no-drag;
}
.new:hover {
  color: #c7a589;
}
</style>
