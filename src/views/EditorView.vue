<script lang="ts" setup>
import { parseFrontMatter, type FrontMatter } from '@/components/FrontMatter'
import type { Category } from '@/local.d.ts'
import router from '@/router'
import { Back, Expand, Fold, Folder } from '@element-plus/icons-vue'
import { MdEditor } from 'md-editor-v3'
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
                <el-button type="primary"> {{ t('editor.update') }} </el-button>
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
                      <el-input v-model="frontMatter.title" placeholder="Title">
                        <template #suffix>
                          <el-icon class="el-input__icon" @click="dialogSourcePath = true"
                            ><folder
                          /></el-icon>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-form>
                  <el-dialog v-model="dialogSourcePath" title="The file path of the document">
                    <el-form>
                      <el-form-item label="File path" label-width="70px">
                        <el-input v-model="sourcePath" autocomplete="off" />
                      </el-form-item>
                    </el-form>
                    <template #footer>
                      <span class="dialog-footer">
                        <el-button @click="dialogSourcePath = false">Cancel</el-button>
                        <el-button type="primary" @click="dialogSourcePath = false">
                          Change
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
                <status-meta-entry v-model="postPublished" />
                <date-meta-entry v-model="frontMatter.date" />
                <el-row>
                  <el-col :span="8">{{ t('editor.permalink') }}</el-col>
                  <el-col :span="16">
                    <el-popover
                      trigger="click"
                      :showArrow="false"
                      width="240px"
                      placement="bottom-end"
                      :hideAfter="0"
                    >
                      <template #reference>
                        <el-link type="primary">{{ frontMatter.permalink }}</el-link></template
                      >
                      <h3>永久链接</h3>
                      <el-form>
                        <el-form-item label="永久链接"><el-input /> </el-form-item>
                      </el-form>
                    </el-popover>
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
                <tag-input v-model="frontMatter.tags" />
                <el-text class="mx-1" type="info">{{ t('eidtor.tagsTip') }}</el-text>
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
</style>
