<script lang="ts" setup>
import router from '@/router'
import { Back, FolderOpened, Memo } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import EditorMain from '../components/EditorMain.vue'
import FileExplorer from '../components/FileExplorer.vue'

const { t } = useI18n()
const editorAsideFold = ref('aside-fold') // or aside-fold
const currentWidth = ref(0)
let startX = 0
let startWidth = 0
if (editorAsideFold.value == 'aside-fold') {
  currentWidth.value = 42
  startWidth = 280
} else {
  currentWidth.value = 280
}
interface Panels {
  [key: string]: any
}
const panels: Panels = {
  fileTree: FileExplorer,
  tocPanel: null
}
const currentPanel = ref('fileTree')
function handleToolbarClick(key: string) {
  if (editorAsideFold.value == 'aside-expand') {
    if (currentPanel.value == key) {
      editorAsideFold.value = 'aside-fold'
      startWidth = currentWidth.value
      currentWidth.value = 42
      console.log('fold: remember: ', startWidth)
    } else {
      currentPanel.value = key
    }
  } else {
    editorAsideFold.value = 'aside-expand'
    currentWidth.value = startWidth
    console.log('expand: restore: ', startWidth)
    currentPanel.value = key
  }
  console.log('clicked: ', key, ' status:', editorAsideFold.value)
}

const cursorStyle = ref('default')
function handleMouseDown(e: MouseEvent) {
  if (editorAsideFold.value == 'aside-fold') return
  startX = e.clientX
  startWidth = currentWidth.value
  console.log('mousedown trigger')
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  const dx = e.clientX - startX
  currentWidth.value = Math.max(startWidth + dx, 200)
}

function handleMouseUp() {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}
function handleMouseEnter() {
  if (editorAsideFold.value == 'aside-fold') return
  cursorStyle.value = 'ew-resize'
}
function handleMouseLeave() {
  if (editorAsideFold.value == 'aside-fold') return
  cursorStyle.value = 'default'
}
</script>
<template>
  <el-container>
    <el-header class="topbar">
      <header-bar>
        <el-button key="back" class="back" text :icon="Back" @click="router.go(-1)">{{
          t('common.back')
        }}</el-button>
      </header-bar>
    </el-header>
    <el-container>
      <el-aside
        class="editor-aside"
        :class="editorAsideFold"
        :style="{ width: currentWidth + 'px' }"
      >
        <el-container class="full-height">
          <el-aside class="toolbar">
            <el-link
              key="fileTree"
              :underline="false"
              @click="handleToolbarClick('fileTree')"
              :class="{ active: 'fileTree' === currentPanel }"
            >
              <el-icon size="22"><folder-opened /></el-icon>
            </el-link>
            <el-link
              key="tocPanel"
              :underline="false"
              @click="handleToolbarClick('tocPanel')"
              :class="{ active: 'tocPanel' === currentPanel }"
            >
              <el-icon size="22"><memo /></el-icon>
            </el-link>
            <!-- 添加更多按钮 -->
          </el-aside>
          <el-main class="toolbar-panel">
            <keep-alive>
              <component :is="panels[currentPanel]" />
            </keep-alive>
            <div
              class="resize-handle"
              :style="{ cursor: cursorStyle }"
              @mouseenter="handleMouseEnter"
              @mouseleave="handleMouseLeave"
              @mousedown="handleMouseDown"
            ></div>
          </el-main>
        </el-container>
      </el-aside>
      <el-main class="main-area"><EditorMain /></el-main>
    </el-container>
  </el-container>
</template>
<style scoped>
.back {
  height: 40px;
  margin: 4px 0;
  color: #fff;
  -webkit-app-region: no-drag;
}
.back:hover {
  color: #c7a589;
}
.full-height {
  height: calc(100vh - 62px);
}
.toolbar {
  width: 42px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #eee;
}
.toolbar .el-link {
  padding: 10px 0;
  width: 100%;
  display: flex;
  justify-content: center;
}
.toolbar-panel {
  border-right: 1px solid #eee;
  padding: 0;
}
.editor-aside {
  position: relative;
  overflow: hidden;
}
.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  width: 10px;
  height: 100%;
}
.aside-expand {
  width: 280px;
}
.aside-expand:deep(.toolbar .active) {
  border-left: 2px solid #007bff;
  border-right: 2px solid #ffffff;
}
.aside-expand:deep(.toolbar .active .el-icon) {
  color: #007bff;
}
.aside-fold {
  width: 42px;
}
</style>
