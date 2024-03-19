<script lang="ts" setup>
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

const appStore = useAppStore()
const { localeLang } = storeToRefs(appStore)
</script>
<template>
  <el-config-provider :locale="localeLang">
    <router-view />
  </el-config-provider>
</template>
