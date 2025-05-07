<script lang="ts" setup>
import { parseFrontMatter, stringify, type FrontMatter } from '@/components/FrontMatter'
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
  sourcePath: () => '',
})

const emit = defineEmits(['update:modelValue', 'success'])

const showDialog = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const frontMatter = ref<FrontMatter>({
  title: '',
  permalink: '',
  date: new Date(),
  updated: new Date(),
  tags: [],
  categories: [],
  excerpt: '',
})
const content = ref('')
async function onOpen() {
  const loadingInstance = ElLoading.service({ target: 'dialog' })
  // The blog post already exists, it is now being edited.
  await window.site.getContent(props.sourcePath).then((data) => {
    const parseDown = parseFrontMatter(data)
    frontMatter.value = parseDown.data as FrontMatter
    content.value = parseDown.content
  })
  loadingInstance.close()
}

async function onSave() {
  const loadingInstance = ElLoading.service({ target: 'dialog' })

  if (!frontMatter.value.title || frontMatter.value.title.length === 0) {
    ElMessageBox.alert(t('editor.titleRequired'), t('editor.tipsTitle'), {
      confirmButtonText: t('editor.ok'),
    })
  }
  frontMatter.value.updated = new Date()
  // change js object to yaml string
  const blogContent = stringify(frontMatter.value, content.value)

  // that means this is an update request
  await window.site.saveContent(props.sourcePath, blogContent)
  ElMessage.success(t('editor.createSuccess'))
  emit('success')
  loadingInstance.close()
  showDialog.value = false
}
</script>
<template>
  <el-dialog v-model="showDialog" class="dialog" @open="onOpen" :destroy-on-close="true">
    <template #header>{{ props.sourcePath }}</template>
    <template #footer>
      <el-button @click="showDialog = false">{{ t('common.back') }}</el-button>
      <el-button type="primary" @click="onSave">{{ t('common.save') }}</el-button>
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
        <div style="width: 100%;">
          <categories-tree-panel v-model="frontMatter.categories" />
        </div>
      </el-form-item>
      <el-form-item :label="t('editor.tags')">
        <tag-input v-model="frontMatter.tags" />
      </el-form-item>
      <el-form-item :label="t('editor.excerpt')">
        <el-input v-model="frontMatter.excerpt" type="textarea" />
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
