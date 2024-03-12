<script lang="ts" setup>
import { useAppStore } from '@/stores/app'
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const appStore = useAppStore()

export interface Props {
  modelValue: boolean
  imageFile: File | undefined
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => false,
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

const previewReader = new FileReader()
watch(
  () => props.imageFile,
  (newVal) => {
    if (newVal !== undefined) {
      console.log('new image file: ', newVal)
      previewReader.onload = (e) => {
        const target = e.target
        if (target !== null && target.result !== null) {
          console.log(target.result)
        }
      }
      previewReader.readAsDataURL(props.imageFile!)
    }
  },
)
</script>
<template>
  <el-dialog v-model="showDialog" :title="t('uploadImage.upload')" @close="showDialog = false">
    <el-form label-position="left" :label-width="100">
      <el-form-item :label="t('uploadImage.filename')">
        <el-input></el-input>
      </el-form-item>
      <el-form-item :label="t('uploadImage.alt')">
        <el-input></el-input>
      </el-form-item>
      <div class="flex justify-center">
        <el-image
          style="width: 400px; border: 1px solid #f00; margin-left: 100px"
          :src="previewReader.result as string"
          fit="cover">
        </el-image>
      </div>
      <el-form-item>
        <el-button>{{ t('uploadImage.submit') }}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
