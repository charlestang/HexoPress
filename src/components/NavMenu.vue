<script lang="ts" setup>
import {
  CaretLeft,
  CaretRight,
  Document,
  Menu as IconMenu,
  Management,
  Odometer
} from '@element-plus/icons-vue'
import { ref } from 'vue'

const isCollapse = ref(true)
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const activeIndex = ref('/main/dashboard')
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
      <el-icon><odometer /></el-icon>
      <template #title>Dashboard</template>
    </el-menu-item>
    <el-menu-item index="/main/post-list">
      <el-icon><document /></el-icon>
      <template #title>All posts</template>
    </el-menu-item>
    <el-menu-item index="/main/categories">
      <el-icon><icon-menu /></el-icon>
      <template #title>Categories</template>
    </el-menu-item>
    <el-menu-item index="/main/tags">
      <el-icon><management /></el-icon>
      <template #title>Tags</template>
    </el-menu-item>
    <el-menu-item @click="isCollapse = !isCollapse">
      <el-icon v-if="isCollapse"><caret-right /></el-icon>
      <el-icon v-else><caret-left /></el-icon>
      <template #title>Collapse Menu</template>
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
