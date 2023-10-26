<template>
  <el-container>
    <el-header class="topbar">
      <img alt="Hexo Writer" height="48" width="48" class="logo" src="../assets/logo.svg" />
      <el-button key="back" class="back" text :icon="Back" @click="router.go(-1)">Back</el-button>
    </el-header>
    <el-main>
      <MdEditor class="editor" v-model="text" />
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { Back } from '@element-plus/icons-vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ref } from 'vue'
import router from '../router'
import type RouteLocationNormalized from 'vue-router'

const text = ref('# Hello Editor')
</script>

<style scoped>
.topbar {
  color: #fff;
  background: #59524c;
  height: 48px;
  padding-left: 0;
}
.logo {
  float: left;
  margin-left: 8px;
}

.back {
  height: 40px;
  margin: 4px 0;
  color: #fff;
}
.back:hover {
  color: #c7a589;
}

.editor {
  height: calc(100vh - 48px - 40px);
}
</style>
