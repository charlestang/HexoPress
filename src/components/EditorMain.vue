<script lang="ts" setup>
import { site } from '@/bridge'
import {
  getCodeFontFamilyStack,
  getEditorFontFamilyStack,
  resolveAppTheme,
} from '@/constants/appearance'
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { useEditorStore } from '@/stores/editorStore'
import { Expand, Fold, Folder } from '@element-plus/icons-vue'
import {
  UnaEditor,
  type EditorExposed,
  type ImageRenderContext,
  type ImageRenderResult,
} from 'una-editor'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { cloneValue, toDate, toStringArray } from '@shared/utils/value'
import { computeImagePath } from '@/utils/path'
import { encodeMarkdownImagePath, resolveMarkdownImageUrl } from '@/utils/markdownImage'

const { t } = useI18n()
const editorStore = useEditorStore() // Initialize the store
const emit = defineEmits<{
  (event: 'media-uploaded'): void
  (event: 'permalink-change', permalink: string): void
}>()

/**
 * @description The flag to indicate whether the post is new or not.
 */
const isNewPost = ref(false)

/**
 * @description The path of the source file, if it is a new post, the value is empty.
 */
const sourcePath = ref('')

const route = useRoute()

isNewPost.value = route.query.type != null && route.query.type === 'new'
sourcePath.value = (route.query.sourcePath as string) ?? ''
if (
  !isNewPost.value &&
  (typeof sourcePath.value === 'undefined' || sourcePath.value.length === 0)
) {
  // The sourcePath is not provided, or not valid. It is also seen as a new post.
  isNewPost.value = true
}

/**
 * @description The flag to indicate whether the post is published or not.
 */
const postPublished = computed(() => !isNewPost.value && sourcePath.value.startsWith('_posts'))

/**
 * @description The flag to indicate whether the post is dirty or not.
 */
const isDirty = ref(false)

/**
 * @description The content of the blog post.
 */
const text = ref('')
const initializing = ref(true)

watch(text, (val, oldVal) => {
  if (!initializing.value && val !== oldVal) {
    isDirty.value = true
  }
  editorStore.setText(val)
})

const frontMatter = ref<PostMeta>({
  title: '',
  date: new Date(),
  permalink: '',
  categories: [],
  tags: [],
})
const dateModel = computed<Date>({
  get() {
    return toDate(frontMatter.value.date) ?? new Date()
  },
  set(value) {
    frontMatter.value.date = value
  },
})
const categoriesModel = computed<string | string[] | (string | string[])[]>({
  get() {
    return (frontMatter.value.categories as string | string[] | (string | string[])[]) ?? []
  },
  set(value) {
    frontMatter.value.categories = value as PostMeta['categories']
  },
})

watch(
  frontMatter,
  () => {
    if (!initializing.value) {
      isDirty.value = true
    }
    editorStore.setFrontMatter({ ...frontMatter.value })
  },
  { deep: true },
)

watch(
  () => frontMatter.value.permalink ?? '',
  (permalink) => {
    emit('permalink-change', permalink)
  },
  { immediate: true },
)

function applyDocumentMeta(meta: PostMeta) {
  const previous = initializing.value
  initializing.value = true
  frontMatter.value = {
    ...frontMatter.value,
    ...meta,
    date: toDate(meta.date) ?? new Date(),
    updated: toDate(meta.updated) ?? meta.updated,
    tags: toStringArray(meta.tags),
    categories: meta.categories ?? [],
  }
  initializing.value = previous
}

async function loadDocument(path: string) {
  try {
    initializing.value = true
    const { meta, content } = await site.getPostDocument(path)
    applyDocumentMeta(meta)
    text.value = content
  } finally {
    initializing.value = false
  }
  // Watchers fire asynchronously (flush: 'pre'); wait for them to settle
  // before resetting dirty so queued watcher callbacks don't re-dirty.
  await nextTick()
  isDirty.value = false
}

