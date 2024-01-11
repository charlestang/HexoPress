<script lang="ts" setup>
import { useCache } from '@/hooks/useCache'
import {
  Briefcase,
  CaretLeft,
  CaretRight,
  Flag,
  Menu as IconMenu,
  PictureFilled,
  Tools,
  TrendCharts
} from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()

const { wsCache } = useCache()
const route = useRoute()

const isCollapse = ref(wsCache.get('isCollapse') || false)
watch(isCollapse, (val, oldVal) => {
  if (val !== oldVal) {
    wsCache.set('isCollapse', val)
  }
})

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
console.log('Read current path from route: ', route.fullPath)
const activeIndex = ref(route.fullPath)
const handleSelect = (key: string, keyPath: string[]) => {
  activeIndex.value = key
  console.log(key, keyPath)
}
</script>

<template>
  <el-menu
    :router="true"
    class="asidemenu"
    :default-active="activeIndex"
    :collapse="isCollapse"
    :collapse-transition="true"
    @open="handleOpen"
    @close="handleClose"
    @select="handleSelect"
  >
    <el-menu-item index="/main/dashboard">
      <el-icon><trend-charts /></el-icon>
      <template #title>{{ t('nav.dashborad') }}</template>
    </el-menu-item>
    <el-menu-item index="/main/post-list">
      <el-icon><briefcase /></el-icon>
      <template #title>{{ t('nav.allPosts') }}</template>
    </el-menu-item>
    <el-menu-item index="/main/categories">
      <el-icon><icon-menu /></el-icon>
      <template #title>{{ t('nav.categories') }}</template>
    </el-menu-item>
    <el-menu-item index="/main/tags">
      <el-icon><flag /></el-icon>
      <template #title>{{ t('nav.tags') }}</template>
    </el-menu-item>
    <el-menu-item index="/main/media-library">
      <el-icon><picture-filled /></el-icon>
      <template #title>{{ t('nav.mediaLibrary') }}</template>
    </el-menu-item>
    <el-menu-item index="/main/preferences">
      <el-icon><tools /></el-icon>
      <template #title>{{ t('nav.preferences') }}</template>
    </el-menu-item>
    <el-menu-item @click="isCollapse = !isCollapse">
      <el-icon v-if="isCollapse"><caret-right /></el-icon>
      <el-icon v-else><caret-left /></el-icon>
      <template #title>{{ isCollapse ? t('nav.expand') : t('nav.collapse') }}</template>
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
.asidemenu {
  color: #fff;
  background: #59524c;
  border-right: none;
}
.el-sub-menu {
  background: #46403c;
}
.el-menu-item,
.el-sub-menu {
  color: #fff;
}
.el-menu-item:hover,
.is-active {
  background-color: #c7a589;
}
</style>
