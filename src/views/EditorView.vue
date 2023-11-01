<script lang="ts" setup>
import router from '@/router'
import { Back } from '@element-plus/icons-vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const sourcePath = route.query.sourcePath
let currentPath = route.query.currentPath
console.log(route.query)
if (Array.isArray(currentPath)) {
  currentPath = currentPath[0]
}
const text = ref('')

if (typeof sourcePath !== 'undefined' && typeof sourcePath === 'string' && sourcePath.length > 0) {
  window.site.getContent(sourcePath).then((content) => {
    text.value = content
  })
}
function filterImage(html: string): string {
  console.log(html.length)
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
</script>

<template>
  <el-container>
    <el-header class="topbar">
      <el-row>
        <el-col :span="24" class="control-bar" />
      </el-row>
      <el-row>
        <el-col :span="24">
          <img alt="HexoPress" height="30" width="30" src="../assets/logo.svg" />
          <div class="app-name">HexoPress</div>
          <el-button key="back" class="back" text :icon="Back" @click="router.go(-1)">{{
            t('common.back')
          }}</el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-main class="page-area">
      <el-container style="display: flex; flex-direction: row-reverse">
        <el-aside width="200px">
          <el-form>
            <el-form-item label="Date">
              <el-input></el-input>
            </el-form-item>
            <el-form-item label="Path">
              <el-input v-model="currentPath" />
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
          <el-header>
            <el-form>
              <el-form-item label="Title">
                <el-input />
              </el-form-item>
            </el-form>
            File Path: {{ sourcePath }}
          </el-header>
          <el-main>
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
.control-bar {
  height: 14px;
  display: block;
}
img {
  float: left;
  margin: 10px 17px 10px 17px;
}
.app-name {
  float: left;
  line-height: 48px;
  padding: 0 12px 0 0;
  margin-left: -12px;
  font-weight: bold;
}
.logo {
  float: left;
  margin-left: 8px;
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
.editor {
  height: calc(100vh - 62px - 40px);
}
</style>
