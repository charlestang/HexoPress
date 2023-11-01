<script lang="ts" setup>
import type { Tag } from '@/local.d.ts'
import { ref } from 'vue'

let tags = ref<null | Tag[]>(null)

async function fetch() {
  tags.value = await window.site.getTags()
}

fetch()
</script>

<template>
  <el-tag v-for="tag in tags" :key="tag.id">
    {{ tag.name }}
  </el-tag>
</template>
