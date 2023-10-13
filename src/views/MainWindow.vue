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
  height: 48px;
  padding-left: 0;
}
.main {
  flex: 1;
}
.nav {
  height: calc(100vh - 48px);
  color: #fff;
  background: #59524c;
}

.main-content {
  height: calc(100vh - 48px);
}
</style>
