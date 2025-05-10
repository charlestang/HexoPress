<script lang="ts" setup>
import { parseFrontMatter, stringify, type FrontMatter } from '@/components/FrontMatter'
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { lineNumbers } from '@codemirror/view'
import { Expand, Fold, Folder } from '@element-plus/icons-vue'
import { Vim, vim } from '@replit/codemirror-vim'
import { MdEditor, NormalToolbar, config, type ExposeParam, type ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()

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
sourcePath.value = route.query.sourcePath as string
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

watch(text, (val, oldVal) => {
  if (val !== oldVal) {
    isDirty.value = true
  }
})

const frontMatter = ref<FrontMatter>({
  title: '',
  date: new Date(),
  permalink: '',
  categories: [],
  tags: [],
})

watch(
  frontMatter,
  () => {
    isDirty.value = true
  },
  { deep: true },
)

if (!isNewPost.value) {
  // The blog post already exists, it is now being edited.
  window.site.getContent(sourcePath.value).then((content) => {
    const parseDown = parseFrontMatter(content)
    frontMatter.value = parseDown.data as FrontMatter
    text.value = parseDown.content
    console.log('parsed front-matter: ', frontMatter.value)
  })
}

/**
 * Content sanitizer to help preview display images in content.
 * @param html The HTML content of the blog post.
 */
function filterImage(html: string): string {
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
function _getBlogContent(): string {
  if (isDirty.value) {
    // Only update frontMatter time if article content has changed
    frontMatter.value.updated = new Date()
  }
  // change js object to yaml string
  return stringify(frontMatter.value, text.value)
}
async function updatePost() {
  const check = await _formValidate()
  if (!check) {
    return
  }
  const blogContent = _getBlogContent()
  // that means this is an update request
  await window.site.saveContent(sourcePath.value, blogContent)
  ElMessage.success(t('editor.createSuccess'))
}

async function upsertDraft() {
  const check = await _formValidate()
  if (!check) {
    return
  }
  const blogContent = _getBlogContent()
  if (typeof sourcePath.value === 'undefined' /* a new document has not sourcePath */) {
    console.log('upsertDraft: ', frontMatter.value)
    // that means this is a new post or draft
    sourcePath.value = await window.site.createFile(
      '_drafts',
      frontMatter.value.title ?? '',
      frontMatter.value.permalink ?? '',
      blogContent,
    )
    isDirty.value = false
    isNewPost.value = false
    ElMessage.success(t('editor.draftSaveSuccess'))
  } else {
    // that means this is an update request
    await window.site.saveContent(sourcePath.value, blogContent)
    ElMessage.success(t('editor.draftSaveSuccess'))
  }
}

async function publishDraft() {
  const check = await _formValidate()
  if (!check) {
    return
  }
  const blogContent = _getBlogContent()
  if (typeof sourcePath.value === 'undefined' /* a new document has not sourcePath */) {
    // that means this is a new post or draft
    sourcePath.value = await window.site.createFile(
      '_posts',
      frontMatter.value.title ?? '',
      frontMatter.value.permalink ?? '',
      blogContent,
    )
    isDirty.value = false
    isNewPost.value = false
    ElMessage.success(t('editor.draftPublishSuccess'))
  } else {
    // that means this is an update request
    const newPath = await window.site.moveFile(sourcePath.value, blogContent)
    console.log('move file from: ', sourcePath.value, ' to newPath: ', newPath)
    if (newPath.length == 0) {
      ElMessage.error(t('editor.createFailed'))
      return
    }
    sourcePath.value = newPath
    ElMessage.success(t('editor.draftPublishSuccess'))
  }
}

const appStore = useAppStore()

if (appStore.editMode === 'vim') {
  config({
    codeMirrorExtensions(theme, extensions) {
      return [...extensions, lineNumbers(), vim()]
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
  imageFile.value = files[0]
  function formatDate(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthS = month < 10 ? '0' + month : month
    return `${year}/${monthS}`
  }
  filePath.value = formatDate(frontMatter.value.date as Date) + '/' + files[0].name
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
onMounted(() => {
  editorRef.value?.on('catalog', console.log)
  editorRef.value?.on('preview', (status) => {
    if (status) {
      editorMaxWidth.value = 2200
    } else {
      editorMaxWidth.value = 1100
    }
  })
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
              <date-meta-entry v-model="frontMatter.date" class="meta-entry" />
              <url-meta-entry v-model="frontMatter.permalink" class="meta-entry" />
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
              <categories-tree-panel v-model="frontMatter.categories" />
            </el-collapse-item>
            <el-collapse-item :title="t('editor.tags')" name="tags">
              <el-text type="info" size="small">{{ t('editor.selectTags') }}</el-text>
              <tag-input v-model="frontMatter.tags" />
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
            @on-save="onSave">
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
