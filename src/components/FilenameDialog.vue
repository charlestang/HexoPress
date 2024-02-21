<script lang="ts" setup>
import { useAppStore } from '@/stores/app'
import { join } from 'path-browserify'
import { computed, ref, watch, watchEffect } from 'vue'
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

const emit = defineEmits(['update:modelValue', 'update:sourcePath'])

const showDialog = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})
const sourceDir = ref('')

watchEffect(() => {
  const base = appStore.basePath
  const config = appStore.hexoConfig
  if (config !== null) {
    sourceDir.value = join(base, config.source_dir, '/')
  }
})

const newFilePath = ref(props.sourcePath)
watch(
  () => props.sourcePath,
  newVal => {
    newFilePath.value = newVal
  },
)
const visible = ref(false)
async function changePath() {
  console.log('change file path: from: ', props.sourcePath, ' to: ', newFilePath.value)
  const res = await window.site.mv(props.sourcePath, newFilePath.value)
  await window.site.refreshSite()
  if (res) {
    ElMessage.success({
      message: t('filenameDialog.changePathSuccess'),
      onClose: async () => {
        visible.value = false
        showDialog.value = false
        emit('update:sourcePath', newFilePath.value)
      },
    })
  } else {
    ElMessage.error(t('filenameDialog.changePathFailed'))
    visible.value = false
  }
}
</script>
<template>
  <el-dialog v-model="showDialog" :title="t('filenameDialog.title')">
    <el-row :gutter="20">
      <el-col class="label" :span="6">{{ t('filenameDialog.sourceDir') }}</el-col>
      <el-col :span="18">{{ sourceDir }}</el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col class="label" :span="6">
        {{ t('filenameDialog.sourcePath') }}
      </el-col>
      <el-col :span="18">
        <el-text v-if="props.sourcePath == ''">{{ t('filenameDialog.fileNotSaved') }}</el-text>
        <el-text v-else
          >{{ props.sourcePath }}
          <el-popover
            :visible="visible"
            placement="bottom-start"
            trigger="click"
            :title="t('filenameDialog.newFilePathTitle')"
            width="30%">
            <el-form label-position="top">
              <el-form-item :label="t('filenameDialog.newFilePath')">
                <el-input v-model="newFilePath" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="changePath">{{
                  t('filenameDialog.confirm')
                }}</el-button>
              </el-form-item>
            </el-form>
            <template #reference>
              <el-link type="primary" class="change" link @click="visible = true">{{
                t('filenameDialog.changePath')
              }}</el-link>
            </template>
          </el-popover>
        </el-text>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<style scoped>
.label {
  text-align: right;
}
.change {
  margin-left: 10px;
}
</style>
