<script lang="ts" setup>
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { useEditorStore } from '@/stores/editorStore' // Import the editor store
import { lineNumbers } from '@codemirror/view'
import { Expand, Fold, Folder } from '@element-plus/icons-vue'
import { Vim, vim } from '@replit/codemirror-vim'
import {
  MdEditor,
  NormalToolbar,
  config,
  type ExposeParam,
  type ToolbarNames,
  type HeadList,
  type CodeMirrorExtension,
} from 'md-editor-v3' // Import CatalogLink
import 'md-editor-v3/lib/style.css'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { createSmoothScroll } from '@vavt/util'
import { toDate, toStringArray } from '@shared/utils/value'

const { t } = useI18n()
const editorStore = useEditorStore() // Initialize the store

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
  if (initializing.value) {
    return
  }
  if (val !== oldVal) {
    isDirty.value = true
  }
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
    if (initializing.value) {
      return
    }
    isDirty.value = true
  },
  { deep: true },
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
    const { meta, content } = await window.site.getPostDocument(path)
    applyDocumentMeta(meta)
    text.value = content
    isDirty.value = false
  } finally {
    initializing.value = false
  }
}

if (!isNewPost.value && sourcePath.value) {
  loadDocument(sourcePath.value)
} else {
  initializing.value = false
}

/**
 * Content sanitizer to help preview display images in content.
 * @param html The HTML content of the blog post.
 */
function filterImage(html: string): string {
  console.log('filterImage: ', frontMatter.value.permalink)
  return _addPrefixToImgSrc(html, 'http://127.0.0.1:2357/', frontMatter.value.permalink || '')
}

