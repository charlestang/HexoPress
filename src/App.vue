<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from './stores/app'
import { watch } from 'vue'

const appStore = useAppStore()
const { localeLang } = storeToRefs(appStore)
watch(localeLang, val => {
  console.log('localeLang changed:', val)
})
</script>
<template>
  <el-config-provider :locale="localeLang">
    <router-view />
  </el-config-provider>
</template>
