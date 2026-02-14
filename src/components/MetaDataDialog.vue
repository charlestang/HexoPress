<script lang="ts" setup>
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { site } from '@/bridge'
import { cloneValue, toDate, toStringArray } from '@shared/utils/value'
import { computed, ref, toRaw } from 'vue'
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

const frontMatter = ref<PostMeta>({
  title: '',
  permalink: '',
  date: new Date(),
  updated: new Date(),
  tags: [],
  categories: [],
  excerpt: '',
})
const categoriesModel = computed<string | string[] | (string | string[])[]>({
  get() {
    return (frontMatter.value.categories as string | string[] | (string | string[])[]) ?? []
  },
  set(value) {
    frontMatter.value.categories = value as PostMeta['categories']
  },
})
async function onOpen() {
  const loadingInstance = ElLoading.service({ target: 'dialog' })
  const meta = await site.getPostMeta(props.sourcePath)
  frontMatter.value = {
    ...frontMatter.value,
    ...meta,
    date: toDate(meta.date) ?? new Date(),
    updated: toDate(meta.updated) ?? new Date(),
    tags: toStringArray(meta.tags),
    categories: (meta.categories ?? []) as PostMeta['categories'],
  }
  loadingInstance.close()
}

function buildMetaPayload(updatedOverride?: Date): PostMeta {
  const raw = toRaw(frontMatter.value)
  const meta = cloneValue<PostMeta>(raw as PostMeta)
  meta.date = toDate(raw.date) ?? new Date()
  meta.updated = updatedOverride ?? toDate(raw.updated) ?? new Date()
  meta.tags = toStringArray(raw.tags)

  if (typeof raw.categories !== 'undefined') {
    meta.categories = cloneValue(raw.categories)
  }

  return meta
}

async function onSave() {
  const loadingInstance = ElLoading.service({ target: 'dialog' })

  if (!frontMatter.value.title || frontMatter.value.title.length === 0) {
    ElMessageBox.alert(t('editor.titleRequired'), t('editor.tipsTitle'), {
      confirmButtonText: t('editor.ok'),
    })
  }
  const updated = new Date()
  frontMatter.value.updated = updated
  const payload = buildMetaPayload(updated)
  await site.updatePostMeta(props.sourcePath, payload)
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
        <div style="width: 100%">
          <CategoriesTreePanel v-model="categoriesModel" />
        </div>
      </el-form-item>
      <el-form-item :label="t('editor.tags')">
        <el-input-tag v-model="frontMatter.tags" tag-type="success" delimiter="," />
      </el-form-item>
      <el-form-item :label="t('editor.excerpt')">
        <el-input v-model="frontMatter.excerpt" type="textarea" />
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