function _addPrefixToImgSrc(html: string, prefix: string, currentPath: string): string {
  const regex = /(<img[^>]+src\s*=\s*["'])([^"']*)/gi
  return html.replace(regex, (match, p1, p2: string) => {
    if (p2.startsWith('http://') || p2.startsWith('https://')) {
      return match
    }
    const curPath = currentPath.split('/').filter((p) => p !== '')
    const imgPath = p2.split('/').filter((p) => p !== '')
    while (curPath.length > 0 && imgPath[0] == '..') {
      imgPath.shift()
      curPath.pop()
    }
    console.log('replaced to : ', p1 + prefix + curPath.concat(imgPath).join('/'))
    return p1 + prefix + curPath.concat(imgPath).join('/')
  })
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

async function _formValidate(): Promise<boolean> {
  if (!isDirty.value) {
    ElMessage.info(t('editor.nothingChanged'))
    return false
  }

  if (!frontMatter.value.title || frontMatter.value.title.length === 0) {
    await ElMessageBox.alert(t('editor.titleRequired'), t('editor.tipsTitle'), {
      confirmButtonText: t('editor.ok'),
    })
    return false
  }
  return true
}
function buildDocument(): PostDocument {
  const date = toDate(frontMatter.value.date) ?? new Date()
  const updated = isDirty.value
    ? new Date()
    : toDate(frontMatter.value.updated) ?? date

  const meta: PostMeta = {
    ...frontMatter.value,
    date,
    updated,
    tags: toStringArray(frontMatter.value.tags),
  }

  return {
    meta,
    content: text.value,
  }
}

async function updatePost() {
  const check = await _formValidate()
  if (!check) {
    return
  }
  if (!sourcePath.value) {
    return
  }
  const document = buildDocument()
  await window.site.savePostDocument(sourcePath.value, document)
  applyDocumentMeta(document.meta)
  isDirty.value = false
  ElMessage.success(t('editor.createSuccess'))
}

async function upsertDraft() {
  const check = await _formValidate()
  if (!check) {
    return
  }
  const document = buildDocument()
  if (!sourcePath.value) {
    console.log('upsertDraft: ', frontMatter.value)
    sourcePath.value = await window.site.createFile(
      '_drafts',
      frontMatter.value.title ?? '',
      frontMatter.value.permalink ?? '',
      '',
    )
    if (!sourcePath.value) {
      ElMessage.error(t('editor.createFailed'))
      return
    }
    await window.site.savePostDocument(sourcePath.value, document)
    applyDocumentMeta(document.meta)
    isDirty.value = false
    isNewPost.value = false
    ElMessage.success(t('editor.draftSaveSuccess'))
  } else {
    await window.site.savePostDocument(sourcePath.value, document)
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
    sourcePath.value = await window.site.createFile(
      '_posts',
      frontMatter.value.title ?? '',
      frontMatter.value.permalink ?? '',
      '',
    )
    if (!sourcePath.value) {
      ElMessage.error(t('editor.createFailed'))
      return
    }
    await window.site.savePostDocument(sourcePath.value, document)
    applyDocumentMeta(document.meta)
    isDirty.value = false
    isNewPost.value = false
    ElMessage.success(t('editor.draftPublishSuccess'))
  } else {
    await window.site.savePostDocument(sourcePath.value, document)
    const newPath = await window.site.moveFile(sourcePath.value, '')
    console.log('move file from: ', sourcePath.value, ' to newPath: ', newPath)
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

if (appStore.editMode === 'vim') {
  config({
    codeMirrorExtensions(extensions: CodeMirrorExtension[]) {
      const extra: CodeMirrorExtension[] = [
        { type: 'lineNumbers', extension: lineNumbers() },
        { type: 'vim', extension: vim() },
      ]
      return [...extensions, ...extra]
    },
  })
  Vim.defineEx('write', 'w', () => {
    onSave()
  })
}
const activeAsidePanels = ref(['meta', 'cate', 'tags'])

const showUploadDialog = ref(false)
const imageFile = ref<File>()
const filePath = ref('')
const uploaded = ref(() => {})
async function onUploadImage(
  files: File[],
  callback: (urls: string[] | { url: string; alt: string; title: string }[]) => void,
) {
  console.log('onUploadImage: ', files)
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
    console.log('upload success')
    // TODO: this is not so good, because it is relative to the permalink.
    //       and the image cannot preview because the image has not been
    //       moved to the `public` path.
    const url = '../images/' + filePath.value
    callback([url])
  }
  showUploadDialog.value = true
}

async function onSave() {
  if (postPublished.value) {
    await updatePost()
  } else {
    await upsertDraft()
  }
  isDirty.value = false
}

let saveIntervalId: NodeJS.Timeout
onMounted(() => {
  saveIntervalId = setInterval(() => {
    if (isDirty.value) {
      onSave()
    }
  }, 1000 * 30)
})

onBeforeUnmount(() => {
  if (saveIntervalId) {
    clearInterval(saveIntervalId)
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
    .then(async (a) => {
      console.log(a)
      await window.site.deleteFile(articlePath)
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

const toolbars = ref<ToolbarNames[]>([
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  '-',
  'title',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  '-',
  'revoke',
  'next',
  'save',
  '-',
  0,
  1,
  '=',
  'prettier',
  'preview',
  'previewOnly',
  'catalog',
])

const editorRef = ref<ExposeParam>()

const editorMaxWidth = ref(1100)
// Helper to generate slug-like IDs
const generateHeadingId = (text: string, level: number, index: number) => {
  const sanitizedText = text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
  return `heading-${level}-${index}-${sanitizedText}`
}

const handleGetCatalog = (headList: HeadList[]) => {
  console.log('handleGetCatalog', headList)
  const transformedHeadings = headList.map((h, index) => ({
    text: h.text,
    level: h.level,
    id: generateHeadingId(h.text, h.level, index),
    line: h.line,
  }))
  editorStore.setHeadings(transformedHeadings)
}

const smoothScroll = createSmoothScroll()
const scrollToLine = (lineNumber: number) => {
  const view = editorRef.value?.getEditorView()
  if (view) {
    const line = view.state.doc.line(lineNumber + 1)
    const top = view.lineBlockAt(line.from)?.top
    const scroller = view.scrollDOM
    smoothScroll(scroller, top)
  }
}

onMounted(() => {
  editorRef.value?.on('preview', (status) => {
    if (status) {
      editorMaxWidth.value = 2200
    } else {
      editorMaxWidth.value = 1100
    }
  })

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

const fontSize = ref(14)
const lineHeight = ref(20)
function onFontSmall() {
  console.log('onFontSmall')
  fontSize.value = 14
  lineHeight.value = 20
}
function onFontBig() {
  console.log('onFontSmall')
  fontSize.value = 18
  lineHeight.value = 26
}
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
        <el-main
          class="editor-wrapper"
          :style="`--font-size: ${fontSize}px; --line-height: ${lineHeight}px`">
          <MdEditor
            ref="editorRef"
            v-model="text"
            class="editor"
            :style="{ maxWidth: `${editorMaxWidth}px` }"
            :toolbars="toolbars"
            :sanitize="filterImage"
            :preview="false"
            :html-preview="false"
            :toolbars-exclude="['pageFullscreen', 'fullscreen', 'htmlPreview', 'github']"
            @upload-img="onUploadImage"
            @on-save="onSave"
            @get-catalog="handleGetCatalog">
            <template #defToolbars>
              <NormalToolbar :title="t('editor.fontIncrease')" @on-click="onFontBig">
                <template #trigger>
                  <img
                    class="md-editor-icon"
                    src="@/assets/font-size-increase.svg"
                    alt="font increase"
                    style="width: 19px; height: 19px" />
                </template>
              </NormalToolbar>
              <NormalToolbar :title="t('editor.fontDecrease')" @on-click="onFontSmall">
                <template #trigger>
                  <img
                    class="md-editor-icon"
                    src="@/assets/font-size-decrease.svg"
                    alt="font increase"
                    style="width: 18px; height: 18px" />
                </template>
              </NormalToolbar>
            </template>
          </MdEditor>
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
  padding: 0 10px 0 0;
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
  padding: 10px;
  padding-top: 0;
  display: flex;
  justify-content: center;
}
.editor {
  height: calc(100vh - 62px - 40px - 60px + 30px);
}
.editor :deep(.cm-editor) {
  font-size: var(--font-size) !important;
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
