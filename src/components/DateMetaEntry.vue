<script lang="ts" setup>
import moment from 'moment'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
export interface Props {
  modelValue?: Date
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => new Date()
})

const emit = defineEmits(['update:modelValue'])

const publishTime = ref(props.modelValue)

function onTimeChange(val: Date) {
  if (val !== null) {
    const o = props.modelValue
    emit('update:modelValue', new Date(o.toDateString() + ' ' + val.toTimeString()))
  }
}

function onDateChange(val: Date) {
  if (val !== null) {
    const o = props.modelValue
    emit('update:modelValue', new Date(val.toDateString() + ' ' + o.toTimeString()))
  }
}
const visible = ref(false)
</script>
<template>
  <el-row>
    <el-col :span="8">{{ t('editor.date') }}</el-col>
    <el-col :span="16">
      <el-popover
        :visible="visible"
        :show-arrow="false"
        width="250"
        trigger="click"
        placement="bottom"
      >
        <template #reference>
          <el-link type="primary" @click="visible = true">{{
            moment(props.modelValue).format(t('datetime.short'))
          }}</el-link>
        </template>
        <meta-entry-title @close="visible = false">{{ t('editor.publish') }}</meta-entry-title>
        <el-form label-position="top">
          <el-form-item :label="t('editor.time')">
            <el-time-picker
              v-model="publishTime"
              :format="t('time.short')"
              @change="onTimeChange"
            />
          </el-form-item>
          <el-form-item :label="t('editor.date')">
            <el-date-picker
              v-model="publishTime"
              :format="t('date.short')"
              @change="onDateChange"
            ></el-date-picker>
          </el-form-item>
        </el-form>
      </el-popover>
    </el-col>
  </el-row>
</template>
<style scoped></style>
