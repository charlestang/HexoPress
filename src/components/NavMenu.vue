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
  TrendCharts,
} from '@element-plus/icons-vue'
import { ref, watch, computed } from 'vue'
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

// 菜单项配置 - 使用 computed 来响应式计算标题
const menuItems = computed(() => [
  {
    index: '/main/dashboard',
    icon: TrendCharts,
    title: t('nav.dashboard')
  },
  {
    index: '/main/post-list',
    icon: Briefcase,
    title: t('nav.allPosts')
  },
  {
    index: '/main/categories',
    icon: IconMenu,
    title: t('nav.categories')
  },
  {
    index: '/main/tags',
    icon: Flag,
    title: t('nav.tags')
  },
  {
    index: '/main/media-library',
    icon: PictureFilled,
    title: t('nav.mediaLibrary')
  },
  {
    index: '/main/preferences',
    icon: Tools,
    title: t('nav.preferences')
  }
])

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
    class="!text-white !bg-[#59524c] !border-r-0"
    :default-active="activeIndex"
    :collapse="isCollapse"
    :collapse-transition="true"
    @open="handleOpen"
    @close="handleClose"
    @select="handleSelect">

    <el-menu-item
      v-for="item in menuItems"
      :key="item.index"
      :index="item.index"
      class="!text-white hover:!bg-[#c7a589]">
      <el-icon><component :is="item.icon" /></el-icon>
      <template #title>{{ item.title }}</template>
    </el-menu-item>

    <!-- 折叠/展开按钮 -->
    <el-menu-item @click="isCollapse = !isCollapse" class="!text-white hover:!bg-[#c7a589]">
      <el-icon v-if="isCollapse"><caret-right /></el-icon>
      <el-icon v-else><caret-left /></el-icon>
      <template #title>{{ isCollapse ? t('nav.expand') : t('nav.collapse') }}</template>
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
.is-active {
  background-color: #c7a589;
}
</style>
