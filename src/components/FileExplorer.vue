<script lang="ts" setup>
import { useAppStore } from '@/stores/app'
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
console.log('sourcePath is: ', sourcePath)
console.log('initialize currentPath: ', currentPath.value)

interface BreadcrumbItem {
  dir: string
  path: string
}
const breadcrumbs = ref<BreadcrumbItem[]>([])
watchEffect(async () => {
  const hexoConfig = await appStore.hexoConfig
  let rootPath = 'source'
  breadcrumbs.value.push({
    dir: rootPath,
    path: hexoConfig.source_dir
  })
  if (currentPath.value !== '') {
    currentPath.value.split('/').forEach((dir: string, index: number, arr: string[]) => {
      breadcrumbs.value.push({
        dir: dir,
        path: join(hexoConfig.source_dir, dir)
      })
    })
  }
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
const files = ref<string[]>([])
watchEffect(async () => {
  files.value = await window.site.getReadDir(currentPath.value)
})
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
    <ul>
      <li v-for="f in files">{{ f }}</li>
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
}
.breadcrumb {
  /** each piece does not wrap */
  white-space: nowrap;
  /** whole breadcrumb does not wrap */
  display: inline-flex;
}
</style>
