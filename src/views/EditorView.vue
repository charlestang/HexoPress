<script lang="ts" setup>
import router from '@/router'
import { Back, Folder } from '@element-plus/icons-vue'
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
      <el-container style="display: flex; flex-direction: row-reverse">
        <el-aside width="240px">
          <el-form>
            <el-form-item label="Date">
              <el-input v-model="frontMatter.date" />
            </el-form-item>
            <el-form-item label="Path">
              <el-input v-model="frontMatter.permalink" />
            </el-form-item>
            <el-form-item label="Categories">
              <el-input />
            </el-form-item>
            <el-form-item label="Tags">
              <el-input />
            </el-form-item>
          </el-form>
        </el-aside>
        <el-container>
          <el-header class="editor-header">
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
          </el-header>
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
.editor-header .el-row {
  height: 100%;
}
.editor-header .el-row .el-col {
  align-self: center;
}
.editor-wrapper {
  padding: 10px;
  padding-top: 0;
}
.editor {
  height: calc(100vh - 62px - 40px - 60px + 30px);
}
</style>
