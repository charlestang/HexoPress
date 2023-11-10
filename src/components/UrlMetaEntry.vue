<script lang="ts" setup>
import moment from 'moment'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
export interface Props {
  modelValue?: String
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ''
})

const emit = defineEmits(['update:modelValue'])

const permalink = ref(props.modelValue)
</script>
<template>
  <el-row>
    <el-col :span="8">{{ t('editor.url') }}</el-col>
    <el-col :span="16">
      <el-popover trigger="click" :showArrow="false" width="250px" placemen :hideAfter="0">
        <template #reference>
          <el-link type="primary">{{ props.modelValue }}</el-link>
        </template>
        <meta-entry-title :showClose="false">{{ t('editor.url') }}</meta-entry-title>
        <el-form label-position="top">
          <el-form-item v-model="permalink" :label="t('editor.permalink')"
            ><el-input />
            <div class="tips">{{ t('editor.permalinkTip') }}</div>
          </el-form-item>
        </el-form>
      </el-popover>
    </el-col>
  </el-row>
</template>
<style scoped>
.tips{
    font-size: 12px;
    color: #999;
}
</style>
