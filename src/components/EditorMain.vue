<script lang="ts" setup>
import { parseFrontMatter, stringify, type FrontMatter } from '@/components/FrontMatter'
import type { Category } from '@/local.d.ts'
import router from '@/router'
import { lineNumbers } from '@codemirror/view'
import { Expand, Fold, Folder } from '@element-plus/icons-vue'
import { vim } from '@replit/codemirror-vim'
import { MdEditor, config } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const sourcePath = ref('')
sourcePath.value = route.query.sourcePath as string
const postPublished =
  typeof sourcePath.value !== 'undefined' &&
  typeof sourcePath.value === 'string' &&
  sourcePath.value.startsWith('_posts')

const dirty = ref(false)
const text = ref('')

watch(text, (val, oldVal) => {
  if (val !== oldVal) {
    dirty.value = true
  }
})

const frontMatter = ref<FrontMatter>({
  title: '',
  date: new Date(),
  permalink: '',
  categories: [],
  tags: []
})

watch(
  frontMatter,
  () => {
    dirty.value = true
  },
  { deep: true }
)

if (
  typeof sourcePath.value !== 'undefined' &&
  typeof sourcePath.value === 'string' &&
  sourcePath.value.length > 0
) {
  // The blog post already exists, it is now being edited.
  window.site.getContent(sourcePath.value).then((content) => {
    const parseDown = parseFrontMatter(content)
    frontMatter.value = parseDown.data as FrontMatter
    text.value = parseDown.content
    console.log('parsed front-matter: ', frontMatter.value)
  })
}

