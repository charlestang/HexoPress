<template>
  <el-row><el-col :span="24" class="control-bar" /></el-row>
  <el-row>
    <el-col :span="24">
      <img alt="HexoPress" height="30" width="30" src="../assets/logo.svg" />
      <div class="app-name">HexoPress</div>
      <el-button key="new-post" :icon="EditPen" text class="new" @click="handleNewPost"
        >{{ t('common.newPost') }}</el-button
      >
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import { EditPen } from '@element-plus/icons-vue'
import router from '../router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const handleNewPost = () => {
  router.push('/editor')
}
</script>
<style scoped>
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
.new {
  height: 40px;
  margin: 4px 0;
  color: #fff;
  -webkit-app-region: no-drag;
}
.new:hover {
  color: #c7a589;
}
</style>
