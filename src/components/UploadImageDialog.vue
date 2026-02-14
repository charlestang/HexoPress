<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { site } from '@/bridge'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

export interface Props {
  modelValue: boolean
  filePath: string
  imageFile: File | undefined
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => false,
})

const emit = defineEmits(['update:modelValue', 'update:filePath', 'uploadSuccess'])

const showDialog = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const filePath = computed({
  get() {
    return props.filePath
  },
  set(value) {
    emit('update:filePath', value)
  },
})

const previewReader = new FileReader()
const imageSrc = ref('')
watch(
  () => props.imageFile,
  (newVal) => {
    if (newVal !== undefined) {
      console.log('new image file: ', newVal)
      previewReader.onload = (e) => {
        const target = e.target
        if (target !== null && target.result !== null) {
          imageSrc.value = target.result as string
          console.log('image loaded from reader, length: ', imageSrc.value.length)
        }
      }
      previewReader.readAsDataURL(props.imageFile!)
    }
  },
)

async function submit() {
  console.log('submit')
  const reader = new FileReader()
  reader.onload = (e) => {
    const target = e.target
    if (target !== null && target.result !== null) {
      site.saveImage(filePath.value, target.result as ArrayBuffer).then(() => {
        emit('uploadSuccess')
        showDialog.value = false
      })
    }
  }
  reader.readAsArrayBuffer(props.imageFile!)
}
</script>
<template>
  <el-dialog v-model="showDialog" :title="t('uploadImage.upload')" @close="showDialog = false">
    <el-form label-position="left" :label-width="100">
      <el-form-item :label="t('uploadImage.filename')">
        <el-input v-model="filePath"></el-input>
      </el-form-item>
      <div class="flex justify-center">
        <el-image
          style="width: 400px; border: 1px solid #f00; margin-left: 100px"
          :src="imageSrc"
          fit="cover">
        </el-image>
      </div>
      <el-form-item>
        <el-button @click="submit">{{ t('uploadImage.submit') }}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
