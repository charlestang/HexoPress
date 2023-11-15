<script lang="ts" setup>
import { parseFrontMatter, stringify, type FrontMatter } from '@/components/FrontMatter'
import type { Category } from '@/local.d.ts'
import router from '@/router'
import { Back, Expand, Fold, Folder } from '@element-plus/icons-vue'
import { vim } from '@replit/codemirror-vim'
import { MdEditor, config } from 'md-editor-v3'
import { lineNumbers } from '@codemirror/view';
import 'md-editor-v3/lib/style.css'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const sourcePath = route.query.sourcePath
const postPublished =
  typeof sourcePath !== 'undefined' &&
  typeof sourcePath === 'string' &&
  sourcePath.startsWith('_post')

const text = ref('')
const frontMatter = ref<FrontMatter>({
  title: '',
  date: new Date(),
  permalink: '',
  categories: [],
  tags: []
})

if (typeof sourcePath !== 'undefined' && typeof sourcePath === 'string' && sourcePath.length > 0) {
  window.site.getContent(sourcePath).then((content) => {
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

let layout = ref('post')
const options = [
  {
    value: 'post',
    label: 'Post'
  }
]

async function updatePost() {
  // change js object to yaml string
  const blogContent = stringify(frontMatter.value, text.value)
  await window.site.saveContent(sourcePath as string, blogContent)
}

config({
  codeMirrorExtensions(theme, extensions) {
    return [...extensions, lineNumbers(), vim()]
  }
})
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
    <el-main class="page-area">
      <el-container>
        <el-header class="editor-header">
          <el-container style="display: flex; flex-direction: row-reverse">
            <el-aside width="240px">
              <div class="op-buttons">
                <el-link
                  type="primary"
                  v-if="!postPublished"
                  style="margin-right: 10px"
                  @click="updatePost"
                  >{{ t('editor.saveDraft') }}
                </el-link>
                <el-button v-if="postPublished" type="primary" @click="updatePost">
                  {{ t('editor.update') }}
                </el-button>
                <el-button v-else type="primary"> {{ t('editor.publish') }} </el-button>

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
                  <el-dialog v-model="dialogSourcePath" :title="t('editor.filePathDialog')">
                    <el-form>
                      <el-form-item :label="t('editor.filePath')" label-width="70px">
                        <el-input v-model="sourcePath" autocomplete="off" />
                      </el-form-item>
                    </el-form>
                    <template #footer>
                      <span class="dialog-footer">
                        <el-button @click="dialogSourcePath = false">{{
                          t('editor.cancel')
                        }}</el-button>
                        <el-button type="primary" @click="dialogSourcePath = false">
                          {{ t('editor.change') }}
                        </el-button>
                      </span>
                    </template>
                  </el-dialog>
                </el-col>
              </el-row>
            </el-main>
          </el-container>
        </el-header>
        <el-container style="display: flex; flex-direction: row-reverse">
          <el-aside :class="asideExpand">
            <el-collapse>
              <el-collapse-item :title="t('editor.meta')">
                <date-meta-entry v-model="frontMatter.date" class="meta-entry" />
                <url-meta-entry v-model="frontMatter.permalink" class="meta-entry" />
                <el-form label-position="top">
                  <el-form-item :label="t('editor.layout')">
                    <el-select
                      v-model="layout"
                      placeholder="Select"
                      style="width: 100%"
                      size="small"
                    >
                      <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-form>
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
              <el-collapse-item :title="t('editor.categories')">
                <el-scrollbar height="250px">
                  <categories-tree v-model="frontMatter.categories" :categories="categories" />
                </el-scrollbar>
                <el-link type="warning">{{ t('editor.createNewCategory') }}</el-link>
              </el-collapse-item>
              <el-collapse-item :title="t('editor.tags')">
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
    </el-main>
  </el-container>
</template>

<style scoped>
.page-area {
  padding: 0;
}
.topbar {
  color: #fff;
  background: #59524c;
  height: 62px;
  padding-left: 0;
  user-select: none;
  -webkit-user-select: none;
  -webkit-app-region: drag;
}
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
.ͼ1 .cm-vim-panel input {
  color: white;
}
</style>
