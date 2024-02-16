<script lang="ts" setup>
import type { FileEntry } from '@/local'
import { useAppStore } from '@/stores/app'
import { Document, Folder } from '@element-plus/icons-vue'
import { dirname, join } from 'path-browserify'
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const appStore = useAppStore()
const route = useRoute()

const currentPath = ref('') // current showing path in file explorer
const sourcePath = route.query.sourcePath as string
if (typeof sourcePath !== 'undefined' && sourcePath !== '') {
  currentPath.value = dirname(sourcePath) // it should be the dirname of current editing file
}

interface BreadcrumbItem {
  dir: string
  path: string
}
const breadcrumbs = ref<BreadcrumbItem[]>([])

async function updateBreadcrumbs() {
  const hexoConfig = await appStore.hexoConfig
  breadcrumbs.value = []
  if (hexoConfig !== null) {
    breadcrumbs.value.push({
      dir: 'source',
      path: hexoConfig.source_dir,
    })
  }
  if (currentPath.value !== '') {
    currentPath.value.split('/').forEach((dir: string, index: number, arr: string[]) => {
      if (hexoConfig !== null) {
        breadcrumbs.value.push({
          dir: dir,
          path: join(hexoConfig.source_dir, dir),
        })
      }
    })
  }
}
watchEffect(() => {
  updateBreadcrumbs()
})

const container = ref<HTMLElement | null>(null)
/**
 * Make breadcrumb scroll with mouse move.
 *
 * This function calculates the relative position of the mouse
 * within the breadcrumb container, and adjusts the scroll
 * position of the container based on this relative position.
 *
 * @param e - The MouseEvent object representing the mouse
 *            move event. The clientX property of this object
 *            is used to calculate the relative mouse position.
 */
function handleMouseMove(e: MouseEvent) {
  if (container.value === null) return
  const rect = container.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const scrollWidth = container.value.scrollWidth - rect.width
  console.log(rect, x, scrollWidth)
  container.value.scrollLeft = (x / rect.width) * scrollWidth
}
const files = ref<FileEntry[]>([])
watchEffect(async () => {
  files.value = await window.site.getReadDir(currentPath.value)
})
function handleDoubleClick(path: string) {
  currentPath.value = path
  updateBreadcrumbs()
}
</script>
<template>
  <div class="wrapper">
    <div class="container" ref="container" @mousemove="handleMouseMove">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
          {{ item.dir }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <ul class="file-list">
      <li v-for="f in files" :key="f.name" class="file-item">
        <el-icon v-if="f.type == 'directory'"><folder /></el-icon>
        <el-icon v-else><document /></el-icon>
        <span class="file-name" @dblclick="handleDoubleClick(f.relativePath)">{{ f.name }}</span>
      </li>
    </ul>
  </div>
</template>
<style scoped>
.wrapper {
  padding: 3px 5px;
}
.container {
  display: flex;
  overflow: hidden;
  height: 32px;
}
.breadcrumb {
  /** each piece does not wrap */
  white-space: nowrap;
  /** whole breadcrumb does not wrap */
  display: inline-flex;
}
.file-list {
  list-style: none;
  padding: 0;
}

.file-item {
  display: flex;
  align-items: flex-start;
  padding-top: 10px;
  padding-bottom: 10px;
}

.file-name {
  flex-grow: 1;
  white-space: normal;
  word-wrap: break-word;
  display: flex;
  align-items: center;
}
.file-item:nth-child(odd) {
  background-color: #f2f2f2;
}

.file-item:nth-child(even) {
  background-color: #ffffff;
}
.el-icon {
  color: #409eff;
  margin: 5px 10px 0 5px;
}
</style>