if (!isNewPost.value && sourcePath.value) {
  loadDocument(sourcePath.value)
} else {
  initializing.value = false
}

const dialogSourcePath = ref(false)
const asideExpand = ref('aside-expand')
function toggleAside() {
  if (asideExpand.value === 'aside-expand') {
    asideExpand.value = 'aside-collapsed'
  } else {
    asideExpand.value = 'aside-expand'
  }
}

function hasNonWhitespaceContent(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

async function _formValidate(): Promise<boolean> {
  if (!isDirty.value) {
    ElMessage.info(t('editor.nothingChanged'))
    return false
  }

  const hasTitle = hasNonWhitespaceContent(frontMatter.value.title)
  const hasBody = hasNonWhitespaceContent(text.value)

  if (!hasTitle || !hasBody) {
    return false
  }

  return true
}
function buildDocument(): PostDocument {
  const rawFrontMatter = toRaw(frontMatter.value)
  const date = toDate(rawFrontMatter.date) ?? new Date()
  const updated = isDirty.value ? new Date() : (toDate(rawFrontMatter.updated) ?? date)

  const meta = cloneValue<PostMeta>(rawFrontMatter as PostMeta)
  meta.date = date
  meta.updated = updated
  meta.tags = toStringArray(rawFrontMatter.tags)

  if (typeof rawFrontMatter.categories !== 'undefined') {
    meta.categories = cloneValue(rawFrontMatter.categories)
  }

  return {
    meta,
    content: text.value,
  }
}

async function updatePost() {
  console.log('Updating post...')
  const check = await _formValidate()
  if (!check) {
    return
  }
  if (!sourcePath.value) {
    return
  }
  const document = buildDocument()
  console.log('Saving document to site..., document:', document)
  await site.savePostDocument(sourcePath.value, document)
  applyDocumentMeta(document.meta)
  isDirty.value = false
  ElMessage.success(t('editor.createSuccess'))
}

async function upsertDraft() {
  console.log('Saving draft...')
  const check = await _formValidate()
  if (!check) {
    return
  }
  const document = buildDocument()
  console.log('Saving draft to site..., document:', document)
  if (!sourcePath.value) {
    sourcePath.value = await site.createFile(
      '_drafts',
      frontMatter.value.title ?? '',
      frontMatter.value.permalink ?? '',
      '',
    )
    if (!sourcePath.value) {
      ElMessage.error(t('editor.createFailed'))
      return
    }
    await site.savePostDocument(sourcePath.value, document)
    applyDocumentMeta(document.meta)
    isDirty.value = false
    isNewPost.value = false
    ElMessage.success(t('editor.draftSaveSuccess'))
  } else {
    await site.savePostDocument(sourcePath.value, document)
    applyDocumentMeta(document.meta)
    isDirty.value = false
    ElMessage.success(t('editor.draftSaveSuccess'))
  }
}

async function publishDraft() {
  const check = await _formValidate()
  if (!check) {
    return
  }
  const document = buildDocument()
  if (!sourcePath.value) {
    sourcePath.value = await site.createFile(
      '_posts',
      frontMatter.value.title ?? '',
      frontMatter.value.permalink ?? '',
      '',
    )
    if (!sourcePath.value) {
      ElMessage.error(t('editor.createFailed'))
      return
    }
    await site.savePostDocument(sourcePath.value, document)
    applyDocumentMeta(document.meta)
    isDirty.value = false
    isNewPost.value = false
    ElMessage.success(t('editor.draftPublishSuccess'))
  } else {
    await site.savePostDocument(sourcePath.value, document)
    const newPath = await site.moveFile(sourcePath.value, '')
    if (!newPath) {
      ElMessage.error(t('editor.createFailed'))
      return
    }
    sourcePath.value = newPath
    applyDocumentMeta(document.meta)
    isDirty.value = false
    ElMessage.success(t('editor.draftPublishSuccess'))
  }
}

const appStore = useAppStore()
const assetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL
const hexoRoot = computed(() => appStore.hexoConfig?.root ?? '/')
const resolvedSystemTheme = ref<'light' | 'dark'>('light')

async function syncResolvedSystemTheme() {
  try {
    const theme = await site.getDarkMode()
    resolvedSystemTheme.value = theme === 'dark' ? 'dark' : 'light'
  } catch {
    resolvedSystemTheme.value = 'light'
  }
}

watch(
  () => appStore.darkMode,
  (theme) => {
    if (theme === 'system') {
      void syncResolvedSystemTheme()
    }
  },
  { immediate: true },
)

const activeAsidePanels = ref(['meta', 'cate', 'tags'])

const showUploadDialog = ref(false)
const imageFile = ref<File>()
const filePath = ref('')
const uploaded = ref(() => {})

function resolveImageUrl(context: ImageRenderContext): Partial<ImageRenderResult> {
  return {
    src: resolveMarkdownImageUrl(
      context.src,
      assetBaseUrl,
      frontMatter.value.permalink ?? '',
      hexoRoot.value,
    ),
  }
}

const renderHooks = {
  image: resolveImageUrl,
}

function onDropImage(files: File[]) {
  if (!files || files.length === 0) {
    return
  }
  const [firstFile] = files
  if (!firstFile) {
    return
  }
  imageFile.value = firstFile
  function formatDate(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthS = month < 10 ? '0' + month : month
    return `${year}/${monthS}`
  }
  filePath.value = formatDate(dateModel.value) + '/' + firstFile.name
  uploaded.value = function () {
    const assetPath = 'images/' + filePath.value
    const imagePath = computeImagePath(hexoRoot.value, assetPath)
    const encodedPath = encodeMarkdownImagePath(imagePath)
    insertImageMarkdown(`![](${encodedPath})`)
    emit('media-uploaded')
  }
  showUploadDialog.value = true
}

async function onSave() {
  console.log('Saving post...')
  if (postPublished.value) {
    await updatePost()
  } else {
    await upsertDraft()
  }
  isDirty.value = false
}

let saveIntervalId: NodeJS.Timeout | null = null
function clearAutoSaveInterval() {
  if (saveIntervalId) {
    clearInterval(saveIntervalId)
    saveIntervalId = null
  }
}

function setupAutoSaveInterval() {
  if (appStore.autoSave !== 'autoSaveOn') {
    clearAutoSaveInterval()
    return
  }
  clearAutoSaveInterval()
  saveIntervalId = setInterval(() => {
    if (isDirty.value) {
      onSave()
    }
  }, 1000 * 30)
}

function syncSelectionToStore() {
  const selectedText = editorRef.value?.getSelection()
  if (selectedText) {
    editorStore.setSelection(selectedText)
  } else {
    editorStore.setSelection('')
  }
}

let selectionIntervalId: NodeJS.Timeout | null = null

onMounted(() => {
  setupAutoSaveInterval()

  // Poll selection state from CodeMirror
  selectionIntervalId = setInterval(syncSelectionToStore, 300)
})

watch(
  () => appStore.autoSave,
  () => {
    setupAutoSaveInterval()
  },
)

onBeforeUnmount(() => {
  clearAutoSaveInterval()
  if (selectionIntervalId) {
    clearInterval(selectionIntervalId)
    selectionIntervalId = null
  }
  if (catalogIntervalId) {
    clearInterval(catalogIntervalId)
    catalogIntervalId = null
  }
})

function onDelete() {
  const articleName = frontMatter.value.title
  const articlePath = sourcePath.value
  ElMessageBox.confirm(
    t('posts.doubleConfirmDeleteContent') + articleName + t('posts.questionMark'),
    t('posts.warning'),
    {
      confirmButtonText: t('posts.confirm'),
      cancelButtonText: t('posts.cancel'),
      type: 'warning',
    },
  )
    .then(async () => {
      await site.deleteFile(articlePath)
      ElMessage({
        type: 'success',
        message: t('posts.deleteSuccess'),
      })
      router.go(-1)
    })
    .catch((reason) => {
      if (reason === 'cancel') {
        ElMessage({
          type: 'info',
          message: t('posts.deleteCanceled'),
        })
      } else {
        if (typeof reason === 'object' && reason.name === 'Error') {
          ElMessage({
            type: 'error',
            message: reason.message,
          })
        } else {
          ElMessage({
            type: 'error',
            message: t('posts.unknownError'),
          })
        }
      }
    })
}

const editorRef = ref<EditorExposed>()
const isEditorFocused = ref(false)

// Helper to generate slug-like IDs
const generateHeadingId = (text: string, level: number, index: number) => {
  const sanitizedText = text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
  return `heading-${level}-${index}-${sanitizedText}`
}

function handleGetCatalog() {
  const headings = editorRef.value?.getHeadings()
  if (!headings) return

  const transformedHeadings = headings.map((h, index) => ({
    text: h.text,
    level: h.level,
    id: generateHeadingId(h.text, h.level, index),
    line: h.line,
  }))
  editorStore.setHeadings(transformedHeadings)
}

const scrollToLine = (lineNumber: number) => {
  // UnaEditor's getHeadings() returns 1-based line numbers
  // and scrollToLine() also expects 1-based line numbers
  editorRef.value?.scrollToLine(lineNumber)
}

function insertImageMarkdown(markdown: string) {
  const editor = editorRef.value
  if (!editor) {
    ElMessage.error('Failed to insert image')
    return
  }
  const content = markdown.endsWith('\n') ? markdown : `${markdown}\n\n`
  editor.insertText(content)
}

defineExpose({
  insertImageMarkdown,
})

let catalogIntervalId: NodeJS.Timeout | null = null

onMounted(() => {
  // Poll headings from editor
  catalogIntervalId = setInterval(handleGetCatalog, 1000)

  // Watch for changes in activeHeadingId from the store and scroll the editor
  watch(
    () => editorStore.activeHeading,
    (heading) => {
      if (heading && editorRef.value) {
        scrollToLine(heading.line)
      }
    },
  )
})

const editorFontSize = computed(() => appStore.editorFontSize)
const editorLineHeight = computed(() => Math.round(appStore.editorFontSize * 1.5))
const editorTheme = computed(() => resolveAppTheme(appStore.darkMode, resolvedSystemTheme.value))
const editorLineWrap = computed(() => appStore.editorLineWrap)
const editorFontFamily = computed(() => getEditorFontFamilyStack(appStore.editorFontFamily))
const codeTheme = computed(() => appStore.codeTheme)
const codeLineNumbers = computed(() => appStore.codeLineNumbers)
const codeFontFamily = computed(() => getCodeFontFamilyStack(appStore.codeFontFamily))
</script>

<template>
  <el-container>
    <el-container>
      <el-header class="editor-header">
        <el-container style="display: flex; flex-direction: row-reverse">
          <el-aside width="240px">
            <div class="op-buttons">
              <el-link
                v-if="!postPublished"
                type="primary"
                style="margin-right: 10px"
                @click="upsertDraft"
                >{{ t('editor.saveDraft') }}
              </el-link>
              <el-button v-if="postPublished" type="primary" @click="updatePost">
                {{ t('editor.update') }}
              </el-button>
              <el-button v-else type="primary" @click="publishDraft">
                {{ t('editor.publish') }}
              </el-button>

              <el-button type="default" @click="toggleAside">
                <el-icon v-if="asideExpand == 'aside-expand'"><expand /></el-icon>
                <el-icon v-else><fold /></el-icon>
              </el-button>
            </div>
          </el-aside>
          <el-main>
            <el-row>
              <el-col :span="24">
                <el-form>
                  <el-form-item class="title-input">
                    <el-input v-model="frontMatter.title" :placeholder="t('editor.title')">
                      <template #suffix>
                        <el-icon class="el-input__icon" @click="dialogSourcePath = true"
                          ><folder
                        /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-form>
                <FilenameDialog v-model="dialogSourcePath" v-model:source-path="sourcePath" />
              </el-col>
            </el-row>
          </el-main>
        </el-container>
      </el-header>
      <el-container style="display: flex; flex-direction: row-reverse">
        <el-aside :class="asideExpand">
          <el-collapse v-model="activeAsidePanels">
            <el-collapse-item :title="t('editor.meta')" name="meta">
              <DateMetaEntry v-model="dateModel" class="meta-entry" />
              <UrlMetaEntry v-model="frontMatter.permalink" class="meta-entry" />
              <el-row v-if="postPublished" :gutter="20">
                <el-col :span="10">
                  <el-button type="warning" plain size="small" style="width: 100%">{{
                    t('editor.turnToDraft')
                  }}</el-button>
                </el-col>
                <el-col :span="14">
                  <el-button
                    type="danger"
                    plain
                    size="small"
                    style="width: 100%"
                    @click="onDelete"
                    >{{ t('editor.moveToTrash') }}</el-button
                  >
                </el-col>
              </el-row>
            </el-collapse-item>
            <el-collapse-item :title="t('editor.categories')" name="cate">
              <CategoriesTreePanel v-model="categoriesModel" />
            </el-collapse-item>
            <el-collapse-item :title="t('editor.tags')" name="tags">
              <el-text type="info" size="small">{{ t('editor.selectTags') }}</el-text>
              <el-input-tag v-model="frontMatter.tags" tag-type="success" delimiter="," />
              <el-text type="info">{{ t('editor.tagsTip') }}</el-text>
            </el-collapse-item>
          </el-collapse>
        </el-aside>
        <el-main class="editor-wrapper" :style="`--line-height: ${editorLineHeight}px`">
          <UnaEditor
            ref="editorRef"
            v-model="text"
            class="editor"
            :theme="editorTheme"
            :line-wrap="editorLineWrap"
            :live-preview="true"
            :font-size="editorFontSize"
            :font-family="editorFontFamily"
            :code-theme="codeTheme"
            :code-line-numbers="codeLineNumbers"
            :code-font-family="codeFontFamily"
            :render-hooks="renderHooks"
            :vim-mode="appStore.editMode === 'vim'"
            @save="onSave"
            @drop="onDropImage"
            @focus="isEditorFocused = true"
            @blur="isEditorFocused = false" />
          <UploadImageDialog
            v-model="showUploadDialog"
            v-model:file-path="filePath"
            :image-file="imageFile"
            @upload-success="uploaded" />
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<style scoped>
.aside-expand {
  width: 240px;
  border-left: 1px solid var(--el-border-color-lighter, #ebeef5);
  padding: 0 10px 0 12px;
}
.aside-collapsed {
  width: 0;
}
.back {
  height: 40px;
  margin: 4px 0;
  color: #fff;
  -webkit-app-region: no-drag;
}
.back:hover {
  color: #c7a589;
}
.title-input {
  margin-bottom: 0;
}
.editor-header {
  padding: 0 10px;
}
.editor-header .el-container {
  height: 100%;
}
.editor-header .el-container .el-main,
.editor-header .el-container .el-aside {
  align-self: center;
  padding: 0;
}
.editor-header .el-container .el-aside {
  text-align: right;
}
.editor-wrapper {
  padding: 0 0 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.editor {
  width: 100%;
  height: calc(100vh - 62px - 40px - 60px + 30px);
}
.editor :deep(.cm-scroller) {
  line-height: var(--line-height) !important;
}
.editor :deep(.cm-lineNumbers) {
  color: #bbb;
}
.meta-entry {
  margin-bottom: 7px;
}
:deep(.el-form-item__label) {
  font-size: 13px;
  color: #303133;
}
:deep(.ͼ1 .cm-vim-panel),
:deep(.ͼ1 .cm-vim-panel input) {
  color: white;
}
:deep(.md-editor svg) {
  box-sizing: content-box;
}
</style>
