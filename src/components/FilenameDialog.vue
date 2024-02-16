<script lang="ts" setup>
import { useAppStore } from '@/stores/app'
import { join } from 'path-browserify'
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const appStore = useAppStore()

export interface Props {
  modelValue: boolean
  sourcePath: string
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => false,
  sourcePath: () => '',
})

const emit = defineEmits(['update:modelValue'])

const showDialog = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})
const sourceDir = ref('')

watchEffect(async () => {
  const base = await appStore.basePath
  const config = await appStore.hexoConfig
  if (config !== null) {
    sourceDir.value = join(base, config.source_dir, '/')
  }
})
</script>
<template>
  <el-dialog v-model="showDialog" :title="t('filenameDialog.title')">
    <el-row :gutter="20">
      <el-col class="label" :span="6">{{ t('filenameDialog.sourceDir') }}</el-col>
      <el-col :span="18">{{ sourceDir }}</el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col class="label" :span="6">{{ t('filenameDialog.sourcePath') }}</el-col>
      <el-col :span="18">
        <el-text v-if="props.sourcePath == ''">{{ t('filenameDialog.fileNotSaved') }}</el-text>
        <el-text v-else>{{ props.sourcePath }}</el-text>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<style scoped>
.label {
  text-align: right;
}
</style>
