<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from './stores/app'

const appStore = useAppStore()
const { localeLang } = storeToRefs(appStore)
</script>
<template>
  <el-config-provider :locale="localeLang">
    <router-view />
  </el-config-provider>
</template>
