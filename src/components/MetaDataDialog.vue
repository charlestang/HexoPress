<script lang="ts" setup>
import { parseFrontMatter, type FrontMatter } from '@/components/FrontMatter'
import { ElLoading } from 'element-plus'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

export interface Props {
  modelValue: boolean
  sourcePath: string
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => false,
  sourcePath: () => ''
})

const emit = defineEmits(['update:modelValue'])

const showDialog = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const frontMatter = ref<FrontMatter>({
  title: '',
  permalink: '',
  date: new Date(),
  updated: new Date(),
  tags: [],
  categories: [],
  excerpt: ''
})
async function onOpen() {
  const loadingInstance = ElLoading.service({ target: 'dialog' })
  // The blog post already exists, it is now being edited.
  await window.site.getContent(props.sourcePath).then((content) => {
    const parseDown = parseFrontMatter(content)
    frontMatter.value = parseDown.data as FrontMatter
  })
  loadingInstance.close()
}
async function onSave() {
  const loadingInstance = ElLoading.service({ target: 'dialog' })
  loadingInstance.close()
  showDialog.value = false
}
</script>
<template>
  <el-dialog v-model="showDialog" class="dialog" @open="onOpen">
    <template #header>{{ props.sourcePath }}</template>
    <template #footer>
      <el-button @click="showDialog = false">{{ t('common.back') }}</el-button>
      <el-button @click="onSave" type="primary">{{ t('common.save') }}</el-button>
    </template>
    <el-form label-width="140px">
      <el-form-item :label="t('editor.title')">
        <el-input v-model="frontMatter.title" />
      </el-form-item>
      <el-form-item :label="t('editor.permalink')">
        <el-input v-model="frontMatter.permalink" />
      </el-form-item>
      <el-form-item :label="t('editor.date')">
        <el-date-picker v-model="frontMatter.date" type="datetime" />
      </el-form-item>
      <el-form-item :label="t('editor.updated')">
        <el-date-picker v-model="frontMatter.updated" type="datetime" />
      </el-form-item>
      <el-form-item :label="t('editor.categories')">
        <el-input v-model="frontMatter.categories" />
      </el-form-item>
      <el-form-item :label="t('editor.tags')">
        <el-input v-model="frontMatter.tags" />
      </el-form-item>
      <el-form-item :label="t('editor.excerpt')">
        <el-input v-model="frontMatter.excerpt" type="textarea" />
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
