<script lang="ts" setup>
import router from '@/router'
import { Back, Expand, Fold, Folder } from '@element-plus/icons-vue'
import matter from 'gray-matter'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const sourcePath = route.query.sourcePath
let currentPath = route.query.currentPath
console.log('currentPath is: ', currentPath)
console.log('sourcePath is: ', sourcePath)
if (Array.isArray(currentPath)) {
  currentPath = currentPath[0]
}
const text = ref('')
interface FrontMatter {
  title: string
  date: string
  permalink: string
  categories: string[]
  tags: string[]
}
const frontMatter = ref<FrontMatter>({
  title: '',
  date: '',
  permalink: '',
  categories: [],
  tags: []
})

if (typeof sourcePath !== 'undefined' && typeof sourcePath === 'string' && sourcePath.length > 0) {
  window.site.getContent(sourcePath).then((content) => {
    const parseDown = matter(content)
    frontMatter.value = parseDown.data as FrontMatter
    text.value = parseDown.content
  })
}

function filterImage(html: string): string {
  return addPrefixToImgSrc(html, 'http://127.0.0.1:2357/', String(currentPath))
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

import type { Category } from '@/local.d.ts'
import { watch } from 'vue'

let categories = ref<null | Category[]>(null)

async function fetch() {
  categories.value = await window.site.getCategories()
}

fetch()

interface Tree {
  id: string
  parent: string | undefined
  label: string
  children?: Tree[]
}

const handleNodeClick = (data: Tree) => {
  console.log(data)
}

let data1 = ref<Tree[]>([])
watch(categories, (newVal) => {
  const nodeMap: { [id: string]: Tree } = {}

  for (const entry of newVal!) {
    nodeMap[entry.id] = {
      id: entry.id,
      parent: entry.parent,
      label: entry.name,
      children: []
    }
  }

  for (const node of Object.values(nodeMap)) {
    if (node.parent) {
      const parent = nodeMap[node.parent]
      if (parent) {
        parent.children?.push(node)
      }
    } else {
      data1.value.push(node)
    }
  }
})

const defaultProps = {
  children: 'children',
  label: 'label'
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
    <el-main class="page-area">
      <el-container>
        <el-header class="editor-header">
          <el-container style="display: flex; flex-direction: row-reverse">
            <el-aside width="240px">
              <div class="op-buttons">
                <el-button type="primary"> {{ t('editor.update') }} </el-button>
                <el-button type="plain" @click="toggleAside">
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
                <el-row>
                  <el-col :span="10">{{ t('editor.date') }}</el-col>
                  <el-col :span="14">
                    <el-link type="primary">{{ frontMatter.date }}</el-link>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="10">{{ t('editor.status') }}</el-col>
                  <el-col :span="14">
                    <el-link type="primary">{{ 'draft' }}</el-link>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="10">{{ t('editor.permalink') }}</el-col>
                  <el-col :span="14">
                    <el-link type="primary">{{ frontMatter.permalink }}</el-link>
                  </el-col>
                </el-row>
              </el-collapse-item>
              <el-collapse-item :title="t('editor.categories')">
                <el-scrollbar height="250px">
                  <el-tree
                    :data="data1"
                    :props="defaultProps"
                    show-checkbox
                    @node-click="handleNodeClick"
                  />
                </el-scrollbar>
                <el-link type="warning">{{ t('editor.createNewCategory') }}</el-link>
              </el-collapse-item>
              <el-collapse-item :title="t('editor.tags')"></el-collapse-item>
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
