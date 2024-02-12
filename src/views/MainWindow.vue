<script setup lang="ts">
import NavMenu from '@/components/NavMenu.vue'
import router from '@/router'
import { EditPen } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { RouterView } from 'vue-router'
const { t } = useI18n()
const onNewPostButtonClicked = () => {
  router.push({ path: '/frame', query: { type: 'new' } })
}
</script>

<template>
  <el-container>
    <el-header class="topbar">
      <header-bar>
        <el-button
          key="new-post"
          :icon="EditPen"
          text
          class="new"
          @click="onNewPostButtonClicked"
          >{{ t('common.newPost') }}</el-button
        >
      </header-bar>
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
