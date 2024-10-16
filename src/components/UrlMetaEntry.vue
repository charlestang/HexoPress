<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
export interface Props {
  modelValue?: string
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => '',
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
function onClickChange() {
  emit('update:modelValue', permalink)
  visible.value = false
}

const permalink = ref('')
watchEffect(() => {
  permalink.value = props.modelValue
})
</script>
<template>
  <el-row>
    <el-col :span="8">{{ t('editor.url') }}</el-col>
    <el-col :span="16">
      <el-popover
        trigger="click"
        :show-arrow="false"
        width="250px"
        placemen
        :hide-after="0"
        :visible="visible">
        <template #reference>
          <el-link v-if="props.modelValue !== ''" type="primary" @click="visible = true">{{
            props.modelValue
          }}</el-link>
          <el-link v-else type="primary" @click="visible = true">{{ t('editor.notSet') }}</el-link>
        </template>
        <meta-entry-title @close="visible = false">{{ t('editor.url') }}</meta-entry-title>
        <el-form label-position="top">
          <el-form-item :label="t('editor.permalink')"
            ><el-input v-model="permalink" />
            <div class="tips">{{ t('editor.permalinkTip') }}</div>
          </el-form-item>
          <el-button type="primary" @click="onClickChange">{{ t('editor.change') }}</el-button>
        </el-form>
      </el-popover>
    </el-col>
  </el-row>
</template>
<style scoped>
.tips {
  font-size: 12px;
  color: #999;
}
</style>
