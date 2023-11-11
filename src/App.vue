<script lang="ts" setup>
import { useAppStore } from './stores/app'

const appStore = useAppStore()
</script>
<template>
  <router-view />
</template>
