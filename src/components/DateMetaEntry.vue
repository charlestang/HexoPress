<script lang="ts" setup>
import { ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()
export interface Props {
  modelValue?: Date
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => new Date()
})

const emit = defineEmits(['update:modelValue'])

const selectedDate = ref(props.modelValue)
</script>
<template>
  <el-row>
    <el-col :span="7">{{ t('editor.date') }}</el-col>
    <el-col :span="17">
      <el-date-picker
        v-model="selectedDate"
        type="datetime"
        format="YY 年 M 月 D 日 HH:mm"
        time-format="HH:mm"
        size="small"
        prefix-icon=""
        :clearable="false"
        :editable="false"
      />
    </el-col>
  </el-row>
</template>
<style scoped>
.el-date-editor {
  width: 120px;
}
:deep(.el-input__prefix) {
  display: none;
}
</style>
