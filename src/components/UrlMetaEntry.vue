<script lang="ts" setup>
/**
 * URL Metadata Entry Component
 * Used for editing and displaying permalink for blog posts
 */
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/**
 * Component props definition
 */
export interface Props {
  /**
   * The initial permalink value
   */
  modelValue?: string
}

// Default props values
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => '',
})

/**
 * Emitted events definition
 */
const emit = defineEmits<{
  /**
   * Updates the permalink value in the parent component
   */
  'update:modelValue': [value: string]
}>()

/**
 * Controls the visibility of the permalink edit popover
 */
const visible = ref(false)

/**
 * Handles the save button click
 * Updates the permalink value and closes the popover
 */
function onClickChange() {
  emit('update:modelValue', permalink.value)
  visible.value = false
}

/**
 * Stores the current permalink value for editing
 * Initialized with the model value from props
 */
const permalink = ref(props.modelValue)

/**
 * Watches for changes in the model value from parent component
 * Updates the local permalink value to stay in sync
 */
watch(
  () => props.modelValue,
  (newValue) => {
    permalink.value = newValue
  },
  { immediate: true}
)
</script>
<template>
  <!-- URL metadata entry row -->
  <el-row>
    <!-- URL label column -->
    <el-col :span="8">{{ t('editor.url') }}</el-col>
    <!-- Permalink edit column -->
    <el-col :span="16">
      <!-- Permalink edit popover -->
      <el-popover
        trigger="click"
        :show-arrow="false"
        width="250px"
        placement="bottom"
        :hide-after="0"
        :visible="visible">
        <template #reference>
          <!-- Display permalink if it exists, otherwise show "Not Set" -->
          <el-link v-if="props.modelValue !== ''" type="primary" @click="visible = true">{{
            props.modelValue
          }}</el-link>
          <el-link v-else type="primary" @click="visible = true">{{ t('editor.notSet') }}</el-link>
        </template>
        <!-- Popover title with close button -->
        <meta-entry-title @close="visible = false">{{ t('editor.url') }}</meta-entry-title>
        <!-- Permalink edit form -->
        <el-form label-position="top">
          <!-- Permalink input field -->
          <el-form-item :label="t('editor.permalink')">
            <el-input v-model="permalink" clearable />
            <!-- Permalink tips -->
            <div class="tips">{{ t('editor.permalinkTip') }}</div>
          </el-form-item>
          <!-- Save button -->
          <el-button type="primary" @click="onClickChange">{{ t('editor.change') }}</el-button>
        </el-form>
      </el-popover>
    </el-col>
  </el-row>
</template>
<style scoped>
/* Form tips styling */
.tips {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
