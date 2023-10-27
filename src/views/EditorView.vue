<template>
  <el-container>
    <el-header class="topbar">
      <el-row>
        <el-col :span="24" class="control-bar" />
      </el-row>
      <el-row>
        <el-col :span="24">
          <img alt="Hexo Writer" height="48" width="48" class="logo" src="../assets/logo.svg" />
          <el-button key="back" class="back" text :icon="Back" @click="router.go(-1)"
            >Back</el-button
          >
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <MdEditor class="editor" v-model="text" />
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import router from '@/router'
import { Back } from '@element-plus/icons-vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sourcePath = route.params.sourcePath
const text = ref('')
console.log('EditorView loaded. sourcePath is: ', sourcePath)
if (typeof sourcePath !== 'undefined' && typeof sourcePath === 'string' && sourcePath.length > 0) {
  window.site.getContent(sourcePath).then((content) => {
    text.value = content
  })
}
</script>

<style scoped>
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
