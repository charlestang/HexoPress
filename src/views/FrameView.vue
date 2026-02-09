<script lang="ts" setup>
import router from '@/router'
import { Back, FolderOpened, Memo, PictureRounded } from '@element-plus/icons-vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import EditorMain from '../components/EditorMain.vue'
import FileExplorer from '../components/FileExplorer.vue'
import TocPanel from '../components/TocPanel.vue'
import MediaPanel from '@/components/MediaPanel.vue'
import AiPanel from '@/components/AiPanel.vue'
import { useEditorStore } from '@/stores/editorStore'

const { t } = useI18n()
const editorStore = useEditorStore()
const editorAsideFold = ref('aside-fold')
const currentWidth = ref(0)
let startX = 0
let startWidth = 0
if (editorAsideFold.value == 'aside-fold') {
  currentWidth.value = 42
  startWidth = 280
} else {
  currentWidth.value = 280
}

const panels = {
  fileTree: FileExplorer,
  tocPanel: TocPanel,
  mediaPanel: MediaPanel,
  aiPanel: AiPanel,
}
type PanelType = keyof typeof panels
const currentPanel = ref<PanelType>('fileTree')

// Get headings from the store
const tocHeadings = computed(() => editorStore.currentHeadings)
const currentPermalink = ref('')
const mediaUploadKey = ref(0)
const mediaPanelActive = computed(() => currentPanel.value === 'mediaPanel')
const editorMainRef = ref<InstanceType<typeof EditorMain> | null>(null)
const aiPanelRef = ref<InstanceType<typeof AiPanel> | null>(null)

const route = useRoute()
watch(
  () => route.query.sourcePath,
  () => {
    aiPanelRef.value?.resetChat()
  },
)

const panelProps = computed(() => {
  if (currentPanel.value === 'tocPanel') {
    return { headings: tocHeadings.value }
  }
  if (currentPanel.value === 'mediaPanel') {
    return {
      active: mediaPanelActive.value,
      uploadKey: mediaUploadKey.value,
      permalink: currentPermalink.value,
    }
  }
  return {}
})

function handleToolbarClick(key: PanelType) {
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

function handleMediaUploaded() {
  mediaUploadKey.value += 1
}

function handlePermalinkChange(permalink: string) {
  currentPermalink.value = permalink
}

function handleInsertRequest(markdown: string) {
  editorMainRef.value?.insertImageMarkdown(markdown)
}
</script>
<template>
  <el-container>
    <el-header class="topbar">
      <HeaderBar>
        <el-button key="back" class="back" text :icon="Back" @click="router.go(-1)">{{
          t('common.back')
        }}</el-button>
      </HeaderBar>
    </el-header>
    <el-container>
      <el-aside
        class="editor-aside"
        :class="editorAsideFold"
        :style="{ width: currentWidth + 'px' }">
        <el-container class="full-height">
          <el-aside class="toolbar">
            <el-link
              key="fileTree"
              underline="never"
              :class="{ active: 'fileTree' === currentPanel }"
              @click="handleToolbarClick('fileTree')">
              <el-icon size="22"><folder-opened /></el-icon>
            </el-link>
            <el-link
              key="tocPanel"
              underline="never"
              :class="{ active: 'tocPanel' === currentPanel }"
              @click="handleToolbarClick('tocPanel')">
              <el-icon size="22"><memo /></el-icon>
            </el-link>
            <el-link
              key="mediaPanel"
              underline="never"
              :class="{ active: 'mediaPanel' === currentPanel }"
              @click="handleToolbarClick('mediaPanel')">
              <el-icon size="22"><picture-rounded /></el-icon>
            </el-link>
            <el-link
              key="aiPanel"
              underline="never"
              :class="{ active: 'aiPanel' === currentPanel }"
              @click="handleToolbarClick('aiPanel')">
              <el-icon size="22">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round">
                  <rect x="4" y="7" width="16" height="13" rx="2" />
                  <circle cx="9" cy="13" r="1.5" />
                  <circle cx="15" cy="13" r="1.5" />
                  <line x1="9.5" y1="17" x2="14.5" y2="17" />
                  <line x1="12" y1="3" x2="12" y2="7" />
                  <circle cx="12" cy="2" r="1" />
                </svg>
              </el-icon>
            </el-link>
          </el-aside>
          <el-main class="toolbar-panel">
            <keep-alive>
              <component
                :is="panels[currentPanel]"
                :ref="
                  (el: unknown) => {
                    if (currentPanel === 'aiPanel') aiPanelRef = el as InstanceType<typeof AiPanel>
                  }
                "
                v-bind="panelProps"
                @request-insert="handleInsertRequest" />
            </keep-alive>
            <div
              class="resize-handle"
              :style="{ cursor: cursorStyle }"
              @mouseenter="handleMouseEnter"
              @mouseleave="handleMouseLeave"
              @mousedown="handleMouseDown"></div>
          </el-main>
        </el-container>
      </el-aside>
      <el-main class="main-area">
        <EditorMain
          ref="editorMainRef"
          @media-uploaded="handleMediaUploaded"
          @permalink-change="handlePermalinkChange" />
      </el-main>
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
