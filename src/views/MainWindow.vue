<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavMenu from '../components/NavMenu.vue'
</script>

<template>
  <el-container>
    <el-header class="topbar">
      <header-bar />
    </el-header>
    <el-container class="main">
      <el-aside class="nav" width="collapse">
        <nav-menu />
      </el-aside>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.topbar {
  color: #fff;
  background: #59524c;
  height: 62px;
  padding-left: 0;
  user-select: none;
  -webkit-user-select: none;
  -webkit-app-region: drag;
}
.main {
  flex: 1;
}
.nav {
  height: calc(100vh - 62px);
  color: #fff;
  background: #59524c;
}

.main-content {
  height: calc(100vh - 62px);
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
