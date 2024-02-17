<script lang="ts" setup>
import { Close } from '@element-plus/icons-vue'

export interface Props {
  showClose?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showClose: () => true,
})

const emit = defineEmits(['close'])
function onClose() {
  emit('close')
}
console.log('title props: show close: ', props.showClose, ' type:', typeof props.showClose)
</script>
<template>
  <el-row class="titlebar">
    <el-col :span="21" clsss="title">
      <h2><slot></slot></h2>
    </el-col>
    <el-col :span="3" class="close">
      <el-icon @click="onClose"><close v-if="props.showClose" /></el-icon>
    </el-col>
  </el-row>
</template>
<style scoped>
h2 {
  font-size: 15px;
  font-weight: 900;
}
.titlebar {
  margin-bottom: 12px;
}
.title {
  text-align: left;
  line-height: 1.5;
}
.close {
  text-align: right;
}
</style>
