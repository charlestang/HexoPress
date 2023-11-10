<script lang="ts" setup>
import { useAppStore } from './stores/app'
import { computed } from 'vue'

const appStore = useAppStore()

// global locale config
const locale = computed(() => appStore.locale)

</script>
<template>
  <el-config-provider :locale="locale">
    <router-view />
  </el-config-provider>
</template>
