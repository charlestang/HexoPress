<script lang="ts" setup>
/**
 * Date Metadata Entry Component
 * Used for editing and displaying the publication date for blog posts
 */
import moment from 'moment'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/**
 * Component props definition
 */
export interface Props {
  /**
   * The initial date value
   */
  modelValue?: Date
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => new Date(),
})

/**
 * Emitted events definition
 */
const emit = defineEmits<{
  'update:modelValue': [value: Date]
}>()

/**
 * Controls the visibility of the date edit popover
 */
const visible = ref(false)

/**
 * Reference to the time portion of the date for the time picker
 */
const publishTime = ref(props.modelValue)

/**
 * Reference to the date portion for the date picker
 */
const publishDate = ref(props.modelValue)

/**
 * Watch for changes in modelValue to keep internal state in sync
 */
watch(
  () => props.modelValue,
  (newValue) => {
    publishTime.value = newValue
    publishDate.value = newValue
  },
  { immediate: true },
)

/**
 * Handles time change event
 * Updates only the time portion of the date while preserving the date
 * @param val The new time value
 */
function onTimeChange(val: Date) {
  if (val !== null) {
    const o = props.modelValue
    emit('update:modelValue', new Date(o.toDateString() + ' ' + val.toTimeString()))
  }
}

/**
 * Handles date change event
 * Updates only the date portion while preserving the time
 * @param val The new date value
 */
function onDateChange(val: Date) {
  if (val !== null) {
    const o = props.modelValue
    emit('update:modelValue', new Date(val.toDateString() + ' ' + o.toTimeString()))
  }
}
</script>
<template>
  <!-- Date metadata entry row -->
  <el-row>
    <!-- Date label column -->
    <el-col :span="8">{{ t('editor.date') }}</el-col>
    <!-- Date edit column -->
    <el-col :span="16">
      <!-- Date edit popover -->
      <el-popover
        :visible="visible"
        :show-arrow="false"
        width="250"
        trigger="click"
        placement="bottom">
        <template #reference>
          <!-- Display formatted date -->
          <el-link type="primary" @click="visible = true">{{
            moment(props.modelValue).format(t('datetime.short'))
          }}</el-link>
        </template>
        <!-- Popover title with close button -->
        <MetaEntryTitle @close="visible = false">{{ t('editor.publish') }}</MetaEntryTitle>
        <!-- Date/time edit form -->
        <el-form label-position="top">
          <!-- Time picker field -->
          <el-form-item :label="t('editor.time')">
            <el-time-picker
              v-model="publishTime"
              :format="t('time.short')"
              @change="onTimeChange" />
          </el-form-item>
          <!-- Date picker field -->
          <el-form-item :label="t('editor.date')">
            <el-date-picker
              v-model="publishDate"
              :format="t('date.short')"
              @change="onDateChange"></el-date-picker>
          </el-form-item>
        </el-form>
      </el-popover>
    </el-col>
  </el-row>
</template>
<style scoped></style>