function filterImage(html: string): string {
  return addPrefixToImgSrc(html, 'http://127.0.0.1:2357/', frontMatter.value.permalink || '')
}
function addPrefixToImgSrc(html: string, prefix: string, currentPath: string): string {
  const regex = /(<img[^>]+src\s*=\s*["'])([^"']*)/gi
  return html.replace(regex, (match, p1, p2: string) => {
    if (p2.startsWith('http://') || p2.startsWith('https://')) {
      return match
    }
    let curPath = currentPath.split('/').filter((p) => p !== '')
    let imgPath = p2.split('/').filter((p) => p !== '')
    while (curPath.length > 0 && imgPath[0] == '..') {
      imgPath.shift()
      curPath.pop()
    }
    console.log('replaced to : ', p1 + prefix + curPath.concat(imgPath).join('/'))
    return p1 + prefix + curPath.concat(imgPath).join('/')
  })
}

let dialogSourcePath = ref(false)
let asideExpand = ref('aside-expand')
function toggleAside() {
  if (asideExpand.value === 'aside-expand') {
    asideExpand.value = 'aside-collapsed'
  } else {
    asideExpand.value = 'aside-expand'
  }
}

// fetch all categories from backend
let categories = ref<Category[]>([])
async function fetch() {
  categories.value = await window.site.getCategories()
}
fetch()

async function updatePost(type: '_posts' | '_drafts') {
  if (!dirty.value) {
    ElMessage.info(t('editor.nothingChanged'))
    return
  }
  if (!frontMatter.value.title || frontMatter.value.title.length === 0) {
    ElMessageBox.alert(t('editor.titleRequired'), t('editor.tipsTitle'), {
      confirmButtonText: t('editor.ok')
    })
  }
  frontMatter.value.updated = new Date()
  // change js object to yaml string
  const blogContent = stringify(frontMatter.value, text.value)

  if (
    typeof sourcePath.value === 'undefined' ||
    (typeof sourcePath.value === 'string' && sourcePath.value.length === 0)
  ) {
    // that means this is a new post or draft
    sourcePath.value = await window.site.createFile(
      type,
      frontMatter.value.title ?? '',
      frontMatter.value.permalink ?? '',
      blogContent
    )
    dirty.value = false
    ElMessage.success(t('editor.createSuccess'))
    router.replace({ path: '/frame', query: { sourcePath: sourcePath.value } })
  } else {
    // that means this is an update request
    await window.site.saveContent(sourcePath.value, blogContent)
    ElMessage.success(t('editor.createSuccess'))
    if (!postPublished) {
      await window.site.moveFile(sourcePath.value, blogContent)
      ElMessage.success(t('editor.publishedSuccess'))
      router.replace({ path: '/frame', query: { sourcePath: sourcePath.value } })
    }
  }
}

config({
  codeMirrorExtensions(theme, extensions) {
    return [...extensions, lineNumbers(), vim()]
  }
})
const activeAsidePanels = ref(['meta', 'cate', 'tags'])

const showCreateCategory = ref(false)
const createCategoryForm = ref({
  name: '',
  parent: ''
})
function onClickAddCategory() {
  console.log('add new category: ')
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
                type="primary"
                v-if="!postPublished"
                style="margin-right: 10px"
                @click="updatePost('_drafts')"
                >{{ t('editor.saveDraft') }}
              </el-link>
              <el-button v-if="postPublished" type="primary" @click="updatePost('_posts')">
                {{ t('editor.update') }}
              </el-button>
              <el-button v-else type="primary" @click="updatePost('_posts')">
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
                <FilenameDialog v-model="dialogSourcePath" :sourcePath="sourcePath" />
              </el-col>
            </el-row>
          </el-main>
        </el-container>
      </el-header>
      <el-container style="display: flex; flex-direction: row-reverse">
        <el-aside :class="asideExpand">
          <el-collapse v-model="activeAsidePanels">
            <el-collapse-item :title="t('editor.meta')" name="meta">
              <DateMetaEntry v-model="frontMatter.date" class="meta-entry" />
              <UrlMetaEntry v-model="frontMatter.permalink" class="meta-entry" />
              <el-row v-if="postPublished" :gutter="20">
                <el-col :span="10">
                  <el-button type="warning" plain size="small" style="width: 100%">{{
                    t('editor.turnToDraft')
                  }}</el-button>
                </el-col>
                <el-col :span="14">
                  <el-button type="danger" plain size="small" style="width: 100%">{{
                    t('editor.moveToTrash')
                  }}</el-button>
                </el-col>
              </el-row>
            </el-collapse-item>
            <el-collapse-item :title="t('editor.categories')" name="cate">
              <el-scrollbar height="250px">
                <categories-tree v-model="frontMatter.categories" :categories="categories" />
              </el-scrollbar>
              <el-popover
                :visible="showCreateCategory"
                :show-arrow="false"
                width="250"
                trigger="click"
                placement="bottom"
              >
                <template #reference>
                  <el-link type="warning" @click="showCreateCategory = true">{{
                    t('editor.createNewCategory')
                  }}</el-link>
                </template>
                <meta-entry-title @close="showCreateCategory = false">{{
                  t('editor.createCategory')
                }}</meta-entry-title>
                <el-form :model="createCategoryForm">
                  <el-form-item :label="t('editor.categoryName')">
                    <el-input v-model="createCategoryForm.name"></el-input>
                  </el-form-item>
                  <el-form-item :label="t('editor.parentCategory')">
                    <el-select v-model="createCategoryForm.parent" placeholder="请选择">
                      <el-option
                        v-for="item in categories"
                        :key="item.id"
                        :label="item.name"
                        :value="item.name"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-button type="primary" @click="onClickAddCategory">{{
                    t('editor.add')
                  }}</el-button>
                </el-form>
              </el-popover>
            </el-collapse-item>
            <el-collapse-item :title="t('editor.tags')" name="tags">
              <el-text type="info" size="small">{{ t('eidtor.selectTags') }}</el-text>
              <tag-input v-model="frontMatter.tags" />
              <el-text type="info">{{ t('eidtor.tagsTip') }}</el-text>
            </el-collapse-item>
          </el-collapse>
        </el-aside>
        <el-main class="editor-wrapper">
          <MdEditor
            class="editor"
            v-model="text"
            :sanitize="filterImage"
            :preview="false"
            :htmlPreview="false"
            :toolbarsExclude="['pageFullscreen', 'fullscreen', 'htmlPreview', 'github']"
          ></MdEditor>
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
}
.editor {
  height: calc(100vh - 62px - 40px - 60px + 30px);
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
</style>
